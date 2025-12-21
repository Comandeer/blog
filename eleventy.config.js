import { load } from 'cheerio';
import site from './src/_data/site.js';
import { markdownIt } from './plugins/markdownIt.js';
import { assetPipeline } from './plugins/assetPipeline.js';
import { disqusShortCode } from './shortcodes/disqus.js';
import { createFigureShortCode } from './shortcodes/figure.js';
import { rssLink, rssLabel } from './shortcodes/rss.js';
import { createNoteShortCode } from './shortcodes/note.js';
import { createLiquidPreprocessor } from './plugins/liquidPreprocessor.js';
import { imageShortCode } from './shortcodes/image.js';

const MORE_COMMENT_REGEX = /<!--\s*more\s*-->/;

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
				getAll().
				filter( ( item ) => {
					return item.data.project === project && item.page.outputPath.endsWith( 'html' );
				} ).
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

	eleventyConfig.addFilter( 'rfc_date', ( dateString ) => {
		const date = new Date( dateString );

		return date.toISOString();
	} );

	eleventyConfig.addFilter( 'excerpt', ( content ) => {
		const [ excerpt ] = content.split( MORE_COMMENT_REGEX );

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

	eleventyConfig.addFilter( 'rss_content', ( post ) => {
		const postURL = cfUrl( new URL( post.data.permalink, post.data.site.url ).href );
		const $ = load( post.content );

		$( ':where(h1, h2, h3, h4, h5, h6) a' ).each( ( _, link ) => {
			const $link = $( link );
			const originalHref = $link.attr( 'href' );

			$link.attr( 'href', postURL + originalHref );
		} );
		$( '.code__copy' ).remove();

		return $( 'body' ).html().replace( MORE_COMMENT_REGEX, '' );
	} );

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
