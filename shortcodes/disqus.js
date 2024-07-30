const htmlmin = require('html-minifier-terser');

/**
 *
 * @typedef {Object} Comment
 * @property {string} content
 * @property {string} author
 * @property {string} date
 * @property {Array<Comment>} comments
 */

/**
 *
 * @param {Array<Comment>} comments
 * @param {boolean} [isSubThread=false]
 * @returns {string}
 */
module.exports = async function disqusShortCode( comments, isSubThread = false ) {
	if ( comments.length === 0 ) {
		return '';
	}

	let html = `<ol class="${ isSubThread ? 'disqus-comment__comments' : 'disqus__comments' } disqus-comments">`;

	for ( const comment of comments ) {
		html += `<li class="disqus-comments__comment disqus-comment">
			<dl class="disqus-comment__meta meta">
				<dt class="meta__item visually-hidden">Opublikowany:</dt>
				<dd class="meta__value"><time datetime="${ comment.date }">${ formatDate( comment.date ) }</time></dd>
				<dt class="meta__item visually-hidden">Autor:</dt>
				<dd class="meta__value">${ comment.author }</dd>
			</dl>
			<div class="disqus-comment__content">${ comment.content }</div>`;

		if ( comment.comments.length > 0 ) {
			// eslint-disable-next-line no-await-in-loop
			html += await disqusShortCode( comment.comments, true );
		}

		html += '</li>';
	};

	html += '</ol>';

	return htmlmin.minify( html, {
		collapseWhitespace: true
	} );
};

function formatDate( dateString ) {
	const date = new Date( dateString );
	const formatter = new Intl.DateTimeFormat( 'pl', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric'
	} );

	return formatter.format( date );
}
