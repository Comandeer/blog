---
layout: post
title:  "Pyrrusowe zwycięstwo"
description: "Czemu WHATWG nie potrafi się dogadać z W3C i co to dla nas oznacza?"
author: Comandeer
date: 2018-01-05T22:35:00+0100
tags:
    - standardy-sieciowe
    - refleksje
    - a11y
comments: true
permalink: /pyrrusowe-zwyciestwo.html
redirect_from:
    - /refleksje/a11y/2018/01/05/pyrrusowe-zwyciestwo.html
---

W Sieci toczy się obecnie spór na miarę tego pomiędzy Świętym Cesarstwem Rzymskim a papiestwem. Po jednej stronie mamy WHATWG, po drugiej – W3C.<!--more-->

## Wojna pozycyjna

Od dość dawna mamy dwa standardy HTML: [jeden od W3C](http://w3c.github.io/html/) i [jeden od WHATWG](https://html.spec.whatwg.org/multipage/). Choć obydwa standardy wyrosły z jednego pnia, wkrótce [zaczęły rozrastać się w dwie strony](https://medium.com/content-uneditable/the-great-world-of-open-web-standards-64c1fe53063). WHATWG zaczęło standaryzować albo całkowite nowości (niekoniecznie z jakimikolwiek implementacjami), albo [rzeczy, które powinny zostać zapomniane](https://github.com/whatwg/dom/issues/334). W3C natomiast skupiło się na [_interoperacyjności_ HTML-a i dostępności](http://www.brucelawson.co.uk/2017/editing-the-w3c-html5-spec/). Może i HTML 5.x nie zawiera wszystkich najnowszych ficzerów, ale kładzie duży nacisk na to, by HTML działał dobrze dla wszystkich.

Niemniej WHATWG od dawna narzeka na to, że HTML 5.x w ogóle powstaje, uparcie we wszystkich możliwych sytuacjach [nazywając specyfikację od W3C forkiem](https://annevankesteren.nl/2016/01/film-at-11). Największym pragnieniem WHATWG zdaje się być _wyeliminowanie_ z równania W3C – przynajmniej w zakresie rozwijania HTML-a. Stąd ostatnie [powołanie do życia Steering Group](https://blog.whatwg.org/working-mode-changes) czy [zmiana licencji standardu HTML na mniej liberalną](https://blog.whatwg.org/copyright-license-change), co może [utrudnić dalszy rozwój HTML 5.x](https://twitter.com/stevefaulkner/status/940271868329824256).

Pomiędzy organizacjami standaryzującymi zdaje się toczyć wojna. WHATWG na własność chce zagarnąć jak najwięcej standardów – [i to nie tylko od W3C](https://daniel.haxx.se/blog/2016/05/11/my-url-isnt-your-url/). I udaje im się to, z prostej przyczyny: WHATWG to organizacja reprezentująca interesy 4 korporacji, które tworzą największe przeglądarki na rynku – Google, Mozilla, Microsoft i Apple. Bez ich zgody W3C czy IETF i tak nie mają _jakiejkolwiek_ mocy sprawczej. I tym sposobem mamy pat.

## Światełko w tunelu…

Jak już wspominałem, W3C skupia się w dużej mierze na dostępności. To w końcu ta organizacja rozwija [WCAG](https://w3c.github.io/wcag21/) czy [ARIA](https://w3c.github.io/aria/). Nic zatem dziwnego, że w [sporze o `main`](https://github.com/whatwg/html/issues/100) to właśnie W3C reprezentuje tę stronę, która upiera się przy dostępnej wersji definicji tego elementu. WHATWG bardzo długo upierało się przy swoim, aż tu nagle… [chce zmienić definicję `main` na bardziej dostępną](https://github.com/whatwg/html/pull/3326). W propozycji pojawia się fragment:

>   The `main` element can be used as a container for the dominant contents of the document.

To sprawia, że w końcu element `main` w wersji od WHATWG jest zgodny z definicją [roli `main` z ARIA](https://w3c.github.io/aria/#main). A to równocześnie przybliża nas zdecydowanie do rozwiązania sławetnego sporu pomiędzy WHATWG i W3C.

## …które szybko zgasło

Niemniej diabeł – i to dosłownie! – tkwi w szczegółach. Nowa propozycja wciąż nie usuwa bowiem najbardziej kontrowersyjnego fragmentu definicji od WHATWG – możliwości wstawiania kilku `main` w obrębie jednej strony:

>   While there is no restriction as to the number of `main` elements in a document, web developers are encouraged to stick to a single element.

Żeby było śmieszniej, tego typu ostrzeżenia Domenic Denicola, redaktor WHATWG, [krytykował w kontekście HTML 5.x](http://www.brucelawson.co.uk/2017/editing-the-w3c-html5-spec/#comment-3778437).

Zastanawia także podejście redaktorów WHATWG do całej sprawy. Jak można wyczytać z opisu pull requesta, powstał on tylko i wyłącznie dlatego, że AT nie chcą współpracować:

>   there's no reason to believe AT will change

Jeszcze ciekawszy obraz sytuacji wyłania się z [komentarza do słynnego issue #100](https://github.com/whatwg/html/issues/100#issuecomment-355543414):

>   I also agree that the dominant advice (unless we can get browsers/AT to change per above) should be to have a single `<main>` per document.

Można wręcz odnieść wrażenie, że redaktorzy WHATWG trwają w świętym przekonaniu, że poza specyfikacją HTML nie istnieje nic innego i jest ona jedynym źródłem prawdy. A w rzeczywistości zmiana implementacji `main` w przeglądarkach tak, by była ona zgodna z definicją w specyfikacji WHATWG pociągnęłaby także za sobą konieczność zmiany definicji roli `main` w ARIA czy opisu bindingów w accessibility tree.

Oczywiście nie mogło także zabraknąć uszczypliwości w kierunku W3C:

>   It does seem like there may be a case for multiple `<main>`s when combined with `hidden`, as W3C's fork of HTML already acknowledges.

Żeby było śmieszniej, od razu na nowo rozgorzała kłótnia o to, czy faktycznie definicję trzeba zmieniać, czy lepiej zmienić… implementacje w przeglądarkach i AT (sic!).

Oczywiście cała dyskusja zostałaby zakończona ponad 2 lata temu, gdyby WHATWG stwierdziło, że faktycznie definicja od W3C jest lepsza i "sforkowało" ją do swojej specyfikacji. Ale piekło jeszcze nie zamarzło, więc nie ma co na to liczyć.

## Przesunięcie frontu

Niemniej sam ruch ze strony WHATWG w kierunku poprawienia dostępności HTML LS jest wielkim skokiem dla całej otwartej Sieci. Pytanie tylko, czy nie jest to skok w przepaść i w jaką stronę to wszystko ostatecznie zacznie zmierzać.

Bo prawdę mówiąc wolałbym, żeby nad rozwojem Sieci czuwało kilkadziesiąt korporacji niż tylko cztery, które i tak już dawno podzieliły ten rynek między siebie…
