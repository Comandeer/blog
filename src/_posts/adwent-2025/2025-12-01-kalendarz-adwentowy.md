---
layout: post
title:  "Kalendarz adwentowy"
description: "W tym roku postanowiłem nieco zaszaleć w grudniu i stworzyć kalendarz adwentowy!"
author: Comandeer
date: 2025-12-01T00:00:00+0100
tags:
    - adwent-2025
comments: true
permalink: /kalendarz-adwentowy.html
---

Trochę przez ostatnie 2 lata zardzewiałem, więc wpadłem na szalony pomysł, który mógłby pomóc mi się na nowo rozruszać: stworzyć kalendarz adwentowy!<!--more-->

## Pomysł

Pomysł jest dość prosty: publikować jeden post dziennie na blogu od 1 do 24 grudnia. Ale nie zakładam, że będą to długie, ambitne artykuły, jak np. [ostatnie zabawy z Cosmic UI](https://blog.comandeer.pl/kosmiczna-zabawa). Jasne, może jeden czy dwa takie teksty się pojawią. Niemniej większość będzie pewnie krótsza, opisująca jakieś ciekawe API czy inną JS-ową ciekawostkę. Na pewno będę chciał też trochę posiedzieć w swoich projektach (i dokończyć [czasomierze](https://blog.comandeer.pl/projekty/czasomierze/)), więc takie rzeczy również się pojawią. Przynajmniej raz chcę też zahaczyć o temat dostępności.

Innymi słowy: 24 grudnia blog powinien powiększyć się o 24 artykuły. Taki jest plan. Można obstawiać, kiedy się wysypię po drodze.

## Kalendarz adwentowy

Natomiast trudno robić kalendarz adwentowy bez [_kalendarza adwentowego_](https://blog.comandeer.pl/kategorie/adwent-2025/). Można się nim także [pobawić na Codepenie](https://codepen.io/Comandeer/pen/jEqKQBZ):

{%include 'embed' src="https://codepen.io/Comandeer/pen/jEqKQBZ" %}

Nie będę ukrywał, że zainspirowałem się [kalendarzem adwentowym HTMHell](https://www.htmhell.dev/adventcalendar/). Tam też poszczególne wpisy są reprezentowane jako prostokątne karty z numerkami. Każda karta się odwraca po najechaniu. Jednak w HTMHell na odwrocie karty też jest tylko numer dnia. Ja z kolei umieściłem tam tytuł wpisu.

Sam układ kalendarza jest oparty o [CSS grida](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Basic_concepts).

```css
.advent-calendar {
	display: grid;
	grid-template-columns: repeat( auto-fill, minmax( 10rem, 1fr ) ); /* 1 */
	gap: 1rem; /* 2 */
}
```

Ustawiłem kolumny (1) w taki sposób, by zajmowały dostępną przestrzeń, dbając przy tym by każdy element miał [szerokość między `10rem` a resztą dostępnej przestrzeni](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/minmax). Do tego dorzuciłem `1rem` odstępu między elementami (2).

Z kolei same karty kalendarza nie mają sztywno określonych rozmiarów. Zamiast tego zastosowałem [`aspect-ratio`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/aspect-ratio) do określenia proporcji:

```css
.advent-item {
	aspect-ratio: 1;
}
```

Dzięki temu elementy zawsze są kwadratami.

Dorzuciłem też eksperymentalną ciekawostkę, dzięki której elementy kalendarza są w losowej kolejności – ale tylko w [eksperymentalnej wersji Safari](https://developer.apple.com/safari/technology-preview/):

```css
.advent-item {
	order: random(1, 24);
}
```

[Funkcja `random()`](https://webkit.org/blog/17285/rolling-the-dice-with-css-random/) losuje wartość (liczbową, tak jak tutaj, lub w konkretnej jednostce, np. `rem`, `px` czy `deg`) z podanego zakresu.

Z kolei do obracania kart po najechaniu użyłem techniki [<i lang="en">flip card</i>](https://3dtransforms.desandro.com/card-flip). Natomiast ich tło wygenerowałem w narzędziu [<b lang="en">CSS Stripes Generator</b>](https://stripesgenerator.com/). W tym momencie to chyba jedyne miejsce w całym kodzie bloga, które używa sztywnych kolorów zamiast [zmiennych CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties).

Przy kartach jest jeszcze jedna eksperymentalna ciekawostka, działająca z kolei tylko w [eksperymentalnym Chrome'ie](https://www.google.com/chrome/dev/):

```css
.flip-card__title {
	text-grow: consistent font-size 4rem;
}
```

[Właściwość `text-grow`](https://github.com/explainers-by-googlers/css-fit-text/blob/main/README.md#potential-solution) pozwala skalować tekst wewnątrz kontenera tak, aby zajmował jak najwięcej dostępnej przestrzeni, ale nie przekraczał określonego maksymalnego rozmiaru fonta. W naszym przykładzie tekst będzie rozszerzany, dopóki będzie miejsce lub nie osiągnie on wielkości `4rem`.

{% figure "../../images/kalendarz-adwentowy/text-grow.png" "Dwa elementy kalendarza: w pierwszym tekst &quot;Post 1&quot; jest napisany małym rozmiarem fonta i zajmuje tylko trochę miejsca w lewym górnym rogu ekranu, podczas gdy w drugim tekst &quot;Post 2  jest napisany wyraźnie większym rozmiarem fonta i zajmuje całą szerokość elementu." "Porównanie kart bez i z właściwością <code>text-grow</code>" %}

Kolejnym ciekawym rozwiązaniem są… numerki. Mimo zastosowania [elementu `ol`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/ol), postanowiłem ukryć jego numerowanie w CSS-ie i [wykorzystać liczniki](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Counter_styles/Using_counters). Dzięki temu mogłem wyświetlić numerek jako przednią stronę karty i użyć go w animacji.

Do tego dorzuciłem [zagnieżdżanie](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Nesting) (bo czemu nie) oraz [nowy sposób centrowania elementów w pionie w elementach blokowych](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/align-content). I oto jest: najbardziej przeinżynierowany kalendarz adwentowy w webdevowej blogosferze!

Zapraszam do wspólnej zabawy i mam nadzieję, że dojedziemy do końca w komplecie 🎄.
