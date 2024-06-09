const themeSwitcherInvoker = document.querySelector( '.theme-switcher__invoker' );
const themeSwitcherInvokerIcon = document.querySelector( '.theme-switcher__invoker-icon' );
const themeSwitcherList = document.querySelector( '.theme-switcher__list' );
const themeSwitcherOptions = Array.from( themeSwitcherList.querySelectorAll( '.theme-switcher__option' ) );
let currentFocusIndex = -1;
let currentTheme = localStorage.getItem( 'theme' ) ?? 'auto';

themeSwitcherInvoker.addEventListener( 'click', toggleThemeSwitcher );

document.addEventListener( 'click', ( evt ) => {
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

	if ( evt.target.closest( '.theme-switcher__list, .theme-switcher__invoker' ) ) {
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

updateThemePreferences( currentTheme );
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
	localStorage.setItem( 'theme', theme );
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
