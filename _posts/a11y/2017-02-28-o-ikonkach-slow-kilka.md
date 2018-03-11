---
layout: post
title:  "O ikonkach słów kilka"
author: Comandeer
date:   2017-02-28 19:27:00 +0100
categories: a11y html-css
comments: true
---

Każdy z nas na pewno choć raz w życiu użył icon fontów – czy to [Fontello](http://fontello.com/), czy [Font Awesome](http://fontawesome.io/). Jednak nie każdy z nas zastanawiał się, jaki jest idealny sposób na wstawianie ich na stronę.

## Tradycyjne sposoby

Zacznijmy od tego, że ikonki nie są jakimiś semantycznymi elementami – to _co najwyżej_ obrazki, więc `i` jest z założenia złe, co [W3C już dawno ustaliło](https://github.com/w3c/html/issues/732). Zatem nie ma co słuchać [poradnika na Font Awesome](http://fontawesome.io/examples/) i lepiej zostać przy `span`

Jeśli wstawiana ikonka jest tylko ozdobnikiem, a treść, jaką prezentuje, jest przekazywana także w inny sposób (np. przez tekst występujący obok niej), to wtedy mamy do czynienia z najprostszą sytuacją:

```html
<span class="icon icon_email" aria-hidden="true"></span>
```

Czemu pusty element? Ponieważ to najprostszy sposób na stworzenie elementu, który będzie ignorowany przez czytniki ekranowe. Dodanie `[aria-hidden=true]` sprawi, że czytnik ominie ten element (i tylko ten). Jest to konieczne, ponieważ czytniki ekranowe **czytają** znaczki Unicode, które są wstawione w pseudoelementy (np. ★ zostanie przeczytane przez VoiceOver jako "black star"). I tak, icon fonty używają niby tak odległych kodów Unicode, że nie powinny być do nich przypisane żadne znaki, ale emojis dodaje się do standardu tak dużo, że w końcu mogą zacząć pojawiać się jakieś konflikty. Zwłaszcza, że przecież system też może wykorzystać te rejony Unicode.

Natomiast jeśli ikonka niesie treść sama w sobie (nie towarzyszy jej żaden tekst), to wówczas można zrobić tak:

```html
<span class="icon icon_email" aria-label="E-mail"></span>
```

Tak, powinno być użyte **co najmniej** `[aria-label]`. `[title]` też może zadziałać, ale pojawia się pewien problem: `[title]` jest czytany tylko wówczas, gdy zawartość elementu nie jest możliwa do przeczytania. Czyli wracamy do problemu z Unicode. W przypadku `[aria-label]` problemu nie ma, bo jest on czytany _zamiast_ zawartości elementu (zawsze, nawet jak zawartość to całkowicie normalny tekst).

## Bardziej dostępne sposoby

Niemniej to jest dość słaby sposób, ponieważ działa tylko i wyłącznie dla czytników ekranowych (i to nie w przypadku korzystania równocześnie z Google Translate, jak [zauważa Heydon](https://inclusive-components.design/notifications/#differentiatingmessagetypes)). A co w sytuacjach, gdy style się nie doczytają, strona będzie użyta w przeglądarce tekstowej etc.? Innymi słowy mówiąc: jak sprawić, żeby ikonka działała _naprawdę_ zawsze?

```html
<span class="icon icon_email" aria-hidden="true"></span>
<span class="visuallyhidden">E-mail</span>
```

[Implementację `.visuallyhidden` warto skopiować z HTML5 Boilerplate](https://github.com/h5bp/html5-boilerplate/blob/f888d9611b1743d3f0fcb98956ca04fa22746315/dist/css/main.css#L135-L145) – [`.sr-only` z BS-a **wciąż** nie jest zaktualizowane zgodnie z najnowszym feedbackiem ze strony FB czy Drupala](https://medium.com/@jessebeach/beware-smushed-off-screen-accessible-text-5952a4c2cbfe).

W jeszcze idealniejszym świecie wszystko wyglądałoby jakoś tak:

```html
<span class="icon">
	<span class="icon__image" data-icon="email" aria-hidden="true"></span>
	<span class="icon__label">E-mail</span>
</span>
```

[Przykładowa implementacja](https://jsfiddle.net/Comandeer/yocqmvet/), oparta na… [image replacement](http://nicolasgallagher.com/css-image-replacement-with-pseudo-elements/). Chyba jedyny problem z tym to fakt, jak się dowiedzieć, czy icon font się wczytał i kiedy pokazać ikonę zamiast etykiety. Niemniej tego typu kod radzi sobie z większością scenariuszów, jakie wyżej opisałem.

## A może by tak SVG?

Ale to wciąż wszystko hacki – bo przecież tym jest sama idea icon fontów. A prawda jest taka, że mamy rok 2017 i aż się prosi, żeby po prostu [stosować SVG](https://css-tricks.com/svg-fragment-identifiers-work/). Wówczas ikonki wyglądają tak:

```html
<img src="nasz-svg#name-of-view" alt="Tekst alternatywny">
```

Oczywiście `[alt]` jak dla normalnego obrazka: jeśli ikonka to ozdobnik – pusty, jeśli niesie treść – wiadomo. Można nawet [używać sprite'ów](http://betravis.github.io/icon-methods/svg-sprite-sheets.html) i – jak widać – wsparcie jest zadziwiająco dobre. Dodatkowo [SVG nie posiadają takich problemów z dostępnością, jak icon fonty](https://cloudfour.com/thinks/seriously-dont-use-icon-fonts/).

## Casus `[title]`

Ktoś pewnie jeszcze zapyta: "A co z `[title]`? Przecież dostarcza informacji o ikonce użytkownikom myszki!". No i właśnie tutaj jest największy problem: **tylko** użytkownikom myszki. Jeślibyśmy chcieli zrobić _naprawdę_ dobry tooltip dla ikonek, który by działał np. też dla użytkowników klawiatury, [warto rozważyć oskryptowane alternatywy](https://sarasoueidan.com//blog/accessible-tooltips/).

------

Jak widać, sposobów na wstawienie icon fontów jest kilka, a najlepszy z nich to… wstawienie SVG.
