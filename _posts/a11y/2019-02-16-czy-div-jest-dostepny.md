---
layout: post
title:  "Czy div jest dostępny?"
author: Comandeer
date:   2019-02-15 23:50:00 +0100
categories: refleksje a11y html-css
comments: true
permalink: /czy-div-jest-dostepny.html
redirect_from:
    - /a11y/html-css/2019/02/15/czy-div-jest-dostepny.html
    - /a11y/html-css/refleksje/2019/02/15/czy-div-jest-dostepny.html
    - /refleksje/a11y/html-css/2019/02/15/czy-div-jest-dostepny.html
---

14 lutego [Ryan Florence napisał na Twitterze, że przyciski w React Native Web (RNW) są dostępne](https://twitter.com/ryanflorence/status/1095884090484518914):

> Both true:
>
> 1. Most devs should just use a `<button>`, not `<a>`, `<div>`, `<span>`, etc.
>
> 2. React Native Web's div buttons are better buttons than `<button>`
> 	- Still keyboard and AT accessible
> 	- Better touch event handling
> 	- Populate `e.relatedTarget` unlike `<button>`
> 	- Easier to style
>
> I think a lot of HTML/CSS experts are being overly critical of React because they see the output of the new [https://twitter.com ](https://t.co/ogT1tMANTm) and *think* they know there are fundamental flaws when they see the div soup.
> That div soup is accessible.
>
> ```html
> <h2/>
> <div role="heading" aria-level="2"/>
>
> <button/>
> <div {...allTheRightAttributesAndEventHandlers}/>
> ```
>
> These are identical as far as accessibility is concerned when implemented correctly.
>
> If you're critical of this, you don't actually care about a11y, you care about your niche
>
> So yeah ... just use a button, or a RNW button, but not your own div button.
>
> [Obydwa stwierdzenia są prawdziwe:
>
> 1. Większość devów powinna używać `<button>` zamiast `<a>`, `<div>`, `<span>` itd.
> 2. Przycisk z React Native Web oparty o div jest lepszy niż `<button>`:
> 	1. Wciąż dostępny z poziomu klawiatury i technologii asystującej.
> 	2. Lepsza obsługa dotyku.
> 	3. Zawiera `e.relatedTarget` w przeciwieństwie do `<button>`.
> 	4. Łatwiejszy do stylowania.
>
> Myślę, że wielu ekspertów HTML/CSS jest zbytnio krytycznych względem Reacta, ponieważ widzą oni kod nowego [Twittera](https://twitter.com) i _myślą_, że wiedzą, żę są tam podstawowe błędy, gdy widzą divową zupę.
>
> Ta divowa zupa jest dostępna.
>
> ```javascript
> <h2/>
> <div role="heading" aria-level="2"/>
>
> <button/>
> <div {...allTheRightAttributesAndEventHandlers}/
> ```
>
> Te kody są identyczne, jeśli bierzemy pod uwagę poprawnie zaimplementowaną dostępność.
>
> Jeśli jesteś krytyczny wobec tego, tak naprawdę nie dbasz o dostępność, ale o własną niszę.
>
> Więc tak… po prostu użyj przycisku albo przycisku z RNW, ale nie swojego własnego przycisku na `div`.]

Takie podejście jest nie tyle niewłaściwe, co szkodliwe. Postaram się pokrótce przybliżyć, czemu tak uważam.

## Informacje o natywnym przycisku są niepełne

Przyciski po kliknięciu _mają_ własność `event.relatedTarget`:

<iframe width="100%" height="300" src="//jsfiddle.net/Comandeer/Lmuwj7eb/embedded/" allowfullscreen="allowfullscreen" allowpaymentrequest frameborder="0"></iframe>

Jeśli ponawigujemy po przykładzie klawiaturą (<kbd>Tab</kbd> oraz <kbd>Shift</kbd>+<kbd>Tab</kbd>), zauważymy, że wyświetla się poprawny identyfikator pola, z którego przeszliśmy do przycisku. Co prawda [Ryan uściśla następnie, że chodzi o Firefoksa i Safari](https://twitter.com/ryanflorence/status/1096067667570487297), ale wciąż nie pokrywa się to z moimi testami. Na moim macOS 10.14.3 zarówno w Firefoksie, jak i w Safari powyższy kod działa – [wbrew informacji na MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#Clicking_and_focus) . Być może zmienił się sposób obsługi focusowania na poziomie całego systemu. To równocześnie oznaczałoby, że problem nieprzekazywania `event.relatedTarget` przez przyciski jest już rozwiązany.

Inna rzecz, że po raz kolejny dostrzec tu można problem "makizacji" developmentu i [zamykania go w bańce](https://www.smashingmagazine.com/2017/03/world-wide-web-not-wealthy-western-web-part-1/). Fakt, że coś nie działa w dwóch przeglądarkach na macOS (lub inaczej: zachowuje się zgodnie z tym, jak zachowują się przyciski w tym systemie), nie oznacza równocześnie, że jest to problem globalny. Chrome, [mający 61% rynku](http://gs.statcounter.com/), tego problemu nie posiada, a sam jeden prezentuje już większość rynku. Oczywiście, użytkowników, którzy mogą natrafić na ten błąd, wciąż jest sporo, ale tutaj trzeba sobie zadać pytanie, czy warto jest rezygnować z natywnego `button` na rzecz własnego rozwiązania, by zadowolić ok. 15% użytkowników kosztem reszty? W tym wypadku wydaje mi się, że sensowniejszym pomysłem byłoby znalezienie alternatywnego sposobu rozwiązania problemu lub stworzenie jakiegoś obejścia dla przeglądarek na macOS.

Kolejną niepełną informacją jest ta, że przyciski w RNW są łatwiejsze do stylowania. Niemniej ta informacja nie wydaje się być aktualna. Obecnie usunięcie wszystkich stylów z przycisku sprowadza się do użycia w CSS [własności `all` z wartością `unset`](https://developer.mozilla.org/en-US/docs/Web/CSS/all). A jeśli musimy wspierać IE i Edge'a lub natrafimy na (wciąż, niestety, istniejące) bugi z `all: unset`, [istnieją tradycyjne sposoby](https://css-tricks.com/overriding-default-button-styles/).

Niepełna jest także informacja o lepszej obsłudze dotyku. Ryan nie podaje szczegółów i nie wiem do końca, o co chodzi. Zwłaszcza, że przecież natywne przyciski również działają normalnie ze zdarzeniami dotykowymi.

Mam także pewną wątpliwość co do źródła danych. [Ryan przy omawianiu zgodności ARIA-owych zamienników z czytnikami ekranowymi](https://twitter.com/ryanflorence/status/1095891544706473985) powołuje się na [statystyki obsługi ARIA przez czytniki ekranowe](https://www.powermapper.com/tests/screen-readers/headings/aria-role-heading/). Widzę z nimi jeden podstawowy problem: nie ma w nich ani jednego czytnika głosowego dla Linuksa czy Androida. Być może okazałoby się wówczas, że wsparcie dla divowych nagłówków wcale nie jest takie świetne.

## Dostępność to nie tylko czytniki ekranowe

Gdy weźmie się pod uwagę wyłącznie czytniki ekranowe, można dojść do wniosku, że faktycznie – `div[role=heading][aria-level=2]` jest równoznaczne z `h2`. Niemniej dostępność nie kończy się na czytnikach ekranowych – [dostępność dotyczy absolutnie każdego](https://blog.comandeer.pl/refleksje/a11y/2017/06/09/to-tylko-niepelnosprawni.html). I tak jak błędem dostępności jest fakt, że czytnik ekranowy nie potraktuje naszego nagłówka jako nagłówka, tak samo błędem dostępności jest fakt, że dodatek do przeglądarki widomego użytkownika nie będzie mógł stworzyć dla niego spisu treści, bo zamiast nagłówków użyliśmy pełno `div`.

I choć dodatek do przeglądarki opierający się na znacznikach HTML, by budować spis treści, nie jest specjalnie popularnym przypadkiem, to o wiele częściej można znaleźć przypadki związane z doborem odpowiednich stylów dla osób niedowidzących. Chyba najprostszym przykładem może być wykorzystanie przez takich użytkowników [własnych stylów CSS](http://people.ds.cam.ac.uk/ssb22/css/). Niestosowanie semantycznych znaczników lub używanie stylów inline (co zresztą RNW też robi, sądząc po [demo](https://necolas.github.io/react-native-web/storybook/?selectedKind=Components&selectedStory=Button&full=0&addons=0&stories=1&panelRight=0)) może znacząco wpłynąć na komfort przeglądania strony przez takich użytkowników, a w skrajnym wypadku im to uniemożliwić całkowicie.

Problem ten dotyczy nie tylko niestandardowych arkuszy stylów użytkownika, ale także [wbudowanego w Windows trybu wysokiego kontrastu](https://www.scottohara.me/blog/2019/02/12/high-contrast-aria-and-images.html). Usuwa on bowiem wszystkie style nadane elementom przez developera i na podstawie domyślnych arkuszy stylów przeglądarki oraz _semantyki_ poszczególnych elementów wyświetla wszystkie elementy. W tym momencie przyciski oparte na `div` przestaną pełnić swoją funkcję. Dzieje się tak, ponieważ w ich przypadku dostępność jest ściśle połączona z ich prezentacją – tych dwóch aspektów nie da się rozdzielić.

{% include figure.html src="/assets/images/czy-div-jest-dostepny/rnw-button-hc.png" link="/assets/images/czy-div-jest-dostepny/rnw-button-hc.png" alt="Brak ramki i innych wyznaczników, że jest to przycisk; został sam tekst." caption="Przycisk z RNW w trybie wysokiego kontrastu" %}

{% include figure.html src="/assets/images/czy-div-jest-dostepny/native-button-hc.png" link="/assets/images/czy-div-jest-dostepny/native-button-hc.png" alt="Ramka wyraźnie wskazuje, w którym miejscu znajduje się przycisk." caption="Natywny przycisk w trybie wysokiego kontrastu" %}

Przycisk na `div` przestaje być przyciskiem w chwili, gdy przestaje wyglądać. Z kolei `button` ma przypisaną "przyciskowość" niejako do własnej tożsamości. Tak jak wilk przebrany za owcę nigdy nie stanie się prawdziwą owcą, tak przycisk na `div` nigdy nie stanie się tym samym co `button`. W wielu przypadkach może się sprawdzić, ale w wielu – spektakularnie się wyglebi.

Dodatkowo fakt, że część stylów jest umieszczana bezpośrednio w znaczniku, w tym te dotyczące animacji, może sprawiać problemy, gdy [pojawi się potrzeba wyłączenia animacji](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion). W przypadku całkowitego rozdziału elementu od prezentacji taka zmiana jest bardzo prosta do wprowadzenia.

## Divowy przycisk nie działa bez JS

I zanim ktoś zdąży powiedzieć, że "przecież nikt nie wyłącza dzisiaj JS": [JS może nie zadziałać](https://kryogenix.org/code/browser/everyonehasjs.html). Ba, wystarczy zadyszka naszego CDN-a, żeby zachowanie dla naszego przycisku wczytało się kilka sekund _za późno_. Przez ten czas użytkownik będzie wrzucony do doliny dziwów i będzie się zastanawiał, czemu przyciski wyglądające jak przyciski nic nie robią. W przypadku zastosowania `button` i podejścia [Progressive Enhancement](https://webroad.pl/inne/3722-progressive-enhancement-zapomniany-fundament) można tak pokombinować z [SSR](https://medium.freecodecamp.org/what-exactly-is-client-side-rendering-and-hows-it-different-from-server-side-rendering-bd5c786b340d), żeby użytkownik dostał podstawową wersję produktu zanim JS się doczyta i był w stanie np. złożyć zamówienie w sklepie. A skoro [da się zrobić nowoczesną stronę WWW, która odpala się na pierwszej przeglądarce internetowej w historii](https://adactio.com/notes/14815), to da się _naprawdę dużo_.

## Divowy przycisk łamie pierwszą zasadę ARIA

[Pierwsza zasada ARIA](https://w3c.github.io/using-aria/#firstrule) brzmi: nie używaj ARIA, jeśli istnieje odpowiedni element HTML, którego możesz użyć. Ta zasada nie wzięła się znikąd i mam nadzieję, że powyższe punkty to pokazują. Nie ma sensu wymyślać na nowo koła – zwłaszcza, że jest to koło z napędem odrzutowym i silnikiem jądrowym, które, źle skonstruowane, grozi zniszczeniem całej planety. Skoro nikt nie wpadłby na pomysł budowania takiego cuda w garażu, skoro geniusze z NASA zrobili to w tajnym laboratorium 50 metrów pod ziemią, nie widzę powodu, dla którego ktoś miałby implementować od podstaw przycisk.

Fakt, że divowy przycisk działa dobrze w czytnikach ekranowych, oparty jest na założeniu, że implementacja jest prawidłowa. Problem polega na tym, że to jest ten typ błędów, który wychodzi dopiero w praniu. Przeglądarki miały na to kilkanaście lat, RNW – zdecydowanie mniej. Dodatkowo jest dość niszową technologią, co zmniejsza ryzyko wystąpienia błędów. Tym samym na divowy przycisk czaić się mogą najróżniejsze przypadki brzegowe i inne monstra. Albo po prostu zmieni się standard ARIA lub zachowanie przycisków w przeglądarkach i divowy przycisk przestanie przystawać do rzeczywistości. A źle działający przycisk jest w stanie czasami wyrządzić więcej szkody niż całkowicie niedziałający.

## HTML to nie tylko dostępność

Stwierdzić, że `div[role=button]` to to samo co `button`, to jak stwierdzić, że w sumie Słowacki to to samo co Mickiewicz… No nie, po prostu nie. Jeśli na gruncie czytników ekranowych jest to to samo, tak na gruncie semantyki są to całkowicie różne elementy. Fakt, że obecnie coraz większa część Sieci jest divową zupą, wynika z faktu, że [HTML stał się formatem kompilacji](https://christianheilmann.com/2019/01/28/html-is-and-always-was-a-compilation-target-can-we-deal-with-that/). To samo w sobie nie jest złe, ale równocześnie pokazuje problem: [współczesne aplikacje nie mają semantycznego HTML-a](https://marcysutton.com/links-vs-buttons-in-modern-web-applications), bo ich twórcy _nie muszą go znać_. W końcu z punktu widzenia developera RNW przycisk to po prostu `<Button />`. Nikogo nie interesuje, że do przeglądarki trafia ostatecznie taki potwór:

```html
<div role="button" data-focusable="true" tabindex="0" class="rn-1oszu61 rn-1iymjk7 rn-s2skl2 rn-l5bh9y rn-101sy47 rn-1efd50x rn-14skgim rn-rull8r rn-mm0ijv rn-13yce4e rn-fnigne rn-ndvcnb rn-gxnn5r rn-deolkf rn-1loqt21 rn-6koalj rn-1qe8dj5 rn-1mlwlqe rn-eqz5dr rn-1mnahxq rn-61z16t rn-p1pxzi rn-11wrixw rn-ifefl9 rn-bcqeeo rn-wk8lta rn-9aemit rn-1mdbw0j rn-gy4na3 rn-bnwqim rn-1otgn73 rn-eafdt9 rn-1i6wzkk rn-lrvibr rn-1lgpqti" style="background-color: rgb(23, 191, 99);">
    <div dir="auto" class="rn-13yce4e rn-fnigne rn-ndvcnb rn-gxnn5r rn-deolkf rn-jwli3a rn-1471scf rn-14xgk7a rn-1b43r93 rn-o11vmf rn-ebii48 rn-majxgm rn-t9a87b rn-1mnahxq rn-61z16t rn-p1pxzi rn-11wrixw rn-tskmnb rn-1pyaxff rn-xd6kpl rn-1m04atk rn-q4m81j rn-bauka4 rn-tsynxw rn-q42fyq rn-qvutc0">Press me</div>
</div>
```

Nikogo, oprócz użytkowników końcowych, którzy – oprócz wszelkich innych opisanych problemów – muszą najzwyczajniej w świecie ściągnąć ten nadmiarowy kod HTML (albo wygenerować u siebie w przeglądarce, co również nie należy do najwydajniejszych rzeczy pod słońcem). W świecie, w którym walczy się o każdy bajt, [wycinając wszelkie niepotrzebne znaki z HTML-a](https://meiert.com/en/blog/html-performance/), taka rozrzutność jest po prostu niezrozumiała.

Niemniej to tylko fragment problemu. Wspomniane już utrudnienia w audytowaniu takiego kodu również są tylko wycinkiem. Nie można bowiem zapomnieć, że w obecnym świecie [HTML jest uniwersalnym językiem wymiany informacji](https://medium.com/content-uneditable/a-standard-for-rich-text-data-4b3a507af552) – popularniejszym nawet od JSON. To język, na bazie którego zbudowano WWW. To język, na bazie którego [powoli powstaje Semantyczna Sieć](https://twobithistory.org/2018/05/27/semantic-web.html). W końcu to język, który traktuje się po macoszemu i odrzuca w pełni jego semantykę… Przez lata wypracowano rozwiązania pokroju [RDF](https://www.w3.org/RDF/), [RDFa](https://rdfa.info/), [mikrodanych](https://html.spec.whatwg.org/multipage/microdata.html#microdata), [Schema.org](https://schema.org/), [mikroformatów](https://microformats.io/), [JSON-LD](https://json-ld.org/) i wielu innych, by teraz porzucić to wszystko na rzecz divowej zupy, niemającej jakiejkolwiek semantycznej wartości. Parsowanie tego typu dokumentów i próba wyciągnięcia z niej _znaczącej_ treści jest niemal niemożliwa. A to oznacza, że z HTML-a pozostaje tylko T – tekst odarty z własnego znaczenia.

I dlatego twierdzenie, że obrona semantycznego HTML-a jest obroną pewnej niszy, jest z gruntu fałszywe. Obrona semantycznego HTML-a to obrona podstawowych wartości, na jakich zbudowano Sieć. A niszą w tym zestawieniu pozostaje RNW.
