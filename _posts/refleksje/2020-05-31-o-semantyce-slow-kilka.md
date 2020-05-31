---
layout: post
title:  "O semantyce słów kilka"
author: Comandeer
date:   2020-05-31 18:26:00 +0200
categories: refleksje a11y html-css standardy-sieciowe
comments: true
permalink: /o-semantyce-slow-kilka.html
---

W świecie webdevu semantyka to dość modne słowo. Tylko co to tak naprawdę jest i do czego służy?

## Problem semantyki

Najczęściej słowo to przejawia się w sformułowaniu "znaczniki semantyczne" lub "nowe znaczniki semantyczne w HTML5". Przyznaję, że sam niejednokrotnie używałem tych zwrotów (zwłaszcza pierwszego), niemniej ostatnio staram się ich wystrzegać. A to dlatego, że są mocno nieprecyzyjne.

Nie istnieje coś takiego, jak znaczniki semantyczne. **Każdy znacznik w HTML-u jest semantyczny, bo ma określone znaczenie**. Nawet ten nieszczęsny `div` jest semantyczny, bo [_specyfikacja opisuje jego znaczenie_](https://html.spec.whatwg.org/multipage/grouping-content.html#the-div-element):

> The `div` element has no special meaning at all. It [represents](https://html.spec.whatwg.org/multipage/dom.html#represents) its children. It can be used with the `class`, `lang`, and `title` attributes to mark up semantics common to a group of consecutive elements. It can also be used in a `dl` element, wrapping groups of `dt` and `dd` elements.
>
> [Element `div` nie ma żadnego specjalnego znaczenia. Reprezentuje swoje dzieci. Może być użyty wraz z atrybutami `class`, `lang` i `title`, żeby przekazywać znaczenie (semantykę) typową dla grupy następujących po sobie elementów. Może być też użyty wewnątrz elementu `dl`, otaczając grupy elementów `dt` i `dd`.]

Widzimy tutaj, że definicja znaczenia (semantyki) `div`a składa się tak naprawdę z dwóch części:

* określenia samego znaczenia,
* zasugerowania sposobów _rozszerzenia_ semantyki `div`a.

Jeśli chodzi o samo znaczenie, to… `div` nic nie znaczy sam w sobie. Nie ukrywam, że nie jest to specjalnie intuicyjnie i zapewne to spowodowało powstanie sformułowania "znacznik semantyczny". Ale równocześnie specyfikacja podaje sposób na dodanie do `div`a konkretnego znaczenia. I tutaj pojawia się kolejny problem: ta dodatkowa semantyka nie jest przeznaczona dla użytkowników.

Podsumowując: `div` jest znacznikiem semantycznym, ponieważ ma znaczenie: nic nie znaczy, ale równocześnie może coś znaczyć, niemniej nie w sposób istotny dla użytkownika.

<div style="max-width:100%;height:0;padding-bottom:119%;position:relative;"><iframe src="https://giphy.com/embed/HfFccPJv7a9k4" width="100%" height="100%" style="position:absolute" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div><p><a href="https://giphy.com/gifs/HfFccPJv7a9k4">via GIPHY</a></p>

Spróbujmy jednak połapać się w tym galimatiasie!

<div class="note">
    <p>Z "nowymi znacznikami semantycznymi w HTML5" istnieje jeszcze jeden problem: one nie są nowe. Można by wręcz powiedzieć, że jak na standardy Sieci są wręcz <em>antyczne</em>. Pierwsze wersje większości "nowych" znaczników pojawiły się co najmniej w roku 2005, jeszcze w czasach, gdy HTML5 nawet się tak nie nazywał. Wówczas było to <a href="https://whatwg.org/specs/web-apps/2005-09-01/">Web Applications 1.0</a>. W tym standardzie można odnaleźć elementy takie jak <code>section</code>, <code>article</code>, <code>aside</code>, <code>header</code>, <code>footer</code>, <code>canvas</code>… Były też <a href="https://whatwg.org/specs/web-apps/2005-09-01/#other">inne elementy</a>, które nie przetrwały do dziś, np. <code>calendar</code>, <code>switch</code> czy <code>datagrid</code>. Ba, był już nawet <a href="https://whatwg.org/specs/web-apps/2005-09-01/#outlines">nieszczęsny algorytm outline'u</a>. Zatem "nowe" to dość odważne słowo w tym wypadku.</p>
    <p>Zresztą część tych pomysłów jest jeszcze starsza i sięga wstecz co najmniej do 2002 roku, do czasów niesławnego XHTML 2.0 (dzięki któremu, nomen omen, powstało HTML5). Ta specyfikacja zawiera m.in. <a href="https://www.w3.org/TR/2002/WD-xhtml2-20020805/mod-text.html#sec_8.18.">znacznik <code>section</code></a> czy… <a href="https://www.w3.org/TR/2002/WD-xhtml2-20020805/mod-text.html#sec_8.11.">algorytm outline'u</a>. Część z tych pomysłów przekopiowano następnie do nowego HTML-a oraz dodano nowe. Więc tak po prawdzie "nowe znaczniki semantyczne w HTML5" nie są ani nowe, ani niekoniecznie są z HTML5.</p>
</div>

## Definicja semantyki

**Semantyka znacznika to jego znaczenie**.

I to w sumie tyle. Mówiąc o semantycznym HTML-u, mówimy o HTML-u, który znaczy _to, co chcemy, żeby znaczył_. Zatem dobieramy odpowiednie znaczniki. Jeśli coś jest nagłówkiem, używamy `h1`–`h6`, jeśli coś jest linkiem, używamy `a`, jeśli coś jest po prostu kontenerem na inne elementy, używamy `div` itd.

Dla celów praktycznych można jednak tę definicję nieco rozszerzyć: semantyka znacznika to jego znaczenie **opisane w specyfikacji**. Innymi słowy: źródłem semantyki jest [specyfikacja HTML](https://html.spec.whatwg.org/multipage/). Zresztą jest to [napisane w niej wprost](https://html.spec.whatwg.org/multipage/dom.html#semantics-2):

> Elements, attributes, and attribute values in HTML are defined (by this specification) to have certain meanings (semantics). For example, the `ol` element represents an ordered list, and the `lang` attribute represents the language of the content.
>
> [Elementy, atrybuty i wartości atrybutów w HTML-u są zdefiniowane (przez tę specyfikację) jako posiadające konkretne znaczenia (semantykę). Na przykład element `ol` reprezentuje listę uporządkowaną, a atrybut `[lang]` reprezentuje język treści.]

Specyfikacja też [wyraźnie zaznacza, w którym miejscu znajduje się dokładny opis znaczenia konkretnego znacznika](https://html.spec.whatwg.org/multipage/dom.html#element-definitions):

> This is then followed by a description of what the element [represents](https://html.spec.whatwg.org/multipage/dom.html#represents), along with any additional normative conformance criteria that may apply to authors and implementations. Examples are sometimes also included.
>
> [Po tym [pozostałych częściach definicji elementu] następuje opis, co reprezentuje dany element, łącznie z dodatkowymi formalnymi wymogami zachowania zgodności z tą specyfikacją, które mogą dotyczyć autorów i implementacji. W niektórych przypadkach są również dostępne przykłady.]

Te definicje elementów znajdują się w rozdziale 4. specyfikacji, <cite>The elements of HTML</cite> (Elementy HTML-a). Jak widać, w tym rozdziale mamy zarówno znaczniki o mocno określonym znaczeniu ([nagłówki](https://html.spec.whatwg.org/multipage/sections.html#the-h1,-h2,-h3,-h4,-h5,-and-h6-elements), [`data`](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-data-element), [`details`](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-details-element)), jak i te, które _specjalnie_ nic nie znaczą ([`div`](https://html.spec.whatwg.org/multipage/grouping-content.html#the-div-element), [`span`](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-span-element), [`template`](https://html.spec.whatwg.org/multipage/scripting.html#the-template-element)).

Stąd też `div` ma znaczenie – ponieważ jego opis znajduje się w specyfikacji HTML. Żeby wiedzieć, że `div` nic nie znaczy, trzeba się tego dowiedzieć ze specyfikacji. Choć brzmi to pokrętnie, to osobiście dla mnie ta sytuacja jest bardzo podobna do tego, w jaki sposób funkcjonuje zero. To liczba, która oznacza… nic. Jak się doda 0 do dowolnego działania, wynik się nie zmieni. A mimo to zero bywa przydatne – właśnie dlatego, że _nic nie robi_. Dokładnie tak samo jest z `div`em.

### Problemy językoznawcze

Taka jeszcze dygresja na koniec definiowania semantyki. Za to, że po polsku słowa "semantyka" i "znaczenie" są traktowane całkowicie osobno, wprowadzając tym samym pewne nieścisłości terminologiczne, obwiniłbym różnice, jakie istnieją między językiem angielskim i polskim. [W angielskim](https://www.oxfordlearnersdictionaries.com/definition/english/semantics) semantyka oznacza zarówno naukę o znaczeniu slów, jak i samo ich znaczenie. [W polskim](https://sjp.pwn.pl/sjp/semantyka;2575165.html) semantyka oznacza już tylko naukę.

Niemniej nawet mimo tej różnicy (a może właśnie dzięki niej) sformułowania typu "znaczenie semantyczne" czy "znaczniki semantyczne" są tym bardziej niezrozumiałe. Dlatego uważam, że mówiąc o semantyce znaczników, należy pamiętać, że chodzi nam o nic innego, jak o _znaczenie_ znaczników (brzmi nieco jak pleonazm…). Być może byłoby o wiele lepiej, gdybyśmy po polsku używali właśnie takiego sformułowania, zamiast hermetycznej semantyki. Ale ten okręt już odpłynął… 

## Trzy poziomy semantyki

Rozprawiliśmy się już z pierwszą częścią definicji elementu `div`. Zostaje jednak jeszcze druga, w której to nic nieznaczący `div` zdobywa znaczenie, ale wciąż nic nie znaczy… Nielogiczne? Bynajmniej, ponieważ trzeba zauważyć, że znaczniki mają tak naprawdę trzy poziomy semantyki (znaczenia):

* formalny, opisany w specyfikacji i przeznaczony **dla użytkowników**,
* formalny, którego infrastruktura jest opisana w specyfikacjach, a który przeznaczony jest **dla przeglądarek i innych programów**,
* nieformalny, oparty na konwencjach częściowo opisanych w specyfikacji i przeznaczony **dla webdeveloperów**.

### Dla użytkowników

To najbardziej oczywisty poziom znaczenia znaczników i ten, o którym dotąd najwięcej mówiliśmy. Dzięki doborze odpowiednich znaczników mamy pewność, że każdy użytkownik Sieci zrozumie to, co chcemy przekazać – i to nawet, gdyby na naszej stronie nie zadziałał JS czy nawet CSS. Przeglądarki domyślnie prezentują określone znaczniki w konkretny sposób, np. nagłówki mają większy rozmiar i są pogrubione, linki są niebieskie i podkreślone, przyciski mają charakterystyczny kształt i kolor itd.

Co więcej, poszczególne znaczniki często powiązane są z konkretnymi, natywnymi zachowaniami. Weźmy znów taki przycisk: nie dość, że użytkownik bez problemu zrozumie, że ma do czynienia z przyciskiem, to dodatkowo będzie mógł go prosto obsłużyć z poziomu klawiatury. To samo dotyczy linków czy np. `details`. Znaczenie elementów jest wprost powiązane z tym, jak się zachowują i tym, jak użytkownicy _oczekują_, że dane elementy będą się zachowywać. Dlatego [nie warto psuć tego, co Po Prostu Działa™](https://blog.comandeer.pl/czy-div-jest-dostepny.html).

### Dla przeglądarek i innych programów

Jednak z HTML-a korzystają nie tylko użytkownicy, ale także programy. Najprostszym przykładem może być przeglądarka, która może udostępnić użytkownikowi dodatkowe funkcje, dzięki temu, że strona jest stworzona przy pomocy poprawnie dobranych znaczników. Jedną z takich funkcji jest tzw. [<span lang="en">reader view</span> (ang. tryb poprawionej czytelności)](https://support.mozilla.org/en-US/kb/firefox-reader-view-clutter-free-web-pages), który wycina wszystkie dodatkowe elementy strony i zostawia samą treść, ostylowaną w sposób ułatwiający czytanie. W jaki sposób przeglądarka odnajduje treść? [Przy pomocy odpowiednich znaczników](https://www.brucelawson.co.uk/2018/the-practical-value-of-semantic-html/), takich jak `main` czy `article`.

Niemniej czasami trzeba przekazać programom dodatkowe informacje. Można to zrobić przy pomocy atrybutów, takich jak [`[class]`](https://html.spec.whatwg.org/multipage/dom.html#global-attributes), [`[data-*]`](https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes) czy [`[lang]`](https://html.spec.whatwg.org/multipage/dom.html#the-lang-and-xml:lang-attributes), znaczników, takich jak [`link`](https://html.spec.whatwg.org/multipage/semantics.html#the-link-element) czy [`meta`](https://html.spec.whatwg.org/multipage/semantics.html#the-meta-element), albo całych dodatkowych mechanizmów, takich jak [mikrodane](https://html.spec.whatwg.org/multipage/microdata.html#microdata), [JSON-LD](https://w3c.github.io/json-ld-syntax/), [RDFa](https://www.w3.org/TR/rdfa-primer/), [ARIA](https://w3c.github.io/aria/) czy [manifest aplikacji sieciowej](https://w3c.github.io/manifest/). Te wszystkie sposoby nie są do końca opisane w specyfikacjach. Specyfikacje zawierają jedynie opis, jak takie mechanizmy działają i jak je implementować, natomiast to, co mają przekazywać, zależy już w pełni od tego, jak zostaną użyte. Myślę, że dobrą analogią będzie książka kucharska. Przepis pokazuje nam, jak zrobić suflet, ale to, co z tego sufletu wyjdzie, zależy już wyłącznie od nas. I dokładnie tak jest w tym wypadku: specyfikacja jest przepisem, a to, jak tych rzeczy użyjemy, to nasz suflet.

### Dla webdeveloperów

No i HTML-a używają w końcu także i webdeveloperzy. W sumie to dość oczywiste: jak inaczej mieliby robić strony internetowe? Niemniej "czysty" HTML może być dość trudny do szybkiego ogarnięcia i utrzymania. Trzeba przyznać, że `ul.menu` od razu mówi, do czego służy dany element, podczas gdy `ul` pozwala nam dowiedzieć się jedynie tego, że to _jakaś_ lista. I to jest właśnie ostatni poziom semantyki, oparty na konwencjach, które różnią się między poszczególnymi projektami i które znaczą coś tylko dla osób pracujących z kodem. To po prostu semantyka pozwalająca na organizację i utrzymanie kodu strony internetowej.

Do tego poziomu semantyki zaliczyć też trzeba wszelkiego rodzaju metodyki, takie jak choćby [BEM](https://en.bem.info/). Z perspektywy HTML-a warstwa BEM jest właśnie tym: dodatkowym znaczeniem, przeznaczonym dla webdeveloperów.

## Rozszerzanie semantyki

Opis poszczególnych poziomów semantyki pokazuje, że podstawowe znaczenie każdego znacznika można rozszerzać (a wręcz, do pewnego stopnia, _zmienić_) na wiele różnych sposobów, co daje wiele różnych rezultatów. Weźmy na tapet nagłówek `h2`:

```html
<h2>Comandeer</h2>
```

Ot, zwykły nagłówek. Ale dodajmy do niego odpowiednią klasę, żeby zaznaczyć, że to nagłówek sekcji:

```html
<h2 class="section__heading">Comandeer</h2>
```

Chcielibyśmy także poinformować cały świat, że ta konkretna sekcja jest o pewnej osobie, a nagłówek zawiera jej imię. W tym celu użyjemy RDFa (będziemy musieli także zmienić nieco samą sekcję):

```html
<section class="section" vocab="http://schema.org" typeof="Person">
	<h2 class="section__heading" property="name">Comandeer</h2>
</section>
```

Tym sposobem nasz nagłówek przekazuje informacje z wszystkich wymienionych wyżej poziomów semantyki:

* na najbardziej podstawowym poziomie to wciąż nagłówek, dzięki czemu użytkownik wie, że zaczyna się nowa sekcja,
* dzięki RDFa wyszukiwarki internetowe i inne programy wiedzą, że to sekcja o osobie, która nazywa się "Comandeer",
* dzięki klasie webdeveloperzy wiedzą, że to nagłówek sekcji.

W podobny sposób można rozszerzać znaczenie praktycznie każdego znacznika HTML.

## Semantyka o dostępność

Ok, teoria teorią, ale czy ma to faktyczne przełożenie na cokolwiek? Jak najbardziej. Najprościej wykazać to, pokazując, jak semantyka wpływa na dostępność. Robiłem to już zresztą wcześniej, np. w [artykule o nagłówkach](https://blog.comandeer.pl/o-naglowkach-slow-kilka.html#nag%C5%82%C3%B3wki-a-dost%C4%99pno%C5%9B%C4%87) czy [artykule o przyciskach w React Native](https://blog.comandeer.pl/czy-div-jest-dostepny.html#dost%C4%99pno%C5%9B%C4%87-to-nie-tylko-czytniki-ekranowe).

W skrócie: każdy element HTML jest prezentowany w określony sposób w [drzewku dostępności](https://developers.google.com/web/fundamentals/accessibility/semantics-builtin/the-accessibility-tree). To, jak dokładnie, wynika z jego [domyślnej roli ARIA](https://w3c.github.io/html-aria/#docconformance). Bardzo prosto to pokazać na przykładzie np. nagłówka i podrabianego nagłówka:

```html
<style>
.heading {
    all: unset;
	display: block;
	font-size: 2em;
	line-height: 2;
	font-weight: bold;
}
</style>
<h1 class="heading">Nagłówek</h1>
<span class="heading">Nagłówek</span>
```

Z punktu widzenia użytkownika, który posługuje się wizualną przeglądarką, obydwa elementy wyglądają tak samo i mogą pełnić role nagłówka. Ale gdy z jakiegoś powodu nie doczyta się CSS (bo np. padnie CDN), drugi z elementów przestanie pełnić swoją rolę. Dodatkowo w drzewku dostępności te obydwa elementy są prezentowane zupełnie inaczej:

{% include figure.html src="/assets/images/o-semantyce-slow-kilka/accessibility-tree.png" link="/assets/images/o-semantyce-slow-kilka/accessibility-tree.png" alt="Element h1 ma rolę heading, podczas gdy span – text container." caption="Widok elementów w inspektorze dostępności Firefoksa" %}

To oznacza, że np. użytkownicy czytników ekranowych nie będą w stanie wykorzystać drugiego z elementów do nawigacji po stronie, a przeglądarka lub inny program nie będzie w stanie wygenerować poprawnego spisu treści dla takiej strony.

Teoretycznie można to naprawić nadając elementowi `span` odpowiednią rolę przy pomocy ARIA (`[role=heading]`), ale to nie rozwiązuje wszystkich problemów. Pomijając już problem z CSS-em (który, faktycznie, nie jest najczęstszy), to jaką mamy pewność, że np. Google traktuje `span[role=heading]` tak samo jak `h1`? Nie bez powodu pierwsza zasada ARIA brzmi: [nie używaj ARIA, jeśli istnieje natywny element HTML robiący daną rzecz](https://w3c.github.io/using-aria/#rule1).

## Semantyka a SEO

A jak już jesteśmy przy Google, to warto wspomnieć o tym, w jaki sposób wykorzystuje dodatkowe informacje semantyczne, przekazywane przy pomocy RDFa czy JSON-LD. Dzięki nim możemy do pewnego stopnia wpływać na to, jak prezentowana będzie nasza strona w wynikach wyszukiwania. Najprostszym przykładem może być dodanie gwiazdek z oceną przy wyszukiwaniu produktu:

{% include figure.html src="/assets/images/o-semantyce-slow-kilka/google-schema.png" link="/assets/images/o-semantyce-slow-kilka/google-schema.png" alt="Moja książka w wynikach wyszukiwania ma ocenę 4.2/6 w Helionie oraz 6/10 w Lubimy czytać." %}

Tego typu gwiazdki można dodać przy pomocy [odpowiedniego typu danych Schema.org](https://schema.org/Review). Samo Schema.org to wspólna inicjatywa Google, Microsoftu (Binga), Yahoo i Yandexu, która dostarcza wspólnego dla tych wyszukiwarek sposobu oznaczania dodatkowej semantyki. Dzięki temu wyszukiwarki te mogą w prosty sposób odczytywać różne dodatkowe informacje, jak m.in. oceny produktów czy ich ceny. Ot, taka namiastka [Web 3.0](https://en.wikipedia.org/wiki/Semantic_Web#Web_3.0).

---

Mam nadzieję, że ten ~~krótki~~ artykuł rozwiewa nieco wątpliwości, jakie przez lata narosły wokół semantyki, oraz pokazuje, dlaczego jest ona istotna – i to nie tylko ze względu na dostępność. A teraz przepraszam, bo widzę kilka źle użytych `div`ów…