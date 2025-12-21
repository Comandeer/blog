import htmlmin from 'html-minifier-next';
import { imageShortCode } from './image.js';

export function createFigureShortCode( markdownIt ) {
	return async function figureShortCode(
		src,
		alt = '',
		caption = null,
		link = null,
		style = '',
		className,
		loading = 'lazy',
		sizes = '90vw',
		widths = [ 440, 880, 1024, 1360 ],
		formats = [ 'avif', 'webp' ]
	) {
		const imageElement = await imageShortCode.call( this,  src, alt, style, className, loading, sizes, widths, formats );
		link = link ? link : getHDSrc( imageElement );
		caption = caption ? markdownIt.render( caption ) : 'Kliknij obrazek, aby go powiększyć';
		const figureElement = `<figure class="figure">
			<a href="${ link }">${ imageElement }</a>
			<figcaption>${ caption }</figcaption>
		</figure>`;

		return htmlmin.minify( figureElement, {
			collapseWhitespace: true
		} );
	};
}

function getHDSrc( imageElement ) {
	const source = imageElement.match( /<source type="image\/(?:avif|svg\+xml)" srcset="(?<srcset>[^"]+)"/ );
	const srcset = source.groups.srcset.trim();
	const srcs = srcset.split( ', ' );
	const [ hdSrc ] = srcs.at( -1 ).split( ' ' );

	return hdSrc;
}
