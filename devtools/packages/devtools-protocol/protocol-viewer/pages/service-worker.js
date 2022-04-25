// thx @nekrtemplar
// https://github.com/NekR/self-destroying-sw

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  self.registration
    .unregister()
    .then(() => self.clients.matchAll())
    .then((clients) => {
      clients.forEach((client) => client.navigate(client.url));
    });
});
