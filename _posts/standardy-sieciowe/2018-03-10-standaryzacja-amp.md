---
layout: post
title:  "Standaryzacja AMP?"
author: Comandeer
date: 2018-03-10T19:42:00+0100
tags: 
    - standardy-sieciowe
    - refleksje
    - html-css
comments: true
permalink: /standaryzacja-amp.html
redirect_from:
    - /refleksje/html-css/2018/03/10/standaryzacja-amp.html
---

Google ogłosiło, że [standaryzuje technologie związane z AMP](https://amphtml.wordpress.com/2018/03/08/standardizing-lessons-learned-from-amp/). Mam jednak pewne wątpliwości co do całego procesu…

## Ale o co chodzi?

Google przyznaje, że AMP nie było do końca poprawnym podejściem do rozwiązania problemu wydajności stron WWW i że teraz dostrzega, że cały proces mógłby być o wiele bardziej przejrzysty i otwarty, gdyby cała technologia oparta była na otwartych standardach sieciowych. Dlatego też wkrótce strony nienapisane w AMP, ale korzystające z otwartych standardów sieciowych, będą mogły również się znaleźć w słynnej już karuzeli na stronie wyników wyszukiwania.

Muszę przyznać, że jestem naprawdę – ale to _naprawdę_ – pozytywnie zaskoczony. Zamiana AMP na zestaw otwartych standardów sieciowych brzmi jak wielki krok naprzód, który przysłuży się całej Sieci! Niemniej – jak zawsze – diabeł tkwi w szczegółach…

## Język

Pierwsze podejrzenia nasuwa już sam język, w jakim napisano ten wpis na blogu. Wystarczy przyjrzeć się pierwszemu zdaniu:

>   For over two years, AMP has been a leading format for creating consistently excellent user experiences on the web, and Google continues to invest strongly in it as our well-lit path to achieving a user-first web.
>
>   [Przez ponad dwa lata, AMP był wiodącym formatem służącym tworzeniu nieustannie wspaniałych doświadczeń użytkownika i Google kontynuuje szerokie inwestycje w tę dobrze zbadaną ścieżkę prowadzącą do stworzenia użytkownikocentrycznej Sieci.]

<div style="width:100%;height:0;padding-bottom:75%;position:relative;"><iframe src="https://giphy.com/embed/pVAMI8QYM42n6" width="100%" height="100%" style="position:absolute" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div><p><a href="https://giphy.com/gifs/january-joan-baez-googles-pVAMI8QYM42n6">via GIPHY</a></p>

Przejdźmy może do ciekawszych rzeczy…

## Rozszerzalna Sieć?

We wpisie pada stwierdzenie, że AMP od samego początku budowano w oparciu o założenia zapisane w [<b lang="en">Extensible Web Manifesto</b>](https://extensiblewebmanifesto.org/) (Manifeście Rozszerzalnej Sieci):

>   The lessons learned in 2+ years of iteration based on the [extensible web](https://github.com/extensibleweb/manifesto) are ones we hope will be useful in informing the web standards process.
>
>   [Mamy nadzieję, że doświadczenie nabyte w czasie ponad dwóch lat iterowania na podstawie zasad [rozszerzalnej Sieci](https://github.com/extensibleweb/manifesto) będzie pomocne w procesie tworzenia standardów sieciowych.]

Problem polega na tym, że Manifest Rozszerzalnej Sieci **nigdy** nie miał być oddzielony od tego procesu. Wskazuje już na to jego pierwsze zdanie:

>   We—[the undersigned](https://extensiblewebmanifesto.org/#signatories)—want to change how web standards committees create and prioritize new features.
>
>   [My – [niżej podpisani](https://extensiblewebmanifesto.org/#signatories) – chcemy zmienić sposób, w jaki komitety zajmujące się standardami sieciowymi tworzą i priorytetyzują nowe funkcje.]

I dalej:

>   We aim to tighten the feedback loop between the editors of web standards and web developers.
>
>   [Chcemy zacieśnić pętlę feedbacku pomiędzy redaktorami standardów sieciowych a webdeveloperami.]

Ba, cały manifest opiera się na założeniu, że standaryzowane będą niskopoziomowe rzeczy, na których społeczność będzie budować wyższe warstwy abstrakcji. Jak zatem AMP wpisuje się w Manifest Rozszerzalnej Sieci, skoro nie jest ani tworzony przez żadne ciało standaryzacyjne, ani w żaden sensowny sposób nie tworzy nowych niskopoziomowych API dla platformy sieciowej?

## Polityka Wydajności Treści

Następnie zostaje przypomniany pomysł [<b lang="en">Content Performance Policy</b>](http://wicg.github.io/ContentPerformancePolicy/) (CPP; Polityka Wydajności Treści):

>   Credit goes to [Tim Kadlec](https://twitter.com/tkadlec) and [Yoav Weiss](https://twitter.com/yoavweiss) for kicking off the [Content Performance Policy idea](https://timkadlec.com/2016/02/a-standardized-alternative-to-amp/) in 2016 and convincing us that we should go down this path. This idea has now morphed into the [Feature Policies](https://wicg.github.io/feature-policy/) and become a real thing that will help with AMP-like performance guarantees without relying on AMP going forward.
>
>   [Wyrazy uznania należą się [Timowi Kadlecowi](https://twitter.com/tkadlec) oraz [Yoavowi Weissowi](https://twitter.com/yoavweiss) za stworzenie pomysłu CPP w 2016 i przekonanie nas, że powinniśmy podążać tą ścieżką. Ten pomysł zmienił się w [Feature Policies](https://wicg.github.io/feature-policy/) i stał się rzeczywistością, która pomoże uzyskać wydajność podobną do AMP bez opierania się na formacie AMP i jego rozwoju.]

Bardzo dobrze, że wspomniano tę inicjatywę, bo była to jedna z największych prób pokazania, że można mieć AMP bez AMP. Szkoda jednak, że została zrównana z [<b lang="en">Feature Policy</b>](https://wicg.github.io/feature-policy/) (FP; Polityka Funkcji), bo te dwie propozycje różnią się od siebie diametralnie. CPP to sposób na poinformowanie przeglądarki, że dana strona korzysta z konkretnych rozwiązań, które mają poprawiać/wpływać na wydajność, oraz wymuszenie tych rozwiązań. FP to sposób na wyłączenie niektórych funkcji platformy sieciowej. Można by powiedzieć, że na pierwszy rzut oka CPP jest podzbiorem FP. Problem polega na tym, że na razie FP umie… wyłączyć możliwość użycia WebRTC. Nie czuję, żeby to miało uratować wydajność strony WWW. Co więcej: istnieje ciekawy konflikt interesów pomiędzy  FP a [<b lang="en">Content Security Policy</b>](https://w3c.github.io/webappsec-csp/) (Polityka Bezpieczeństwa Treści), bo większość rzeczy wyłączalnych przez FP związana jest z bezpieczeństwem, nie zaś – wydajnością.

Dochodzi tutaj do niebezpiecznego przesunięcia semantycznego: zamiast szczegółowego, doskonale przystosowanego do problemów wydajności rozwiązania, proponuje nam się rozwiązanie bardzo ogólne, wręcz _wybrakowane_ względem pierwotnej propozycji. A raczej nie o to chodzi.

## Pozostałe standardy

Google przygotował listę nowych standardów, na których ma się opierać AMP oraz inne wydajne strony:

>   Google’s goal is to extend support in features like the [Top Stories carousel](https://developers.google.com/search/docs/guides/about-amp) to AMP-like content that (1) meets a set of performance and user experience criteria and (2) implements a set of new web standards. Some of the proposed standards in the critical path are [Feature Policy](https://wicg.github.io/feature-policy/), [Web Packaging](https://github.com/WICG/webpackage), [iframe promotion](https://discourse.wicg.io/t/proposal-for-promotable-iframe/2375), [Performance Timeline](https://w3c.github.io/performance-timeline/), and [Paint Timing](https://w3c.github.io/paint-timing/).
>
>   [Celem Google jest rozszerzenie wsparcia w [karuzeli Top Stories](https://developers.google.com/search/docs/guides/about-amp) również na treść AMP-opodobną, która (1) spełnia zestaw kryteriów dotyczących wydajności i doświadczenia użytkownika (2) implementuje zestaw nowych standardów sieciowych. Niektóre z tych standardów to [Feature Policy](https://wicg.github.io/feature-policy/), [Web Packaging](https://github.com/WICG/webpackage), [awansowanie `iframe`](https://discourse.wicg.io/t/proposal-for-promotable-iframe/2375), [Performance Timeline](https://w3c.github.io/performance-timeline/) i [Paint Timing](https://w3c.github.io/paint-timing/).]

[Pełna lista dostępna jest na GitHubie](https://github.com/ampproject/amphtml/blob/master/contributing/web-standards-related-to-amp.md). Gdy rzucimy na nią okiem, dostrzeżemy poważny problem: niemal żaden z wymienionych tam standardów sieciowych nie jest standardem sieciowym ani nawet nie znajduje się obecnie na ścieżce standaryzacyjnej. Owszem, kilka jest opisanych jako <q lang="en">shipping in first browsers</q> [implementowane w pierwszych przeglądarkach], ale to oznacza po prostu, że… w Chrome już eskperymentują. Jedyne faktyczne standardy na tej liście na chwilę obecną to [<b lang="en">Performance Timeline</b>](https://w3c.github.io/performance-timeline/) (Rozkład czasowy Wydajności) i [<b lang="en">Paint Timing</b>](https://w3c.github.io/paint-timing/) (Chronometraż Malowania). Żeby było śmieszniej, to najmniej przydatne rzeczy z tej listy. Podczas gdy reszta "standardów" w jakiś sposób zmienia działanie strony, te dwa standardy umożliwiają jedynie pobieranie statystyk o tym, czy strona jest wydajna. I na tym kończy się zakres faktycznych standardów sieciowych na liście standardów sieciowych…

OK, przyznaję, że na liście są jeszcze 2 rzeczy, które mogą stać się w dość niedługim czasie standardami: wspomniane już FP oraz [<b lang="en">Web Packaging</b>](https://github.com/WICG/webpackage) (WP; Pakowanie Sieciowe). Ale to w sumie tyle. Reszta to luźne pomysły, rzucone ot tak (jak choćby [usprawnienie preloadu obrazków](https://github.com/w3c/preload/issues/120) – co nie przeszkodziło w implementacji tego w Chrome – czy [awansowanie `iframe`](https://discourse.wicg.io/t/proposal-for-promotable-iframe/2375) – brzmiące po polsku jeszcze gorzej niż angielski oryginał) lub "dyskutowane", jak np. [uniemożliwienie wczytywania multimediów o nieokreślonych rozmiarach](https://github.com/WICG/feature-policy/issues/127) (proszę zwrócić uwagę, jak gorąca dyskusja się wywiązała!).

Ba, większość rzeczy na liście standardów to po prostu propozycje rzeczy, które można wyłączać przy pomocy FP. Nie robi to zbyt pozytywnego wrażenia, zważając na fakt, że to, co można wyłączać przy pomocy FP, [nie jest częścią standardu](https://wicg.github.io/feature-policy/#features):

>   The [policy-controlled features](https://wicg.github.io/feature-policy/#policy-controlled-feature) themselves are not themselves part of this framework. A non-normative list of currently-defined features is maintained as a [companion document](https://github.com/WICG/feature-policy/blob/gh-pages/features.md) alongside this specification.
>
>   [[Funkcje kontrolowane przy pomocy polityki](https://wicg.github.io/feature-policy/#policy-controlled-feature) nie są częścią tego frameworka. Nienormatywna lista obecnie zdefiniowanych funkcji jest utrzymywana jako [uzupełniający specyfikację dokument](https://github.com/WICG/feature-policy/blob/gh-pages/features.md).]

W samym zaś tym dokumencie czytamy:

>   This document lists policy-controlled features being implemented in browsers. It is not intended to be a complete list: browsers may choose to implement other features not in this list. Nor is it intended to be normative: the definitions of these features all belong in their respective specs.
>
>   [Ten dokument wylistowuje funkcje kontrolowane przy pomocy polityki, które są implementowane przez przeglądarki. Nie ma zamiaru być kompletną listą: przeglądarki mogą zaimplementować inne funkcje kontrolowane przy pomocy polityki, które nie są na liście. Nie ma też zamiaru być normatywny: definicje poszczególnych funkcji przynależą do odpowiadających im specyfikacji.]

Tym samym otwartość listy otwartych standardów jeszcze bardziej się nam zawęża.

### Pakowanie Sieciowe

Samo WP jest dość ciekawą bestią, bo pozwala na spakowanie danej strony do archiwum i podpisanie go kluczem cyfrowym, żeby było wiadomo skąd to archiwum pochodzi. Innymi słowy: ten standard ma umożliwić serwowanie treści z cache AMP u Google, ale pokazując, że pochodzi ze strony odpowiedniego wydawcy. I na dobrą sprawę to jedyne, co ten standard robi… W tym momencie Google już nawet nie udaje, że strony w AMP byłyby wydajne bez cache:

>   We’re super excited about Web Packaging because it isn’t AMP-specific technology, **so we’ll be able to use it for instant-loading of all packaged web content!**
>
>   [Jesteśmy bardzo podekscytowani w związku z WP, ponieważ nie jest to technologia przeznaczona wyłącznie dla AMP, **więc będziemy w stanie natychmiastowo wczytywać każdą spakowaną treść!**]

Czyli tak czy inaczej tracimy kontrolę nad własną treścią, która będzie przechowywana w cache Google jako archiwum. Nie wiadomo, jak te archiwum będzie przesyłane do klienta, ani jak często Google będzie je uaktualniał. Ba, na chwilę obecną [szkic specyfikacji](https://jyasskin.github.io/webpackage/bundles/draft-yasskin-dispatch-bundled-exchanges.html) **nie zapewnia nawet spojności danych**:

>   Bundles currently have no mechanism for ensuring that they signed exchanges they contain constitute a consistent version of those resources.
>
>   [Paczki na chwilę obecną nie posiadają mechanizmu zapewniającego, że podpisana wymiana HTTP je dostarczająca zawiera spójną wersję przekazywanych zasobów.]

Nie mamy więc nawet pewności, że Google nie będzie ingerował w naszą treść!

Jedynym pomysłem z WP, który wygląda ciekawie, jest [podpisane wymiany HTTP](https://tools.ietf.org/html/draft-yasskin-http-origin-signed-responses-03). Wymiana HTTP jest definiowana jako para żądanie-odpowiedź, zatem przeglądarka będzie mogła odrzucić odpowiedź, jeśli ta nie przedstawi sygnatury odpowiadającej tej z żądania. Bardzo ciekawy mechanizm, chociaż nie wyobrażam sobie go w "normalnych" zastosowaniach (to raczej coś dla aplikacji, które muszą zachować maksymalny poziom bezpieczeństwa).

### Awansowanie `iframe`

Najbardziej absurdalną propozycją na liście jest zdecydowanie [awansowanie `iframe`](https://discourse.wicg.io/t/proposal-for-promotable-iframe/2375). W skrócie chodzi o to, że – żeby przyśpieszyć nawigację pomiędzy stronami – strona A wczytuje u siebie w `iframe` stronę B i gdy użytkownik na tę stronę B chce przejść, treść strony po prostu jest zastępowana zawartością ramki.

Rozumiem skąd ten pomysł się wziął, bo na dobrą sprawę to po prostu próba kodyfikacji praktyk, które są stosowane w rzeczywistości. Niemniej czy naprawdę musimy standardy sieciowe sprowadzać do takiej roli? Już wolałbym zobaczyć [wielki powrót `link[rel=prerender]`](https://css-tricks.com/prefetching-preloading-prebrowsing/#article-header-id-4) albo wykorzystanie do tego Service Workerów (Serwisowych Wątków Roboczych) ([<span lang="en">foreign fetch</span>](https://developers.google.com/web/updates/2016/09/foreign-fetch) [zewnętrzne pobieranie] – to było coś!). No ale prawo Kopernika-Comandeera zawsze działa i ostatecznie każdy dobry standard sieciowy zostanie wyparty przez gorszy…

Niemniej w tej propozycji chyba i tak najciekawsze jest to, kto ją stworzył – [Andrew Betts](https://github.com/triblondon). Ten sam, który stworzył i jest jednym z oryginalnych sygnatariuszy [<b lang="en">A letter about Google AMP</b>](http://ampletter.org/) [Listu o Google AMP]. Sama propozycja wyewoluowała z [ogólnej propozycji wprowadzenia prerenderingu](https://discourse.wicg.io/t/pre-render-meets-feature-policy-alternative-to-amp/2173), która miała być _alternatywą_ dla AMP. I ta propozycja znalazła się na liście wśród innych standardów i propozycji, które są "związane" z AMP lub – jak dobitniej określa to wpis na blogu AMP – powstały dzięki AMP. Muszę przyznać, że to dość pokrętna logika.

## Przyszłość

Głównym założeniem CPP był fakt, że to, co da się zrobić w AMP, da się też zrobić przy pomocy współczesnych, **istniejących** standardów sieciowych oraz dobrych praktyk, a brakuje jedynie formalnych, obiektywnych wyznaczników, czy strona faktycznie jest wydajna:

>   By specifying the specific tool to be used when building a page, Google makes their job much easier. There has been no simple way to verify a certain level of performance is achieved by a site. AMP provides that. […] So when we look at what AMP offers that you cannot offer yourself already, it’s not a high-performing site—we’re fully capable of doing that already. It’s this verification.
>
>   [Tworząc konkretne narzędzie do budowania stron, Google ułatwia sobie zadanie. Nie ma prostego sposobu na weryfikację poziomu wydajności osiąganej przez daną stronę. AMP to zapewnia. […] Więc jeśli chcemy ustalić, co takiego AMP nam oferuje, czego nie możemy zrobić obecnie sami, to nie będzie to wysoce wydajna strona – to możemy bez problemu zrobić sami. Chodzi o weryfikację tego.]

Niesamowita praca włożona w rozwój tych dobrych praktyk przez ludzi, takich jak choćby wspomniany już Andrew Betts, [Ilya Grigorik](https://www.igvita.com/) (nomen omen również pracownik Google'a), [Steve Souders](https://www.stevesouders.com/), cała [grupa robocza W3C dedykowana wydajności](https://www.w3.org/webperf/) (Grigorik jest jej wiceprzewodniczącym) czy [Filament Group](https://www.filamentgroup.com/), pokazuje, że da się budować niezwykle wydajne strony WWW bez uciekania się do własnościowych formatów, takich jak AMP. I nie potrzeba do tego cache'u ani archiwizacji całych stron WWW. [Naprawdę](https://projects.hearstnp.com/performance/).

Dlatego tym bardziej dziwi mnie, że Google mówi "spoko, faktycznie lepiej używać otwartych standardów sieciowych", po czym robi unik i zasłania się listą rzeczy, które może kiedyś się pojawią, może w więcej niż jednej przeglądarce, może w ogóle się nie pojawią… A Sieć potrzebuje wydajności tu i teraz. Wydajności, którą jesteśmy w stanie uzyskać tu i teraz. I to bez pomocy Google i jego własnościowego formatu.

Google swoim oświadczeniem [nie rozwiał wątpliwości](https://ethanmarcotte.com/wrote/campaign/), a jego ostatnie działania [rodzą coraz większy opór](http://this.how/googleAndHttp/). Jedna wojna o otwarte standardy sieciowe została już wygrana, być może pora na kolejną.
