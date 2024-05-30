/* global module */

const path = require( 'node:path' );
const { formatRFC3339 } = require( 'date-fns' );
const markdownIt = require( 'markdown-it' );
const markdownItAnchor = require('markdown-it-anchor');
const markdownItClass = require('@toycode/markdown-it-class');
const markdownItLinkAttributes = require('markdown-it-link-attributes');
const markdownItEmoji = require('markdown-it-emoji').full;
const sass = require( 'sass' );
const slugify = require( 'slugify' );
const site = require( './_data/site' );
const imageShortCode = require( './shortcodes/image' );

/**
 *
 * @param {import('@11ty/eleventy').UserConfig} eleventyConfig
 */
module.exports = function( eleventyConfig ) {
	eleventyConfig.ignores.add( '/images/**' );

	eleventyConfig.setLibrary( 'md', markdownIt ( {
		html: true,
		breaks: true,
		linkify: true,
		typographer: true
	} ).use( markdownItAnchor, {
		slugify: ( str ) => {
			return slugify(str, {
				replacement: '-',
				remove: /[#,&,+()$~%.'":*¿?¡!<>{}]/g,
				lower: true
			} );
		},
		tabIndex: false,
		permalink: markdownItAnchor.permalink.headerLink()
	} ).
		use( markdownItClass, {
			h1: [ 'title', 'is-1' ],
			h2: [ 'title', 'is-2' ],
			h3: [ 'title', 'is-3' ],
			h4: [ 'title', 'is-4' ],
			h5: [ 'title', 'is-5' ],
			h6: [ 'title', 'is-6' ]
		} ).
		use( markdownItLinkAttributes, [
			{
				matcher( href ) {
					return !href.startsWith( 'https://blog.comandeer.pl' ) && href.match( /^https?:\/\// );
				},
				attrs: {
					rel: 'noreferrer noopener'
				}
			}
		] ).
		use( markdownItEmoji ) );

	eleventyConfig.addCollection( 'posts', ( collection ) => {
		return collection.getFilteredByGlob( '_posts/**/*.md' ).
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

	eleventyConfig.addPassthroughCopy( {
		public: '.'
	} );

	eleventyConfig.addFilter( 'rfc_date', ( date ) => {
		return formatRFC3339( date );
	} );

	eleventyConfig.addFilter( 'excerpt', ( content ) => {
		const [ excerpt ] = content.split( /<!--\s*more\s*-->/ );

		return excerpt.trim();
	} );

	eleventyConfig.addTemplateFormats( 'scss' );

	// https://www.11ty.dev/docs/languages/custom/#example-add-sass-support-to-eleventy
	eleventyConfig.addExtension( 'scss', {
		outputFileExtension: 'css',
		async compile( inputContent ) {
			return async () => {
				const { css } = sass.compileString( inputContent, {
					loadPaths: [ './node_modules' ]
				} );

				return css;
			};
		}
	} );

	eleventyConfig.addAsyncShortcode( 'image', imageShortCode );

	return {
		dir: {
			layouts: '_layouts'
		}
	};
};
