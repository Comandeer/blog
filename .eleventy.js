/* global module */

const site = require( './_data/site' );
const { formatRFC3339 } = require( 'date-fns' );

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

	return {
		dir: {
			layouts: '_layouts'
		}
	};
};
