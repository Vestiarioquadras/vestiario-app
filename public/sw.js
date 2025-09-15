/**
 * Service Worker para Vestiário PWA
 * Implementa cache, funcionalidade offline e sincronização
 */

const CACHE_NAME = 'vestiario-v1.0.0'
const STATIC_CACHE = 'vestiario-static-v1'
const DYNAMIC_CACHE = 'vestiario-dynamic-v1'

// Arquivos estáticos para cache
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-16x16.png',
  '/icons/icon-32x32.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  // Adicione outros arquivos estáticos conforme necessário
]

// URLs que devem ser sempre buscadas da rede
const NETWORK_FIRST_URLS = [
  '/api/',
  '/auth/',
  '/bookings/',
  '/courts/'
]

// URLs que podem usar cache primeiro
const CACHE_FIRST_URLS = [
  '/icons/',
  '/images/',
  '/static/'
]

/**
 * Instalação do Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Cacheando arquivos estáticos...')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('[SW] Service Worker instalado com sucesso!')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('[SW] Erro na instalação:', error)
      })
  )
})

/**
 * Ativação do Service Worker
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Removendo cache antigo:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Service Worker ativado!')
        return self.clients.claim()
      })
  )
})

/**
 * Interceptação de requisições
 */
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignora requisições que não são HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return
  }

  // Estratégia Network First para APIs
  if (isNetworkFirst(url.pathname)) {
    event.respondWith(networkFirst(request))
    return
  }

  // Estratégia Cache First para recursos estáticos
  if (isCacheFirst(url.pathname)) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Estratégia Stale While Revalidate para outras requisições
  event.respondWith(staleWhileRevalidate(request))
})

/**
 * Verifica se a URL deve usar estratégia Network First
 */
function isNetworkFirst(pathname) {
  return NETWORK_FIRST_URLS.some(url => pathname.startsWith(url))
}

/**
 * Verifica se a URL deve usar estratégia Cache First
 */
function isCacheFirst(pathname) {
  return CACHE_FIRST_URLS.some(url => pathname.startsWith(url))
}

/**
 * Estratégia Network First
 * Tenta buscar da rede primeiro, fallback para cache
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('[SW] Rede indisponível, buscando no cache:', request.url)
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Retorna página offline se for uma navegação
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response(
        getOfflinePage(),
        {
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }
    
    throw error
  }
}

/**
 * Estratégia Cache First
 * Busca no cache primeiro, fallback para rede
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('[SW] Erro ao buscar recurso:', request.url, error)
    throw error
  }
}

/**
 * Estratégia Stale While Revalidate
 * Retorna cache imediatamente e atualiza em background
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(() => {
    // Se a rede falhar, retorna o cache se existir
    return cachedResponse
  })
  
  return cachedResponse || fetchPromise
}

/**
 * Sincronização em background
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Sincronização em background:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

/**
 * Executa sincronização em background
 */
async function doBackgroundSync() {
  try {
    // Aqui você pode implementar sincronização de dados offline
    console.log('[SW] Executando sincronização...')
    
    // Exemplo: sincronizar reservas offline
    const offlineBookings = await getOfflineBookings()
    for (const booking of offlineBookings) {
      await syncBooking(booking)
    }
    
    console.log('[SW] Sincronização concluída!')
  } catch (error) {
    console.error('[SW] Erro na sincronização:', error)
  }
}

/**
 * Notificações push
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Notificação push recebida:', event)
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do Vestiário!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Detalhes',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/icon-96x96.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Vestiário', options)
  )
})

/**
 * Clique em notificação
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Clique em notificação:', event)
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard/player')
    )
  } else if (event.action === 'close') {
    // Apenas fecha a notificação
  } else {
    // Clique no corpo da notificação
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

/**
 * Funções auxiliares
 */
async function getOfflineBookings() {
  // Implementar busca de reservas offline
  return []
}

async function syncBooking(booking) {
  // Implementar sincronização de reserva
  console.log('[SW] Sincronizando reserva:', booking)
}

function getOfflinePage() {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vestiário - Offline</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
        }
        .container {
          max-width: 400px;
          padding: 2rem;
        }
        h1 { margin-bottom: 1rem; }
        p { margin-bottom: 2rem; opacity: 0.9; }
        button {
          background: rgba(255,255,255,0.2);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
        }
        button:hover {
          background: rgba(255,255,255,0.3);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📱 Vestiário</h1>
        <p>Você está offline. Verifique sua conexão com a internet e tente novamente.</p>
        <button onclick="window.location.reload()">Tentar Novamente</button>
      </div>
    </body>
    </html>
  `
}

