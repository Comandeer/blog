import site from '../src/_data/site.js';

export function rssLink() {
	// eslint-disable-next-line @babel/no-invalid-this
	const url = parsePageUrl( this.page.url );

	if ( url === '' ) {
		return '/feeds/feed.xml';
	}

	return `/feeds/${ url }.xml`;
}

export function rssLabel() {
	// eslint-disable-next-line @babel/no-invalid-this
	const url = parsePageUrl( this.page.url );

	if ( url === '' ) {
		return 'Subskrybuj blog';
	}

	if ( url.startsWith( 'projekty/' ) ) {
		const projectId = url.replace( 'projekty/', '' );

		return `Subskrybuj wpisy o projekcie ${ site.projectNames[ projectId ] }`;
	}

	const categoryId = url.replace( 'kategorie/', '' );

	return `Subskrybuj kategorię ${ site.categoryNames[ categoryId ] }`;
}

function parsePageUrl( pageUrl ) {
	const [ url ] = pageUrl.split( '/strona-' );

	return url.replaceAll( /^\/|\/$/g, '' );
}
