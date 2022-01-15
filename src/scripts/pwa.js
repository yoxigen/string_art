const swFilename = 'service-worker.js';

export async function initServiceWorker() {
  if (!navigator.serviceWorker) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(swFilename);
    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      if (installingWorker == null) {
        return;
      }
      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            console.log(
              'New content is available and will be used when all ' +
                'tabs for this page are closed. See https://bit.ly/CRA-PWA.'
            );
          } else {
            console.log('Content is cached for offline use.');
          }
        }
      };
    };
  } catch (error) {
    console.error('Error during service worker registration:', error);
  }
}
