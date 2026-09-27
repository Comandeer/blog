---
layout: post
title:  "Zapiski na marginesach"
description: "Bloczkom kodu na blogu przydałaby się numeracja!"
author: Comandeer
date: 2026-09-28T01:27:00+0200
project: blog
tags:
    - html-css
comments: true
permalink: /zapiski-na-marginesach.html
---

Im dłużej przyglądałem się bloczkom kodu na blogu, tym bardziej wydawało mi się, że czegoś w nich brakuje. W końcu doszło do mnie: nie ma numeracji linii! Pora to naprawić.<!--more-->

## Wymogi dla numeracji

Jednak jeśli już dodaję numerację, to chciałbym, żeby spełniała kilka wymagań:

1. **Numery linii nie powinny się kopiować razem z kodem**. Innymi słowy: nie powinny być częścią treści bloczka kodu.
2. **Numeracja nie powinna dodawać śmieci w HTML-u**. Mogę na chama dodać element, w który wepcham wygenerowane numery, ale chciałbym tego uniknąć. Idealnie, jakby w kodzie nie pojawił się żaden nowy element.
3. **Numery nie powinny się przewijać razem z kodem**. Tak to działa w praktycznie każdym edytorze kodu: sam kod się przewija horyzontalnie, ale numer linii jest zawsze widoczny.
4. **Numeracja powinna się pokazywać, gdy jest odpowiednio dużo miejsca na nią**. Jeśli ktoś przegląda bloga na wąskim ekranie, na którym widać raptem kilka znaków w linii, dodanie dodatkowo numeracji całkowicie uniemożliwi mu zapoznanie się z kodem.

Ok, skoro wymagania już mamy, możemy zająć się ich spełnianiem!

## Nie kopiujemy i nie śmiecimy

Pierwsze dwa wymogi z powyższej listy tak naprawdę załatwić można za jednym zamachem. Skoro nie chcemy śmiecić w HTML-u, to zostaje nam… śmiecenie w CSS-ie lub JS-ie. W tym pierwszym od praktycznie zawsze jest możliwość dodawania treści przy pomocy pseudoelementów [`::before`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::before) i [`::after`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::after) oraz [własności `content`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/content). Kolejnym krokiem jest ustalenie, gdzie te style dodać.

Do kolorowania kodu w bloczkach używam [Shiki](https://shiki.style/).

{% note %}Shiki generuje cały potrzebny kod po stronie serwera, dzięki czemu przeglądarka dostaje już całość pokolorowaną. Stoi to w opozycji do większości innych rozwiązań (jak [Prism.js](https://prismjs.com/) czy zdobywający popularność [MicroLighter](https://davatron5000.github.io/microlighter/)), które robią to po stronie przeglądarki.

Osobiście uważam, że kolorowanie po stronie serwera jest lepsze dla osoby korzystającej ze strony. Nie dość, że przeglądarka nie musi wykonywać dodatkowej pracy (co może być problemem przy dużej liczbie dużych bloków kodu na stronie wyświetlanej na słabszym urządzeniu), to dodatkowo kod będzie pokolorowany _zawsze_. Czyli nawet wtedy, gdy [JS nie zadziała](https://www.kryogenix.org/code/browser/everyonehasjs.html).{% endnote %}

Shiki jest na tyle miły, że każdą linię kodu otacza w element `span.line`, a cały bloczek ma klasę `.shiki`. Dzięki temu wystarczy dodać pseudoelement z numeracją bezpośrednio do linii:

```css
.shiki {
	/* […] */

	.line::before { /* 1 */
		content: '1' / ''; /* 2 */
	}
}
```

Dla każdego elementu `.line` wewnątrz elementu `.shiki` dodaję pseudoelement `::before` (1). W nim używam własności `content`, by dodać cyfrę `1` (2). Dodatkowa wartość w tej własności, po znaku ukośnika, to tekst alternatywny (podobnie jak w przypadku obrazków). W tym przypadku to pusty ciąg tekstowy. Dzięki temu technologia asystująca (np. czytnik ekranu) będzie ignorowała numerację. Dodatkowo zastosowanie tzw. [generowanej treści](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Generated_content) w CSS-ie sprawia, że przy kopiowaniu numeracja zostanie pominięta.

## Automatyczna numeracja

No dobrze, ale jak sprawić, żeby linie faktycznie się numerowały? Na ten moment wszystkie mają ustawiony na sztywno numer `1`:

{% figure "../../../images/zapiski-na-marginesach/step-1.png" "Bloczek kodu JavaScript z numeracją po lewej stronie; każda linia ma numer 1." %}

Tutaj na pomoc przychodzą [liczniki](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Counter_styles/Using_counters)! Dzięki nim możemy powiedzieć CSS-owi, żeby dla każdego bloczka kodu stworzył nowy licznik, a dla każdej linii w tym bloczku – zwiększył o jeden jego wartość.

```css
.shiki {
	/* […] */
	counter-reset: code-line; /* 1 */

	.line::before {
		counter-increment: code-line; /* 2 */
		content: counter( code-line ) / ''; /* 3 */
	}
}
```

Na początku [tworzymy nowy licznik](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/counter-reset) o nazwie `code-line` (1) dla każdego elementu `.shiki`. Potem, w każdym pseudoelemencie `.line::before` [zwiększamy jego wartość](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/counter-increment) o 1 (2), a następnie wyświetlamy przy pomocy [funkcji `counter()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/counter) (3).

Tym prostym sposobem linie zaczęły się automatycznie numerować:

{% figure "../../../images/zapiski-na-marginesach/step-2.png" "Bloczek kodu JavaScript z numeracją po lewej stronie; każda linia ma poprawny numer." %}

## Nie przewijamy, ale stylujemy

No dobrze, dodajmy trochę stylów, bo na razie numeracja wygląda słabo. Przy okazji od razu naprawimy problem z przewijaniem się numerków razem z kodem:

```css
.shiki {
	/* […] */

	.line::before {
		counter-increment: code-line;
		content: counter( code-line ) / '';
		display: inline-block; /* 1 */
		position: sticky; /* 2 */
		inset-inline-start: 0; /* 3 */
		inline-size: 4ch; /* 4 */
		border-inline-end: 1px solid; /* 5 */
		margin-inline-end: 0.5ch; /* 6 */
		padding-inline-end: 0.5ch; /* 7 */
		background-color: inherit; /* 8 */
		text-align: end; /* 9 */
	}
}
```

Trochę się tego nazbierało. Więc po kolei:

1. Dzięki ustawieniu [`display: inline-block`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/display#inline-block) będziemy mogli nadawać numeracji szerokość oraz marginesy.
2. Pozycja ustawiona na [`sticky`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position#sticky) oznacza, że ten element ma zostać w miejscu, gdy bloczek będzie przewijany.
3. Ta własność to [logiczny odpowiednik `left`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/inset-inline-start) (lub [`right`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/right), jeśli strona jest w języku zapisywanym od prawej do lewej). W połączeniu z `position: sticky` oznacza tyle, że numeracja ma się "przykleić" do swojego miejsca, gdy w trakcie przewijania dotknie lewej krawędzi bloczka.
4. To z kolei [logiczny odpowiednik `width`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/inline-size). Nasza numeracja zawsze będzie miała szerokość 4 [znaków](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length#ch). Dzięki temu numerek nawet dla długiego kodu na pewno się zmieści.
5. Dodajemy też [obramowanie za numeracją](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/border-inline-end), żeby oddzielić ją od samego kodu. Nie podajemy koloru, dzięki czemu domyślnie zostanie użyty aktualny kolor fonta.
6. Żeby kod nie "przykleił się" do obramowania numeracji, dodajemy [margines za nią](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/margin-inline-end).
7. Nie chcemy też, żeby sama numeracja "przyklejała się" do obramowania, więc dodajemy jej odpowiedni [margines wewnętrzny](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/padding-inline-end).
8. Wymuszamy, żeby numeracja miała takie samo tło jak linia. W [moich stylach dla kodu](https://github.com/Comandeer/blog/blob/3c761b7ea5c23de069af298dd011cab4227b03e4/src/_styles/_code.scss#L34-L46) każdy `span` wewnątrz kodu kolorowanego przez Shiki ma nadane tło. A że tło się nie dziedziczy automatycznie w CSS-ie, wymuszamy to ręcznie. Jeśli nie nadalibyśmy tła dla numeracji, byłoby przezroczyste i numeracja nakładałaby się na kod w trakcie przewijania:
   {% figure "../../../images/zapiski-na-marginesach/background-error.png" "Bloczek kodu, w którym numeracja nie ma nadanego koloru tła, przez co nakłada się na kod w trakcie przewijania." %}
9. I wreszcie – [wyrównujemy numerek do końca](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/text-align#end) (w tym przypadku – do prawej).

Dodatkowo usunąłem margines wewnętrzny dla bloczka kodu, inaczej kod z numeracją wyglądał… _dziwnie_:

{% figure "../../../images/zapiski-na-marginesach/padding-error.png" "Bloczek kodu, w którym z powodu marginesu wewnętrznego numeracja niejako wisi w powietrzu." %}

Ostateczny efekt wygląda zadowalająco:

{% figure "../../../images/zapiski-na-marginesach/step-3.png" "Bloczek kodu JavaScript z numeracją po dodaniu stylów." %}

## Nie zasłaniamy

Pozostaje ostatni problem – numeracja na wąskich ekranach może przysłaniać kod:

{% figure "../../../images/zapiski-na-marginesach/size-error.png" "Bardzo wąski bloczek kodu JavaScript z numeracją, która przysłania ponad połowę kodu." %}

I tak, zdaję sobie sprawę z tego, że to ekstremalny przykład, ale na szczęście naprawienie tego nie jest szczególnie trudne. Dzięki [<i lang="en">container queries</i>](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries) można sprawić, że numeracja pokaże się tylko wówczas, gdy bloczek kodu będzie miał szerokość co najmniej 20 znaków:

```css
.shiki {
	/* […] */
	container: code-block / inline-size; /* 1 */

	.line::before { /* 4 */
		/* ]…] */
	}

	@container ( inline-size < 20ch ) { /* 2 */
		.line::before {
			display: none; /* 3 */
		}
	}
}
```

Z bloczka kodu tworzymy kontener (1). Wskazujemy, że interesuje nas jedynie jego wymiar liniowy (szerokość). Następnie, dla kontenera o szerokości poniżej 20 znaków (2) ukrywamy numerację (3). Style te wstawiamy po ogólnych stylach numeracji (4) – dzięki temu mamy pewność, że je nadpiszą.

Od teraz bardzo wąskie bloczki kodu nie będą miały numeracji:

{% figure "../../../images/zapiski-na-marginesach/size-fix.png" "Bardzo wąski bloczek kodu JavaScript, z którego zniknęła numeracja." %}

Pojawił się jednak inny problem – kontener zepsuł numerację. Nagle każda linia ma ten sam numer, `1`:

{% figure "../../../images/zapiski-na-marginesach/container-error.png" "Bloczek kodu JavaScript z zepsutą numeracją; każda linia ma numer 1." %}

Na szczęście łatwo to naprawić – wystarczy resetować licznik nie w samym bloczku (kontenerze), a w [pierwszej linii](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:first-child) w danym bloczku kodu:

```css
.shiki {
	/* […] */
	container: code-block / inline-size;

	.line:first-child {
		counter-reset: code-line;
	}
}
```

{% note %}Pseudoklasa `:first-child` działa tutaj, ponieważ linie są bezpośrednimi dziećmi bloczku kodu. W innym przypadku znalezienie pierwszej linii mogłoby być trudniejsze.{% endnote %}

## Ostatni szlif

Na dołączonych wyżej zrzutach ekranu dostrzec można jeszcze jeden, subtelny problem: każda ostatnia linia w bloczku jest pusta. Wyświetla się wyłącznie dlatego, że teraz jest dodana do niej numeracja. W innym wypadku – jako pusty element liniowy – linia "zapadłaby się" i nie byłaby wyświetlona. Jest na to proste rozwiązanie: nie wyświetlać numeracji dla [ostatniej linii](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:last-child), jeśli jest ona [pusta](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:empty).

```css
.shiki {
	/* […] */

	.line:last-child:empty::before {
		display: none;
	}
}
```

{% note %}W idealnym świecie zmieniłbym konfigurację Shiki tak, aby taka linia nie była generowana… Ale rozwiązanie CSS-owe jest zdecydowanie prostsze.{% endnote %}

## Numeracja w akcji

I tym sposobem do bloga dodaliśmy numerację! Jak działa w praktyce, zobaczyć można na poniższym bloczku:

```javascript
const aVariableWithSuperHiperDuperExtraLoooongNameThatWillDefinitelyRequireScrollingHorizontally = () => {
    return 1 + 1;
}

console.log( 'whatever' );
```

