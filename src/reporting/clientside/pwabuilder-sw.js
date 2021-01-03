// This is the "Offline copy of assets" service worker
// See https://www.pwabuilder.com/serviceworker

const CACHE = "pwabuilder-offline";
const QUEUE_NAME = "bgSyncQueue";

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');
const BackgroundSyncPlugin = workbox.backgroundSync.BackgroundSyncPlugin;

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

const bgSyncPlugin = new BackgroundSyncPlugin('myQueueName', {
    maxRetentionTime: 24 * 60 // Retry for max of 24 Hours (specified in minutes)
});

workbox.routing.registerRoute(
    new RegExp('/*'),
    new workbox.strategies.StaleWhileRevalidate({
        cacheName: CACHE,
        plugins: [
            bgSyncPlugin
        ]
    })
);