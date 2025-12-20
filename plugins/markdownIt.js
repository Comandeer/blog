import markdownItConstructor from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItClass from '@toycode/markdown-it-class';
import markdownItLinkAttributes from 'markdown-it-link-attributes';
import { full as markdownItEmoji } from 'markdown-it-emoji';
import { createHighlighter } from 'shiki';
import slugify from 'slugify';
import MarkdownIt from 'markdown-it';

const langs = {
	'bash': 'Bash',
	'css': 'CSS',
	'diff': 'Git diff',
	'html': 'HTML',
	'html-derivative': 'HTML',
	'javascript': 'JavaScript',
	'json': 'JSON',
	'jsx': 'JSX',
	'liquid': 'Liquid',
	'markdown': 'Markdown',
	'mdx': 'MDX',
	'php': 'PHP',
	'python': 'Python',
	'scss': 'SCSS',
	'sh': 'Shell',
	'shell': 'Shell',
	'tsx': 'TSX',
	'typescript': 'TypeScript',
	'xml': 'XML',
	'yaml': 'YAML'
};

const highlighter = await createHighlighter( {
	themes: [
		'github-light',
		'github-dark'
	],
	langs: Object.keys( langs )
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
	use( markdownItEmoji ).
	use( markdownItCodeBlock );

/**
 *
 * @param {MarkdownIt} markdownIt
 */
function markdownItCodeBlock( markdownIt ) {
	const originalFenceRule = markdownIt.renderer.rules.fence;

	markdownIt.renderer.rules.fence = ( tokens, idx, options, env, slf ) => {
		const token = tokens[ idx ];
		const lang = token.info ? token.info.trim() : '';
		const renderedCodeBlock = originalFenceRule( tokens, idx, options, env, slf );

		return `<figure class="code" typeof="SoftwareSourceCode">
			<figcaption class="code__caption">
				<span class="code__title" property="programmingLanguage">${ langs[ lang ] ?? '' }</span>
				<button class="code__copy">Kopiuj</button>
			</figcaption>
			<div class="code__code" translate="no" property="text">
				${ renderedCodeBlock }
			</div>
		</figure>`;
	};
}
