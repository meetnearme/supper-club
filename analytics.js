// PostHog analytics (Redding Supper Club organization, US cloud) and the Meta Pixel. Runs only on the live domain, so
// local and Netlify deploy previews send nothing. PostHog events go through the /relay proxy in netlify.toml so ad
// blockers drop fewer of them. privacy.html describes all of this; update it when tracking changes.
(() => {
  if (!['reddingsupper.club', 'www.reddingsupper.club'].includes(location.hostname)) return;

  // Official PostHog loader snippet, unmodified.
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],Object.defineProperty(u,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e}}),Object.defineProperty(u.people,"toString",{configurable:!0,enumerable:!0,writable:!0,value:function(){return u.toString(1)+".people (stub)"}}),o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagResult isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);

  posthog.init('phc_D5M3Ss3A9YtpirKsf7P23wXYfUyVADLCAoYiT9BabKPU', {
    api_host: '/relay',
    ui_host: 'https://us.posthog.com',
    defaults: '2026-05-30',
  });

  // Keep an ad's UTM tags for the rest of the visit, so the request recorded on /thank-you is credited to the ad.
  const params = new URLSearchParams(location.search);
  const campaign = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((key) => {
    if (params.has(key)) campaign[key] = params.get(key);
  });
  if (Object.keys(campaign).length) posthog.register_for_session(campaign);

  // Official Meta Pixel loader snippet, unmodified. PageView lets ads optimize for landing page views.
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '1641371730822384');
  fbq('track', 'PageView');

  // A page can name an event to record when it loads, e.g. thank-you.html records invitation_requested (a Meta Lead).
  const event = document.currentScript?.dataset.event;
  if (event) posthog.capture(event);
  if (event === 'invitation_requested') fbq('track', 'Lead');
})();
