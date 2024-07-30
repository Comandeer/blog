---
layout: post
title:  "CSS w JS – mity o mitach"
description: "Komentarze do komentarzy o artykule na temat CSS-in-JS."
author: Comandeer
date: 2017-05-01T18:20:00+0200
tags:
    - refleksje
    - html-css
    - javascript
    - daj-sie-poznac-2017
comments: true
permalink: /css-w-js-mity-o-mitach.html
redirect_from:
    - /refleksje/html-css/javascript/daj-sie-poznac-2017/2017/05/01/css-w-js-mity-o-mitach.html
---

Wszyscy, którzy mnie znają, wiedzą doskonale, że w przypadku Sieci należę raczej do konserwatystów, będących [wyznawcami starego porządku](http://webroad.pl/inne/3722-progressive-enhancement-zapomniany-fundament). To uwielbienie dla tradycji rozciąga się także na używane technologie. Jeśli coś jest nowe, lecz _niewystarczająco_ dobre, po prostu tego nie używam. Prawda jest taka, że przeżyłem już niejedną super nowoczesną, gorącą technologię ([prawda, Angular?](https://www.webkrytyk.pl/2014/12/12/moja-prawda-o-angular-js/)) i widziałem śmierć niejednego standardu (a nawet przeglądarki!). I mam wrażenie, że kolejny z trendów również przeżyję: CSS w JS-ie.<!--more-->

Trend ten narodził się, rzecz jasna, wraz z [powstaniem Reacta](https://speakerdeck.com/vjeux/react-css-in-js) i miał rozwiązywać problemy, których dotąd w CSS-ie nie rozwiązano. Problem polega na tym, że, owszem, czysty CSS ich nie rozwiązywał, ale dobre praktyki i całe ekosystemy skonstruowane wokół różnych metodologii – jak najbardziej. Niemniej powstały mity o tym, jaki CSS jest zły, które pozwoliły ugruntować się nowemu trendowi. Nie przeczę, rozwiązania pokroju CSS Modules czy [`styled-components`](https://github.com/styled-components/styled-components) mają swoją niszę – zwłaszcza w ekosystemie Reacta. Problem polega na tym, że ludzie ich używają z całkowicie _bezsensownych_ powodów lub – o zgrozo! – "bo tak". Doskonale to pokazują komentarze do [artykułu o mitach odnośnie CSS-a w JS-ie](https://hackernoon.com/stop-using-css-in-javascript-for-web-development-fa32fb873dcc), które zafrapowały mnie na tyle, że części z nich postanowiłem się przyjrzeć bliżej.

Najbardziej w oczy rzuca się fakt, że broniący CSS-a w JS-ie _nienawidzą_ [BEM](https://en.bem.info/). Problem polega na tym, że, gdy przeglądam komentarze, odnoszę wrażenie, że nienawidzą BEM, bo go… nie znają. [Jakub Gawlas stwierdza wprost](https://medium.com/@jakub.gawlas/really-the-difference-is-negligible-b44147a42783), że nie używa BEM, bo

>   [BEM] makes a mess in a bigger projects, over styled-components.

[Hà Nguyễn dopowiada](https://medium.com/@sonhanguyen/you-should-name-your-article-stop-using-styled-component-4dcd8d5800d8), że

>   Saying BEM is the solution is like saying we don’t need javascript modular system because we can just namespace all the craps in the window object, not to mention we need to give it extra brain power to come up with a hierarchy for styles because they are separated from the javascript code.

Najdobitniej jednak [ujmuje to Resist Design](https://medium.com/@resistdesign/ewwwww-bem-shit-man-sorry-572aa9c837bb):

>   ewwwww, BEM is shit man, sorry.

No tak, z argumentem takiego kalibru nie ma nawet jak dyskutować…

Wszyscy wyżej wymienieni komentujący _nie wiedzą_, czym jest BEM – mimo że zdaje się im inaczej. Sprowadzają go bowiem wyłącznie do konwencji nazewniczej. I tutaj muszę się z nimi zgodzić: jeśli rozpatrujemy BEM wyłącznie jako konwencję nazewniczą, nie ma on sensu… Niemniej sama oficjalna dokumentacja nazywa BEM <i>metodologią</i>, a ja powiedziałbym nawet więcej: BEM jest architekturą, wokół której zbudować można cały front aplikacji (i dywagowałbym, czy wepchanie BEM po stronie serwera również nie przyniosłoby korzyści). BEM jest przecież niczym innym, jak warstwą abstrakcji na HTML + CSS + JS – dokładnie tym samym, czym jest React.js + `styled-components`! Różnica przebiega na samym poziomie owej abstrakcyjności i rzekłbym, że tutaj nowe rozwiązanie przegrywa z kretesem. Abstracja w przypadku Reacta i `styled-components` sprowadza się do przetłumaczenia HTML-a i CSS-a do formy JS-owej. W przypadku BEM tworzone jest coś na wzór [DSL-a](https://pl.wikipedia.org/wiki/J%C4%99zyk_dziedzinowy) dla konkretnego projektu, który można użyć na każdym etapie tworzenia: od głupiego projektu na kartce (na szkicu już przecież widać bloki, elementy i ich warianty), poprzez projekt graficzny (organizacja warstw/elementów w Photoshopie/Sketchu według konwencji nazewniczej BEM nie brzmi źle), na _faktycznej implementacji_ kończąc. W przypadku abstrakcji wprowadzanej przez React.js + `styled-components` mamy do czynienia tylko z "ułatwianiem" ostatniego etapu.

Jeśli zatem patrzy się całościowo na BEM, wówczas argumenty o tym, że jest "brudny" i zaśmieca kod nie dają się za bardzo utrzymać. Dłuższa nazwa klasy w odniesieniu do całego "języka projektu" (jakby można to nazwać) to wszak i tak o wiele mniejsze ustępstwo niż zależność od narzędzi i bibliotek w przypadku CSS Modules czy `styled-components`.

Inne argumenty odnoszą się bezpośrednio do CSS-a i HTML-a i… w gruncie rzeczy są przerażające. Najpierw przyjrzyjmy się [komentarzowi Vanyi Yania](https://medium.com/@vanuan/first-of-all-what-are-we-comparing-here-df089fefa7a1):

>   Doesn’t even sound like a myth to me. Styled-components does solve the global namespace problem. Doesn’t it?

No ok, to nie odnosi się bezpośrednio do CSS-a, ale w sumie jego dotyczy. Wszystko rozbija się o to, czy rozwiązania JS-owe rozwiązują problem globalności stylów. Odpowiedź brzmi prosto: nie. Jedyne, co te narzędzia robią, to [generują całkowicie losowe nazwy klas, po czym aplikują do konkretnych elementów](https://www.webpackbin.com/bins/-KeeZCr0xKfutOfOujxN). To nie jest rozwiązanie problemu, a jego **obejście przy pomocy brudnego hacku**. W gruncie rzeczy konwencja nazewnicza BEM robi _dokładnie_ to samo – z tym, że w niej to my ustalamy nazewnictwo, co często jest wręcz zaletą (brak udziwnionego debuggingu).

>   Why do you need to know which tag is used? To me all tags are all the same with only difference the default styling. If you don’t need a special styling, why create a dedicated component?

A to jest po prostu przerażające. Rozumiem, że tagi w JSX-ie nie przekładają się 1:1 do kodu HTML, ale twierdzenie, że nowy tag jest związany wyłącznie z inną prezentacją, aż boli. Tak ścisłe wiązanie semantyki z prezentacją prowadzi ostatecznie do tego, że wynikowy kod HTML z semantyką się nawet nie widział (pozdrowienia dla Facebooka i jego divowego limbo).

>   If you want specific list styling you’d have to name it. And naming it using tag name to me is a more nice way. Otherwise why all these fancy HTML5 semantic markup tags were invented?

Chociaż w gruncie rzeczy wychodzi na to, że faktycznie myśli się o tych tagach jako przekładalnych do HTML-a… co jest naprawdę bardzo, _bardzo_ przerażające.

>   It is impossibe to extend classes in CSS without some kind of preprocessor

Uhm… Czym niby się różni

```css
.klasa {
	color: red;
	display: block;
	border: 2px #000 solid;
}
.klasa_modyfikowana {
	color: blue;
}
```

od

```scss
.klasa {
	color: red;
	display: block;
	border: 2px #000 solid;
}

.klasa_modyfikowana {
	@extend .klasa;
	color: blue;
}
```

Drugi kod generuje o wiele dłuższy kod CSS i powoduje, że w naszym kodzie HTML traci się informacje o zależnościach pomiędzy poszczególnymi elementami i ich wariantami (bo przecież mówimy tutaj o jakiejś sensownej wartwie abstrakcji, a nie CSS-ie na poziomie `.button-green`!).

Zresztą nieprawdą jest, że nie da się rozszerzać klas w CSS-ie, bo ten [dochrapał się ostatnio mixinów](https://tabatkins.github.io/specs/css-apply-rule/).

>   implies that css overriding rules are easy to grasp

Wydaje mi się, że CSS z założenia jest łatwiejszy do czytania niż składnia JS-a.

>   \#6 tells you that forcing people to create a separate file even for a single rule is a good thing

Patrzę na mit \#6 i nie widzę tam takiego stwierdzenia – typowe [<i>reductio ad absurdum</i>](https://www.logicallyfallacious.com/tools/lp/Bo/LogicalFallacies/151/Reductio_ad_Absurdum).

>   I don’t see how having a separate file improves performance. Parsing is single-threaded. For what I know, having a separate file worsens network loading performance as there’s a connection latency.

Ktoś tu chyba nie słyszał o [HTTP/2](HTTP/2). Obecnie liczba żądanych plików nie stanowi aż tak dużego problemu, a w połączeniu z dobrze skonfigurowanym cache potrafi zdziałać prawdziwe cuda. [Polymer](https://www.polymer-project.org/) z tym eksperymentuje.

[Hajime Yamasaki Vukelic posuwa się w swych dywagacjach jeszcze dalej](https://medium.com/@hayavuk/regardless-of-how-it-relates-to-styled-components-which-i-could-not-care-less-about-this-1c75825582d0):

>   The misconception that styling and semantics are orthogonal comes from the artificial separation of concerns that places HTML and CSS into two different buckets without much thought. Having HTML and CSS in separate buckets only splits the problem along *syntactical* boundaries, without any consideration of the intimate relationship between content and its appearance.

Oto kolejny – szkodliwy – mit powtarzany w środowisku Reacta: mityczny _podział technologii_. Według tego mitu podział strony na HTML + CSS + JS jest bezsensowny, bo dzieli według technologii, a nie obowiązków (<i>separation of concerns</i>). Jak bardzo miałki jest to argument, najlepiej obrazuje [artykuł o tworzeniu modularnych interfejsów](https://hackernoon.com/building-modular-interfaces-a4e4076b4307), w którym autor sztuczny podział na HTML + CSS + JS proponuje zastąpić _naturalnym_ podziałem na JSX + JS + CSS. Tutaj nawet nie trzeba komentarza.

Jak niebezpieczne jest natomiast łączenie semantyki z prezentacją, to najlepiej pokazują [recenzje na WebKrytyku](https://www.webkrytyk.pl/), w których najlepiej widać, że zawsze kończy się to _całkowitą niedostępnością_. Wydawało mi się, że pewne podstawowe koncepty są na tyle… _podstawowe_, że nie trzeba ich tłumaczyć. Najwidoczniej w chwili, gdy przestało się je tłumaczyć, przestały być podstawowe.

[Mattia Astorino z kolei wskazuje na niesprawiedliwość przykładów z CSS-em](https://medium.com/@equinusocio/i-suggest-you-to-show-an-example-based-on-attributes-instead-of-classes-8c9d6ae54e59):

>   I suggest you to show an example based on attributes instead of classes. Css status shoud be use the aria-* attributes o normal attributes. So.. .button[aria-primary] is a better example

[Przerabialiśmy to już](https://alistapart.com/article/meaningful-css-style-like-you-mean-it). Łączenie prezentacji bezpośrednio z tożsamością czy rolą elementów nie działa na dłuższą metę, bo brakuje nam pewnej warstwy abstrakcji – właśnie dlatego powstało BEM czy ów nieszczęsny CSS w JS-ie.

Wróćmy jeszcze na chwilę do [Hà Nguyễna i jego komentarza](https://medium.com/@sonhanguyen/you-should-name-your-article-stop-using-styled-component-4dcd8d5800d8):

>   About web component and shadow dom, please stop politically correct your fellow devs. I think we have enough of it in real life. If the so called “standard” is not as usable as we want and we as a community can sustain our solution that makes sense, then use what makes sense. What’s the point of conforming to external standard when you are making application whose codebase is only accessible by your already-on-the-same-page team members or even just yourself anyway? I’m not a fan of css as json objects but I’ll definitely pick things like css-modules and csjs over crappy standards for UI components that I don’t intend to publish in my own application.

I właśnie tak zabija się standardy sieciowie. Zamiast włączyć się w proces ich powstawania, webdevowie postanawiają pójść na łatwiznę. Tym sposobem zamiast standardów mamy "standardy" i zamknięte ekosystemy oparte na rozwiązaniach poszczególnych korporacji (ekosystem Reacta to przecież piaskownica Facebooka, nie można o tym zapominać!).

[Ciekawą kwestię porusza z kolei Paul Henschel](https://medium.com/@drcmda/pretending-that-css-works-just-fine-with-functional-components-is-a-delusional-as-saying-jss-has-it-9d9455af1eac):

>   Pretending that css works just fine with functional components is as odd as saying jss has it already figured out. […] A declarative, functional component is not a HTML directive and will never be.

Skoro komponenty Reacta są funkcyjne, to czemu są deklarowane przy pomocy XML-owej składni? Co więcej – są przecież tłumaczone następnie na kod HTML… Odnoszę wrażenie, że funkcyjne komponenty to kolejny mit, jaki towarzyszy Reactowi, który po raz kolejny odwraca naszą uwagę od faktu, że React jest niczym więcej, jak warstwą abstrakcji dla widoku – i tym być powinien.

Chyba jedyny komentarz, z którym jestem w stanie się zgodzić, to [komentarz Raymonda Julina](https://medium.com/@nervetattoo/true-to-a-degree-1eb56b5e86fe), w którym stwerdza on, że, owszem, BEM rozwiązuje wspomniane problemy, ale na poziomie konwencji nazewniczej może dojść do konfliktów nazw i w rozwiązywaniu ich lepsza jest maszyna. I to jest prawda. Pytanie tylko, jak często takie konflikty faktycznie zachodzą i czy nie jest to problem bardziej potencjalny niż rzeczywisty?

Doskonale zdaję sobie sprawę z tego, że CSS w JS-ie ma swoje prawdziwe use-case'y, w których faktycznie sprawuje się lepiej niż tradycyjny CSS… Niemniej po przeczytaniu tych komentarzy odnoszę nieodparte wrażenie, że główna teza zawarta w artykule (użytkownicy używają CSS w JS-ie bez wyraźnego powodu lub z powodu trendu) sama się potwierdziła. Przeraża zwłaszcza lekkość, z jaką _znowu_ zaczyna podchodzić się do semantyki HTML-a.

Obym był tylko zrzędliwym konserwatystą a nie prorokiem…
