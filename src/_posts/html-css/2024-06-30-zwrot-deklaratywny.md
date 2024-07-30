---
layout: post
title:  "Zwrot deklaratywny"
author: Comandeer
date: 2024-06-30T22:51:00+0200
tags:
  - html-css
  - refleksje
comments: true
permalink: /zwrot-deklaratywny.html
---

Webdevelopment przyzwyczaił nas już do tego, że pewnych rzeczy bez JS-a nie da się zrobić. Niektóre ficzery przeglądarkowe są bowiem dostępne tylko z poziomu JS-owych API. Inne rzeczy w ogóle nie są dostępne w przeglądarce i trzeba sobie je samemu napisać w – a jakże! – JS-ie. Niemniej ostatnio można zaobserwować pewien deklaratywny zwrot w standardach sieciowych.<!--more-->

## Na początku był popup

Chyba każda osoba zajmująca się webdevelopmentem przynajmniej raz zetknęła się z popupem. Te wyskakujące okienka przyjmować mogą wszelkie możliwe formy, jednak przez wiele lata jedynym sensownym sposobem na ich stworzenie był JS. I choć po drodze pojawił się nawet [element HTML `<dialog>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog), to wciąż potrzebowaliśmy JS-a do jego otwarcia.

Ale to ostatnio się zmieniło, za sprawą nowego [Popover API](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API). Pozwala ono zrobić z dowolnego elementu wyskakujące okienko:

```html
<button popovertarget="popover">Otwórz okienko</button>
<div id="popover" popover>Jestem okienkiem!</div>
```

Ba, nic nie stoi na przeszkodzie, by połączyć Popover API z elementem `<dialog>`:

<p class="codepen" data-height="300" data-default-tab="html,result" data-slug-hash="GRaWPPy" data-pen-title="Untitled" data-user="Comandeer" style="height: 300px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;">
  <span>See the Pen <a href="https://codepen.io/Comandeer/pen/GRaWPPy">
  Untitled</a> by Comandeer (<a href="https://codepen.io/Comandeer">@Comandeer</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://cpwebassets.codepen.io/assets/embed/ei.js"></script>

Zarówno element `<dialog>`, jak i Popover API nie wydają się być strasznie przełomowe. Niemniej diabeł tkwi w szczegółach! Własnoręczne rzeźbienie wyskakujących okienek wiąże się ze sporą liczbą wyzwań, wśród których wymienić można choćby odpowiednie zarządzanie focusem. Rzut oka na [<cite lang="en">ARIA Practices</cite>](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/dialog/) pokazuje, jak dużo trzeba zrobić, żeby wyskakujące okienko było dostępne. W przypadku `<dialog>`u i Popover API te wszystkie rzeczy robi (a przynajmniej: powinna robić) za nas przeglądarka. Przeszliśmy dzięki temu od mówienia przeglądarce, _jak_ coś zrobić do mówienia, _co_ chcemy zrobić, a przeglądarka załatwia już całą resztę.

## Rewolucja kryjąca się za rogiem

Sama możliwość tworzenia wyskakujących okienek przy pomocy dwóch linijek HTML-a jest czymś niezwykłym. Ale wciąż jest tutaj kilka rzeczy, które można by usprawnić. Jak choćby fakt, że na razie nie da się w taki sposób tworzyć modalnych dialogów (czyli takich, które uniemożliwiają korzystanie z reszty strony, aż nie zostaną zamknięte). Te wciąż wymagają JS-owego API. Z drugiej strony okienka tworzone przy pomocy Popover API dość trudno ustawić w odpowiednim miejscu na ekranie, przez co trudno zrobić z nich np. tooltipy lub menu otwierane przyciskiem.

Tutaj jednak na scenę wkracza kolejna nowość, na razie dostępna tylko w Chrome – [CSS <i lang="en">anchor positioning</i> (kotwiczenie pozycjonowania)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning/Using). Pozwala ona "przypiąć" dany element do innego elementu. Dzięki temu można uzyskać choćby wspomniane wcześniej rozwijane przyciskiem menu:

{% include 'embed' src="https://codepen.io/Comandeer/pen/qBGzJQm" %}

Kotwiczenie pozycjonowania to, wbrew pozorom, nie jest łatwy do rozwiązania problem. Wystarczy spojrzeć, jak popularne są rozwiązania pokroju [Floating UI](https://floating-ui.com/) (dawny Popper), które ma [**ponad 11 milionów pobrań tygodniowo**](https://www.npmjs.com/package/@floating-ui/dom). A mówimy tutaj wyłącznie o wersji vanilla JS – jeśli zliczyć także integracje z popularnymi frameworkami oraz poprzednią wersję, Poppera, ta liczba spokojnie się _podwoi_. I nie jest to jedyna biblioteka od tego. Zapotrzebowanie jest więc bardzo duże i miło zobaczyć, że przeglądarki zaczynają to robić za nas. Co w teorii oznacza, że powinno to działać wydajniej i… czyściej. W końcu obliczanie pozycji w JS-ie od zawsze brzmiało na obejście ograniczeń CSS-a.

To wciąż jednak nie wszystkie nowości, które mogą się wkrótce pojawić. [Grupa Open UI](https://open-ui.org/), dzięki której dostaliśmy choćby omawiane już wyżej Popover API, pracuje m.in. nad [<i lang="en">invokers</i> (wywoływaczami)](https://open-ui.org/components/invokers.explainer/). Co ciekawe, w jej propozycji pojawia się przykład, o którym też już wspominałem – wywołanie modalnego dialogu:

```html
<button command="showModal" commandfor="my-dialog">Otwórz dialog</button>

<dialog id="my-dialog">Jestem dialogiem!</dialog>
```

Wywoływacze pozwalać będą na deklaratywne przypinanie do przycisków komend, takich jak otwieranie dialogu, sterowanie odtwarzaniem multimediów, ale też – całkowicie niestandardowych, które osoba webdeveloperska będzie mogła sama dodać. Te ostatnie będą już jednak wymagać kodu JS do obsługi.

Równocześnie, w bardzo podobnym duchu, Jeremy Keith zaproponował [deklaratywną wersję Web Share API](https://github.com/adactio/share-button-type/blob/gh-pages/explainer.md):

```html
<button type="share">Share this</button>
```

A to otworzyło drogę do szerszej dyskusji nad tym, [czy aby nie potrzebujemy większej liczby typów przycisków](https://adactio.com/journal/20259).

Deklaratywny zwrot widać także w podejściu przeglądarek. Google ostatnio zaproponowało [nowy element HTML, `<permission>`](https://developer.chrome.com/blog/permission-element-origin-trial). Jego zadaniem ma być ustandaryzowanie pytania osoby odwiedzającej strony o możliwość użycia tzw. potężnych ficzerów, jak choćby dostęp do mikrofonu czy kamery.

Deklaratywne rozwiązania wielu webdeveloperskich wyzwań zaczynają pojawiać się w technologiach sieciowych coraz częściej. Tym samym coraz więcej rzeczy można wyrzucić z naszego kodu JS i zdać się w pełni na przeglądarkę. W teorii pozwoli to znacząco odchudzić ilość kodu, jaki przesyłamy do przeglądarek, a tym samym – podnieść wydajność stron WWW. Równocześnie obniża się złożoność samych aplikacji internetowych – ta jest przenoszona do samych przeglądarek. Niejako równolegle dochodzi też do zmiany paradygmatu. Coraz ważniejsze staje się [doradzanie przeglądarce, zamiast rozkazywania jej](https://buildexcellentwebsit.es/). Zwłaszcza, że przecież najnowsze deklaratywne rozwiązania nie są pierwszymi – obecne w CSS-ie [systemy layoutu (flexbox i grid)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Relationship_of_grid_layout_with_other_layout_methods) też są w pełni deklaratywne, podobnie jak [właściwości logiczne](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values). Jako osoby webdeveloperskie musimy pamiętać o coraz mniejszej liczbie rzeczy, co sprawia, że możemy skupić się na tym, co najbardziej istotne: dowożeniu dobrych stron WWW.

