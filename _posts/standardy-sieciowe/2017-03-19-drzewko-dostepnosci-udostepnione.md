---
layout: post
title:  "Drzewko dostępności udostępnione!"
author: Comandeer
date:   2017-03-19 21:00:00 +0100
categories: standardy-sieciowe a11y daj-sie-poznac-2017 javascript
comments: true
permalink: /drzewko-dostepnosci-udostepnione.html
redirect_from:
    - /a11y/daj-sie-poznac-2017/javascript/2017/03/19/drzewko-dostepnosci-udostepnione.html
---

Tematyka dostępności bardzo mnie ciekawi, czego najlepszym dowodem jest [mój wpis na temat tworzenia własnego czytnika ekranowego](https://blog.comandeer.pl/eksperymenty/a11y/2017/02/11/tworzymy-czytnik-ekranowy.html). Wspominałem w nim o drzewku dostępności. I właśnie o nim będzie dzisiaj ciut więcej.

## Co to drzewko dostępności?

Strona internetowa w pewnym sensie przypomina las, bo… składa się z samych drzew. Są przynajmniej trzy: DOM, CSSOM i właśnie drzewko dostępności.

Drzewko DOM (Document Object Model – obiektowy model dokumentu) to drzewko, na którym opiera się wszystko, co dzieje się na stronie. W wielkim skrócie: każdy element HTML, na jaki natknie się przeglądarka w czasie wczytywania strony, jest zamieniany na odpowiadający mu obiekt w DOM. Te obiekty tworzą strukturę drzewiastą z prostego powodu: zagnieżdżamy elementy HTML. Przykład:

```html
<p>
	<label for="input">Przykładowy input:</label>
	<input type="text" id="input">
</p>
```

Taki kod zostanie przetworzony do mniej więcej takiego drzewka DOM:

```
p
|
|--label[for=input]
|
|--input#input[type=text]
```

Każdy taki obiekt DOM możemy sobie pobrać z poziomu JS i pobawić się nim na różne dziwne sposoby (o tym kiedyś indziej).

CSSOM (CSS Object Model) to z kolei drzewko, które powstaje po sparsowaniu arkuszy stylów i nałożeniu stylów na drzewko DOM. Mało ciekawe.

Drzewko dostępności to z kolei drzewko, które do każdego obiektu DOM dodaje dodatkowe informacje, które pozwalają technologiom asystującym taki element prawidłowo rozpoznać. I tak nasz `input` z przykładu będzie miał określoną rolę `textbox` (pole tekstowe) oraz zawierał informacje, że etykietę ma w tym i tym elemencie `label`. Tylko tyle i aż tyle.

## Modyfikowanie drzewka dostępności

Jak dotąd przeglądarki bardzo broniły jakiegokolwiek dostępu do drzewka dostępności i nie bardzo mieliśmy możliwość choćby je oglądnąć. Sprawę zdecydowanie poprawiło powstanie [standardu ARIA](http://w3c.github.io/aria/aria/aria.html), który umożliwił nam modyfikowanie tego, co zwraca drzewko dostępności:

```html
<!-- Strollujmy czytnik ekranowy i zróbmy z tego nagłówka przycisk! -->
<h2 role="button">Heheszki bardzo</h2>
```

Z ARIA jest jednak jeden, podstawowy problem: działa na poziomie HTML-a, nie DOM. Cokolwiek byśmy nie próbowali zrobić w ARIA, musimy to zrobić rzeźbiąc w kodzie HTML. Dla aplikacji, w których niemal wszystko jest robione z poziomu JS-a, tego typu rozwiązanie niekoniecznie jest wygodne. Co więcej, ARIA nie pozwala w żaden sposób odczytać własności danego elementu w drzewku dostępności. ARIA zachowuje się jak całkowicie osobny byt. A to sprawia spore problemy.

## Nadchodzi nowe

Dlatego też zaczęły się prace nad zupełnie nowym mechnizmem, [Accessibility Object Model](https://github.com/WICG/aom/blob/master/explainer.md) (obiektowy model dostępności), czyli taki DOM, ale dla drzewka dostępności. Podstawowe założenie jest niesamowicie proste: każdy obiekt w DOM będzie miał dodatkową własność, `accessibleNode`, która będzie zwracać wszelkie informacje o danym elemencie, jakie tylko posiada drzewko dostępności. Dzięki niej będzie także można modyfikować wszystko, co tylko nam się zamarzy. Wygodniej i potężniej niż ARIA, prawda?

```javascript
// Heheszki
heading.accessibleNode.role = 'button';
```

Co ciekawe, AOM ma także pozwalać na podpinanie się pod zdarzenia, które emituje technologia asystująca (tzw. intencje). To pozwala na dokładniejsze odpowiadanie na działania użytkownika, bez ingerencji "tłumacza" w postaci przeglądarki (która np. większość akcji przetłumaczy na zwykły klik). Tym sposobem zamiast kliku na polu, będziemy mogli zareagować na intencję `increment` (zwiększenie wartości pola liczbowego).

Niestety, AOM na chwilę obecną nie jest nawet na oficjalnej ścieżce standaryzacyjnej, więc długo sobie na to poczekamy. Ale warto.
