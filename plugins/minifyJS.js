const path = require( 'node:path' );
const revPlugin = require( 'eleventy-plugin-rev' );
const { minify } = require( 'terser' );

module.exports = function( eleventyConfig ) {
	revPlugin.settings.setEnabled( '.src.js', true );

	eleventyConfig.addTemplateFormats( 'src.js' );

	eleventyConfig.addExtension( 'src.js', {
		outputFileExtension: 'js',

		async compile( content ) {
			const { code } = await minify( content, {
				module: true
			} );

			return () => {
				return code;
			};
		},

		compileOptions: {
			// That's a super-nasty hack to use the same flow as the eleventy-sass.
			// Yeah, it's definitely going to haunt me in the future.
			// https://github.com/kentaroi/eleventy-sass/blob/77ce75081e0d584e97bf4e41e88e9ad06cd2e2af/lib/eleventy-sass.js#L182-L196
			permalink: async function eleventySassRevvedPermalink( permalink, inputPath, template ) {
				const content = await template.inputContent;
				const normalizedInputPath = path.normalize( inputPath );
				const hash = revPlugin.revHashFromInputPath( normalizedInputPath ) ??
					revPlugin.createRevHash( normalizedInputPath, content );

				return ( data ) => {
					const outputWithoutHash = `${ data.page.filePathStem }.${ data.page.outputFileExtension }`;
					const outputWithHash = `${ data.page.filePathStem }-${ hash }.${ data.page.outputFileExtension }`;

					revPlugin.setPathPair( normalizedInputPath, outputWithoutHash );

					return outputWithHash;
				};
			}
		}
	} );
};
