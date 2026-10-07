(() => {
  // Approved guests receive this link from the organizer; public form submissions never lead here.
  if (!window.location.hash) {
    window.history.replaceState(null, '', '#event/c5fc0d53-08e2-4171-aa6d-2ee393ebb66c');
  }

  const embed = document.querySelector('#mnm-embed-script');
  embed.addEventListener('error', () => {
    document.querySelector('#ticketing-error').hidden = false;
  });
})();
