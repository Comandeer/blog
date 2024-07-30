const markdownIt = require( 'markdown-it' );
const markdownItAnchor = require( 'markdown-it-anchor' );
const markdownItClass = require( '@toycode/markdown-it-class' );
const markdownItLinkAttributes = require( 'markdown-it-link-attributes' );
const markdownItEmoji = require( 'markdown-it-emoji' ).full;
const slugify = require( 'slugify' );

const SLUG_PLACEHOLDER = '™™©©®®';

slugify.extend( {
	'ę': 'ę',
	'Ę': 'ę',
	'ó': 'ó',
	'Ó': 'ó',
	'ą': 'ą',
	'Ą': 'ą',
	'ś': 'ś',
	'Ś': 'ś',
	'ł': 'ł',
	'Ł': 'ł',
	'ż': 'ż',
	'Ż': 'ż',
	'ź': 'ź',
	'Ź': 'ź',
	'ć': 'ć',
	'Ć': 'ć',
	'ń': 'ń',
	'Ń': 'ń',
	'[': '',
	']': '',
	'/': '',
	'–': SLUG_PLACEHOLDER,
	'—': SLUG_PLACEHOLDER,
	'+': SLUG_PLACEHOLDER
} );

module.exports = markdownIt ( {
	html: true,
	breaks: true,
	linkify: true,
	typographer: true
} ).use( markdownItAnchor, {
	slugify: ( str ) => {
		str = str.
			replaceAll( ' ', '' ).
			replaceAll( '– ', ' ' );

		const slug = slugify( str, {
			replacement: '-',
			remove: /[#,&,+()$~%.'":*¿?¡!<>{}]/g,
			lower: true,
			trim: false
		} );

		return slug.
			replaceAll( SLUG_PLACEHOLDER, '' ).
			replaceAll( '👍', '' ).
			replaceAll( '👎', '' );
	},
	tabIndex: false,
	permalink: markdownItAnchor.permalink.headerLink()
} ).
	use( markdownItClass, {} ).
	use( markdownItLinkAttributes, [
		{
			matcher( href ) {
				return !href.startsWith( 'https://blog.comandeer.pl' ) && href.match( /^https?:\/\// );
			},
			attrs: {
				rel: 'noreferrer noopener'
			}
		}
	] ).
	use( markdownItEmoji );
