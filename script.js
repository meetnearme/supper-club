(() => {
    const menuToggle = document.querySelector('#menu-toggle');
    const mobileMenu = document.querySelector('#mobile-menu');
    const dialog = document.querySelector('#invitation-dialog');
    const form = document.querySelector('#invitation-form');
    const status = document.querySelector('#form-status');
    const isLocalPreview = [
        'localhost',
        '127.0.0.1',
        '::1',
        '[::1]',
        ''
    ].includes(location.hostname);
    let invitationTrigger;

    function closeMenu() {
        mobileMenu.hidden = true;
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation');
    }

    menuToggle.addEventListener('click', () => {
        const opening = mobileMenu.hidden;
        mobileMenu.hidden = !opening;
        menuToggle.setAttribute('aria-expanded', String(opening));
        menuToggle.setAttribute(
            'aria-label',
            opening ? 'Close navigation' : 'Open navigation'
        );
    });
    mobileMenu
        .querySelectorAll('a')
        .forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !mobileMenu.hidden) {
            closeMenu();
            menuToggle.focus();
        }
    });
    window
        .matchMedia('(min-width: 1024px)')
        .addEventListener('change', (event) => {
            if (event.matches) closeMenu();
        });

    document.querySelectorAll('[data-open-invite]').forEach((button) => {
        button.addEventListener('click', () => {
            invitationTrigger = button;
            closeMenu();
            if (isLocalPreview) {
                status.textContent =
                    'This is a local preview. Requests are not sent here; the form is ready for submission when this site is deployed to Netlify. You can also reach Brian or Ben through their LinkedIn links in “Your hosts.”';
            }
            dialog.showModal();
            document.body.classList.add('dialog-open');
            window.posthog?.capture('invitation_form_opened');
        });
    });

    document
        .querySelector('#close-dialog')
        .addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
        )
            dialog.close();
    });
    dialog.addEventListener('close', () => {
        document.body.classList.remove('dialog-open');
        if (invitationTrigger && !invitationTrigger.closest('[hidden]'))
            invitationTrigger.focus();
        else menuToggle.focus();
    });

    // Netlify handles the native POST on the live site. Never simulate a successful request locally.
    form.addEventListener('submit', (event) => {
        if (!isLocalPreview) return;
        event.preventDefault();
        status.textContent =
            'Your details have not been sent. This local preview has no submission service; deploy to Netlify to receive invitation requests, or contact your hosts using their LinkedIn links.';
        status.scrollIntoView({
            block: 'nearest',
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
                .matches
                ? 'auto'
                : 'smooth'
        });
    });

    // Enhance below-the-fold sections without hiding content when scripts or animation are unavailable.
    if (
        'IntersectionObserver' in window &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.remove('awaiting-reveal');
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.06 }
        );
        document.querySelectorAll('.reveal').forEach((section) => {
            if (section.getBoundingClientRect().top > window.innerHeight) {
                section.classList.add('awaiting-reveal');
                observer.observe(section);
            }
        });
    }
})();
