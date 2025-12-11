const codeBlockRegex = /^```(?:.+)?\n(?:.|\n)+?\n```\n/gmu;

export function createLiquidPreprocessor( eleventyConfig ) {
	eleventyConfig.addPreprocessor( 'liquidPreprocessor', 'md', ( _, content ) => {
		return content.replaceAll( codeBlockRegex, '{% raw %}$&{% endraw %}' );
	} );
}
