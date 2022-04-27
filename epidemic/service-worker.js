/********************* install **************************/

async function addResourcesToCache(resources) {
    const cache = await caches.open('v1')
    await cache.addAll(resources)
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        addResourcesToCache([
            '/',
            '/about.html',
            '/fallback.html',
            '/favicon.ico',
            '/index.html',
            '/pull.html',
            '/css/style.css',
            '/js/main.js',
            '/js/frappe-charts.min.iife.js',
            // '/api/fetch',
            // '/api/status',
        ])
    )
})


/********************* activate **************************/

const enableNavigationPreload = async () => {
    if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable()
    }
}

self.addEventListener('activate', (event) => {
    event.waitUntil(enableNavigationPreload())
})


/********************* fetch **************************/

async function putInCache(request, response) {
    const cache = await caches.open('v1')
    await cache.put(request, response)
}

async function cacheFirst({request, preloadResponsePromise, fallbackUrl} = {}) {
    // First try to get the resource from the cache
    const responseFromCache = await caches.match(request)
    if (responseFromCache) {
        return responseFromCache
    }

    // Next try to use (and cache) the preloaded response, if it's there
    const preloadResponse = await preloadResponsePromise
    if (preloadResponse) {
        console.info('using preload response', preloadResponse)
        putInCache(request, preloadResponse.clone())
        return preloadResponse
    }

    // Next try to get the resource from the network
    try {
        const responseFromNetwork = await fetch(request)
        putInCache(request, responseFromNetwork.clone())
        return responseFromNetwork
    } catch (err) {
        const fallbackResponse = await caches.match(fallbackUrl)
        if (fallbackResponse) {
            return fallbackResponse
        }

        // When even the fallback response is not available,
        // there is nothing we can do, but we must always
        // return a Response object
        return new Response('Network error happened', {
            status: 408,
            headers: {
                'Content-Type': 'text/plain'
            }
        })
    }
}

self.addEventListener('fetch', (event) => {
    event.respondWith(
        cacheFirst({
            request: event.request,
            preloadResponsePromise: event.preloadResponse,
            fallbackUrl: '/fallback.html',
        })
    )
})
