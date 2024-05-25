---
layout: post
title:  "Koniec HTML5?"
author: Comandeer
date: 2019-03-31T16:00:00+0200
tags: 
    - standardy-sieciowe
    - refleksje
comments: true
permalink: /koniec-html5.html
---

Dzisiaj, czyli 31 marca 2019, kończy się "czarter" [Web Platform Working Group](https://www.w3.org/WebPlatform/WG/). A wraz z nim prawdopodobnie kończy się także historia HTML5 (i DOM 4). I nie, nie jest to przedwczesny żart primaaprilisowy.

## Dwa standardy

Dzieje rozwoju HTML-a są dość zawiłe (temat już poruszałem kilkukrotnie, choćby przy okazji [dyskusji nad znacznikiem `main`](https://blog.comandeer.pl/refleksje/a11y/2018/01/23/zawieszenie-broni.html)). Niemniej od roku 2012 mieliśmy względną stabilizację. Niezależnie od siebie powstawały dwa standardy HTML. WHATWG tworzy [HTML Living Standard](https://html.spec.whatwg.org/multipage/). To nieustannie uaktualniana wersja HTML, która ściśle odzwierciedla to, co jest zaimplementowane w przeglądarkach (a przynajmniej: w większości przypadków tak jest) oraz do której trafiają wszystkie obiecujące propozycje, mające poparcie co najmniej 2 twórców przeglądarek (jak np. [lazyloading obrazków](https://github.com/whatwg/html/pull/3752)). Z racji tego, że to standard tworzony właśnie przez organizację zrzeszającą twórców przeglądarek, to można oczekiwać, że wszelkie zmiany w przeglądarkach będą w nim ujęte – i tak się dzieje. Od dawna odnoszę wrażenie, że HTML LS jest standardem skupionym właśnie wokół samych przeglądarek.

W3C z kolei tworzy(ło?) [HTML 5.x](https://w3c.github.io/html/). W przeciwieństwie do standardu od WHATWG, HTML5 jest wersjonowane – tak, aby poszczególne specyfikacje mogły stać się rekomendacjami. Ostatnią opublikowaną rekomendacją jest [HTML 5.2](https://www.w3.org/TR/html52/). HTML 5.3 zaczęło powstawać, niemniej w trakcie prac doszło do eskalacji konfliktu z WHATWG i negocjacji na temat dalszych losów HTML 5.x. I wszystko wskazuje na to, że efektem negocjacji jest ubicie HTML 5.x (bo HTML 5.3 nie zmieniło się od października 2018) i uznanie HTML LS za jedyny normatywny standard HTML. Z jednej strony to bardzo dobrze, bo zawsze lepiej mieć jeden standard niż [miliard konkurujących ze sobą](https://xkcd.com/927/). Z drugiej, niesie to ze sobą pewne niebezpieczeństwa, bo HTML LS zdaje się ignorować pewne problemy związane z dostępnością i niektóre problemy, które od dawna podnoszą webdeveloperzy. Dlatego od dawna uważam, że te standardy mogą istnieć obok siebie, bo wypełniają tak naprawdę różne zadania.

Bardzo podobna sytuacja jest z DOM LS i DOM 4.x, którego [dalszy rozwój zablokowały formalne obiekcje ze strony twórców przeglądarek](https://github.com/w3c/dom/issues/175).

## Ważne różnice

O jakich problemach mówię? Tak naprawdę po naprawieniu [słynnego issue #100](https://github.com/whatwg/html/issues/100) został jeden główny problem z dostępnością: [hierarchia nagłówków](https://github.com/whatwg/html/issues/83). Redaktorzy HTML LS uparcie nie ruszają w ogóle fragmentów związanych z algorytmem outline'u, mimo że [od lat wiadomo, że jest fikcją](https://developer.paciellogroup.com/blog/2013/10/html5-document-outline/). Dodatkowo w HTML LS wciąż istnieje [element `hgroup`](https://html.spec.whatwg.org/multipage/sections.html#the-hgroup-element), który bez działającego algorytmu outline'u najzwyczajniej w świecie nie ma sensu. Tym samym kierowanie się zaleceniami zawartymi w HTML LS doprowadzi do stworzenia [niedostępnej, płaskiej hierarchii nagłówków](https://blog.comandeer.pl/html-css/a11y/2017/07/04/o-naglowkach-slow-kilka.html). W HTML 5.x od lat z kolei przed fragmentem związanym z tym algorytmem jest ostrzeżenie o tym, że nie jest nigdzie zaimplementowany, nie ma znacznika `hgroup` oraz [istnieje osobny fragment o oznaczaniu podtytułów](https://w3c.github.io/html/common-idioms-without-dedicated-elements.html#subheadings-subtitles-alternative-titles-and-taglines).

Temat nagłówków ciągnie się już z dobre 6 lat i nie widać jego końca. Choć pewien czas temu [Anne van Kesteren zaproponował zmianę algorytmu outline'u](https://github.com/whatwg/html/pull/3499), za dużo od tego czasu się nie wydarzyło. I dopóki się nie wydarzy, a w przeglądarkach nie pojawią się faktyczne implementacje (co i tak nie rozwiąże problemu osób, które korzystają z IE 11 w połączeniu z czytnikami ekranowymi), to o wiele lepiej kierować się radami zawartymi w HTML 5.x – nawet jeśli nie będzie to Ten Jedyny Prawdziwy Standard™.

Inną ciekawą różnicą jest sposób zdefiniowania poprawnego e-maila: [HTML LS świadomie łamie RFC](https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address) i standaryzuje uproszczoną postać poprawnych e-maili. [HTML 5.x z kolei po prostu odsyła do RFC-6531](https://w3c.github.io/html/sec-forms.html#valid-e-mail-address), które [standaryzuje adresy e-mail ze znakami narodowymi](https://tools.ietf.org/html/rfc6531). [Temat wraca uparcie co pewien czas](https://github.com/whatwg/html/issues/4089), niemniej odpowiedź WHATWG jest zawsze taka sama: przeglądarki nie są zainteresowane implementacją. To po raz kolejny pokazuje, że to właśnie przeglądarki są głównymi odbiorcami HTML LS. W przypadku HTML 5.x głównymi odbiorcami są (byli?) webdeveloperzy.

Mam nadzieję, że prędzej czy później lobbing ze strony środowisk związanych z branżą dostępności czy W3C doprowadzi do tego, że z HTML LS znikną fragmenty nieprzystające do rzeczywistości. Do tego jednak czasu w kwestiach semantyki i dostępności będę uparcie powoływał się na HTML 5.x, nawet jeśli będzie to "nienormatywna specyfikacja". Bo pod tym względem od zawsze była lepsza niż HTML LS.
