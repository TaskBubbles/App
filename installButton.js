let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();

    // Stash the event so it can be triggered later
    deferredPrompt = e;

    // Show your install button (for example, setting a class to make it visible)
    const installButton = document.getElementById('installButton');
    installButton.style.display = 'block';

    installButton.addEventListener('click', () => {
        // Hide the install button
        installButton.style.display = 'none';

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
            } else {
                console.log('User dismissed the install prompt');
            }
            deferredPrompt = null;
        });
    });
});

// Optional: hide the button if the app is already installed
window.addEventListener('appinstalled', () => {
    const installButton = document.getElementById('installButton');
    installButton.style.display = 'none';
});
