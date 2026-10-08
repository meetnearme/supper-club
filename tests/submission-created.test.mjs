import assert from 'node:assert/strict';
import { afterEach, beforeEach, mock, test } from 'node:test';
import submissionCreated from '../netlify/functions/submission-created.mjs';

const originalEnvironment = {
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
};
let fetchMock;

beforeEach(() => {
  process.env.RESEND_API_KEY = 'resend-test-key';
  process.env.RESEND_FROM_EMAIL = 'Redding Supper Club <brian@meetnear.me>';
  fetchMock = mock.method(globalThis, 'fetch', async () => {
    throw new Error('Unexpected network request in email test');
  });
  mock.method(console, 'info', () => {});
  mock.method(console, 'error', () => {});
});

afterEach(() => {
  mock.restoreAll();
  for (const [key, value] of Object.entries(originalEnvironment)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

function requestFor(overrides = {}) {
  return new Request('https://supper-club.test/.netlify/functions/submission-created', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payload: {
      id: 'submission-123',
      form_name: 'invitation-request',
      data: {
        email: 'taylor@example.com',
        name: 'Taylor',
        work: 'Building a neighborhood workshop',
        curiosity: 'What should stay human?',
        dietary: 'Peanut allergy',
      },
      ...overrides,
    } }),
  });
}

function captureDelivery(respond = () => Response.json({ data: [{ id: 'organizer-email' }, { id: 'applicant-email' }] })) {
  const calls = [];
  fetchMock.mock.mockImplementation(async (url, options) => {
    calls.push({ url, ...options, messages: JSON.parse(options.body) });
    return respond();
  });
  return calls;
}

test('notifies Brian with all request details and acknowledges only the applicant', async () => {
  const calls = captureDelivery();
  const response = await submissionCreated(requestFor());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { accepted: 2 });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.resend.com/emails/batch');
  assert.equal(calls[0].headers.Authorization, 'Bearer resend-test-key');

  const [organizer, applicant] = calls[0].messages;
  assert.deepEqual(organizer.to, ['brian@meetnear.me']);
  assert.equal(organizer.reply_to, 'taylor@example.com');
  assert.match(organizer.text, /Building a neighborhood workshop/);
  assert.match(organizer.text, /What should stay human\?/);
  assert.match(organizer.text, /Peanut allergy/);
  assert.deepEqual(applicant.to, ['taylor@example.com']);
  assert.equal(applicant.reply_to, 'brian@meetnear.me');
  assert.match(applicant.text, /pending review/);
  assert.match(applicant.text, /not an invitation, a ticket, or a reserved seat/);
  assert.doesNotMatch(applicant.text + applicant.html, /\/tickets|#event\/|Peanut allergy/);
});

test('accepts email-only requests and supported form-name payload variants', async () => {
  const calls = captureDelivery();
  const response = await submissionCreated(requestFor({ form_name: undefined, name: 'invitation-request', data: { email: 'guest@example.com' } }));
  assert.equal(response.status, 200);
  assert.match(calls[0].messages[0].text, /Name: Not provided/);
  assert.match(calls[0].messages[1].text, /Hello,/);
  const fieldResponse = await submissionCreated(requestFor({ form_name: undefined, name: 'Taylor', data: { email: 'guest@example.com', 'form-name': 'invitation-request' } }));
  assert.equal(fieldResponse.status, 200);
});

test('escapes applicant-provided content in both HTML emails', async () => {
  const calls = captureDelivery();
  await submissionCreated(requestFor({ data: { email: 'guest@example.com', name: '<img src=x onerror=alert(1)>', work: '<script>alert(1)</script>' } }));
  for (const message of calls[0].messages) {
    assert.doesNotMatch(message.html, /<script>|<img src=x/);
    assert.match(message.html, /&lt;img/);
  }
  assert.match(calls[0].messages[0].html, /&lt;script&gt;/);
});

test('uses a stable idempotency key for retries and a different key for new submissions', async () => {
  const calls = captureDelivery();
  await submissionCreated(requestFor());
  await submissionCreated(requestFor());
  await submissionCreated(requestFor({ id: 'submission-456' }));
  assert.equal(calls[0].headers['Idempotency-Key'], calls[1].headers['Idempotency-Key']);
  assert.notEqual(calls[0].headers['Idempotency-Key'], calls[2].headers['Idempotency-Key']);
});

test('ignores other forms, spam, and filled honeypots without sending email', async () => {
  for (const overrides of [{ form_name: 'another-form' }, { spam: true }, { data: { email: 'guest@example.com', 'bot-field': 'spam' } }]) {
    assert.equal((await submissionCreated(requestFor(overrides))).status, 204);
  }
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('rejects invalid applicant addresses and missing submission IDs', async () => {
  for (const overrides of [{ data: { email: 'not-an-email' } }, { data: { email: 'one@example.com,two@example.com' } }, { id: '' }]) {
    assert.equal((await submissionCreated(requestFor(overrides))).status, 422);
  }
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('fails clearly when either Resend setting is missing', async () => {
  delete process.env.RESEND_API_KEY;
  assert.equal((await submissionCreated(requestFor())).status, 503);
  process.env.RESEND_API_KEY = 'resend-test-key';
  delete process.env.RESEND_FROM_EMAIL;
  assert.equal((await submissionCreated(requestFor())).status, 503);
  assert.equal(fetchMock.mock.callCount(), 0);
});

test('reports provider rejection without claiming email acceptance or exposing the API key', async () => {
  captureDelivery(() => Response.json({ message: 'Sender not verified' }, { status: 403 }));
  const response = await submissionCreated(requestFor());
  assert.equal(response.status, 502);
  const body = await response.text();
  assert.doesNotMatch(body, /accepted|resend-test-key/);
  assert.match(body, /remains saved in Netlify Forms/);
});

test('requires acceptance of both emails and handles transport failures', async () => {
  captureDelivery(() => Response.json({ data: [{ id: 'only-one-email' }] }));
  assert.equal((await submissionCreated(requestFor())).status, 502);
  fetchMock.mock.mockImplementation(async () => { throw new Error('Connection failed'); });
  assert.equal((await submissionCreated(requestFor())).status, 502);
});

test('rejects malformed JSON and unsupported request methods', async () => {
  assert.equal((await submissionCreated(new Request('https://supper-club.test/', { method: 'POST', body: '{' }))).status, 400);
  assert.equal((await submissionCreated(new Request('https://supper-club.test/'))).status, 405);
  assert.equal(fetchMock.mock.callCount(), 0);
});
