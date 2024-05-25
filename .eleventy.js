/* global module */

/**
 *
 * @param {import('@11ty/eleventy').UserConfig} eleventyConfig
 * @returns
 */
module.exports = function( eleventyConfig ) {
	eleventyConfig.setLiquidOptions( {
		dynamicPartials: false,
		strictFilters: false
	} );

	return {
		dir: {
			layouts: '_layouts'
		}
	};
};
