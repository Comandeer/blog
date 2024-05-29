---
layout: post
title:  "Stylowalne ikonki SVG"
descriotion: "Kilka sposobów na to, jak ostylować ikonki SVG."
author: Comandeer
date: 2019-07-25T22:15:00+0200
tags:
    - eksperymenty
    - html-css
comments: true
permalink: /stylowalne-ikonki-svg.html
---

To, że [SVG jest lepsze od fontów z ikonami](https://css-tricks.com/icon-fonts-vs-svg/), jest już raczej dość powszechną wiedzą. Ale jeden problem związany z SVG wydaje się nas prześladować od lat i wciąż nie widać rozwiązania na horyzoncie: ikony SVG w zewnętrznym pliku są średnio używalne. Nie da się ich ot tak wczytać z zewnętrznej domeny ([same origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy), FTW!), nie da się stylować ich części, a do niedawna w ogóle nic się nie dało z nimi zrobić…

<small>Wszystkie ikony użyte w tym artykule pochodzą z [Devicon](https://konpa.github.io/devicon/).</small><!--more-->

## Problem

Klient życzy sobie ikonki FB. Znaleźliśmy zatem takową:

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="32" height="32" style="background: #3d5a98; border-radius: 6.53px;">
    <path fill="#fff" id="f" class="cls-2" d="M86.48,123.17V77.34h15.38l2.3-17.86H86.48V48.08c0-5.17,1.44-8.7,8.85-8.7h9.46v-16A126.56,126.56,0,0,0,91,22.7C77.38,22.7,68,31,68,46.31V59.48H52.62V77.34H68v45.83Z"></path>
</svg>

Wstawiamy ją na stronę jako standardowy SVG:

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="32" height="32" style="background: #3d5a98; border-radius: 6.53px;">
    <path fill="#fff" id="f" class="cls-2" d="M86.48,123.17V77.34h15.38l2.3-17.86H86.48V48.08c0-5.17,1.44-8.7,8.85-8.7h9.46v-16A126.56,126.56,0,0,0,91,22.7C77.38,22.7,68,31,68,46.31V59.48H52.62V77.34H68v45.83Z"></path>
</svg>
```

Nic prostszego. Ale klient sobie życzy, żeby po najechaniu tło robiło się różowe a literka – zielona. No ok, da się zrobić:

<style>
	.icon-facebook {
		background: #3d5a98;
		border-radius: 6.53px;
	}
	.icon-facebook:hover {
		background: pink;
	}
	.icon-facebook:hover .cls-2 {
		fill: #0f0;
	}
</style>
<svg xmlns="http://www.w3.org/2000/svg" class="icon-facebook" viewBox="0 0 128 128" width="32" height="32">
    <path fill="#fff" id="f" class="cls-2" d="M86.48,123.17V77.34h15.38l2.3-17.86H86.48V48.08c0-5.17,1.44-8.7,8.85-8.7h9.46v-16A126.56,126.56,0,0,0,91,22.7C77.38,22.7,68,31,68,46.31V59.48H52.62V77.34H68v45.83Z"></path>
</svg>

```html
<style>
	.icon-facebook {
		background: #3d5a98;
		border-radius: 6.53px;
	}
	.icon-facebook:hover {
		background: pink;
	}
	.icon-facebook:hover .cls-2 {
		fill: #0f0;
	}
</style>
<svg xmlns="http://www.w3.org/2000/svg" class="icon-facebook" viewBox="0 0 128 128" width="32" height="32">
    <path fill="#fff" id="f" class="cls-2" d="M86.48,123.17V77.34h15.38l2.3-17.86H86.48V48.08c0-5.17,1.44-8.7,8.85-8.7h9.46v-16A126.56,126.56,0,0,0,91,22.7C77.38,22.7,68,31,68,46.31V59.48H52.62V77.34H68v45.83Z"></path>
</svg>
```

No to ostatnie życzenie klienta: ikonka musi się znajdować w osobnym pliku, nie bezpośrednio w HTML-u. I choćbyśmy nie wiem jak błagali, tak ma być i koniec. Inaczej miliardowy kontrakt przepadnie, a my będziemy musieli płacić odszkodowanie za niewywiązanie się z umowy.

I zanim pójdziemy sprzedać nerkę, by pokryć straty, sprawdźmy, czy mimo wszystko nie mamy jakiejś alternatywy.

## Rozwiązanie #1: naiwne

A co jeślibyśmy przekopiowali całość do SVG, łącznie ze stylami?

```svg
<svg xmlns="http://www.w3.org/2000/svg" class="icon-facebook" viewBox="0 0 128 128">
	<defs>
		<style>
			.icon-facebook {
				background: #3d5a98;
				border-radius: 6.53px;
			}
			.icon-facebook:hover {
				background: pink;
			}
			.icon-facebook:hover .cls-2 {
				fill: #0f0;
			}
		</style>
	</defs>
    <path fill="#fff" id="f" class="cls-2" d="M86.48,123.17V77.34h15.38l2.3-17.86H86.48V48.08c0-5.17,1.44-8.7,8.85-8.7h9.46v-16A126.56,126.56,0,0,0,91,22.7C77.38,22.7,68,31,68,46.31V59.48H52.62V77.34H68v45.83Z"></path>
</svg>
```

Jeśli teraz odwołamy się do takiego obrazka poprzez `img`, to… zadziała tylko połowicznie:

<img src="/assets/stylowalne-ikonki-svg/facebook1.svg" alt="Facebook" width="32" height="32">

```html
<img src="/images/facebook.svg" alt="Facebook" width="32" height="32">
```

Obrazki wstawione przez `img` zawsze są statyczne. Nie pozwalają na zaawansowaną interakcję, jak choćby zareagowanie na `:hover`. Na szczęście jednak istnieje inny znacznik HTML, który na taką interakcję pozwala: `object`.

<object data="/assets/stylowalne-ikonki-svg/facebook1.svg" type="image/svg+xml" width="32" height="32"></object>

```html
<object data="/images/facebook.svg" type="image/svg+xml" width="32" height="32"></object>
```

Działa!

Lecz zanim osiądziemy na laurach, wypada doczytać drobny druczek w umowie z klientem. A tam informacja o tym, że takich ikonek FB na stronie musi być kilka i każda musi mieć inne kolory po najechaniu. A równocześnie wszystkie te ikonki mają być oparte na tym samym pliku SVG.

Po tym jak już wyrwiemy sobie resztki włosów z głowy, czas pomyśleć nad jakimś rozwiązaniem.

## Rozwiązanie #2: prawie dobre

### Przekazywanie parametrów

Musimy w jakiś sposób przekazać informacje o kolorach do konkretnych ikonek na stronie. Jedyne, do czego mamy dostęp po stronie HTML-a, to URL ikonki. A to nasuwa dwa dość oczywiste rozwiązania:

* przekazanie informacji jako parametrów wyszukiwania, np. `facebook.svg?hover=red`;
* przekazanie informacji jako tzw. fragmentu, np. `facebook.svg#hover=red`.

Jak się okazuje, ten problem wcale nie jest taki abstrakcyjny, bo od dawna próbuje się go rozwiązać. Pierwsze próby podjęto w roku 2009, gdy stworzono [rozwiązanie opierające się właśnie na przekazywaniu informacji jako parametrów wyszukiwania](https://www.w3.org/TR/SVGParamPrimer/). Z kolei pod koniec 2018 roku Tab Atkins stworzył [nieoficjalną propozycję rozwiązania opierającego się na przekazywaniu informacji jako fragmentów](https://tabatkins.github.io/specs/svg-params/). Oprócz tej oczywistej różnicy pomiędzy propozycjami istnieje jeszcze jedna, prawdopodobnie bardziej istotna: nowsza propozycja opiera się w całości na niestandardowych własnościach CSS (aka zmiennych CSS), podczas gdy starsza – na funkcji `param()` w CSS.

Z racji tego, że zmienne CSS wydają się o wiele przyjemniejsze w używaniu, tak samo jak i przekazywanie informacji jako parametrów wyszukiwania, połączymy oba rozwiązania i stworzymy przekazywanie zmiennych CSS jako parametrów wyszukiwania!

```
http://example.com/nasz-obrazek.svg?zmienna=wartosc
```

### SVG a JS

Pytanie jednak, jak to zrobić? Odpowiedź kryje się w starszej z propozycji. Można zauważyć, że znajdują się tam działające przykłady rozwiązania. A wszystko w oparciu o skrypt znajdujący się bezpośrednio w pliku SVG:

```svg
<script type="text/ecmascript" xlink:href="param.js" />
```

Z racji tego, że SVG jest poprawnym XML-em, jest tworzony dla niego DOM. A jeśli jest tworzony dla niego DOM, to najprawdopodobniej da się do niego podpiąć przez JS!  Stwórzmy zatem prosty skrypt parsujący przekazywane parametry wyszukiwania na zmienne CSS.

Samo parsowanie parametrów wyszukiwania jest obecnie bardzo proste, dzięki wprowadzeniu [interfejsu `URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams). Wystarczy przekazać do tego konstruktora `location.search`, a więc kolekcję parametrów wyszukiwania, jakie zostały przekazane do danej strony:

```javascript
const params = new URLSearchParams( location.search );
```

Mając ładnie przygotowaną kolekcję parametrów, nie zostaje nam nic innego niż stworzenie z każdej pary klucz-wartość odpowiedniej zmiennej CSS:

```javascript
[ ...params.entries() ].forEach( ( [ param, value ] ) => { // 1
    document.documentElement.style.setProperty( `--${ param }`, value ); // 2
} );
```

`[ ...params.entries() ]` (1) tworzy nam dwuwymiarową tablicę, w której każdy element to tablica zawierająca klucz i wartość danego parametru wyszukiwania. Zatem dla takiego URL-a

```
http://example.com/icon.svg?hover=red&what=ever
```

dostaniemy taką tablicę `params`:

```javascript
[
    [ 'hover', 'red' ],
    [ 'what', 'ever' ]
]
```

Przy pomocy destrukturyzacji wyciągamy nazwę parametru do zmiennej `param`, a wartość – do zmiennej `value`. I na podstawie tych zmiennych tworzymy zmienną CSS na głównym elemencie dokumentu SVG (2).

### Gotowe rozwiązanie

Jeśli połączymy to z SVG i wprowadzimy sensowne zmienne, możemy uzyskać coś takiego:

```svg
<svg xmlns="http://www.w3.org/2000/svg" class="icon-facebook" viewBox="0 0 128 128">
	<defs>
		<style>
			.icon-facebook {
				background: var( --normal-background, #3d5a98 );
				border-radius: 6.53px;
			}
			.icon-facebook .cls-2 {
				fill: var( --normal-fill, #fff );
			}
			.icon-facebook:hover {
				background: var( --hover-background, pink );
			}
			.icon-facebook:hover .cls-2 {
				fill: var( --hover-fill, #0f0 );
			}
		</style>
		<script>
			const params = new URLSearchParams( location.search );
			[ ...params.entries() ].forEach( ( [ param, value ] ) => {
				document.documentElement.style.setProperty( `--${ param }`, value );
			} );
		</script>
	</defs>
    <path id="f" class="cls-2" d="M86.48,123.17V77.34h15.38l2.3-17.86H86.48V48.08c0-5.17,1.44-8.7,8.85-8.7h9.46v-16A126.56,126.56,0,0,0,91,22.7C77.38,22.7,68,31,68,46.31V59.48H52.62V77.34H68v45.83Z"></path>
</svg>
```

Jak widać, wszystkie na stałe wpisane kolory w SVG zamieniliśmy na odpowiednie zmienne z domyślnymi wartościami (gdyby żadna nie została przekazana w URL-u).

Teraz możemy sterować kolorami SVG, przekazując odpowiednie parametry w URL-u:

<object data="/assets/stylowalne-ikonki-svg/facebook2.svg?normal-background=%23f00&normal-fill=blue&hover-background=%230f0&hover-fill=orange" type="image/svg+xml" width="32" height="32"></object>

```html
<object data="/images/facebook.svg?normal-background=%23f00&normal-fill=blue&hover-background=%230f0&hover-fill=orange" type="image/svg+xml" width="32" height="32"></object>
```

<div class="note">
    <p>Warto zauważyć, że <code>img</code> po raz kolejny tutaj nie zadziała. Osadzanie obrazków w taki sposób uniemożliwia odpalenie się skryptów JS.</p>
    <p>Dodatkowo warto zauważyć, że wszystkie parametry przekazywane do naszego SVG muszą być dostosowane do składni URL-ów, a zatem <code>#f00</code> zamienia się na <code>%23f00</code>. Takie kodowanie można uzyskać np. w JS przy pomocy <code>encodeURIComponent</code>.</p>
</div>

## Rozwiązanie #3: dobre

A co jeśli klient jest jeszcze bardziej złośliwy i zechce jeszcze jedną ikonkę, ale równocześnie uprze się, że obydwie mają być _w tym samym pliku SVG_? Na szczęście [sprite'y w SVG to nic nowego](https://betravis.github.io/icon-methods/svg-sprite-sheets.html):

```svg
<svg xmlns="http://www.w3.org/2000/svg">
	<defs>
		<style>
			.icon .background {
				fill: var( --normal-background, #3d5a98 );
				border-radius: 6.53px;
			}
			.icon .path {
				fill: var( --normal-fill, #fff );
			}
			.icon:hover .background {
				fill: var( --hover-background, pink );
			}
			.icon:hover .path {
				fill: var( --hover-fill, #0f0 );
			}
		</style>
		<script>
			const params = new URLSearchParams( location.search );
			[ ...params.entries() ].forEach( ( [ param, value ] ) => {
				document.documentElement.style.setProperty( `--${ param }`, value );
			} );
		</script>
	</defs>

	<view id="facebook" viewBox="0 0 128 128" />
	<view id="typescript" viewBox="128 0 128 128" />

	<g class="icon">
		<rect class="background" x="4.83" y="4.83" width="118.35" height="118.35" rx="6.53" ry="6.53" />
		<path class="path" d="M86.48,123.17V77.34h15.38l2.3-17.86H86.48V48.08c0-5.17,1.44-8.7,8.85-8.7h9.46v-16A126.56,126.56,0,0,0,91,22.7C77.38,22.7,68,31,68,46.31V59.48H52.62V77.34H68v45.83Z" />
	</g>
	<g class="icon" style="transform: translateX( 128px );">
		<rect class="background" x="22.67" y="47" width="99.67" height="73.67" />
		<path class="path" d="M1.5,63.91v62.5h125V1.41H1.5Zm100.73-5a15.56,15.56,0,0,1,7.82,4.5,20.58,20.58,0,0,1,3,4c0,.16-5.4,3.81-8.69,5.85-.12.08-.6-.44-1.13-1.23a7.09,7.09,0,0,0-5.87-3.53c-3.79-.26-6.23,1.73-6.21,5a4.58,4.58,0,0,0,.54,2.34c.83,1.73,2.38,2.76,7.24,4.86,8.95,3.85,12.78,6.39,15.16,10,2.66,4,3.25,10.46,1.45,15.24-2,5.2-6.9,8.73-13.83,9.9a38.32,38.32,0,0,1-9.52-.1,23,23,0,0,1-12.72-6.63c-1.15-1.27-3.39-4.58-3.25-4.82a9.34,9.34,0,0,1,1.15-.73L82,101l3.59-2.08.75,1.11a16.78,16.78,0,0,0,4.74,4.54c4,2.1,9.46,1.81,12.16-.62a5.43,5.43,0,0,0,.69-6.92c-1-1.39-3-2.56-8.59-5-6.45-2.78-9.23-4.5-11.77-7.24a16.48,16.48,0,0,1-3.43-6.25,25,25,0,0,1-.22-8c1.33-6.23,6-10.58,12.82-11.87A31.66,31.66,0,0,1,102.23,58.93ZM72.89,64.15l0,5.12H56.66V115.5H45.15V69.26H28.88v-5A49.19,49.19,0,0,1,29,59.09C29.08,59,39,59,51,59L72.83,59Z" />
	</g>
</svg>
```

Kod obrazków nieco się zmienił, ponieważ pojawiły się dodatkowe elementy `rect`, odpowiedzialne za wyświetlanie tła.

Użycie takiego sprite'a jest bardzo podobne do użycia zwykłej ikony:

<object data="/assets/stylowalne-ikonki-svg/sprite.svg?normal-background=%23f00&normal-fill=blue&hover-background=%230f0&hover-fill=orange#facebook" type="image/svg+xml" width="32" height="32"></object> <object data="/assets/stylowalne-ikonki-svg/sprite.svg?normal-background=%23f00&normal-fill=blue&hover-background=%230f0&hover-fill=orange#typescript" type="image/svg+xml" width="32" height="32"></object>

```html
<object data="/images/sprite.svg?normal-background=%23f00&normal-fill=blue&hover-background=%230f0&hover-fill=orange#facebook" type="image/svg+xml" width="32" height="32"></object> <object data="/assets/stylowalne-ikonki-svg/sprite.svg?normal-background=%23f00&normal-fill=blue&hover-background=%230f0&hover-fill=orange#typescript" type="image/svg+xml" width="32" height="32"></object>
```

Jedyną zmianą jest tak naprawdę pojawienie się fragmentu w URL, który wskazuje, jaką ikonkę chcemy wyświetlić.

### Rozwiązanie #4: najlepsze

A czemu by nie stworzyć Custom Elementu, który by skrzętnie ukrywał wszelkie szczegóły implementacji powyższej techniki? Wówczas wstawianie ikonek sprowadzałoby się do:

```html
<icon- name="facebook" width="32" height="32" normal-background="#f00" normal-fill="blue" hover-background="#0f0" hover-fill="orange"></icon->
```

Nazwę ikonki podajemy jako atrybut `[name]`, wymiary jako `[width]` i `[height]`, a resztę parametrów jako normalne atrybuty naszego CE. Stwórzmy zatem taki prosty CE!

```javascript
class Icon extends HTMLElement { // 1
	connectedCallback() { // 2
		const name = this.getAttribute( 'name' ); // 5
		const width = this.getAttribute( 'width' ) || 32; // 6
		const height = this.getAttribute( 'height' ) || 32; // 7
		const params = this.createSearchQuery();
		const shadow = this.attachShadow( { mode: 'closed' } ); // 3

		shadow.innerHTML = `<object data="sprite.svg?${ params }#${ this.getAttribute( 'name' ) }" type="image/svg+xml" width="${ width }" height="${ height }"></object>`; // 4
	}

	createSearchQuery() { // 8
		const attributes = [ ...this.attributes ].filter( ( { name } ) => { //
			return ![
				'name',
				'width',
				'height'
			].includes( name ); // 9
		} ).map( ( { name, value } ) => { // 11
			return [ name, value ]; // 10
		} );
		const params = new URLSearchParams( attributes ); // 12

		return params.toString(); // 13
	}
}

customElements.define( 'icon-', Icon ); // 14
```

Tworzymy nowy element HTML, `Icon` (1). Następnie dodajemy akcję, która odpali się, gdy dany element zostanie dodany do DOM (2). Tworzymy wewnątrz naszego elementu Shadow DOM (3) i wstawiamy do środka znacznik `object` z naszą ikoną (4). Jej nazwę (5) oraz rozmiary (6, 7) pobieramy z odpowiednich atrybutów (`[name]`, `[width]`, `[height]`). Najbardziej skomplikowane jest przetworzenie pozostałych atrybutów na parametry przekazywane w URL-u. Robi to metoda `createSearchQuery` (8). Korzystając z własności `attributes` naszego elementu DOM pobieramy kolekcję wszystkich atrybutów, z których odsiewamy te niebędące parametrami (9). Następnie tworzymy tablicę dwuwymiarową z atrybutów (10) – dokładnie taką samą, jaką zwróciło nam wcześniej `URLSearchParams`. Musieliśmy tutaj użyć destrukturyzacji (11), ponieważ `element.attributes` jest kolekcją [obiektów `Attr`](https://developer.mozilla.org/en-US/docs/Web/API/Attr), a my chcemy tylko nazwę i wartość atrybutu. Uzyskaną tablicę dwuwymiarową przekazujemy do konstruktora `URLSearchParams` (12), a następnie konwertujemy ten obiekt na ciąg tekstowy (13). To sprawia, że dokonujemy konwersji odwrotnej niż wcześniej: z dwuwymiarowej tablicy parametrów uzyskujemy fragment URL-a. Na koniec dodajemy nasz CE do kolekcji CE danej strony (14).

Wszystko działa, co można sprawdzić empirycznie na [prostym demo](/assets/stylowalne-ikonki-svg/ce.html).

I to by było na tyle, jeśli chodzi o stylowanie ikonek SVG. Miłego przenoszenia kodu SVG do zewnętrznych plików!
