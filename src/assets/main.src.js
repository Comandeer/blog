/* global localStorage, HTMLElement, document, window, customElements */
/**
 * @typedef CookiePreferences
 * @property {boolean} prefs
 * @property {boolean} embed
 * @property {boolean} comments
 */

/**
 * @type CookiePreferences
 */
let cookiePrefences = getFromStorage( 'cookiePreferences' ) ??
	{
		prefs: false,
		embed: false,
		comments: false
	};

const themeSwitcherInvoker = document.querySelector( '.theme-switcher__invoker' );
const themeSwitcherInvokerIcon = document.querySelector( '.theme-switcher__invoker-icon' );
const themeSwitcherList = document.querySelector( '.theme-switcher__list' );
const themeSwitcherOptions = Array.from( themeSwitcherList.querySelectorAll( '.theme-switcher__option' ) );
let currentFocusIndex = -1;
let currentTheme = getFromStorage( 'theme' ) ?? 'auto';

document.addEventListener( 'click', ( evt ) => {
	if ( evt.target.closest( '.theme-switcher__invoker' ) ) {
		toggleThemeSwitcher();

		return;
	}

	if ( themeSwitcherList.hidden ) {
		return;
	}

	const option = evt.target.closest( '.theme-switcher__option' );

	if ( option ) {
		updateThemePreferences( option.value );
		updateThemeSwitcherMenu( option.value );
		toggleThemeSwitcher();

		return;
	}

	if ( evt.target.closest( '.theme-switcher__list' ) ) {
		return;
	}

	toggleThemeSwitcher();
} );

themeSwitcherInvoker.addEventListener( 'keydown', ( evt ) => {
	switch ( evt.key ) {
		case 'ArrowDown':
		case 'ArrowUp':
			evt.preventDefault();
			evt.stopPropagation();
			toggleThemeSwitcher( evt.key === 'ArrowDown' ? true : false );
	}
} );

document.addEventListener( 'keydown', ( evt ) => {
	if ( themeSwitcherList.hidden ) {
		return;
	}

	switch ( evt.key ) {
		case 'Escape':
			toggleThemeSwitcher();
			break;
		case 'ArrowDown':
		case 'ArrowUp':
			evt.preventDefault();
			moveFocus( evt.key === 'ArrowDown' ? 1 : -1 );
			break;
	}
} );

themeSwitcherList.addEventListener( 'mouseover', ( evt ) => {
	const option = evt.target.closest( '.theme-switcher__option' );

	if ( option ) {
		option.focus();
	}

	const index = themeSwitcherOptions.indexOf( option );

	currentFocusIndex = index;
} );

updateThemeSwitcherMenu( currentTheme );

function toggleThemeSwitcher( forcedVisibility ) {
	themeSwitcherList.hidden = forcedVisibility !== undefined ? !forcedVisibility : !themeSwitcherList.hidden;
	const isOpen = !themeSwitcherList.hidden;

	themeSwitcherInvoker.setAttribute( 'aria-expanded', String( isOpen ) );
	themeSwitcherInvokerIcon.textContent = isOpen ? '▲' : '▼';

	currentFocusIndex = -1;

	if ( isOpen ) {
		moveFocus( 1 );
	} else {
		themeSwitcherInvoker.focus();
	}
}

function updateThemePreferences( theme ) {
	currentTheme = theme;

	document.documentElement.dataset.theme = theme;

	if ( cookiePrefences.prefs ) {
		saveToStorage( 'theme', theme );
	}
}

function updateThemeSwitcherMenu( theme ) {
	themeSwitcherOptions.forEach( ( menuItem ) => {
		const isChecked = menuItem.value === theme;

		menuItem.setAttribute( 'aria-checked', String( isChecked ) );
	} );
}

function moveFocus( direction ) {
	currentFocusIndex += direction;

	if ( currentFocusIndex < 0 ) {
		currentFocusIndex = themeSwitcherOptions.length - 1;
	} else if ( currentFocusIndex > themeSwitcherOptions.length - 1 ) {
		currentFocusIndex = 0;
	}

	themeSwitcherOptions[ currentFocusIndex ].focus();
}

const cookieBannerButtonAll = document.querySelector( '#cookie-banner-button-all' );
const cookieBannerButtonNone = document.querySelector( '#cookie-banner-button-none' );
const cookieBannerButtonChoose = document.querySelector( '#cookie-banner-button-choose' );
const cookieSettingsButton = document.querySelector( '#cookie-settings' );
const cookieDialog = document.querySelector( '#cookie-dialog' );
const cookieDialogCloseButton = document.querySelector( '#cookie-dialog-close' );
const cookieDialogForm = document.querySelector( '#cookie-dialog-form' );

cookieBannerButtonAll.addEventListener( 'click', () => {
	setCookiePreferences( {
		prefs: true,
		embed: true,
		comments: true
	} );

	closeCookieBanner();
} );

cookieBannerButtonNone.addEventListener( 'click', () => {
	setCookiePreferences( {
		prefs: false,
		embed: false,
		comments: false
	} );

	closeCookieBanner();
} );

cookieBannerButtonChoose.addEventListener( 'click', () => {
	closeCookieBanner();
	cookieDialog.showModal();
	updateCookieDialog();
} );

cookieSettingsButton.addEventListener( 'click', () => {
	cookieDialog.showModal();
	updateCookieDialog();
} );

cookieDialogForm.addEventListener( 'submit', ( evt ) => {
	setCookiePreferences( {
		prefs: evt.target.elements.prefs.checked,
		embed: evt.target.elements.embed.checked,
		comments: evt.target.elements.comments.checked
	} );
} );

cookieDialogCloseButton.addEventListener( 'click', () => {
	closeCookieBanner();
	cookieDialog.close();
} );

function closeCookieBanner() {
	document.documentElement.classList.remove( 'cookie-banner-shown' );
}

function updateCookieDialog() {
	cookieDialogForm.elements.prefs.checked = cookiePrefences.prefs;
	cookieDialogForm.elements.embed.checked = cookiePrefences.embed;
	cookieDialogForm.elements.comments.checked = cookiePrefences.comments;
}

function setCookiePreferences( preferences ) {
	saveToStorage( 'cookiePreferences', preferences );

	cookiePrefences = preferences;
}

function getFromStorage( key ) {
	try {
		return JSON.parse( localStorage.getItem( key ) );
	} catch {
		return undefined;
	}
}

function saveToStorage( key, value ) {
	try {
		localStorage.setItem( key, JSON.stringify( value ) );
	} catch {
		// noop
	}
}

class EmbedComponent extends HTMLElement {
	#motionWarning = [
		'https://giphy.com'
	];

	#urlHandlers = new Map( [
		[ 'https://codepen.io', ( url ) => {
			return String( url ).replace( '/pen/', '/embed/' );
		} ],

		[ 'https://jsfiddle.net', ( url ) => {
			const urlWithoutSlash = String( url ).replace( /\/$/, '' );

			return `${ urlWithoutSlash }/embedded/`;
		} ],

		[ 'https://giphy.com', ( url ) => {
			return url;
		} ],

		[ 'https://www.youtube.com',  ( url ) => {
			return String( url ).replace( 'youtube.com/watch?v=', 'youtube-nocookie.com/embed/' );
		} ]
	] );

	connectedCallback() {
		if ( !cookiePrefences.embed ) {
			return;
		}

		const src = this.getAttribute( 'src' );

		if ( !URL.canParse( src ) ) {
			return;
		}

		const embedUrl = new URL( src );
		const motionWarning = this.#motionWarning.includes( embedUrl.origin );

		if ( motionWarning && window.matchMedia( 'prefers-reduced-motion: reduced' ) ) {
			this.insertAdjacentHTML( 'afterbegin', '<p>⚠️ Treść może zawierać ruszające się elementy!</p>' );

			return;
		}

		const urlHandler = this.#urlHandlers.get( embedUrl.origin );

		if ( !urlHandler ) {
			return;
		}

		const iframeUrl = urlHandler( embedUrl );

		const iframe = document.createElement( 'iframe' );

		iframe.src = iframeUrl;

		this.innerHTML = '';
		this.append( iframe );
	}
}

customElements.define( 'embed-', EmbedComponent );

class CommentsComponent extends HTMLElement {
	connectedCallback() {
		if ( !cookiePrefences.comments ) {
			return;
		}

		const theme = this.#getTheme();
		const script = document.createElement( 'script' );

		script.setAttribute( 'data-repo', 'Comandeer/blog' );
		script.setAttribute( 'data-repo-id', 'MDEwOlJlcG9zaXRvcnk4MDkyMTIyOA==' );
		script.setAttribute( 'data-category', 'Announcements' );
		script.setAttribute( 'data-category-id', 'DIC_kwDOBNLCjM4ChGfo' );
		script.setAttribute( 'data-mapping', 'specific' );
		script.setAttribute( 'data-term', this.getAttribute( 'thread' ) );
		script.setAttribute( 'data-strict', '0' );
		script.setAttribute( 'data-reactions-enabled', '0' );
		script.setAttribute( 'data-emit-metadata', '1' );
		script.setAttribute( 'data-input-position', 'top' );
		script.setAttribute( 'data-theme', theme );
		script.setAttribute( 'data-lang', 'pl' );
		script.setAttribute( 'data-loading', 'lazy' );
		script.crossOrigin = 'anonymous';
		script.async = true;
		script.src = 'https://giscus.app/client.js';

		this.replaceWith( script );
	}

	#getTheme() {
		const currentTheme = document.documentElement.dataset.theme;

		if ( currentTheme === 'auto' ) {
			return 'preferred_color_scheme';
		}

		return `${ currentTheme }_high_contrast`;
	}
}

customElements.define( 'comments-', CommentsComponent );
