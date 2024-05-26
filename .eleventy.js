/* global module */

/**
 *
 * @param {import('@11ty/eleventy').UserConfig} eleventyConfig
 */
module.exports = function( eleventyConfig ) {
	eleventyConfig.setLiquidOptions( {
		dynamicPartials: false,
		strictFilters: false
	} );

	eleventyConfig.addPassthroughCopy( {
		public: '.'
	} );

	return {
		dir: {
			layouts: '_layouts'
		}
	};
};
