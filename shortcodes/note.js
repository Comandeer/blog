import htmlmin from 'html-minifier-terser';

let currentId = 0;

export function createNoteShortCode( markdownIt ) {
	return function noteShortCode( content ) {
		const labelId = `note-${ currentId++ }`;
		const noteElement = `<div class="note" role="note" aria-labelledby="${ labelId }">
			<p class="note__label" id="${ labelId }">Dygresja</p>
			<div class="note__content">${ markdownIt.render( content ) }</div>
		</div>`;

		return htmlmin.minify( noteElement, {
			collapseWhitespace: true
		} );
	};
}
