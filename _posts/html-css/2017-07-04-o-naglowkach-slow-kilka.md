---
layout: post
title:  "O nagłówkach słów kilka"
author: Comandeer
date:   2017-07-04 16:20:00 +0200
categories: html-css a11y
comments: true
---

Mam już dość powtarzania wciąż na nowo i nowo bzdur odnośnie wykorzystania nagłówków w HTML5, co wręcz prowadzi do ["poprawiania" dobrych materiałów w Sieci](http://sowaprogramuje.pl/10-bledow-poczatkujacych-frontend-developerow-czesc-1/#comment-54). Dlatego dzisiaj słów kilka o nagłówkach.

## Nagłówki – czyli co?

Na sam początek warto zastanowić się, czym są nagłówki. Jeśli ktoś o nich wspomina w kontekście SEO, to najlepiej go _nie_ słuchać. Mit o tym, że mają większe znaczenie dla Google od "normalnych" tagów, wziął się z prawdziwej roli nagłówków.

Treść na stronie internetowej powinna być podzielona na sensowne części. Na najbardziej podstawowym poziomie będą to oczywiście akapity, niemniej taki podział jest najczęściej niewystarczający. Dlatego też poszczególne akapity grupuje się w <i>sekcje</i>. Wyznacznikiem sekcji jest właśnie nagłówek.

W jaki sposób poznać, czy strona jest poprawnie podzielona na sekcje, a tym samym – czy nagłówki są wykorzystane poprawnie? To proste: nagłówki powinny stworzyć <i>hierarchię treści</i> (ang. <i lang="en">outline</i>), czyli, mówiąc kolokwialnie, spis treści. Przykład takiego spisu treści można zobaczyć w moim [tutorialu o semantycznym HTML-u](http://tutorials.comandeer.pl/html5-blog.html). Co ciekawe, jest on [faktycznie generowany z nagłówków](https://github.com/Comandeer/comandeers-tutorials/blob/180978efbd9711666f7ac5f0c7c606fc3564abbc/build/bs/build.js#L42-L71).

## Znaczenie nagłówków

Jeśli już wiemy, do czego nagłówki są wykorzystywane, zastanówmy się, jakie mają znaczenie w procesie tworzenia stron WWW. Jak już było to wspomniane, przedstawiają całą strukturę treści na stronie, a zatem: relacje i zależności pomiędzy poszczególnymi sekcjami na stronie. Tutaj na scenę wkracza tzw. <i>poziom nagłówka</i>, a zatem cyferka znajdująca się obok literki "h" w nazwie poszczególnych tagów.

Poziom nagłówka nie oznacza żadnej mocy ani innego dziwnego voodoo, o którym powtarza się w kontekście SEO. Poziom nagłówka oznacza tylko i wyłącznie jego relację w stosunku do innych elementów na stronie. Spójrzmy na przykład:

```html
<h1>Gatunki kotów</h1>
<h2>Gatunki europejskie</h2>
<h3>Dachowiec angielski</h3>
<h3>Kanałowiec polski</h3>
<h2>Gatunki azjatyckie</h2>
<h3>Smok</h3>
```

Z tego przykładu wiemy, że cała strona dotyczy gatunków kotów. Tak bowiem mówi nagłówek najwyższego poziomu (tag `h1`). Powinien on być tylko jeden na stronie i określać jej tematykę. Następnie dostrzegamy, że strona podzielona jest na 2 duże sekcje: gatunków europejskich i azjatyckich (tagi `h2`). Te sekcje zawierają podsekcje (tagi `h3`) poświęcone poszczególnym gatunkom kota. Oczywiście te podsekcje mogą mieć swoje podsekcje (tagi `h4`), które dalej dzieliłyby na części opisy poszczególnych gatunków (np. "Występowanie", "Sposób pielęgnacji" itd.).

## Nagłówki a dostępność

Jak widać, taka struktura jest niezwykle przejrzysta i logiczna. I to już samo w sobie powinno stanowić odpowiedź na pytanie, czemu należy wykorzystywać poszczególne poziomy nagłówków zgodnie z przeznaczeniem. Niemniej jest ważniejszy powód: dostępność.

Niemal wszystkie czytniki ekranowe traktują nagłówki jako <i>punkty nawigacyjne</i>, pomiędzy którymi można przeskakiwać, wykorzystując odpowiedni skrót klawiszowy. To sprawia, że poprawne wykorzystanie nagłówków staje się jeszcze istotniejsze. Wprowadzenie więcej niż jednego nagłówka najwyższego poziomu może wprowadzić niepotrzebne zamieszanie u użytkownika ([przypadek podobny do wielokrotnego `main`](https://medium.com/content-uneditable/the-great-world-of-open-web-standards-64c1fe53063)). Tak samo takie zamieszanie może wprowadzić używanie niepoprawnych poziomów nagłówków czy pomijanie poziomów. Tylko prosta, czysta i sensowna struktura nagłówków na stronie ma _jakikolwiek_ sens z pragmatycznego punktu widzenia.

I tutaj ważna uwaga: jak już wspominałem w [artykule o tworzeniu czytnika ekranowego](https://blog.comandeer.pl/eksperymenty/a11y/2017/02/11/tworzymy-czytnik-ekranowy.html), technologia asystująca wie tyle, ile powie jej przeglądarka. Jak poszczególne nagłówki są oznajmiane technologii asystującej, można zobaczyć np. w narzędziach programistycznych przeglądarki Chrome w zakładce "Accessibility":

{% capture src %}{{ '/assets/images/devtools-a11y.png' | absolute_url }}{% endcapture %}
{% include figure.html alt="Screenshot otwartych narzędzi programistycznych Chrome, w których podglądany w zakładce Accessibility jest tag h2" src=src %}

Jak widać, nagłówek `h2` jest przedstawiany jako element o roli `heading` (nagłówek) i poziomie 2 – zatem wszystko się zgadza.

## Nagłówki a HTML5

HTML5 wprowadził nowe znaczniki dzielące stronę na sekcje (tzw. <i>znaczniki sekcjonujące</i>), m.in. `section` czy `article`. W specyfikacji HTML5 pojawia się także zarys nowego algorytmu definiującego hierarchię treści. W skrócie: nieważny jest poziom nagłówka, a jedynie poziom jego "zagłębienia", czyli `body > h2` będzie wyżej niż `body > section > h1`.

Tak brzmi teoria. Rzeczywistość okazała się brutalna, bo [żadna przeglądarka nie dodała wsparcia dla tego algorytmu](https://www.paciellogroup.com/blog/2013/10/html5-document-outline/). Algorytm stał się **niebezpieczną fikcją**, która powodowała problemy z dostępnością. Okazało się bowiem, że `body > h2` było nagłówkiem niższego rzędu niż `body > section > h1`. A z racji tego, że technologia asystująca nie wie o stronie nic ponad to, co dostarczy jej przeglądarka, **nie powinno się korzystać z nowego sposobu definiowania nagłówków**

Łatwo to sprawdzić empirycznie. Gdyby nowy algorytm działał, `h1` w poniższym kodzie powinien być przedstawiony czytnikowi ekranowemu jako nagłówek drugiego poziomu:

```html
<body>
	<section>
		<h1>Test</h1>
	</section>
</body>
```

Zobaczmy zatem, czy Chrome faktycznie tak przedstawia ten nagłówek technologii asystującej:

{% capture src %}{{ '/assets/images/devtools-a11y-h1.png' | absolute_url }}{% endcapture %}
{% include figure.html alt="Screenshot otwartych narzędzi programistycznych Chrome, w których podglądany w zakładce Accessibility jest tag section > h1" src=src %}

Jak widać, nagłówek wewnątrz sekcji wciąż jest przedstawiany jako nagłówek pierwszego stopnia. To oznacza, że wykorzystanie kilku nagłówków `h1` na stronie (mimo stosowania równolegle tagów sekcjonujących) tworzy **płaską hierarchię treści**. Tego typu hierarchia jest całkowicie nieprzydatna z punktu widzenia użytkownika – zwłaszcza takiego, który posługuje się dodatkowo technologią asystującą.

Prawda ta jest znana od zawsze i [ma odzwierciedlenie w specyfikacji HTML5](http://w3c.github.io/html/sections.html#creating-an-outline):

>   Warning! There are currently no known native implementations of the outline algorithm in graphical browsers or assistive technology user agents, although the algorithm is implemented in other software such as conformance checkers and browser extensions. Therefore the [outline](http://w3c.github.io/html/sections.html#outline) algorithm cannot be relied upon to convey document structure to users. Authors should use heading [rank](http://w3c.github.io/html/sections.html#rank) (`h1`-`h6`) to convey document structure.

Co więcej, cały ten fragment specyfikacji jest oznaczony jako <i>nienormatywny</i> – a zatem nikt _nie ma obowiązku_ się do niego stosować. I nikt tego nie robi.

[W specyfikacji HTML od WHATWG nie istnieje takowa informacja](https://html.spec.whatwg.org/multipage/sections.html#outlines). Ba, ta specyfikacja opisuje sposób obliczania nagłówków wewnątrz elementu `hgroup`! To kolejny dowód na to, że jeśli chodzi o dostępność, to lepiej omijać specyfikację od WHATWG…

W kontekście HTML5 powstaje zatem zasadne pytanie: czy jest sens stosować znaczniki sekcjonujące skoro i tak wypada stosować nagłówki po staremu? Uważam, że tak, bo tagi te sprawiają, że kod staje się przejrzystszy. Sekcje są oznaczone już nie tylko przez sam nagłówek, ale przez wyraźny tag `section` bądź `article`. Tym sposobem kod jest bardziej <i>semantyczny</i>.

## Główny nagłówek

Warto też przez chwilę zastanowić się nad określaniem głównego nagłówka strony. Jak już wiemy, powinno to być `h1`. Niemniej pytanie brzmi, co w tym `h1` powinno się zawierać?

### #1 – nagłówek opisujący podstronę

Przez lata powtarzałem, że [w przypadku większości stron głównym nagłówkiem strony powinno być logo](https://www.webkrytyk.pl/2013/08/18/lexy-com-pl/#naglowki). Niestety, podgląd ten  [nie jest mocno popularny wśród użytkowników czytników ekranowych](http://www.456bereastreet.com/archive/201104/html5_document_outline_revisited/). Większość z nich (ponad 50%) twierdzi, że `h1` powinno być tytułem danej podstrony. 30% użytkowników dopuszcza za to istnienie dwóch `h1`: dla tytułu całej witryny oraz dla tytułu danej podstrony. Jedynie około 12% uważa, że `h1` powinno oznaczać tytuł całej witryny.

Tego typu wyniki doprowadziły do stworzenia techniki, w której logo/nazwa witryny jest nagłówkiem `h1` wyłącznie na stronie głównej. Na poszczególnych podstronach logo stanowi już tylko link, natomiast w znaczniku `h1` znajduje się tytuł podstrony.  Ta technika jest wykorzystywana m.in. na stronie [<b>Internet Bez Barier</b>](http://internet-bez-barier.com/).  Warto porównać kod [strony głównej](http://internet-bez-barier.com/) z kodem [dowolnej podstrony](http://internet-bez-barier.com/tabele-html/):

```html
<!-- strona główna nagłówek -->
<div class="heading clearfix">
	<img src="http://internet-bez-barier.com/wp-content/themes/internet-bez-barier/images/globe3.png" alt="" />
	<div class="heading-inner">
		<h1 class="site-title">Internet bez barier</h1>

		<p class="site-description">blog na temat dostępności stron internetowych</p>
		<a class="skip" href="#main">Przejdź do głównej treści</a>
	</div>
</div>

<!-- podstrona nagłówek -->
<div class="heading clearfix">
	<img src="http://internet-bez-barier.com/wp-content/themes/internet-bez-barier/images/globe3.png" alt="" />
	<div class="heading-inner">
		<a class="home-link" href="http://internet-bez-barier.com/" title="strona główna" rel="home">
			<span class="site-title">Internet bez barier</span>
		</a>
		<p class="site-description">blog na temat dostępności stron internetowych</p>
		<a class="skip" href="#main">Przejdź do głównej treści</a>
	</div>
</div>
[…]
<h1 class="entry-title">Tabele HTML</h1>
```

Jak widać, na stronie głównej nazwa witryny jest wewnątrz tagu `h1` i nie jest linkiem (bo znajdujemy się na stronie głównej). Na podstronie z kolei `h1` w nazwie witryny jest zastąpione przez link powrotny do strony głównej, a w `h1`umieszczono tytuł wpisu. Wydaje mi się, że tego typu podejście jest na chwile obecną najlepsze, niemniej brakuje jakichś większych badań na temat nawigowania przy pomocy nagłówków.

W przypadku stron typu <i lang="en">one-page</i> problemu nie ma. Tutaj w sumie jedynym sensownym wzorcem (moim zdaniem rzecz jasna) jest ten z logo/nazwą witryny w `h1`.

### #2 – nagłówek poza nawigacją

Istnieje jeszcze jeden wzorzec, o którym warto wspomnieć, a który proponuje np. [Heydon Pickering](http://www.heydonworks.com/): logo strony jest pierwszą pozycją menu nawigacyjnego strony:

```html
<nav role="navigation" aria-label="site links">
	<div class="menu-menu-1-container">
		<ul id="menu-menu-1" class="menu">
			<li id="menu-item-4" class="menu-item menu-item-type-custom menu-item-object-custom current-menu-item current_page_item menu-item-home menu-item-4">
				<a title="HeydonWorks latest blog articles" href="http://www.heydonworks.com">HeydonWorks</a>
			</li>
			[…]
		</ul>
	</div>
</nav>
```

W tym modelu nawigacja i nagłówek strony są osobnymi bytami. Trzeba przyznać, że jest to dość sensowne rozwiązanie i stosuje je m.in. [Smashing Magazine](https://www.smashingmagazine.com/)… niemniej nie do końca mnie przekonuje. Wydaje mi się, że ten wzorzec najbardziej sprawdziłby się w przypadku aplikacji, w której nagłówki określałyby po prostu kolejne widgety/komponenty, lub na stronach reklamowych, gdzie występuje tzw. [<i lang="en">hero section</i>](https://www.sitepoint.com/exploring-hero-section/).

### #3 – nagłówek witryny

No i nie można zapomnieć o najstarszej technice, czyli `h1` jako tytule witryny. Choć nie jest to kardynalny błąd, może wprowadzać pewne zamieszanie dla użytkownika czytnika ekranowego. Istnieje wówczas rozbieżność pomiędzy nawigacją przy pomocy tzw. <i>landmarków</i> (`main, nav, article`) a nawigacją nagłówkami. Teoretycznie nawigowanie do `main` powinno dać ten sam rezultat, co nawigowanie do `h1`.

## Nagłówki kontekstualne?

Nowy algorytm nagłówków w HTML5 miał rozwiązać problem, który od dawna martwi osoby tworzące bardziej skomplikowane aplikacje internetowe: nie zawsze wiadomo, gdzie nasz komponent wyląduje. Wyobraźmy sobie, że robimy sobie w Reactcie komponent "Pogoda" (`Weather`), który ma taki kod HTML:

```html
<section>
	<h2>Pogoda</h2>
	<!-- Tu pogoda wczytana skądś tam -->
</section>
```

Ten komponent następnie ma trafić jako podsekcja sekcji "Inne wiadomości":

```html
<section>
	<h2>Inne wiadomości</h2>
	<Weather />
</section>
```

I tu pojawia się problem: hierarchia treści pokaże komponent "Pogoda" jako osobną sekcję, sąsiadującą z sekcją "Inne wiadomości" (bo i tu, i tu mamy nagłówek drugiego stopnia). Gdyby algorytm hierarchii treści z HTML5 działał, wówczas nagłówek w "Pogodzie" byłby przedstawiany technologii asystującej jako nagłówek trzeciego poziomu lub niższego. Niemniej algorytm nie działa i jest problem…

Poziomy nagłówków w HTML-u są bowiem _globalne_. Nie zależą w żaden sposób od miejsca występowania tagu. `h2` zawsze będzie nagłówkiem drugiego poziomu, a `h6` – szóstego. W czasach, gdy HTML był językiem tworzenia _dokumentów hipertekstowych_, nie sprawiało to praktycznie żadnego problemu. W chwili, gdy HTML stał się językiem do tworzenia _aplikacji internetowych_, brak nagłówków <i>kontekstualnych</i> (zależnych od swojego miejsca występowania) staje się problemem. Zwłaszcza, gdy myślimy o całości aplikacji jako o zbiorze niezależnych komponentów. Wówczas często nie wiemy, gdzie dana rzecz ostatecznie się znajdzie, a co za tym idzie – nie jesteśmy w stanie dobrać sensownie poziomu nagłówka.

Na chwilę obecną problem ten najlepiej rozwiązać tworząc… [komponent nagłówka](https://github.com/ThePacielloGroup/html5-h), który za pomocą magii ARIA (`[aria-level]` czy `[role=heading]`) ustali swój faktyczny poziom. A [w przyszłości być może doczekamy się tego w HTML-u](https://github.com/w3c/html/issues/774), dzięki [tagowi `h`](https://jonathantneal.github.io/h-element-spec/).

## Podtytuły

Została ostatnia kwesia. [Podtytytułów nie robi się na nagłówkach](http://w3c.github.io/html/common-idioms-without-dedicated-elements.html#subheadings-subtitles-alternative-titles-and-taglines). Jest to bowiem dodatkowa informacja do już wstawionego nagłówka. Umieszczanie tego w nagłówku niepotrzebnie komplikowałoby hierarchię treści. Dodatkowo byłoby to utrudnieniem dla użytkowników czytników ekranowych, umieszczając dwa punkty nawigacyjne praktycznie w tym samym miejscu.
