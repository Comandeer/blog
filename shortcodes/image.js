// Adapted from https://github.com/madrilene/eleventy-excellent/blob/9e17d9582151e5e1026e24539fd2338cc8d5a29e/config/shortcodes/image/index.js
// ISC License, Copyright (c) 2022 Lene Saile

const path = require( 'node:path' );
const image = require( '@11ty/eleventy-img' );
const htmlmin = require('html-minifier-terser');

const stringifyAttributes = ( attributeMap ) => {
	return Object.entries( attributeMap ).
		map( ( [ attribute, value ] ) => {
			if ( typeof value === 'undefined' ) {
				return '';
			}
			return `${attribute}="${value}"`;
		} ).
		join( ' ' );
};

module.exports = async function imageShortCode(
	src,
	alt = '',
	style = '',
	className,
	loading = 'lazy',
	sizes = '90vw',
	widths = [ 440, 880, 1024, 1360 ],
	formats = [ 'avif', 'webp' ]
) {
	const { inputPath } = this.page;
	const currentDir = path.dirname( inputPath );
	const imgSrc = path.resolve( currentDir, src );
	const originalFormat = path.extname( src ).replace( /^\./, '' );
	const { dir, url } = getOutputPaths( src );

	formats.push( originalFormat );

	const metadata = await image( imgSrc, {
		widths: [ ...widths ],
		formats: [ ...formats ],
		urlPath: url,
		outputDir: dir,
		filenameFormat: ( id, src, width, format ) => {
			const extension = path.extname( src );
			const name = path.basename( src, extension );

			return `${ name }-${ width }w.${ format }`;
		}
	} );

	const lowSrc = getLowSrc( metadata, originalFormat );
	const imageSources = Object.values( metadata ).
		map( ( imageFormat ) => {
			return `  <source type="${ imageFormat[ 0 ].sourceType }" srcset="${ imageFormat.
				map( ( entry ) => {
					return entry.srcset;
				} ).
				join( ', ' ) }" sizes="${ sizes }">`;
		} ).
		join( '\n' );

	const imgageAttributes = stringifyAttributes( {
		src: lowSrc.url,
		width: lowSrc.width,
		height: lowSrc.height,
		alt: alt.replace( /"/g, '&quot;' ),
		loading,
		decoding: 'async'
	} );

	const imageElement = `<picture ${ className ? `class="${ className }"` : '' }${ style ? ` style="${ style }"` : '' }>
		${ imageSources }
		<img
		${ imgageAttributes }>
	</picture>`;

	return htmlmin.minify( imageElement, {
		collapseWhitespace: true
	} );
};

function getOutputPaths( src ) {
	const srcDir = path.dirname( src.replace( /^((..\/)+|\.?\/)images\//, '' ) );

	return {
		dir: path.join( './dist/assets/images/', srcDir ),
		url: path.join( '/assets/images/', srcDir )
	};
}

function getLowSrc( metadata, originalFormat ) {
	const formatKey = originalFormat === 'jpg' ? 'jpeg' : originalFormat;

	return metadata[ formatKey ].at( -1 );
}
