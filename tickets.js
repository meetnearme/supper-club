(() => {
    // Approved guests receive this link from the organizer; public form submissions never lead here.
    if (!window.location.hash) {
        window.history.replaceState(
            null,
            '',
            '#event/0ccbc1a9-7709-4dc2-aa59-6ec0bfb96c60'
        );
    }

    const embed = document.querySelector('#mnm-embed-script');
    embed.addEventListener('error', () => {
        document.querySelector('#ticketing-error').hidden = false;
    });
})();
