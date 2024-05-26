/* global module */

/**
 *
 * @param {import('@11ty/eleventy').UserConfig} eleventyConfig
 */
module.exports = function( eleventyConfig ) {
	eleventyConfig.setLiquidOptions( {
		dynamicPartials: true,
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
