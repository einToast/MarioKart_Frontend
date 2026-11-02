export const reloadOnServiceWorkerUpdate = (): void => {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    const hadController = !!navigator.serviceWorker.controller;
    let reloading = false;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!hadController || reloading) {
            return;
        }
        reloading = true;
        window.location.reload();
    });
};
