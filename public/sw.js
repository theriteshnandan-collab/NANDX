/// <reference lib="webworker" />

/**
 * NANDIX Service Worker v1
 * 
 * Provides:
 * - App shell caching for offline-first experience
 * - Static asset caching (CSS, JS, fonts)
 * - Network-first strategy for API/dynamic content
 */

const CACHE_NAME = "nandix-v1";
const STATIC_ASSETS = [
    "/nandix",
    "/manifest.json",
];

// Install: Pre-cache critical assets
self.addEventListener("install", (event) => {
    console.log("[SW] Installing NANDIX Service Worker v1");
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener("activate", (event) => {
    console.log("[SW] Activating NANDIX Service Worker v1");
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch: Network-first with cache fallback
self.addEventListener("fetch", (event) => {
    const { request } = event;

    // Skip non-GET requests
    if (request.method !== "GET") return;

    // Skip WebSocket/WebRTC signaling
    if (request.url.includes("signaling") || request.url.includes("peerjs")) return;

    // For navigation requests (HTML pages): network-first
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // For static assets (JS, CSS, images): cache-first
    if (
        request.url.includes("/_next/static/") ||
        request.url.includes("/icons/") ||
        request.url.endsWith(".css") ||
        request.url.endsWith(".js") ||
        request.url.endsWith(".woff2")
    ) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;
                return fetch(request).then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                    return response;
                });
            })
        );
        return;
    }
});

// Push notifications (future)
self.addEventListener("push", (event) => {
    const data = event.data?.json() ?? { title: "NANDIX", body: "New message" };
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: "/icons/icon-192.png",
            badge: "/icons/icon-192.png",
            vibrate: [200, 100, 200],
            tag: "nandix-msg",
            renotify: true,
        })
    );
});

// Notification click: open app
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: "window" }).then((clients) => {
            const nandixClient = clients.find((c) => c.url.includes("/nandix"));
            if (nandixClient) {
                return nandixClient.focus();
            }
            return self.clients.openWindow("/nandix");
        })
    );
});
