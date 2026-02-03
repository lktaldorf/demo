// LKT Tracker Service Worker für Push Notifications

const CACHE_NAME = 'lkt-tracker-v10';

// Dateien zum Cachen
const CACHE_FILES = [
    '/',
    '/app.html',
    '/index.html'
];

// Install Event
self.addEventListener('install', event => {
    console.log('Service Worker installed');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(CACHE_FILES).catch(e => console.log('Cache error:', e));
        })
    );
    self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', event => {
    console.log('Service Worker activated');
    event.waitUntil(clients.claim());
});

// Push Event - Benachrichtigung empfangen
self.addEventListener('push', event => {
    console.log('Push received:', event);
    
    let data = {
        title: '🎺 LKT Tracker',
        body: 'Neue Benachrichtigung',
        icon: 'icon-192.png',
        badge: 'icon-192.png',
        tag: 'lkt-notification',
        url: '/'
    };
    
    if (event.data) {
        try {
            const payload = event.data.json();
            data = { ...data, ...payload };
        } catch (e) {
            data.body = event.data.text();
        }
    }
    
    const options = {
        body: data.body,
        icon: data.icon || 'icon-192.png',
        badge: data.badge || 'icon-192.png',
        tag: data.tag || 'lkt-notification',
        requireInteraction: true,
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/'
        },
        actions: [
            { action: 'open', title: 'Öffnen' },
            { action: 'close', title: 'Schließen' }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification Click Event
self.addEventListener('notificationclick', event => {
    console.log('Notification clicked:', event);
    
    event.notification.close();
    
    if (event.action === 'close') {
        return;
    }
    
    const urlToOpen = event.notification.data?.url || '/app.html';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                // Prüfe ob App bereits offen ist
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Sonst neues Fenster öffnen
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

// Background Sync (für Offline-Unterstützung)
self.addEventListener('sync', event => {
    if (event.tag === 'lkt-sync') {
        console.log('Background sync triggered');
        // Hier könnte Offline-Queue synchronisiert werden
    }
});

// Periodic Background Sync (für Event-Erinnerungen)
self.addEventListener('periodicsync', event => {
    if (event.tag === 'lkt-event-check') {
        console.log('Periodic sync: checking events');
        // Event-Check hier implementieren
    }
});
