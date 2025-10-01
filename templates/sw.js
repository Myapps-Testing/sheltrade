const CACHE_NAME = "sheltrade-v1.0.0";
const STATIC_CACHE = "sheltrade-static-v1.0.0";
const DYNAMIC_CACHE = "sheltrade-dynamic-v1.0.0";

// Files to cache immediately
const STATIC_ASSETS = [
  "/",
  "/landing.html",
  "/dashboard.html",
  "/auth.html",
  "/about.html",
  "/contact.html",
  "/license.html",
  "/404.html",
  "/css/main.css",
  "/js/main.js",
  "/js/dashboard.js",
  "/js/auth.js",
  "/js/giftcards.js",
  "/manifest.json",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Install event");
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate event");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve cached content when offline
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip external requests
  if (!url.origin.includes("localhost") && !url.origin.includes("sheltrade"))
    return;

  // Handle API requests differently
  if (url.pathname.startsWith("/api/") || url.hostname.includes("supabase")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached API response if available
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets and pages
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          // Don't cache non-successful responses
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Cache the response
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        })
        .catch(() => {
          // Return offline fallback for navigation requests
          if (request.destination === "document") {
            return caches.match("/landing.html");
          }
        });
    })
  );
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag);

  if (event.tag === "background-sync-transactions") {
    event.waitUntil(syncPendingTransactions());
  }
});

// Function to sync pending transactions
async function syncPendingTransactions() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const keys = await cache.keys();

    const pendingRequests = keys.filter(
      (request) =>
        request.url.includes("/transactions") ||
        request.url.includes("/wallet_deposit") ||
        request.url.includes("/user_giftcards")
    );

    await Promise.all(
      pendingRequests.map(async (request) => {
        try {
          const response = await fetch(request);
          if (response.ok) {
            await cache.put(request, response);
          }
        } catch (error) {
          console.error("[SW] Failed to sync:", request.url, error);
        }
      })
    );
  } catch (error) {
    console.error("[SW] Background sync failed:", error);
  }
}

// Push notifications
self.addEventListener("push", (event) => {
  console.log("[SW] Push received:", event);

  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body || "You have a new notification from Sheltrade",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || 1,
    },
    actions: [
      {
        action: "explore",
        title: "View Details",
        icon: "/icons/icon-72x72.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/icons/icon-72x72.png",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Sheltrade", options)
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification click:", event);

  event.notification.close();

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/dashboard.html"));
  } else {
    event.waitUntil(clients.openWindow("/landing.html"));
  }
});

// Message handler for communication with main thread
self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
