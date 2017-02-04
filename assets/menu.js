( function( toggler ) {
	var id = toggler.getAttribute( 'href' ).substr( 1 ),
		menu = document.getElementById( id );

	function isMenuVisible( menu ) {
		return menu.classList.contains( 'trigger--opened' ) || location.hash === '#' + menu.id;
	}

	function closeMenu( menu, toggler ) {
		menu.classList.remove( 'trigger--opened' );

		toggler.setAttribute( 'aria-expanded', 'false' );
	}

	function toggleMenu( menu, toggler ) {
		var isVisible;

		menu.classList.toggle( 'trigger--opened' );
		isVisible = isMenuVisible( menu );

		toggler.setAttribute( 'aria-expanded', String( isVisible ) );
	}

	toggler.setAttribute( 'role', 'button' );
	toggler.setAttribute( 'aria-controls', id );
	toggler.setAttribute( 'aria-label', 'Rozwiń/zwiń menu' );
	toggler.setAttribute( 'aria-expanded', String( isMenuVisible( menu ) ) );

	toggler.addEventListener( 'keydown', function( evt ) {
		if ( evt.keyCode === 32 || evt.keyCode === 13 ) {
			evt.preventDefault();
			toggleMenu( menu, toggler );
		}
	}, false );

	window.addEventListener( 'click', function( evt ) {
		if ( evt.target === toggler || toggler.contains( evt.target ) ) {
			evt.preventDefault();
			return toggleMenu( menu, toggler );
		}

		if ( menu.contains( evt.target ) ) {
			return;
		}

		closeMenu( menu, toggler );
	}, false );

	window.addEventListener( 'keydown', function( evt ) {
		if ( isMenuVisible( menu ) && evt.keyCode === 27 ) {
			evt.preventDefault();
			return closeMenu( menu, toggler );
		}
	}, false );

}( document.querySelector( '.menu-icon' ) ) );
