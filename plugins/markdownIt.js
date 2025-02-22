import markdownItConstructor from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItClass from '@toycode/markdown-it-class';
import markdownItLinkAttributes from 'markdown-it-link-attributes';
import { full as markdownItEmoji } from 'markdown-it-emoji';
import { createHighlighter } from 'shiki';
import slugify from 'slugify';

const highlighter = await createHighlighter( {
	themes: [
		'github-light',
		'github-dark'
	],
	langs: [
		'bash',
		'css',
		'diff',
		'html',
		'html-derivative',
		'javascript',
		'json',
		'php',
		'python',
		'scss',
		'sh',
		'shell',
		'typescript',
		'xml'
	]
} );

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

export const markdownIt = markdownItConstructor ( {
	html: true,
	breaks: true,
	linkify: true,
	typographer: true,
	highlight: ( code, lang ) => {
		return highlighter.codeToHtml( code, {
			lang,
			themes: {
				light: 'github-light',
				dark: 'github-dark'
			}
		} );
	}
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
