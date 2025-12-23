---
layout: post
title:  "Nullius in verba"
description: "A co, gdybyśmy traktowali webdev bardziej jak naukę?"
author: Comandeer
date: 2025-12-24T00:06:00+0100
tags:
    - adwent-2025
    - refleksje
comments: true
permalink: /nullius-in-verba.html
---

Osoby nieco dłużej śledzące moją internetową aktywność mogły zauważyć pewną zmianę mojego podejścia do tematów webdevowych. W mojej dawnej webkrytykowej twórczości, ale i w początkach istnienia tego bloga, o wiele więcej było, hm, _emocjonalnych_ wstawek. Niczym dekadencki poeta z bujną i rozwichrzoną czupryną zdecydowanie stawiałem formę wyżej od treści. Obecnie moje podejście jest zdecydowanie bardziej _naukowe_. I to bynajmniej nie z powodu nagłego braku bujnej czupryny!<!--more-->

## Podejście naukowe

Co to jednak znaczy, że traktuję webdev naukowo? Tak naprawdę wyróżniłbym tutaj trzy główne elementy:

1. formę treści,
2. obecność źródeł,
3. empiryczność.

### Forma treści

Artykuły naukowe mają ściśle określoną strukturę. Bardzo często opisuje się ją [akronimem IMRaD](https://en.wikipedia.org/wiki/IMRAD):

1. <b lang="en">Introduction</b> (wprowadzenie) – wyjaśnienie celu badania, postawienie hipotezy,
2. <b lang="en">Methods</b> (metody badawcze) – w jaki sposób badanie zostało wykonane, kto w nim uczestniczył,
3. <b lang="en">Results</b> (wyniki) – omówienie wyników badania, sprawdzenie, czy wyniki zgadzają się z postawioną hipotezą,
4. <b lang="en">Discussion</b> (polemika) – próba interpretacji wyników, porównanie ich z innymi badaniami z tego zakresu, zaproponowanie możliwych przyszłych kierunków badań.

Tak tworzone artykuły powinny zachowywać jak największą obiektywność, skupiając się przede wszystkim na opisie faktów, z pominięciem opinii osób autorskich.

Ja nie jestem naukowcem i siłą mojego bloga jest jednak to, że umieszczam na nim materiały o webdevie okraszone _moją_ opinią. Więc bardziej nazwałbym swoją radosną twórczość <dfn id="esej-hipertekstowy">esejami hipertekstowymi</dfn>. To nic innego jak [eseje](https://pl.wikipedia.org/wiki/Esej), które są opublikowane w formie hipertekstu. Czyli: mogą linkować do innych esejów lub bezpośrednio do źródeł, Równocześnie jednak – raz luźniej, raz ściślej – trzymam się struktury IMRaD. Weźmy taki [artykuł o Cookie Store API](https://blog.comandeer.pl/pudelko-z-ciasteczkami). Na samym początku jest wprowadzenie, w którym zaznaczam problem (<q>relacja Sieci z ciasteczkami od zawsze była skomplikowana</q>). Następnie następuje omówienie wyników badania (w tym wypadku: organoleptycznego sprawdzenia, jak się obsługuje ciasteczka w przeglądarkach). W przypadku artykułów z eksperymentów (jak np. [jednoplikowych komponentów](https://blog.comandeer.pl/jednoplikowe-komponenty) czy [ASCSS-a](https://blog.comandeer.pl/ascss)) pojawiają się też sekcje z metodami (opis inspiracji i narzędzi użytych do stworzenia danego projektu) oraz polemika (w jaki sposób go dalej rozwijać, czy moje pierwotne założenia udało się spełnić, itd.).

### Źródła

Niemniej to nie forma jest głównym wyznacznikiem "naukowości". Według mnie o wiele ważniejszym jest odwoływanie się do źródeł. W końcu szansa, że opisałem coś jako pierwszy w Internecie, jest niemalże zerowa. Nawet jeśli w swoim zakątku Sieci jestem faktycznie pierwszy, to przecież o jakimś standardzie sieciowym napisała przede mną choćby… osoba pisząca jego specyfikację. Nawet jeśli już wymyślę coś absolutnie swojego (jak [<span lang="en">Headings First Principle</span> (HFP)](https://blog.comandeer.pl/headings-first-principle)), to przecież to nie istnieje w próżni. Żeby mogło powstać HFP, musiał powstać HTML, a w nim nagłówki. Niezbędnymi elementami były też wszelkie [dobre praktyki wokół dzielenia treści stron WWW na sekcje](https://www.smashingmagazine.com/2022/07/article-section-elements-accessibility/) oraz [sposób nawigowania przy pomocy nagłówków przez osoby korzystające z czytników ekranowych](https://webaim.org/projects/screenreadersurvey10/#finding). Słowem: musiał istnieć cały skomplikowany ekosystem Sieci, żebym ja mógł do niego dodać swoją małą cegiełkę.

Chyba najdobitniej widać to w przypadku mojego, jak dotąd najambitniejszego, projektu, [GWD](https://gwd.comandeer.pl/). W każdym "rozdziale" na końcu znajdują się listy źródeł oraz dodatkowych materiałów. Nazbierało się ich **około tysiąca**. A i tak była to mocno okrojona lista. Zwłaszcza, że sporo tematów ostatecznie wypadło z tego eseju.

Niemniej samo odesłanie do źródeł to za mało. Prawdziwa praca polega na odpowiednim ich dobraniu. Bo można opisać np. element HTML `bdo` i odesłać do jakiejś strony-krzak czy [popularnej, acz słabej jakości witryny](https://www.webkrytyk.pl/2022/10/30/w3schools-com-runda-druga/). Zamiast tego wypada jednak dokładnie zapoznać się, do czego linkujemy, czy nie ma tam błędów merytorycznych, czy poruszone są wszystkie kwestie ważne poruszenia, itd. I tak jak w świecie nauki, w którym mamy tytuły godne zaufania ([Science](https://www.science.org/), [Nature](https://www.nature.com/)), tak i w webdevie jedne źródła są bezpieczniejsze od innych. Najbezpieczniejsze są, rzecz jasna, specyfikacje i standardy. Nie ma pewniejszych źródeł od nich. Jeśli chcę opisać element `bdo`, to [specyfikacja HTML](https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-bdo-element) jest Kanonicznym Źródłem Prawdy™. Ale standardy często są pisane w sposób całkowicie hermetyczny i niezrozumiały dla dowolnej osoby, która nie czyta sobie RFC do poduszki. Wtedy warto sięgnąć po drugie najlepsze źródło – [dokumentację MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/bdo). Jeśli coś można by nazwać <q>oficjalną dokumentacją platformy sieciowej</q>, to byłoby to właśnie MDN.

Dobrej jakości źródeł jest oczywiście więcej – jak choćby [Smashing Magazine](https://www.smashingmagazine.com/), [A List Apart](https://alistapart.com/) czy blogi znanych osób ze światka webdevu. I często na tych stronach, oderwanych od "oficjalnego obiegu", dzieją się rzeczy ciekawsze. To w końcu na łamach A List Apart powstał termin [Responsive Web Design](https://alistapart.com/article/responsive-web-design/)! Często też wyłuskać można na jakiejś stronie jakąś perełkę wśród całej reszty _meh_ artykułów (hej, to zupełnie jak na moim blogu!). Tylko no właśnie – _wyłuskać_…

Sprawne posługiwanie się źródłami wymaga mimo wszystko wprawy i pewnego doświadczenia. Ja w swoim życiu przerobiłem już _tysiące_ artykułów o webdevie i jestem w stanie oddzielić te faktycznie ciekawe od tych, które takie nie są. I właśnie tę umiejętność selekcji uważam za kluczową w bardziej naukowym podejściu do webdevu. Żeby ją zdobyć, to nie ma innej rady – trzeba spędzić swoje na czytaniu. Na początku będzie się czytać wszystko, jak leci, by z czasem odrzucać te najgorsze z najgorszych, aż w końcu nadejdzie moment, w którym się Po Prostu Wie™, co jest warte poświęcenia czasu, a co nie.

Niemniej z selekcją źródeł jest jeszcze jeden mały haczyk: ryzyko wpadnięcia w bańkę. Każda osoba ma jakieś poglądy i przekonania. Choćby tak błahe, jak nielubienie Reacta czy skłonność do wybierania mniej popularnych rozwiązań. I takie przekonania będą – bardziej lub mniej świadomie – wpływać na to, które źródła się dobiera. Nie sądzę, by dało się od tego całkowicie uciec, ale im bardziej się jest tego świadomym, tym mniejszy ma to wpływ na proces selekcji. Bo czasami warto wręcz sięgać po źródła, z którymi się nie zgadzamy – choćby po to, by [wejść z nimi w polemikę](https://gwd.comandeer.pl/progressive-enhancement/#krytyka).

### Empiryczność

Wreszcie ostatni element, który widać w większości moich artykułów – zarówno tutaj, jak i [na WebKrytyku](https://www.webkrytyk.pl/2021/10/31/wpadki-i-wypadki-14/). Empiryczność, czyli mówiąc inaczej: eksperymentowanie. Kiedy opisuję nowe API, fajnie byłoby, gdybym przygotował choćby krótkie demko, w którym bym zademonstrował jego podstawowe ficzery. Tym prostym sposobem można być jak Longinus Podbipięta i ~~ściąć trzy gł~~ odhaczyć trzy rzeczy:

1.  pokazujemy osobom czytającym, że opisywane przez nas rzeczy faktycznie istnieją i działają,
2. tworzymy dla siebie samych z przyszłości źródło do linkowania, jeśli kiedyś wspomnimy znowu o tym API,
3. zapamiętujemy całą rzecz lepiej, niż gdybyśmy naskrobali jedynie teoretyczny opis.

Poza tym – ostatecznie piszę ten blog dla przyjemności. A gdzie byłby cały fun z tego, gdybym się nie bawił kodem?

## Tylko po co?

Odpowiedziałem już na pytanie, <q>jak</q> traktować webdev bardziej naukowo. Pora zatem pochylić się nad drugim, równie ważnym – jeśli nawet nie ważniejszym – pytaniem: <q>po co</q>?

Bo uważam, że tego wymaga uczciwość intelektualna. Webdev nie jest jakąś bliżej niezdefiniowaną sztuką okultystyczną (mimo że czasami tak się jawi!). Wbrew pozorom zdecydowana większość platformy sieciowej jest oparta na konkretnych standardach i specyfikacjach. Bo gdyby nie była, strony WWW działałyby w jednych przeglądarkach i nie działały w innych. [Te czasy już przerabialiśmy](https://thehistoryoftheweb.com/browser-wars/) i to właśnie dzięki nim dzisiaj mamy otwarte standardy sieciowe. Jasne, nie jest idealnie, ale inicjatywy takie jak [Web Platform Tests](https://wpt.fyi/) czy [Interop](https://web.dev/blog/interop-2025) dają nadzieję, ze będzie lepiej. A skoro Sieć oparta jest na fundamentach, które są skodyfikowane (spisane "na papierze", z przybitą pieczątką) i możliwe do empirycznej weryfikacji (w każdej chwili mogę odpalić przeglądarkę i sprawdzić, jak ten HTML czy CSS działają), to nie widzę powodu, by moje artykuły się do tego nie odwoływały.

Uczciwość intelektualna wymaga też, by istniała pewna ciągłość między tym, co tworzymy, a tym, co zostało stworzone. Tak jak artykuł naukowy nie może istnieć bez źródeł, tak trudno stworzyć artykuł o hipertekście bez… hipertekstu. W webdevie nie ma [<i lang="en">self-made men</i>](https://en.wikipedia.org/wiki/Self-made_man), wszyscy budujemy na fundamentach postawionych przez innych. Nawet jeśli nasze budowanie polega na niezgadzaniu się z już istniejącymi dobrymi praktykami i proponowaniu czegoś nowego. Bo ostatecznie nie byłoby tej propozycji, gdyby nie ta praktyka! Żeby się z czymś nie zgadzać, trzeba najpierw zauważyć istnienie tego czegoś. Inaczej [nasza krytyka będzie całkowicie jałowa](https://www.webkrytyk.pl/2021/12/15/video-swiete-wojny-javascriptu-ile-h1-na-stronie-i-dlaczego-kuba-przespal-ostatnie-10-lat/).

Wreszcie: webdev najzwyczajniej w świecie _zasługuje_ na bardziej naukowe – czy też po prostu merytoryczne – traktowanie. Choćby dlatego, że Sieć stanowi coraz większą część naszego codziennego życia. To wszechobecna technologia, do której [dostęp ma **ok. 6 miliardów ludzi**](https://www.itu.int/en/mediacentre/Pages/PR-2025-11-17-Facts-and-Figures.aspx). W innych dziedzinach nauki i technologii, które często dotykają mniejszej liczby osób (jak np. projekt nowego skafandra astronautycznego), zachowujemy niezwykłą precyzję i naukową rygorystyczność. Natomiast w dziedzinie, która w taki czy inny sposób zahacza o _jakieś ¾ światowej populacji_, mam wrażenie, że często wychodzimy z założenia, że <q>to tylko technologia</q>. A to przecież nieprawda. [Ludzie mają różne powody, by korzystać z Internetu](https://shkspr.mobi/blog/2021/01/the-unreasonable-effectiveness-of-simple-html/). Jeśli – jako osoby tworzące strony WWW – nie traktujemy Sieci wystarczająco poważnie, ostatecznie szkodzimy osobom, które z tych stron WWW następnie korzystają. I myślę, że przestawienie myślenia z <q>to tylko technologia</q> w kierunku <q>webdev to nauka</q> jest mało bolesnym sposobem na stworzenie lepszej Sieci.

I tym optymistycznym akcentem życzę Wszystkim wesołych świąt 🎄🎄🎄!
