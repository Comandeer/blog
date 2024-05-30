---
layout: post
title:  "Jednoplikowe komponenty"
description: "Eksperyment z przeniesieniem jednoplikowych komponentów znanych z Vue.js do środowiska Web Components."
author: Comandeer
date: 2018-06-30T19:50:00+0100
tags:
    - javascript
    - html-css
    - eksperymenty
comments: true
permalink: /jednoplikowe-komponenty.html
redirect_from:
    - /javascript/html-css/eksperymenty/2018/06/30/jednoplikowe-komponenty.html
---

Chyba każdy, kto miał styczność z [frameworkiem Vue](https://vuejs.org/), słyszał również o jego [jednoplikowych komponentach](https://vuejs.org/v2/guide/single-file-components.html). Ten super prosty pomysł pozwala definiować cały kod odpowiedzialny za konkretny komponent w jednym pliku. Jest to na tyle dobre rozwiązanie, że [pojawiła się inicjatywa przeniesienia tego mechanizmu do przeglądarek](https://github.com/TheLarkInn/unity-component-specification). Niemniej – stanęła w miejscu i od sierpnia tamtego roku nic się nie wydarzyło. Mimo to myślę, że spojrzenie na ten problem i próba dostosowania go do przeglądarki jest ciekawym zagadnieniem, którym się dzisiaj zajmiemy.<!--more-->

## Jednoplikowe komponenty

Zaznajomieni z pojęciem <i lang="en">Progressive Enhancement</i> zapewne znają [mantrę o podziale strony na warstwy](https://webroad.pl/inne/3722-progressive-enhancement-zapomniany-fundament). W przypadku myślenia o komponentach wbrew pozorom wcale się to nie zmienia. Ba, tych warstw jest jeszcze więcej, bo każdy komponent ma co najmniej 3 warstwy: treści/szablonu, prezentacji i zachowania. Przy najbardziej konserwatywnym podejściu oznacza to tyle, że każdy komponent składa się z co najmniej 3 plików, np. komponent `Button` wyglądałby tak:

```
Button/
|
| -- Button.html
|
| -- Button.css
|
| -- Button.js
```

Przy tego typu podejściu warstwy są dzielone tak samo jak poszczególne technologie (treść/szablon – HTML, prezentacja – CSS, zachowanie – JS). To oznacza, że – jeśli nie używamy żadnego narzędzia budującego – przeglądarka będzie musiała wczytać wszystkie 3 pliki. Stąd też pojawił się pomysł, żeby pozostawić podział na warstwy, ale nie robić podziału na poszczególne technologie. Tak zrodziły się jednoplikowe komponenty.

<p class="note">Zwykle jestem sceptycznie nastawiony do pojęcia "podział na technologie". Wynika to jednak z tego, że pojawia się ono najczęściej jako <a href="https://medium.com/@hayavuk/regardless-of-how-it-relates-to-styled-components-which-i-could-not-care-less-about-this-1c75825582d0">wytłumaczenie, czemu w danym projekcie podział na warstwy jest odrzucony</a> – a przecież te dwie kwestie tak naprawdę są całkowicie oddzielne!</p>

Komponent `Button` w postaci jednoplikowej wyglądałby mniej więcej tak:

```html
<template>
	<!-- Tutaj zawartość Button.html. -->
</template>

<style>
	/* Tutaj zawartość Button.css. */
</style>

<script>
	// Tutaj zawartość Button.js.
</script>
```

Już na pierwszy rzut oka widać, że jednoplikowy komponent to tak naprawdę Stary Dobry HTML™ z wewnętrznymi stylami i skryptami + znacznikiem `template`. Tym sposobem, przy użyciu najprostszych metod, uzyskaliśmy komponent, w którym wciąż widać wyraźny podział na warstwy (treść/szablon – `template`, prezentacja – `style`, zachowanie – `script`) bez potrzeby uciekania się do tworzenia osobnych plików.

Pozostaje zatem najważniejsze pytanie: jak tego użyć?

## Podstawowe założenia

Żeby móc wczytywać tego typu komponenty, utworzymy sobie _globalną_ funkcję `loadComponent`:

```javascript
window.loadComponent = ( function() {
	function loadComponent( URL ) {}

	return loadComponent;
}() );
```

Zastosowałem tutaj [wzorzec modułu](https://addyosmani.com/resources/essentialjsdesignpatterns/book/#modulepatternjavascript). Pozwoli on nam zdefiniować niezbędne funkcje pomocnicze, wystawiając na zewnątrz wyłącznie funkcję `loadComponent`. Jak na razie funkcja ta nic nie robi.

I dobrze, bo nie mamy nawet czego wczytać! Załóżmy, że będziemy chcieli stworzyć komponent `hello-world`, który będzie wyświetlał tekst:

> Hello, world! My name is &lt;podane imię&gt;.

Dodatkowo, po kliknięciu, nasz komponent będzie wyświetlał komunikat:

> Don't touch me!

Zapiszemy kod naszego komponentu do pliku `HelloWorld.wc` (`.wc`, czyli plik zawierający Web Component; tak, wiem, po polsku to źle brzmi). Na samym początku będzie on wyglądał tak:

```html
<template>
	<div class="hello">
		<p>Hello, world! My name is <slot></slot>.</p>
	</div>
</template>

<style>
	div {
		background: red;
		border-radius: 30px;
		padding: 20px;
		font-size: 20px;
		text-align: center;
		width: 300px;
		margin: 0 auto;
	}
</style>

<script></script>
```

Jak widać, na razie nie dodaliśmy żadnego zachowania dla naszego komponentu. Zdefiniowaliśmy jedynie jego szablon i style. Swobodne użycie `div` w CSS i pojawienie się `slot` sugeruje, że nasz komponent będzie używał [Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM). I tak też będzie: domyślnie wszystkie style i szablon wylądują w cieniu.

Wykorzystanie tego komponentu na stronie powinno być maksymalnie łatwe:

```html
<hello-world>Comandeer</hello-world>

<script src="loader.js"></script>
<script>
	loadComponent( 'HelloWorld.wc' );
</script>
```

Używamy naszego komponentu jak typowego [Custom Elementu](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements). Jedyną różnicą jest potrzeba wczytania go przy pomocy funkcji `loadComponent` (którą zasysamy z pliku `loader.js`). Ta funkcja robi za nas wszystkie potrzebne rzeczy, typu rejestracja komponentu przy pomocy `customElements.define`.

Tyle założeń, przejdźmy do konkretów!

## Podstawowy "ładowacz"

Skoro chcemy wczytać dane z zewnętrznego pliku, musimy się posłużyć nieśmiertelnym Ajaksem. Mamy rok 2018, więc _wypada_ użyć [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch):

```javascript
function loadComponent( URL ) {
	return fetch( URL );
}
```

Cóż za postęp! Niemniej na razie jedynie pobieramy ten plik, absolutnie nic z nim nie robiąc. Aby dobrać się do jego zawartości, najwygodniej będzie zamienić odpowiedź na tekst:

```javascript
function loadComponent( URL ) {
	return fetch( URL ).then( ( response ) => {
		return response.text();
	} );
}
```

Z racji tego, że zwracamy w `loadComponent` wynik funkcji `fetch`, nasza funkcja `loadComponent` zwraca [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). Możemy to wykorzystać do sprawdzenia, czy faktycznie wczytało nam zawartość komponentu i przerobiło na zwykły tekst:

```javascript
loadComponent( 'HelloWorld.wc' ).then( ( component ) => {
	console.log( component );
} );
```

{% include 'figure' src="../../images/jednoplikowe-komponenty-fetch.png" link="/assets/images/jednoplikowe-komponenty-fetch.png" alt="Konsola Google Chrome wyświetlająca informacje o wczytaniu pliku HelloWorld.wc, a następnie wyświetlająca jego zawartość w formie tekstu" %}

Działa!

## Parsowanie odpowiedzi

Jednak tekst jako taki nic nam nie daje. Nie po to pisaliśmy nasz plik w HTML-u, żeby teraz wracać do tekstu i [robić niedozwolone](https://stackoverflow.com/a/1732454). Wszak jesteśmy w przeglądarce – środowisku, w którym powstał DOM. Wykorzystajmy jego potęgę!

Okazuje się, że w przeglądarkach znajduje się [klasa `DOMParser`](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser), która umożliwia stworzenie parsera DOM (cóż za niespodzianka!). Stwórzmy ją zatem, by zamienić nasz komponent w sensowny DOM:

```javascript
return fetch( URL ).then( ( response ) => {
	return response.text();
} ).then( ( html ) => {
	const parser = new DOMParser(); // 1

	return parser.parseFromString( html, 'text/html' ); // 2
} );
```

Najpierw tworzymy nową instancję parsera (1), a następnie parsujemy tekstową zawartość komponentu (2). Warto zwrócić przy tym uwagę, że używamy tutaj trybu HTML (`'text/html'`). Jeśli chcesz, by Twój kod był bliższy JSX-owi czy choćby komponentom Vue, to warto ustawić tryb XML (`'text/xml'`). Wówczas wymagałoby to jednak zmian w samej strukturze komponentu (np. trzeba by dodać główny element, który otaczałby wszystkie pozostałe).

Jeśli teraz sprawdzimy, co zwraca `loadComponent`, zauważymy, że jest to kompletne drzewko DOM.

{% include 'figure' src="../../images/jednoplikowe-komponenty-parsowanie.png" link="/assets/images/jednoplikowe-komponenty-parsowanie.png" alt="Konsola Chrome pokazująca sparsowane drzewko DOM komponentu" %}

I mówiąc "kompletne" mam na myśli _naprawdę_ kompletne. W tym wypadku dostajemy pełnoprawny dokument HTML, z `head` i `body`. Jak widać, zawartość naszego komponentu trafiła do `head`. Jest to spowodowane tym, w jaki sposób parser HTML wykonuje swoją pracę.  [Algorytm budowania drzewa DOM](https://html.spec.whatwg.org/multipage/parsing.html#tree-construction) jest opisany dokładnie w specyfikacji HTML LS. W największym uproszczeniu można przyjąć, że konstruując takie drzewko, parser będzie umieszczał wszystko w `head` tak długo, aż nie natknie się na element, który jest dozwolony tylko w `body`. Wszystkie wykorzystane przez nas elementy (`template`, `style`, `script`) są dozwolone w `head`, stąd otrzymujemy taki wynik. Gdybyśmy na początek naszego komponentu dodali np. pusty znacznik `p`, wówczas cała jego zawartość znalazłaby się w `body` dokumentu stworzonego przez parser.

<p class="note">Tak naprawdę nasz komponent jest traktowany jako <em>niepoprawny</em> dokument HTML, ponieważ nie zaczyna się od <code>DOCTYPE</code>. Tym samym powstały z niego dokument znajduje się w tzw. <a href="https://developer.mozilla.org/en-US/docs/Web/HTML/Quirks_Mode_and_Standards_Mode"><i>trybie quirks</i></a>. Na szczęście dla nas nie ma to znaczenia, bo wykorzystujemy parser DOM wyłącznie do pocięcia naszego komponentu na potrzebne nam później części.</p>

Mając już całe drzewko DOM, możemy z niego wyciągnąć tylko potrzebne nam rzeczy:

```javascript
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
```

Zapiszmy zatem całe nasze pobieranie i parsowanie do pierwszej pomocniczej funkcji, `fetchAndParse`:

```javascript
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

	function loadComponent( URL ) {
		return fetchAndParse( URL );
	}

	return loadComponent;
}() );
```

<p class="note">Fetch API to nie jedyny sposób pobrania drzewka DOM z zewnętrznego dokumentu. <a href="https://jsfiddle.net/Comandeer/rokoxp7d/"><code>XMLHttpRequest</code> ma dedykowany tryb <code>document</code></a>, który pozwala pominąć etap samodzielnego parsowania DOM. Jednak coś za coś: <code>XMLHttpRequest</code> nie ma API opartego na <code>Promise</code>, co wymuszałoby jego dodanie własnymi siłami.</p>

## Rejestrowanie komponentu

Skoro już mamy wszystkie potrzebne części, wypada stworzyć funkcję `registerComponent`, która będzie rejestrowała nasz nowy Custom Element i pozwalała na jego użycie:

```javascript
window.loadComponent = ( function() {
	function fetchAndParse( URL ) {
		[…]
	}

	function registerComponent() {

	}

	function loadComponent( URL ) {
		return fetchAndParse( URL ).then( registerComponent );
	}

	return loadComponent;
}() );
```

W ramach przypomnienia: Custom Element musi być klasą dziedziczącą po `HTMLElement`. Dodatkowo każdy nasz komponent będzie korzytał z Shadow DOM, do którego trafią style i zawartość szablonu. To oznacza, że tak naprawdę każdy z naszych komponentów będzie korzystał z takiej samej klasy. Stwórzmy sobie więc ją:

```javascript
function registerComponent( { template, style, script } ) {
	class UnityComponent extends HTMLElement {
		connectedCallback() {
			this._upcast();
		}

		_upcast() {
			const shadow = this.attachShadow( { mode: 'open' } );

			shadow.appendChild( style.cloneNode( true ) );
			shadow.appendChild( document.importNode( template.content, true ) );
		}
	}
}
```

Tworzę tę klasę wewnątrz `registerComponent`, ponieważ korzysta ona z przekazanych funkcji informacji. Klasa korzysta z lekko przerobionego mechanizmu dołączania Shadow DOM opisanego w artykule [<cite>Deklaratywny Shadow DOM</cite>](https://blog.comandeer.pl/javascript/2017/10/31/deklaratywny-shadow-dom.html).

Zostaje nam już ostatnia rzecz związana z rejestrowaniem komponentu – nadanie mu nazwy i dodanie do zbioru komponentów danej strony:

```javascript
function registerComponent( { template, style, script } ) {
	class UnityComponent extends HTMLElement {
		[…]
	}

	return customElements.define( 'hello-world', UnityComponent );
}
```

Jeśli teraz sprobujemy wykorzystać nasz komponent na stronie, powinien zadziałać:

{% include 'figure' src="../../images/jednoplikowe-komponenty-dzialanie1.png" link="/assets/images/jednoplikowe-komponenty-dzialanie1.png" alt="Komponent wyświetlony w Chrome: czerwony prostokąt o zaookrąglonych krawędziach, wewnątrz którego znajduje się napis: &quot;Hello, world! My name is Comandeer.&quot;" %}

## Wczytanie skryptu z komponentu

No, to wszystkie łatwe rzeczy mamy już za sobą. Teraz pora na coś naprawdę trudnego: dodanie warstwy zachowania oraz… dynamicznej nazwy dla naszego komponentu. W poprzednim kroku wpisaliśmy nazwę na sztywno, jednak powinna być pobierana z komponentu. Tak samo powinny być pobierane informacje o słuchaczach zdarzeń (ang. <i lang="en">event listeners</i>), które chcemy przypiąć do naszego Custom Elementu. Posłużymy się tutaj konwencją podobną do tej z Vue:

```html
<template>
	[…]
</template>

<style>
	[…]
</style>

<script>
	export default { // 1
		name: 'hello-world', // 2
		onClick() { // 3
			alert( `Don't touch me!` );
		}
	}
</script>
```

Zakładamy, że `script` wewnątrz pliku komponentu to moduł, dlatego może cokolwiek eksportować (1). A tym eksportem jest obiekt zawierający nazwę komponentu (2) oraz event listenery, ukryte pod metodami, których nazwy zaczynają się od `on…` (3).

Na poziomie pliku komponentu wygląda to bardzo ładnie i nic nie wypływa na zewnątrz (bo moduły nie istnieją w globalnym zakresie). Niemniej pojawia się problem: nigdzie w standardzie nie zdefiniowano, w jaki sposób obsługiwać eksporty z modułów wewnętrznych (czyli tych, których kod jest osadzony bezpośrednio w HTML). Polecenie `import` w ES zakłada bowiem, że dostanie jakiś identyfikator modułu. Najczęściej jest to URL pliku zawierającego jego kod. W przypadku modułów wewnętrznych taki identyfikator nie istnieje.

I zanim się poddamy i zmienimy nasz ładny sposób na jakiś brzydszy (`componentsSettings.push( settingsObject )`), to pora wyciągnąć z szafy ~~tru~~ ohydny hack. Istnieją co najmniej 2 sposoby, by nakłonić przeglądarkę, żeby dany tekst uważała za plik: [Data URI](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) oraz [Object URI](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL). Przyjrzyjmy się im pokrótce.

<p class="note"><a href="https://stackoverflow.com/a/46086545">Na Stack Overflow sugerowane jest użycie Service Workera</a>. W naszym wypadku to typowa armata na muchę, ale warto mieć świadomość istnienia kolejnego rozwiązania.</p>

### Data URI i Object URI

Data URI to sposób starszy i o wiele bardziej prymitywny. Polega na zamianie treści pliku w URL poprzez obcięcie niepotrzebnych białych znaków, a następnie, opcjonalnie, zakodowanie całości przy pomocy Base64. Załóżmy, że mamy taki prosty plik JS:

```javascript
export default true;
```

Jako Data URI wyglądałby następująco:

```
data:application/javascript;base64,ZXhwb3J0IGRlZmF1bHQgdHJ1ZTs=
```

Do takiego URL-a można się następnie odwoływać jakby był normalnym plikiem:

```javascript
import test from 'data:application/javascript;base64,ZXhwb3J0IGRlZmF1bHQgdHJ1ZTs=';

console.log( test );
```

Niemniej największa wada Data URI ujawnia się bardzo szybko: im większy nasz plik JS, tym dłuższy będziemy mieli Data URI. No i dość trudno w takim URL-u zamieścić _w sensowny sposób_ dane binarne. Dlatego też powstały tzw. Object URI. Są one pokłosiem m.in. powstania [File API](https://developer.mozilla.org/en-US/docs/Web/API/File/Using_files_from_web_applications) oraz wprowadzenia tagów `video` i `audio`. Ich zadanie jest bardzo proste: stworzyć z przekazanych danych binarnych fałszywy plik, który miałby unikalny URL działający tylko w obrębie danej strony – czyli innymi słowy: stworzyć plik w pamięci o unikalnej nazwie. Tym sposobem dostajemy zaletę Data URI (prosty sposób stworzenia nowego "pliku"), ale bez jego wad (nagle w kodzie nie znajdzie się 100 MB tekstu).

Object URI tworzy się najczęściej albo ze streamów multimediów (wziętych choćby ze wspomnianych `video` i `audio`) albo plików przesłanych przy pomocy `input[type=file]` czy mechanizmu drag&drop. Na szczęście takie pliki można też stworzyć samemu i służą do tego klasy [`File`](https://developer.mozilla.org/en-US/docs/Web/API/File) (reprezentująca plik) oraz [`Blob`](https://developer.mozilla.org/en-US/docs/Web/API/Blob) (reprezentująca ogólnie dane binarne). W naszym przypadku posłużymy się `Blob`, w którym umieścimy zawartość naszego modulu, a następnie stworzymy z niego Object URI:

```javascript
const myJSFile = new Blob( [ 'export default true;' ], { type: 'application/javascript' } );
const myJSURL = URL.createObjectURL( myJSFile );

console.log( myJSURL ); // blob:https://blog.comandeer.pl/8e8fbd73-5505-470d-a797-dfb06ca71333
```

### Dynamiczny `import`

Niemniej tutaj pojawia się kolejny problem: polecenie `import` nie przyjmuje zmiennej jako identyfikatora modułu. To oznacza, że jakiegokolwiek sposobu byśmy nie próbowali użyć – czy byłoby to podstawianie stworzonego Data URI, czy Object URI – `import` tego nie przyjmie. Zatem porażka?

Nie do końca. Ten problem został już dawno zauważony i stworzono [propozycję dynamicznego importu](https://developers.google.com/web/updates/2017/11/dynamic-import). Na razie jest na 3 etapie standaryzacji, a zatem – pojawiają się pierwsze implementacje. I tutaj wykorzystanie zmiennej nie sprawia już żadnego problemu:

```javascript
const myJSFile = new Blob( [ 'export default true;' ], { type: 'application/javascript' } );
const myJSURL = URL.createObjectURL( myJSFile );

import( myJSURL ).then( ( module ) => {
	console.log( module.default ); // true
} );
```

Jak widać, `import` wykorzystane jako funkcja zwraca `Promise`, do którego przekazywany jest obiekt reprezentujący moduł. Zawiera on też wszystkie zadeklarowane eksporty, łącznie z domyślnym ukrytym jako właściwość `default`.

### Implementacja

Wiemy już, co trzeba zrobić, więc wystarczy to zrobić. Dodajmy kolejną funkcję pomocniczą, `getSettings`. Odpalimy ją przed `registerComponents` i pobierzemy z niej potrzebne nam informacje ze skryptu:

```javascript
function getSettings( { template, style, script } ) {
	return {
		template,
		style,
		script
	};
}

[…]

function loadComponent( URL ) {
	return fetchAndParse( URL ).then( getSettings ).then( registerComponent );
}
```

Na razie funkcja jedynie zwraca przekazane jej parametry. Dodajmy zatem to, o czym przed chwilą mówiliśmy. Na sam początek zamieńmy skrypt na Object URI:

```javascript
const jsFile = new Blob( [ script.textContent ], { type: 'application/javascript' } );
const jsURL = URL.createObjectURL( jsFile );
```

Następnie wczytajmy go przy pomocy `import` i zwróćmy szablon, style oraz wyciągniętą z naszego nieszczęsnego `script` nazwę:

```javascript
return import( jsURL ).then( ( module ) => {
	return {
		name: module.default.name,
		template,
		style
	}
} );
```

Tym sposobem `registerComponent` dostaje dalej trzy parametry, ale zamiast `script` teraz dostaje `name`. Poprawmy zatem jej kod:

```javascript
function registerComponent( { template, style, name } ) {
	class UnityComponent extends HTMLElement {
		[…]
	}

	return customElements.define( name, UnityComponent );
}
```

<i lang="fr">Voilà</i>!

## Warstwa zachowania

Został nam już zatem ostatni element naszego komponentu: zachowanie, czyli po prostu obsługa różnych zdarzeń. Na razie w funkcji `getSettings` z naszego modułu wyciągamy wyłącznie nazwę komponentu. Wypada zatem wyciągnąć także metody obsługi zdarzeń. Posłuży nam do tego [metoda `Object.entries`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries). Powróćmy zatem do `getSettings` i dodajmy odpowiedni kod:

```javascript
function getSettings( { template, style, script } ) {
	[…]

	function getListeners( settings ) { // 1
		const listeners = {};

		Object.entries( settings ).forEach( ( [ setting, value ] ) => { // 3
			if ( setting.startsWith( 'on' ) ) { // 4
                listeners[ setting[ 2 ].toLowerCase() + setting.substr( 3 ) ] = value; // 5
            }
		} );

		return listeners;
	}

	return import( jsURL ).then( ( module ) => {
		const listeners = getListeners( module.default ); // 2

		return {
			name: module.default.name,
			listeners, // 6
			template,
			style
		}
	} );
}
```

Nasza funkcja zrobiła się skomplikowana. W jej wnętrzu pojawiła się kolejna funkcja pomocnicza, `getListeners` (1). Przekazujemy do niej eskport naszego modułu (2). Następnie iterujemy po wszystkich właściwościach tego obiektu przy pomocy `Object.entries` (3). Jeśli nazwa danej właściwości zaczyna się od `on…` (4), to  dodajemy wartość danej właściwości do obiektu `listeners`, pod kluczem równym `setting[ 2 ].toLowerCase() + setting.substr( 3 )` (5). Klucz uzyskujemy po obcięciu `on` i zamianie pierwszej litery na małą (zatem z naszego `onClick` otrzymamy `click`). Tak skonstruowany obiekt przekazujemy następnie dalej (6).

<div class="note">
<p>Zamiast <code>[].forEach</code> można tutaj zastosować też <code>[].reduce</code>, co pozwoli wyeliminować zmienną <code>listeners</code>:</p>
<div class="highlight"><pre><code class="language-javascript">function getListeners( settings ) {
	return Object.entries( settings ).reduce( ( listeners, [ setting, value ] ) => {
		if ( setting.startsWith( 'on' ) ) {
			listeners[ setting[ 2 ].toLowerCase() + setting.substr( 3 ) ] = value;
		}

		return listeners;
	}, {} );
}</code></pre></div>
</div>

Teraz wystarczy już tylko podpiąć te listenery w naszej klasie komponentu:

```javascript
function registerComponent( { template, style, name, listeners } ) { // 1
	class UnityComponent extends HTMLElement {
		connectedCallback() {
			this._upcast();
			this._attachListeners(); // 2
		}

		[…]

		_attachListeners() {
			Object.entries( listeners ).forEach( ( [ event, listener ] ) => { // 3
				this.addEventListener( event, listener, false ); // 4
			} );
		}
	}

	return customElements.define( name, UnityComponent );
}
```

Jak widać, przybył nowy parametr w destrukturyzacji, `listeners` (1) oraz nowa metoda w klasie, `_attachListeners` (2). Znów używamy `Object.entries` by przejść po wszystkich listenerach (3) i je przypiąć do naszego elementu (4).

Po tym zabiegu w końcu klikanie w nasz komponent powinno dawać odpowiedni efekt:

{% include 'figure' src="../../images/jednoplikowe-komponenty-dzialanie2.png" link="/assets/images/jednoplikowe-komponenty-dzialanie2.png" alt="Komunikat wyświetlony w Chrome po naciśnięciu komponentu:  &quot;Don't touch me!&quot;" %}

I tym oto sposobem udało nam się zaimplementować działające jednoplikowe Web Components 🎉!

## Wsparcie przeglądarek i reszta podsumowania

Jak widać, trzeba się nieco napracować, żeby zrobić choćby podstawową obsługę jednoplikowych komponentów. Bardzo wiele elementów tej układanki jest klejonych na szybko z różnych hacków (Object URI do wczytywania modułów – FTW!), a sama technika zdaje się nie mieć sensu, jeśli nie uzyska natywnego wsparcia ze strony przeglądarek. Co więcej, w chwili, gdy piszę te słowa (30 czerwca 2018), w Firefoksie nie ma ani Custom Elements, ani dynamicznego importu. Na dobrą sprawę przedstawione tutaj rozwiązanie działa na razie wyłącznie w Chrome. I dlatego, przynajmniej na razie, jest to raczej ciekawostka niźli coś rzeczywiście użytecznego.

Mimo wszystko dobrze się bawiłem, pisząc prostą implementację takiego rozwiązania. Było to coś _innego_, dotykającego sporej liczby obszarów przeglądarki i nowoczesnych standardów. I mam nadzieję, że przynajmniej jedna osoba dotrwa do końca!

A, [całość oczywiście jest dostępna online](https://blog.comandeer.pl/assets/jednoplikowe-komponenty/).
