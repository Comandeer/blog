window.loadComponent = ( function() {
	function fetchAndParse( URL ) {
		return fetch( URL ).then( ( response ) => {
			return response.text();
		} ).then( ( html ) => {
			const parser = new DOMParser();
			const document = parser.parseFromString( html, 'text/html' );
			const head = document.head;
			const template = head.querySelector( 'template' );
			const style = head.querySelector( 'style' );
			const script = head.querySelector( 'script' );

			return {
				template,
				style,
				script
			};
		} );
	}

	function getSettings( { template, style, script } ) {
		const jsFile = new Blob( [ script.textContent ], { type: 'application/javascript' } );
		const jsURL = URL.createObjectURL( jsFile );

		function getListeners( settings ) {
			return Object.entries( settings ).reduce( ( listeners, [ setting, value ] ) => {
				if ( setting.startsWith( 'on' ) ) {
					listeners[ setting[ 2 ].toLowerCase() + setting.substr( 3 ) ] = value;
				}

				return listeners;
			}, {} );
		}

		return import( jsURL ).then( ( module ) => {
			const listeners = getListeners( module.default );

			return {
				name: module.default.name,
				listeners,
				template,
				style
			}
		} );
	}

	function registerComponent( { template, style, name, listeners } ) {
		class UnityComponent extends HTMLElement {
			connectedCallback() {
				this._upcast();
				this._attachListeners();
			}

			_upcast() {
				const shadow = this.attachShadow( { mode: 'open' } );

				shadow.appendChild( style.cloneNode( true ) );
				shadow.appendChild( document.importNode( template.content, true ) );
			}

			_attachListeners() {
				Object.entries( listeners ).forEach( ( [ event, listener ] ) => {
					this.addEventListener( event, listener, false );
				} );
			}
		}

		return customElements.define( name, UnityComponent );
	}

	function loadComponent( URL ) {
		return fetchAndParse( URL ).then( getSettings ).then( registerComponent );
	}

	return loadComponent;
}() );
