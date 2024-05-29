/* global module */

const { formatRFC3339 } = require( 'date-fns' );
const sass = require( 'sass' );
const site = require( './_data/site' );

/**
 *
 * @param {import('@11ty/eleventy').UserConfig} eleventyConfig
 */
module.exports = function( eleventyConfig ) {
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

	return {
		dir: {
			layouts: '_layouts'
		}
	};
};
