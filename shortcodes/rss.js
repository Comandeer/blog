const site = require( '../src/_data/site.js' );

exports.rssLink = function() {
	const url = parsePageUrl( this.page.url );

	if ( url === '' ) {
		return '/feeds/feed.xml';
	}

	return `/feeds/${ url }.xml`;
};

exports.rssLabel = function() {
	const url = parsePageUrl( this.page.url );

	if ( url === '' ) {
		return 'Subskrybuj blog';
	}

	if ( url.startsWith( 'projekty/' ) ) {
		const projectId = url.replace( 'projekty/', '' );
		return `Subskrybuj wpisy o projekcie ${ site.projectNames[ projectId ] }`;
	}

	return `Subskrybuj kategorię ${ site.categoryNames[ url ] }`;
};

function parsePageUrl( pageUrl ) {
	const [ url ] = pageUrl.split( '/strona-' );

	return url.replaceAll( /^\/|\/$/g, '' );
}
