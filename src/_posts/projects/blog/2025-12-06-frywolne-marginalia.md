---
layout: post
title: "Frywolne marginalia"
description: "Dygresje na blogu zawsze były – ale zrobione po macoszemu. W końcu nieco je poprawiłem!"
author: Comandeer
date: 2025-12-06T00:00:00+0100
project: blog
tags:
    - adwent-2025
    - html-css
comments: true
permalink: /frywolne-marginalia.html
---

Nie będę ukrywał – ten blog pełen jest dygresji. Na tyle ich tutaj dużo, że nawet doczekały się swoich własnych stylów. Niemniej całe rozwiązanie było napisane na kolanie i mocno niedomagało. W końcu postanowiłem choć trochę je poprawić.<!--more-->

## Stare dygresje

Przyjrzyjmy się najpierw, jak kiedyś wyglądały dygresje:

{% include 'embed' src="https://codepen.io/Comandeer/pen/zxqMwdv" %}

Od strony HTML-a był to jeden element, najczęściej `p`, z klasą `.note`:

```html
<p class="note">Treść dygresji</p>
```

Mimo to dygresja zawsze wyświetlana była jako element w ramce, w którym nad treścią był  nagłówek z napisem <q>Dygresja</q>. Tego nagłówka nie ma w kodzie, jest dodawany przy pomocy [generowanej treści w CSS-ie](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Generated_content):

```css
.note::before { /* 1 */
	[…]
	content: 'Dygresja'; /* 2 */
    […]
}
```

Do elementu `.note` dodajemy [pseudoelement `::before`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::before) (1) z [własnością `content`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/content) zawierającą treść nagłówka (2).

I choć jest to ciekawa sztuczka, to nastręcza zadziwiająco dużej liczby problemów:

1. Tego typu nagłówek może być [pomijany przez czytniki ekranu](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::before#accessibility). Można się spierać, że pominięcie słowa <q>Dygresja</q> nie jest jakimś poważnym błędem. Ale z drugiej strony – nie ma za bardzo powodu, by je pomijać.

2. Taki nagłówek nie zostanie przetłumaczony przez usługi typu Google Translate:

   {% figure "../../../images/frywolne-marginalia/google-translate.png" "Fragment wpisu przetłumaczone na angielski: nad dygresją znajduje się nagłówek &quot;Triggers&quot;, następnie znajduje się nagłówek &quot;Dygresja&quot; po polsku, po czym następuje treść dygresji oraz reszta wpisu z powrotem po angielsku." %}

3. [Czytniki kanałów](https://pl.wikipedia.org/wiki/Czytnik_kana%C5%82%C3%B3w) potraktują dygresję jak zwyczajny akapit:

   {% figure "../../../images/frywolne-marginalia/rss.png" "Fragment wpisu z czytnika kanałów: nagłówek &quot;Wyzwalacze&quot;, pod którym znajduje się treść dygresji, bez ramki oraz widocznego nagłówka dygresja." %}

   Dzieje się tak dlatego, że nie korzystają z tego samego formatu co osoby odwiedzające stronę ((HTML + CSS), a z [Atoma](https://pl.wikipedia.org/wiki/Atom_(standard)). W nim z kolei nie ma stylów CSS, stąd informacja o dygresji jest tracona.

4. Zmiana nagłówka dla pojedynczej dygresji zaczyna być problematyczna. Musiałbym kombinować np. z [funkcją `attr()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/attr). Tylko jeśli i tak musiałbym zmieniać swój HTML, dodając nowy atrybut, to równie dobrze mógłbym po prostu przenieść nagłówek do HTML-a.

5. No i… takiego nagłówka nie da się zaznaczyć myszą. Osobiście tego typu tekst mnie strasznie irytuje.

A oprócz nagłówka problemy sprawiały też same dygresje. Dokładniej: sposób, w jaki je wstawiałem do postów. Z racji tego, że Markdown nie ma składni do dygresji (pomijając to [GitHubowe dziwactwo](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts)), używałem bezpośrednio HTML-a. A to jest [zadziwiająco złożony temat w Markdownie](https://spec.commonmark.org/0.31.2/#html-blocks). Mówiąc prosto: Markdown wewnątrz HTML-a częściej nie działa niż działa. A ja chciałbym, żeby działał zawsze.

Innymi słowy, potrzebowałem nowych dygresji!

## Nowe dygresje

Tak oto prezentuje się finalny efekt:

{% include 'embed' src="https://codepen.io/Comandeer/pen/emZQWQJ" %}

### Lepszy HTML

Na początku zająłem się podrasowaniem HTML-a:

```html
<div class="note" role="note" aria-labelledby="note-1"> <!-- 1 -->
	<p class="note__label" id="note-1">Dygresja</p> <!-- 2 -->
	<div class="note__content"> <!-- 4 -->
		<p>Cześć, jestem dygresją!</p> <!-- 3 -->
	</div>
</div>
```

Teraz dygresje znajdują się w elemencie `div.note` (1), który dodatkowo ma [rolę `note`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/note_role). Dzięki temu czytniki ekranowe zostaną poinformowane o tym, że ten element zawiera poboczną treść (wtrącenie). Z kolei [atrybut `[aria-labelledby]`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-labelledby) pozwala wskazać, że dygresja jest opisana przez element z etykietą (2). Choć wizualnie etykieta ta przypomina nagłówek (jest większym fontem i na wyróżniającym się tle), to ostatecznie doszedłem do wniosku, że HTML-owy nagłówek byłby tutaj wręcz szkodliwy. Wystarczy wyobrazić sobie artykuł, w którym jest sporo dygresji. Wówczas na stronie byłoby pełno nagłówków o treści <q>Dygresja</q>. Wprowadzałoby to jedynie chaos dla [osób korzystających z czytników ekranu i nagłówków do nawigacji](https://webaim.org/projects/screenreadersurvey10/#finding). Stąd zwykły akapit. Sama treść (3) dygresji z kolei jest wewnątrz elementu `div.note__content` (4). Dzięki temu mogę dodawać bez przeszkód style dla samej treści.

Wygląd w dużej mierze zostawiłem ten sam, pozbyłem się jedynie tego dziwnego wcięcia dygresji względem pozostałej treści. Teraz ma taką samą szerokość jak wszystko inne.

### Lepszy… erm, backend?

Przy okazji postanowiłem też poprawić sposób wstawiania dygresji. Odszedłem od czystego HTML-a na rzecz tzw. [<i lang="en">shortcode</i> (krótkiego kodu; _krodu_)](https://www.11ty.dev/docs/shortcodes/), a dokładniej jego [parzystej odmiany](https://www.11ty.dev/docs/shortcodes/#paired-shortcodes). W moim przypadku nazwałem krod `note`:

```
{\% note %}Treść dygresji{\% endnote %}
```

{% note %}W rzeczywistości znaki ucieczki (`\`) nie powinny się znajdować w krodzie. Niemniej to był jedyny sposób, by go pokazać w [Eleventy](https://www.11ty.dev/) (moim systemie blogowym).{% endnote %}

Kod do obsługi kroda `note` wygląda następująco:

```javascript
import htmlmin from 'html-minifier-terser'; // 1

let currentId = 0; // 2

export function createNoteShortCode( markdownIt ) { // 3
	return function noteShortCode( content ) { // 4
		const labelId = `note-${ currentId++ }`; // 5
		const noteElement = `<div class="note" role="note" aria-labelledby="${ labelId }">
			<p class="note__label" id="${ labelId }">Dygresja</p>
			<div class="note__content">${ markdownIt.render( content ) }</div>
		</div>`; // 6

		return htmlmin.minify( noteElement, { // 7
			collapseWhitespace: true
		} );
	};
}
```

Na początku importujemy funkcję `htmlmin` z  [biblioteki `html-minifier-terser`](http://npmjs.com/package/html-minifier-terser) (1). Posłuży ona nam do przemielenia wygenerowanego kodu HTML do jednolinijkowej wersji. Dzięki temu sprawimy, że parser Markdowna zostawi nasz kod HTML w spokoju i go przypadkiem nie zepsuje. Następnie tworzymy zmienną `currentId` (2). Będzie nam służyła do generowania unikatowych identyfikatorów dla etykiet dygresji. Następnie tworzymy funkcję `createNoteShortCode()` (3). Przyjmuje ona jako argument `markdownIt`, a więc [parser Markdowna](https://www.npmjs.com/package/markdown-it) – ten sam, który jest używany do generowania postów na blogu. Dzięki temu będziemy mogli używać Markdowna w dygresjach. Z funkcji `createNoteShortCode()` zwracamy funkcję kroda (4). Jako argument, `content`, przyjmuje ona treść dygresji. Następnie tworzymy zawartość atrybutu `[id]` etykiety (5), po czym kod HTML dygresji (6). By poprawnie wyświetlić treść dygresji, używamy [metody `markdownIt.render()`](https://markdown-it.github.io/markdown-it/#MarkdownIt.render), która przetworzy treść z Markdowna do HTML-a. Na końcu minifikujemy wygenerowany HTML (7) i zwracamy go.

Teraz jeszcze trzeba dodać nasz krod do konfiguracji Eleventy w pliku `eleventy.config.js`:

```javascript
eleventyConfig.addPairedShortcode( 'note', createNoteShortCode( markdownIt ) );
```

I tyle. Od teraz dygresje na blogu stały się lepsze!
