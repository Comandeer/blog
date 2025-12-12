---
layout: post
title: "Zagięty róg książki"
description: "Czasami trzeba zrobić coś nietypowego z aktualnie odwiedzaną stroną WWW, ale pisanie rozszerzenia przeglądarki jest zbyt skomplikowane. Wówczas pozostają skryptozakładki!"
author: Comandeer
date: 2025-12-13T00:00:00+0100
tags:
    - adwent-2025
    - javascript
comments: true
permalink: /zagiety-rog-ksiazki.html
---

Czasami trzeba zrobić coś _nietypowego_ z aktualnie odwiedzaną stroną. Ot, choćby wygenerować spis treści dla [mojego wpisu o XSLT](https://blog.comandeer.pl/xslt-jeszcze-zywa-skamielina-sieci). Jak to jednak zrobić jako osoba odwiedzająca stronę?<!--more-->

## Czemu nie rozszerzenie przeglądarki?

Pierwszą myślą zapewne są [rozszerzenia przeglądarki](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions). Dzięki nim można dodawać do przeglądarki przeróżne nowe funkcje, poczynając od [blokowania reklam](https://chromewebstore.google.com/detail/ublock-origin-lite/ddkjiahejlhfcafbddmgiahcphecmpfh?hl=en), a kończąc na [ulepszaniu interfejsu GitHuba](https://github.com/refined-github/refined-github). Nie byłoby więc żadnym problemem dla rozszerzenia, żeby wygenerować spis treści na stronie.

Haczyk polega na tym, że napisanie rozszerzenia nie jest aż takie proste. Mimo że na przestrzeni lat zaszły zmiany, które to mocno ułatwiły, to wciąż jest to nieopłacalna ilość pracy, jeśli chcemy zrobić coś naprawdę małego. Rozszerzenia tworzy się przy pomocy [specjalnego API](https://developer.chrome.com/docs/extensions/reference/). Oczywiście, istnieją osobne jego wersje dla przeglądarek opartych o Chromium, Firefoksa oraz Safari. W praktyce rozszerzenie napisane dla Chrome'a da się [łatwo dostosować pod Firefoksa](https://extensionworkshop.com/documentation/develop/porting-a-google-chrome-extension/). Safari to osobna historia i [wymaga odpowiednich narzędzi](https://developer.apple.com/documentation/safariservices/packaging-a-web-extension-for-safari). Wciąż jednak można uznać proces tworzenia rozszerzenia pod wszystkie najważniejsze przeglądarki za względnie prosty. A doszliśmy do tego dzięki różnym [inicjatywom standaryzującym](https://github.com/w3c/webextensions).

Każde rozszerzenie [składa się z kilku części](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension): [manifestu (metadanych)](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension#manifest.json), [skryptów działających w tle](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Background_scripts), [skryptów działających na aktualnie odwiedzanej stronie](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts) oraz [UI samego rozszerzenia](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Anatomy_of_a_WebExtension#sidebars_popups_and_options_pages) (np. okienka z opcjami). Jednak samo stworzenie rozszerzenia to dopiero połowa zabawy. Żeby było dostępne dla innych, trzeba je opublikować w sklepie z roszerzeniami danej przeglądarki. A każdy z nich ma inne wymagania i inny proces. Innymi słowy: dla małych rzeczy jest to gra niewarta świeczki.

## Skryptozakładki

Na szczęście istnieje pewien prosty sposób, dzięki któremu da się imitować działanie rozszerzeń: [<i lang="en">bookmarklets</i> (skryptozakładki)](https://en.wikipedia.org/wiki/Bookmarklet). To nic innego, jak zakładki w przeglądarce, które, zamiast odsyłać do strony WWW, wykonują jakąś akcję. Związane jest to ze specjalnym [schematem URL-i](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes): [`javascript`](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/javascript). Jak sama jego nazwa sugeruje, pozwala on na stworzenie URL-a, który wykona kod JS. Przykładowy URL może wyglądać tak:

```
javascript:alert(1)
```

Jeśli ten kod wkleimy lub wpiszemy do paska adresu w przeglądarce i naciśniemy <kbd>Enter</kbd>, naszym oczom okaże się wyskakujący komunikat o treści <q>1</q>. Ten sam efekt można uzyskać, tworząc <a href="javascript:alert(1)">specjalny link</a>. Taki link można następnie przeciągnąć na pasek zakładek przeglądarki i zapisać sobie skryptozakładkę "na później".

Do skryptozakładek można włożyć praktycznie dowolny kod JS. Dzięki temu można zrobić np. [narzędzie do sprawdzania dostępności](https://sa11y.netlify.app/bookmarklet/). Trzeba jedynie pamiętać, żeby taki kod był zgodny ze skłądnią URL-i, np. białe znaki powinny być [odpowiednio zakodowane](https://developer.mozilla.org/en-US/docs/Glossary/Percent-encoding). W przeglądarce służą do tego [funkcja `encodeURIComponent()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) oraz [funkcja `encodeURI()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURI):

```javascript
console.log( 'javascript:' + encodeURIComponent( `alert( 'Hello, world!' );` ) ); // 1
console.log( encodeURI( `javascript:alert( 'Hello, world!' );` ) ); // 2
```

W przypadku `encodeURIComponent()` kodowaniu poddajemy tylko część URL-a po schemacie (1). Natomiast w przypadku `encodeURI()` – cały URL (2). Warto też zauważyć, że `encodeURIComponent()` koduje więcej znaków.

Skryptozakładki mają jednak jeden, bardzo spory haczyk: są traktowane jak zwyczajne skrypty JS. Zatem podlegają zasadom [<i lang="en">Content Security Policy</i>](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP). Jeśli dana strona nie zezwala na skrypty spoza konkretnego [originu](https://developer.mozilla.org/en-US/docs/Glossary/Origin), skryptozakładka nie zadziała. Przeglądarki nakładają też limity na długość URL-i i dłuższe skrypty po prostu się nie zmieszczą w skryptozakładkach. [Sensownym limitem wydaje się długość ok. 8000 znaków](https://stackoverflow.com/a/417184).

## Skryptozakładka generująca spis treści

### Kod

Napiszmy zatem kod naszej skryptozakładki generującej spis treści. Będzie ona robić kilka rzeczy:

1. wyszukiwać wszystkie nagłówki,
2. tworzyć na ich podstawie listę z linkami,
3. wstawiać tę listę jako przypięty element z lewej strony.

Z racji tego, że to skryptozakładka, całość otoczona będzie w [IIFE](https://developer.mozilla.org/en-US/docs/Glossary/IIFE). Dzięki temu odpali się w momencie kliknięcia w link:

```javascript
( function() {

}() );
```

Dodajmy teraz logikę odpowiedzialną za wyszukiwanie nagłówków i tworzenie z nich listy z linkami:

```javascript
( function() {
	const headings = document.querySelectorAll( 'main :where(h1, h2, h3, h4, h5, h6)' ); // 1
	let currentLevel = 1; // 2
	const nav = createList( currentLevel ); // 3
	let currentList = nav; // 4

	for ( const heading of headings ) { // 5
		setLevel( getHeadingLevel( heading ) ); // 6

		const listItem = createListItem( heading ); // 7

		currentList.append( listItem ); // 8
	}

	document.body.append( createNavContainer( nav ) ); // 9
}() );
```

Na początku wyszukujemy wszystkie nagłówki, które są wewnątrz elementu `main` (1). Dzięki temu odsiejemy nieinteresujące nas nagłówki, jak np. te od modala z ciasteczkami. Warto zauważyć jak [pseudoklasa `:where()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:where) pomaga nam uzyskać prostszy selektor. Potem ustawiamy aktualny poziom zagłębienia nagłówków (2), tworzymy listę nagłówków danego poziomu (3) oraz ustawiamy ją jako aktualną listę (4). Następnie iterujemy po nagłówkach (5) i dla każdego ustawiamy poziom zagłębienia (6). Następnie tworzymy nowy element listy na podstawie nagłówka (7) i dodajemy go do aktualnej listy (8). Na samym końcu tworzymy kontener z nawigacją i wstawiamy go na stronę (9).

Na pierwszy rzut oka ta logika może wydawać się dziwna, ale chcemy uzyskać listę, w której poszczególne nagłówki będą miały odpowiedni poziom zagłębienia:

* Główny nagłówek artykułu
	* Podsekcja
		* Podpodsekcja
	* Kolejna podsekcja

Żeby to uzyskać, nasz skrypt:

1. Trzyma informację o tym, na jakim poziomie zagłębienia jest.
2. Jeśli kolejny dodawany nagłówek jest na wyższym poziomie zagłębienia:
	1. Dodaje nową zagnieżdżoną listę.
	2. Dodaje do tej nowej listy link do nagłówka.
3. Jeśli kolejny dodawany nagłówek jest na niższym poziomie zagłębienia:
	1. Wyszukuje najbliższą listę, która ma ten poziom zagłębienia.
	2. Dodaje do tej listy link do nagłówka.
4. Jeśli kolejny dodawany nagłówek jest na tym samym poziomie zagłębienia:
	1. Dodaje do obecnej listy link do nagłówka.

Ten algorytm jest implementowany przez funkcję `setLevel()`:

```javascript
function setLevel( level ) {
	const lastLevel = currentLevel; // 1

	currentLevel = level; // 2

	if ( lastLevel < level ) { // 3
		const newList = createList( level ); // 4

		currentList.lastElementChild.append( newList ); // 5

		currentList = newList; // 6
	} else { // 7
		currentList = currentList.closest( `[data-level="${ level }"]` ); // 8
	}
}
```

Na początku zapisujemy obecny poziom zagłębienia do zmiennej `lastLevel` (1). Dzięki temu możemy nadpisać aktualny poziom tym przekazanym do funkcji (2). Następnie sprawdzamy, czy nowy poziom jest większy od poprzedniego (3). Jeśli tak, tworzymy nową listę z nowym poziomem zagłębienia (4) i dodajemy ją do tej obecnej (5). Następnie ustawiamy obecną listę na tę nowo utworzoną (6). Jeśli nie (7), znajdujemy najbliższą listę z nowym poziomem zagłębienia (8). [Metoda `#closest()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/closest) tak naprawdę pokrywa punkty 3. i 4. algorytmu, ponieważ w przypadku, gdy nowy poziom zagłębienia jest taki sam jak stary, `#closest()` też zwróci poprawną listę.

Samym tworzeniem listy zajmuje się funkcja `createList()`:

```javascript
function createList( level ) { // 1
	const list = document.createElement( 'ul' ); // 3

	list.style.listStyleType = 'none'; // 4
	list.dataset.level = level; // 2

	return list; // 5
}
```

Przekazujemy jej poziom zagłębienia listy (1), który dodajemy jako atrybut `[data-level]` do samej listy (2). Oprócz tego, funkcja tworzy listę (3), usuwa z niej styl punktora (4), a na końcu zwraca stworzoną listę (5).

Z kolei element listy z linkiem do nagłówka jest tworzony przy pomocy funkcji `createListItem()`:

```javascript
function createListItem( heading ) {
	const listItem = document.createElement( 'li' );

	listItem.innerHTML = heading.innerHTML;

	return listItem;
}
```

Zawartość elementu listy (1) to po prostu prosta kopia zawartości nagłówka. Z racji tego, że nagłówki na blogu już są podlinkowane, taki zabieg w pełni wystarcza do stworzenia działającego spisu treści.

Dla kompletności dorzucam jeszcze kod funkcji `getHeadingLevel()` oraz `createNavContainer()`:

```javascript
function getHeadingLevel( heading ) {
	return Number( heading.tagName.replace( 'H', '' ) ); // 1
}

function createNavContainer( nav ) {
	const container = document.createElement( 'div' ); // 1

	container.style.position = 'fixed'; // 2
	container.style.insetInlineStart = 0; // 3
	container.style.insetBlockStart = 0; // 4
	container.style.border = '2px var(--secondary) solid';

	container.append( nav );

	return container;
}
```

Funkcja `getHeadingLevel()` wyciąga poziom nagłówka z [nazwy jego elementu HTML](https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName) (1). Wycina z niej literę `H`, a resztę konwertuje z ciągu tekstowego na liczbę. Z kolei funkcja `createNavContainer()` tworzy element `div` (1), a następnie nadaje mu odpowiednie style, by był przyczepiony (2) w lewym (3), górnym (4) rogu strony.

Całość kodu prezentuje się następująco:

```javascript
( function() {
	const headings = document.querySelectorAll( 'main :where(h1, h2, h3, h4, h5, h6)' );
	let currentLevel = 1;
	const nav = createList( currentLevel );
	let currentList = nav;

	for ( const heading of headings ) {
		setLevel( getHeadingLevel( heading ) );

		const listItem = createListItem( heading );

		currentList.append( listItem );
	}

	document.body.append( createNavContainer( nav ) );

	function createList( level ) {
		const list = document.createElement( 'ul' );

		list.style.listStyleType = 'none';
		list.dataset.level = level;

		return list;
	}

	function setLevel( level ) {
		const lastLevel = currentLevel;

		currentLevel = level;

		if ( lastLevel < level ) {
			const newList = createList( level );

			currentList.lastElementChild.append( newList );

			currentList = newList;
		} else {
			currentList = currentList.closest( `[data-level="${ level }"]` );
		}
	}

	function getHeadingLevel( heading ) {
		return Number( heading.tagName.replace( 'H', '' ) );
	}

	function createListItem( heading ) {
		const listItem = document.createElement( 'li' );

		listItem.innerHTML = heading.innerHTML;

		return listItem;
	}

	function createNavContainer( nav ) {
		const container = document.createElement( 'div' );

		container.style.position = 'fixed';
		container.style.insetInlineStart = 0;
		container.style.insetBlockStart = 0;
		container.style.border = '2px var(--secondary) solid';

		container.append( nav );

		return container;
	}
}() );
```

### Tworzenie skryptozakładki

Tak naprawdę samo stworzenie skryptozakładki sprowadza się do przepuszczenia powyższego kodu JS przez funkcję `encodeURIComponent()`, a następnie zrobienie z tego URL-a. Ale że to nudne, przygotowałem proste narzędzie do konwersji:

{% include 'embed' src="https://codepen.io/Comandeer/pen/MYyRgBB" %}

Generator składa się z dwóch zasadniczych części: formularza w HTML-u oraz JS-owego kodu jego obsługi. Sam formularz jest prosty:

```html
<form id="generator">
	<p><label for="code">JS code</label></p>
	<p><textarea name="code" id="code"></textarea></p> <!-- 1 -->
	<p><button>Generate</button></p>
	<p><output id="bookmarklet"></output></p> <!-- 2 -->
	<p><a href="" id="link" hidden>Drag me to your bookmark bar</a></p> <!-- 3 -->
</form>
```

Istotne są w nim tak naprawdę trzy elementy:

1. pole tekstowe, w którym trzeba wprowadzić kod do przetworzenia,
2. [element `output`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/output), w którym będzie wyświetlany gotowy URL,
3. link, dzięki któremu będzie można łatwo zainstalować skryptozakładkę w przeglądarce.

Natomiast kod obsługujący ten formularz prezentuje się następująco:

```javascript
const form = document.querySelector( '#generator' );
const output = document.querySelector( '#bookmarklet' );
const link = document.querySelector( '#link' );

form.addEventListener( 'submit', ( evt ) => { // 1
	evt.preventDefault(); // 2

	const formData = new FormData( evt.target ); // 3
	const rawCode = formData.get( 'code' ); // 4

	if ( rawCode.trim() === '' ) { // 5
		link.hidden = true; // 6
		output.value = ''; // 7

		return; // 8
	}

	const optimizedCode = rawCode.replaceAll( /[\t\n]/gu, '' ); // 9
	const bookmarklet = `javascript:${ encodeURIComponent( optimizedCode ) }`; // 10

	output.value = bookmarklet; // 11
	link.href = bookmarklet; // 12
	link.hidden = false; // 13
} );
```

[Nasłuchujemy](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener) na [zdarzenie `submit`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event) formularza (1). [Blokujemy domyślną akcję](https://developer.mozilla.org/en-US/docs/Web/API/Event/preventDefault) (2), a następnie [wyciągamy dane z formularza](https://developer.mozilla.org/en-US/docs/Web/API/FormData) (3). Sprawdzamy, czy zawartość pola tekstowego (4) jest pusta (5). Jeśli tak, ukrywamy linka (6), resetujemy zawartość elementu `output` (7) i wychodzimy z funkcji (8). W przeciwnym wypadku, optymalizujemy zawartość pola tekstowego poprzez usunięcie tabulatorów i znaków nowej linii (9). Dzięki temu pozbywamy się sporej części białych znaków i tym samym – zmniejszamy rozmiar wynikowego URL-a. Na sam koniec tworzymy URL-a (10) i wsadzamy go do elementu `output` (11) oraz do linku (12), który przy okazji pokazujemy (13).

### Gotowa skryptozakładka

Jeśli do powyższego generatora wkleimy nasz kod generujący spis treści, otrzymamy następującego URL-a:

```
javascript:(%20function()%20%7Bconst%20headings%20%3D%20document.querySelectorAll(%20'main%20%3Awhere(h1%2C%20h2%2C%20h3%2C%20h4%2C%20h5%2C%20h6)'%20)%3Blet%20currentLevel%20%3D%201%3Bconst%20nav%20%3D%20createList(%20currentLevel%20)%3Blet%20currentList%20%3D%20nav%3Bfor%20(%20const%20heading%20of%20headings%20)%20%7BsetLevel(%20getHeadingLevel(%20heading%20)%20)%3Bconst%20listItem%20%3D%20createListItem(%20heading%20)%3BcurrentList.append(%20listItem%20)%3B%7Ddocument.body.append(%20createNavContainer(%20nav%20)%20)%3Bfunction%20createList(%20level%20)%20%7Bconst%20list%20%3D%20document.createElement(%20'ul'%20)%3Blist.style.listStyleType%20%3D%20'none'%3Blist.dataset.level%20%3D%20level%3Breturn%20list%3B%7Dfunction%20setLevel(%20level%20)%20%7Bconst%20lastLevel%20%3D%20currentLevel%3BcurrentLevel%20%3D%20level%3Bif%20(%20lastLevel%20%3C%20level%20)%20%7Bconst%20newList%20%3D%20createList(%20level%20)%3BcurrentList.lastElementChild.append(%20newList%20)%3BcurrentList%20%3D%20newList%3B%7D%20else%20%7BcurrentList%20%3D%20currentList.closest(%20%60%5Bdata-level%3D%22%24%7B%20level%20%7D%22%5D%60%20)%3B%7D%7Dfunction%20getHeadingLevel(%20heading%20)%20%7Breturn%20Number(%20heading.tagName.replace(%20'H'%2C%20''%20)%20)%3B%7Dfunction%20createListItem(%20heading%20)%20%7Bconst%20listItem%20%3D%20document.createElement(%20'li'%20)%3BlistItem.innerHTML%20%3D%20heading.innerHTML%3Breturn%20listItem%3B%7Dfunction%20createNavContainer(%20nav%20)%20%7Bconst%20container%20%3D%20document.createElement(%20'div'%20)%3Bcontainer.style.position%20%3D%20'fixed'%3Bcontainer.style.insetInlineStart%20%3D%200%3Bcontainer.style.insetBlockStart%20%3D%200%3Bcontainer.style.border%20%3D%20'2px%20var(--secondary)%20solid'%3Bcontainer.append(%20nav%20)%3Breturn%20container%3B%7D%7D()%20)%3B
```

Teraz wystarczy go zapisać jako zakładkę (np. przeciągając <a href="javascript:(%20function()%20%7Bconst%20headings%20%3D%20document.querySelectorAll(%20'main%20%3Awhere(h1%2C%20h2%2C%20h3%2C%20h4%2C%20h5%2C%20h6)'%20)%3Blet%20currentLevel%20%3D%201%3Bconst%20nav%20%3D%20createList(%20currentLevel%20)%3Blet%20currentList%20%3D%20nav%3Bfor%20(%20const%20heading%20of%20headings%20)%20%7BsetLevel(%20getHeadingLevel(%20heading%20)%20)%3Bconst%20listItem%20%3D%20createListItem(%20heading%20)%3BcurrentList.append(%20listItem%20)%3B%7Ddocument.body.append(%20createNavContainer(%20nav%20)%20)%3Bfunction%20createList(%20level%20)%20%7Bconst%20list%20%3D%20document.createElement(%20'ul'%20)%3Blist.style.listStyleType%20%3D%20'none'%3Blist.dataset.level%20%3D%20level%3Breturn%20list%3B%7Dfunction%20setLevel(%20level%20)%20%7Bconst%20lastLevel%20%3D%20currentLevel%3BcurrentLevel%20%3D%20level%3Bif%20(%20lastLevel%20%3C%20level%20)%20%7Bconst%20newList%20%3D%20createList(%20level%20)%3BcurrentList.lastElementChild.append(%20newList%20)%3BcurrentList%20%3D%20newList%3B%7D%20else%20%7BcurrentList%20%3D%20currentList.closest(%20%60%5Bdata-level%3D%22%24%7B%20level%20%7D%22%5D%60%20)%3B%7D%7Dfunction%20getHeadingLevel(%20heading%20)%20%7Breturn%20Number(%20heading.tagName.replace(%20'H'%2C%20''%20)%20)%3B%7Dfunction%20createListItem(%20heading%20)%20%7Bconst%20listItem%20%3D%20document.createElement(%20'li'%20)%3BlistItem.innerHTML%20%3D%20heading.innerHTML%3Breturn%20listItem%3B%7Dfunction%20createNavContainer(%20nav%20)%20%7Bconst%20container%20%3D%20document.createElement(%20'div'%20)%3Bcontainer.style.position%20%3D%20'fixed'%3Bcontainer.style.insetInlineStart%20%3D%200%3Bcontainer.style.insetBlockStart%20%3D%200%3Bcontainer.style.border%20%3D%20'2px%20var(--secondary)%20solid'%3Bcontainer.append(%20nav%20)%3Breturn%20container%3B%7D%7D()%20)%3B">ten pomocny link</a>). Kiedy już ją odpalimy na wybranym artykule, po lewej stronie powinien się pojawić spis treści:

{% figure "../../images/zagiety-rog-ksiazki/spis-tresci.png" "Fragment wpisu &quot;XSLT – (jeszcze) żywa skamielina Sieci&quot;; w lewym górnym rogu znajduje się ramka ze spisem treści wpisu z linkami do poszczególnych nagłówków." "Przykład działania na [wpisie o XSLT](https://blog.comandeer.pl/xslt-jeszcze-zywa-skamielina-sieci)" %}

Tak oto w zamierzchłych czasach rozszerzało się możliwości przeglądarki!

