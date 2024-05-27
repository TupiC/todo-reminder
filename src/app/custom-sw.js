// @ts-nocheck

importScripts('./ngsw-worker.js');
self.addEventListener('notificationclick', (event) => {
    console.log('notification clicked!')
});

self.addEventListener('install', event => {
    console.log('Custom Service Worker installing.');
});

self.addEventListener('activate', event => {
    console.log('Custom Service Worker activated.');
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(fetchResponse => {
                return caches.open('dynamic-cache').then(cache => {
                    cache.put(event.request.url, fetchResponse.clone());
                    return fetchResponse;
                });
            });
        })
    );
});

self.addEventListener('push', event => {
    const data = event.data.json();
    console.log('Push received:', data);
    const options = {
        body: data.body,
        icon: 'assets/icons/icon-72x72.png'
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('message', event => {
    console.log('Custom Service Worker received message:', event.data);
    event.ports[0].postMessage('Reply from Custom Service Worker');
});

self.addEventListener('sync', event => {
    if (event.tag === 'sync-todos') {
        event.waitUntil(syncTodos());
    }
});

const syncTodos = async () => {
    console.log('Syncing todos...');
    const indexedDbService = new IndexedDbService();
    todos = await indexedDbService.getAllTodos();
    doneTodos = await indexedDbService.getAllDoneTodos();
    expiredTodos = await indexedDbService.getAllExpiredTodos();
};
