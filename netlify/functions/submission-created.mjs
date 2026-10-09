import { createHash } from 'node:crypto';

const formName = 'invitation-request';
const organizerEmail = 'brian@meetnear.me';
const cohostEmail = 'benji@smartlemon.io';

function field(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function escapeHtml(value) {
    return value.replace(
        /[&<>"']/g,
        (character) =>
            ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[character]
    );
}

function emailLayout(heading, content) {
    return `<!doctype html>
<html lang="en"><body style="margin:0;padding:24px;background:#f7f5ee;color:#30392f;font-family:Arial,sans-serif;">
<table role="presentation" style="width:100%;max-width:560px;margin:auto;border:1px solid #dbdccf;border-collapse:collapse;">
<tr><td style="padding:24px;background:#293e32;color:#f7f5ee;font-family:Georgia,serif;font-size:26px;">The Redding Supper Club</td></tr>
<tr><td style="padding:28px;font-size:14px;line-height:1.8;"><h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:28px;font-weight:normal;">${heading}</h1>${content}</td></tr>
<tr><td style="padding:18px 28px;border-top:1px solid #dbdccf;color:#687153;font-size:12px;">Good food. Better questions.</td></tr>
</table></body></html>`;
}

function invitationEmails(data, from) {
    const email = field(data.email);
    const name = field(data.name);
    const greeting = name ? `Hi ${name},` : 'Hello,';
    const acknowledgment = [
        greeting,
        'Thanks for requesting an invitation to the Redding Supper Club. We have received your request, and Brian and Ben will personally review it as they bring the table together.',
        'Your request is pending review. This acknowledgment is not an invitation, a ticket, or a reserved seat.',
        'If you are invited, your hosts will send a separate email with the final dinner details and a private link to reserve your seat.',
        'Questions? Reply to this email to reach Brian.',
        'Warmly,\nBrian & Ben'
    ];
    const details = [
        ['Name', name || 'Not provided'],
        ['Email', email],
        ['What they are working on', field(data.work) || 'Not provided'],
        ['Question for the table', field(data.curiosity) || 'Not provided'],
        ['Allergies or dietary needs', field(data.dietary) || 'Not provided']
    ];

    return [
        {
            from,
            to: [organizerEmail],
            cc: [cohostEmail],
            reply_to: email,
            subject: 'New Redding Supper Club invitation request',
            text: [
                'A new invitation request is ready for your personal review.',
                ...details.map(([label, value]) => `${label}: ${value}`),
                'Reply to this email to contact the applicant. Approval and sharing the private ticket link remain manual.'
            ].join('\n\n'),
            html: emailLayout(
                'A new person for the table.',
                `<p>A new invitation request is ready for your personal review.</p>${details
                    .map(
                        ([label, value]) =>
                            `<p><strong>${label}</strong><br/>${escapeHtml(
                                value
                            ).replace(/\r?\n/g, '<br/>')}</p>`
                    )
                    .join(
                        ''
                    )}<p>Reply to this email to contact the applicant. Approval and sharing the private ticket link remain manual.</p>`
            )
        },
        {
            from,
            to: [email],
            reply_to: organizerEmail,
            subject: 'We received your Redding Supper Club request',
            text: acknowledgment.join('\n\n'),
            html: emailLayout(
                'Your request is with your hosts.',
                acknowledgment
                    .map(
                        (paragraph) =>
                            `<p>${escapeHtml(paragraph).replace(
                                /\n/g,
                                '<br/>'
                            )}</p>`
                    )
                    .join('')
            )
        }
    ];
}

// Netlify verifies event signatures before invoking this supported filename-based event handler.
export default async function submissionCreated(request) {
    if (request.method !== 'POST') {
        return new Response('Method not allowed', {
            status: 405,
            headers: { Allow: 'POST' }
        });
    }

    let payload;
    try {
        ({ payload } = await request.json());
    } catch {
        return Response.json(
            { error: 'Invalid submission event' },
            { status: 400 }
        );
    }

    const data = payload?.data;
    const submittedForm =
        field(payload?.form_name) || field(data?.['form-name']) || field(payload?.name);
    if (
        submittedForm !== formName ||
        payload?.spam === true ||
        field(data?.['bot-field'])
    ) {
        return new Response(null, { status: 204 });
    }

    const email = field(data?.email);
    if (
        !data ||
        email.length > 254 ||
        !/^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/.test(email) ||
        !field(payload.id)
    ) {
        return Response.json(
            { error: 'Missing submission ID or valid applicant email' },
            { status: 422 }
        );
    }

    const apiKey = field(process.env.RESEND_API_KEY);
    const from = field(process.env.RESEND_FROM_EMAIL);
    if (!apiKey || !from) {
        console.error(
            'Invitation emails are not configured: set RESEND_API_KEY and RESEND_FROM_EMAIL in Netlify.'
        );
        return Response.json(
            { error: 'Email delivery is not configured' },
            { status: 503 }
        );
    }

    // The same verified submission keeps the same key, preventing duplicate batches on retries for 24 hours.
    const submissionKey = createHash('sha256').update(payload.id).digest('hex');
    try {
        const response = await fetch('https://api.resend.com/emails/batch', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Idempotency-Key': `invitation-request/${submissionKey}`
            },
            body: JSON.stringify(invitationEmails(data, from)),
            signal: AbortSignal.timeout(10000)
        });

        if (!response.ok) {
            throw new Error(
                `Resend rejected the email batch (HTTP ${response.status}).`
            );
        }
        const result = await response.json();
        if (
            !Array.isArray(result.data) ||
            result.data.length !== 2 ||
            !result.data.every(
                (entry) => typeof entry.id === 'string' && entry.id
            )
        ) {
            throw new Error(
                'Resend did not confirm acceptance of both emails.'
            );
        }

        console.info('Invitation emails accepted by Resend.', {
            submissionId: payload.id
        });
        return Response.json({ accepted: 2 });
    } catch (error) {
        console.error('Invitation email delivery failed.', {
            submissionId: payload.id,
            error: error.message
        });
        return Response.json(
            {
                error: 'Email delivery failed; the request remains saved in Netlify Forms'
            },
            { status: 502 }
        );
    }
}
