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

const cacheKeyRegex = /(.+)?-[\w]+\.(css|js)/;

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
		const responseClone = response.clone();

		await updateCache( cache, requestClone, responseClone );

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
		const responseClone = response.clone();

		await updateCache( cache, requestClone, responseClone );

		return response;
	} catch {
		return getFallback();
	}
}

/**
 * @param {Cache} cache
 * @param {Request} request
 * @param {Response} response
 * @returns {Promise<void>}
 */
async function updateCache( cache, request, response ) {
	await cache.put( request, response );

	const url = new URL( request.url );
	const { pathname: path } = url;

	if ( !path.endsWith( '.css' ) && !path.endsWith( '.js' ) ) {
		return;
	}

	const matchedPath = path.match( cacheKeyRegex );

	if ( matchedPath === undefined ) {
		return;
	}

	const [ , pathStart, extension ] = matchedPath;

	const keys = await cache.keys();

	keys.forEach( ( key ) => {
		const { pathname: path } = new URL( key.url );

		if ( path.startsWith( pathStart )  && path.endsWith( extension ) && key.url !== request.url ) {
			cache.delete( key );
		}
	} );
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
