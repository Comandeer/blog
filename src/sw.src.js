const CURRENT_CACHE_VERSION = 1;
const CURRENT_CACHE_NAME = `Comandeerowy-${ CURRENT_CACHE_VERSION }`;
const CACHEABLE_EXTENSIONS = [
	'js',
	'avif',
	'webp',
	'svg',
	'png',
	'jpg',
	'gif',
	'css',
	'html'
];

self.addEventListener( 'install', () => {
	self.skipWaiting();
} );

self.addEventListener( 'activate', ( event ) => {
	event.waitUntil( setupCaches() );
} );

// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/fetch_event#cache_falling_back_to_network
self.addEventListener( 'fetch', ( event ) => {
	if ( event.request.mode === 'navigate' ) {
		event.respondWith( networkThenCache( event.request ) );
	} else {
		event.respondWith( cacheThenNetwork( event.request ) );
	}
} );

async function networkThenCache( request ) {
	const cache = await caches.open( CURRENT_CACHE_NAME );
	const requestClone = request.clone();

	try {
		const response = await fetch( request );

		await cache.put( requestClone, response.clone() );

		return response;
	} catch {
		const cachedResponse = await cache.match( request );

		if ( cachedResponse ) {
			return cachedResponse;
		}

		return getFallback();
	}
}

async function cacheThenNetwork( request ) {
	try {
		const requestURL = new URL( request.url );
		const requestExt = request.url.split( '.' ).at( -1 );

		if ( self.location.origin !== requestURL.origin || !CACHEABLE_EXTENSIONS.includes( requestExt ) ) {
			const response = await fetch( request );

			return response;
		}

		const cache = await caches.open( CURRENT_CACHE_NAME );
		const cachedResponse = await cache.match( request );

		if ( cachedResponse ) {
			return cachedResponse;
		}

		const requestClone = request.clone();
		const response = await fetch( request );

		await cache.put( requestClone, response.clone() );

		return response;
	} catch {
		return getFallback();
	}
}

async function getFallback() {
	const cache = await caches.open( CURRENT_CACHE_NAME);
	const cachedResponse = await cache.match( '/offline.html' );

	return cachedResponse;
}

async function setupCaches() {
	const currentCache = await caches.open( CURRENT_CACHE_NAME );

	currentCache.addAll( [
		'/',
		'/offline.html',
		'/404.html'
	] );

	const cacheNames = await caches.keys();

	return Promise.all(
		cacheNames.map( ( cacheName ) => {
			return cacheName !== CURRENT_CACHE_NAME ? caches.delete( cacheName ) : true;
		} )
	);
}
