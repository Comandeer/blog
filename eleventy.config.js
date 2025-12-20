import { formatRFC3339 } from 'date-fns';
import site from './src/_data/site.js';
import { markdownIt } from './plugins/markdownIt.js';
import { assetPipeline } from './plugins/assetPipeline.js';
import { disqusShortCode } from './shortcodes/disqus.js';
import { createFigureShortCode } from './shortcodes/figure.js';
import { rssLink, rssLabel } from './shortcodes/rss.js';
import { createNoteShortCode } from './shortcodes/note.js';
import { createLiquidPreprocessor } from './plugins/liquidPreprocessor.js';
import { imageShortCode } from './shortcodes/image.js';

/**
 *
 * @param {import('@11ty/eleventy').UserConfig} eleventyConfig
 */
// eslint-disable-next-line no-restricted-syntax
export default function( eleventyConfig ) {
	eleventyConfig.ignores.add( '/images/**' );
	eleventyConfig.ignores.add( '/assets/main.{scss,src.js}' );
	eleventyConfig.addWatchTarget( './src/_styles/**/*.scss' );

	eleventyConfig.addPlugin( assetPipeline );

	eleventyConfig.setLibrary( 'md', markdownIt );

	eleventyConfig.addCollection( 'posts', ( collection ) => {
		return collection.
			getFilteredByGlob( 'src/_posts/**/*.md' ).
			sort( ( a, b ) => {
				return b.date - a.date;
			} );
	} );

	Object.keys( site.projectNames ).forEach( ( project ) => {
		eleventyConfig.addCollection( `project-${ project }`, ( collection ) => {
			return collection.
				getFilteredByGlob( `src/_posts/projects/${ project }/*.md` ).
				sort( ( a, b ) => {
					return b.date - a.date;
				} );
		} );
	} );

	const tags = Object.keys( site.categoryNames );

	tags.forEach( ( tag ) => {
		eleventyConfig.addCollection( tag, ( collection ) => {
			return collection.getFilteredByTag( tag ).
				sort( ( a, b ) => {
					return b.date - a.date;
				} );
		} );
	} );

	eleventyConfig.setLiquidOptions( {
		jekyllInclude: true,
		dynamicPartials: true,
		strictFilters: false
	} );

	[
		'src/assets/',
		'src/favicon.ico',
		'src/apple-touch-icon.png',
		'src/manifest.webmanifest',
		'src/_redirects'
	].forEach( ( path ) => {
		return eleventyConfig.addPassthroughCopy( path );
	} );

	eleventyConfig.addFilter( 'rfc_date', ( date ) => {
		return formatRFC3339( date );
	} );

	eleventyConfig.addFilter( 'excerpt', ( content ) => {
		const [ excerpt ] = content.split( /<!--\s*more\s*-->/ );

		return excerpt.trim();
	} );

	eleventyConfig.addFilter( 'embedOrigin', ( url ) => {
		if ( url.startsWith( 'https://codepen.io' ) ) {
			return ' na CodePenie.';
		}

		if ( url.startsWith( 'https://jsfiddle.net' ) ) {
			return ' na JSFiddle.';
		}

		if ( url.startsWith( 'https://giphy.com' ) ) {
			return ' na Giphy.';
		}

		if ( url.startsWith( 'https://www.youtube.com' ) ) {
			return ' na YouTubie.';
		}

		return '';
	} );
	eleventyConfig.addFilter( 'commentUrl', ( permalink ) => {
		const searchParams = new URLSearchParams();

		searchParams.set( 'discussions_q', `category:Komentarze ${ cfUrl( permalink ) }` );

		return `https://github.com/Comandeer/blog/discussions/categories/komentarze?${ searchParams.toString() }`;
	} );
	eleventyConfig.addFilter( 'cfUrl', cfUrl );

	eleventyConfig.addAsyncShortcode( 'image', imageShortCode );
	eleventyConfig.addAsyncShortcode( 'figure', createFigureShortCode( markdownIt ) );
	eleventyConfig.addAsyncShortcode( 'disqus', disqusShortCode );
	eleventyConfig.addShortcode( 'rss_link', rssLink );
	eleventyConfig.addShortcode( 'rss_label', rssLabel );
	eleventyConfig.addPairedShortcode( 'note', createNoteShortCode( markdownIt ) );

	createLiquidPreprocessor( eleventyConfig );

	return {
		dir: {
			input: 'src',
			layouts: '_layouts',
			output: 'dist'
		}
	};
}

function cfUrl( url ) {
	return url.replace( /index\.html$/, '' ).replace( /\.html$/, '' );
}
