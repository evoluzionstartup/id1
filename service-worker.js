// Nome do cache para controle de versão
const CACHE_NAME = 'id1-evoluzion-cache-v2';

// Lista de arquivos para cachear (app shell)
const urlsToCache = [
  '/', // A raiz do seu site
  '/index.html',
  '/perfil.html',
  '/manifest.json',
  // Adicione aqui os caminhos para seus ícones
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-192x192.png',
  '/icons/icon-maskable-512x512.png',
  // Se você tiver arquivos CSS ou JS externos, adicione-os aqui também
  // Exemplo: '/styles/main.css', '/js/utils.js'
];

// Evento 'install': Ocorre quando o Service Worker é instalado
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cacheando arquivos essenciais.');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Falha ao cachear arquivos:', error);
      })
  );
});

// Evento 'fetch': Intercepta requisições de rede
self.addEventListener('fetch', (event) => {
  // Tenta responder com um recurso do cache primeiro
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Se o recurso estiver no cache, retorna-o
        if (response) {
          return response;
        }
        // Se não estiver no cache, faz a requisição de rede
        return fetch(event.request)
          .then((networkResponse) => {
            // Clona a resposta porque a resposta original só pode ser consumida uma vez
            const responseToCache = networkResponse.clone();
            // Tenta adicionar a resposta ao cache para futuras requisições
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Não cachear requisições não-GET ou que não sejam HTTP/HTTPS
                if (networkResponse.status === 200 && networkResponse.type === 'basic') {
                  cache.put(event.request, responseToCache);
                }
              });
            return networkResponse;
          })
          .catch(() => {
            // Se a requisição de rede falhar e não houver cache, você pode retornar uma página offline
            // Por enquanto, apenas loga o erro
            console.error('Service Worker: Falha na requisição de rede para:', event.request.url);
            // Poderia retornar uma página offline aqui:
            // return caches.match('/offline.html');
          });
      })
  );
});

// Evento 'activate': Ocorre quando o Service Worker é ativado
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Exclui caches antigos
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deletando cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
