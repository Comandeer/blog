/* global module */

const path = require( 'node:path' );
const { formatRFC3339 } = require( 'date-fns' );
const revPlugin = require( 'eleventy-plugin-rev' );
const sassPlugin = require( 'eleventy-sass' );
const site = require( './src/_data/site' );
const markdownIt = require( './plugins/markdownIt' );
const minifyJS = require( './plugins/minifyJS' );
const imageShortCode = require( './shortcodes/image' );
const disqusShortCode = require( './shortcodes/disqus' );

/**
 *
 * @param {import('@11ty/eleventy').UserConfig} eleventyConfig
 */
module.exports = function( eleventyConfig ) {
	eleventyConfig.ignores.add( '/images/**' );

	eleventyConfig.addPlugin( revPlugin );
	eleventyConfig.addPlugin( sassPlugin, {
		rev: true
	} );

	eleventyConfig.setLibrary( 'md', markdownIt );
	eleventyConfig.amendLibrary( 'md', () => {} );

	eleventyConfig.on( 'eleventy.before', async () => {
		const shiki = await import( 'shiki' );
		const highlighter = await shiki.createHighlighter( {
			themes: [
				'github-light',
				'github-dark'
			],
			langs: [
				'bash',
				'css',
				'diff',
				'html',
				'html-derivative',
				'javascript',
				'json',
				'php',
				'python',
				'scss',
				'sh',
				'shell',
				'typescript',
				'xml'
			]
		} );

		eleventyConfig.amendLibrary( 'md', ( mdLib ) => {
			mdLib.set( {
				highlight: ( code, lang ) => {
					return highlighter.codeToHtml( code, {
						lang,
						themes: {
							light: 'github-light',
							dark: 'github-dark'
						}
					} );
				}
			} );
		} );
	} );

	eleventyConfig.addCollection( 'posts', ( collection ) => {
		return collection.getFilteredByGlob( 'src/_posts/**/*.md' ).
			sort( ( a, b ) => {
				return b.date - a.date;
			} );
	} );

	const tags = Object.keys( site.tagNames );

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

	minifyJS( eleventyConfig );

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

		searchParams.set( 'discussions_q', `category:Announcements ${ cfUrl( permalink ) }` );

		return `https://github.com/Comandeer/blog/discussions/categories/announcements?${ searchParams.toString() }`;
	} );
	eleventyConfig.addFilter( 'cfUrl', cfUrl );

	eleventyConfig.addAsyncShortcode( 'image', imageShortCode );
	eleventyConfig.addAsyncShortcode( 'disqus', disqusShortCode );

	return {
		dir: {
			input: 'src',
			layouts: '_layouts',
			output: 'dist'
		}
	};
};

function cfUrl( url ) {
	return url.replace( /index\.html$/, '' ).replace( /\.html$/, '' );
}
