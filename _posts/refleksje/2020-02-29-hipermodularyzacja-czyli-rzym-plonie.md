---
layout: post
title:  "Hipermodularyzacja, czyli Rzym płonie"
author: Comandeer
date: 2020-02-29T23:56:00+0100
tags: 
    - refleksje
    - javascript
comments: true
permalink: /hipermodularyzacja-czyli-rzym-plonie.html
---

<blockquote>
	<p>— Wybacz, boski imperatorze — rzekł zdyszanym głosem Faon — w Rzymie pożar! większa część miasta w płomieniach!...</p>
    <p>Na tę wiadomość wszyscy zerwali się z miejsc, Nero złożył formingę i rzekł:</p>
    <p> — Bogowie!... Ujrzę płonące miasto i skończę Troikę.</p>

    <p>Henryk Sienkiewicz <cite>Quo vadis</cite>, <a href="https://pl.wikisource.org/wiki/Quo_vadis/Tom_II/Rozdzia%C5%82_19" rel="noreferrer noopener">https://pl.wikisource.org/wiki/Quo_vadis/Tom_II/Rozdział_19</a></p>

</blockquote>

Zdecydowanie moim ulubionym cesarzem jest Neron, ponieważ tak jak on czasami lubię sobie popatrzeć jak Rzym płonie… Z tym, że mój Rzym to zupełnie inny Rzym.

## Rzym?

Kilka dni temu [Sebastian McKenzie ogłosił, że kod źródłowy tajemniczego projektu Rome jest już na GitHubie](https://twitter.com/sebmck/status/1232885861135421441). Co bardziej porywczy już [zdążyli włoską stolicę przetestować](https://jasonformat.com/rome-javascript-toolchain/). Niemniej mnie o wiele bardziej od samego działania ciekawi filozofia tego projektu. Za ["Przeczytaj mnie"](https://github.com/facebookexperimental/rome#readme):

> **Rome** is an experimental JavaScript toolchain. It includes a compiler, linter, formatter, bundler, testing framework and more. It aims to be a comprehensive tool for anything related to the processing of JavaScript source code.
>
> [**Rzym** to eksperymentalny zestaw narzędzi dla JavaScriptu. Zawiera kompilator, linter, narzędzie do formatowania kodu, bundler, framework do testów itp. Jego celem jest zostanie w pełni samowystarczalnym narzędziem do wszystkich rzeczy związanych z procesowaniem kodu źródłowego JavaScript.]

Co więcej, Rzym nie ma żadnych zależności. Absolutnie wszystko jest w nim tworzone od podstaw.

Dość łatwo zaatakować Rzym jako projekt tworzony przez Facebooka, który dzięki niemu tylko umocni swoją pozycję na rynku hegemona technologii frontendowych. Niemniej ja postanowiłem podpalić Rzym od ~~du~~ strony łaźni.

## Hipermodularyzacja

Na ten termin po raz pierwszy natknąłem się w [artykule o JS-owym ekosystemie na Pony Foo](https://ponyfoo.com/articles/controversial-state-of-javascript-tooling#hypermodularization). W największym skrócie jest to tendencja do dzielenia aplikacji na jak najmniejsze, samodzielne moduły. Chyba najlepszym tego przykładem jest [`lodash`](https://www.npmjs.com/package/lodash), w którym praktycznie każda funkcja jest osobnym modułem, który można zainstalować z poziomu npm i używać niezależnie od całej reszty. Z drugiej strony skali mamy natomiast [słynną aferę `left-pad`](https://www.theregister.co.uk/2016/03/23/npm_left_pad_chaos/), która położyła na kilka godzin cały ekosystem JS-a. A pośrodku plasuje się [`karma`](https://www.npmjs.com/package/karma) ze swoimi pluginami do pluginów.

Przyjrzyjmy się zatem pokrótce zadom i waletom hipermodularyzacji!

###  👍 Wszystkie koła już są wymyślone

W połowie tamtego roku [npm przebiło barierę miliona dostępnych pakietów](https://snyk.io/blog/npm-passes-the-1-millionth-package-milestone-what-can-we-learn/). To czyni z niego największy tego typu rejestr na świecie. To również oznacza, że niemal wszystko, co dało się stworzyć w JS-ie, już zostało stworzone.  Chcesz sprawdzić, czy liczba jest parzysta? Jest od tego [pakiet `is-even`](https://www.npmjs.com/package/is-even). Potrzebujesz liczb nieparzystych? No to [`is-odd`](https://www.npmjs.com/package/is-odd)! Potrzebujesz dodać na początku liczby zera, żeby miała odpowiednią dłu… A nie, to akurat zły przykład.

W każdym razie niemal wszystkie problemy mają swoje rozwiązania w przepastnych zasobach npm-a i często wystarczy _zainstalować odpowiedni pakiet_. Tym sposobem nie trzeba tracić czasu na rozwiązywanie często nietrywialnych problemów, a po prostu korzystać z piękna open source'u.

### 👎 Każda zależność to dodatkowa odpowiedzialność

Jasne, czasami można mieć słabszy dzień i z ulgą powierzyć sprawdzanie, czy liczba jest parzysta, czy nie, kawałkowi kodu ściągniętemu z npm. Niemniej [czasami w cieniu kryją się smoki](https://medium.com/hackernoon/im-harvesting-credit-card-numbers-and-passwords-from-your-site-here-s-how-9a8cb347c5b5). Jeśli nie wiemy, co kryje się w danym pakiecie, to w idealnym świecie nie powinniśmy go stosować. Co prawda szansa, że do jQuery czy Reacta nagle ktoś wprowadzi kod wykradający klucze SSH, jest minimalna, ale _wciąż jest_. Można minimalizować ryzyko tego typu niespodzianek poprzez stosowanie dokładnych wersji pakietów w `package.json` (czyli bez żadnych tyld, daszków i innych gwiazdek; tylko twarde liczby) oraz tzw. [<i lang="en">lock files</i>](https://docs.npmjs.com/configuring-npm/package-locks.html). Można też po prostu ograniczać liczbę zależności i jeśli coś da się napisać w dwóch linijkach kodu, to po prostu to _napisać w dwóch linijkach kodu_. A jak już tak bardzo nie chce nam się powtarzać tych samych dwóch linijek kodu w innych projektach, to zawsze można [stworzyć pakiet w swoim zakresie (<i lang="en">scope</i>)](https://docs.npmjs.com/using-npm/scope.html).

Jeszcze innym ciekawym wektorem ataku w przypadku pakietów npm jest fakt, że – w przeciwieństwie do [Composera](https://getcomposer.org/) czy stareńkiego [Bowera](https://bower.io/) – wersja pakietu na npm nie musi być oparta na jego kodzie źródłowym na GitHubie. Sam korzystam z tej opcji, wypychając do npm jedynie zminifikowaną wersję moich pakietów. Niemniej dla bardziej krnąbrnych ludzi stwarza to spore pole do popisu. Nie ma bowiem nic, co powstrzymywałoby ich przed wrzuceniem na GitHuba całkowicie niewinnego kodu, a na npm – koparki Bitcoinów.

No i oczywiście trzeba wspomnieć o `left-padzie`. Każda zależność to jeden potencjalny `left-pad` więcej. Albo [`core-js`](https://www.facebook.com/groups/257881290932879/permalink/2701294813258169/).

### 👍 Łatwe komponowanie aplikacji…

[<q lang="en">Composition over inheritance</q>](https://en.wikipedia.org/wiki/Composition_over_inheritance) to znana zasada świata OOP. Sprawdza się nie tylko tam. Niemal zawsze wymachiwanie większą liczbą mniejszych sztyletów daje lepsze rezultaty niż machanie ogromnymi maczugami. Jak Cię napadnie 20 zbirów w lesie, to mając 20 sztyletów za pazuchą zabijesz wszystkich, nim zdążą zakrzyknąć "Pieniądze albo śmierć" (gorzej, jak się okaże, że to byli poborcy podatkowi lokalnego szeryfa). Jak z kolei napadnie Cię tych samych 20 zbirów, a masz tylko ogromną maczugę, to może i powalisz 15 jednym ciosem, aż ziemia się zatrzęsie, ale 5 pozostałych szybko zada Ci śmierć, zgodnie z Twoim wyborem.

Nie inaczej jest w przypadku projektów w JS. Posiadanie sporej liczby małych modułów pozwala nam podmieniać wnętrzności naszego rozwiązania na takie, które lepiej spełniają nasze potrzeby. Lubimy testowanie przy pomocy [kawy](https://mochajs.org/), ale równocześnie wolimy mocki z [jakiejś egzotycznej biblioteki z 50 strony w rejestrze npm](https://www.npmjs.com/package/spooks)? Spoko, wystarczy podmienić jeden moduł i tyle. W ten sposób można stworzyć dokładnie takie rozwiązanie, jakie chcemy. W przypadku bardziej monolitycznych rozwiązań, pokroju włoskiej stolicy, [błazna](https://www.npmjs.com/package/jest) czy nawet [Cypressa](https://www.npmjs.com/package/cypress), takie żonglowanie i dobieranie sobie rozwiązań jest o wiele trudniejsze, jeśli nie całkiem niemożliwe.

### 👎 …no chyba że coś nie działa

Niemniej składanie rozwiązań z wielu modułów ma też jedną zasadniczą wadę: jak coś nie działa, to często wpadamy w króliczą norę. Bo coś nie działa w Babelu, ale tak naprawdę Babel używa do tego modułu X, który używa modułu Y, który zależy od modułu Z, który używa Babela… I tym sposobem nasz przycisk po kliknięciu nie staje się czerwony, bo biblioteka do parsowania danych binarnych nie radzi sobie z formatem CSV.

Abstrakcyjne? Niby tak, ale `left-pad` się zdarzył i nagle okazało się, że dodawanie zer na początku liczb jest niezbędne do budowania skomplikowanych aplikacji webowych. Każda nowa zależność sprawia, że jesteśmy zależni od coraz większej liczby osób i ich czasu wolnego/przeznaczonego na rozwój open source'u. Wystarczy, że jeden z naszych puzzli nie działa prawidłowo, żeby całość się rozpadła. A wówczas zostaje nam zgłoszenie buga w odpowiednim repozytorium i czekanie… albo sforkowanie i oficjalne przyznanie się, że hipermodularyzacja nie działa.

### 👍 Tak działa ekosystem JS-a – po prostu

Ludzie pragnęli modułów w JS od zawsze. W końcu AMD i abominacje pokroju [Require.js](https://requirejs.org/) nie powstały bez przyczyny. Aż w końcu npm dało nam to, na co wszyscy czekaliśmy: możliwość faktycznego wykorzystywania modułów i mieszania ich ze sobą. Jasne, nie oznacza to od razu, że powinny były powstać pakiety pokroju `is-even` czy `is-odd`. Ale z jakiegoś powodu powstały. Z jakiegoś powodu ludzie stwierdzili, że to jest dobry pomysł. Z jakiegoś powodu największe projekty pokroju Babela czy webpacka korzystają z takich rozwiązań. Z jakiegoś powodu _to działa_.

### 👎 Tak działa ekosystem JS-a – po prostu

A równocześnie: z jakiegoś powodu pojawił się problem `left-pad`a. Z jakiegoś powodu mamy obecnie problem z `core-js`. Z jakiegoś powodu hipermodularyzacja przyciąga do ekosystemu JS-a naprawdę poważne problemy, na które nikt nie chce lub nie umie znaleźć rozwiązania.

Z hipermodularyzacją jest jeden, zasadniczy problem: ma prawo faktycznie działać jedynie w idealnym świecie. W tym, w którym żyjemy, razem z nią w pakiecie dostajemy liczne problemy i zagrożenia: od nagle odpublikowanych pakietów, poprzez wydanie zepsutych wersji innych pakietów, na pakietach wykradających dane kart kredytowych kończąc. Jasne, w 90% przypadków wszystko działa jak należy. Ale te pozostałe 10% istnieje. I może nas kosztować grube miliony.

## Rzym płonie

Jakkolwiek nie patrzeć na hipermodularyzację, jest ona obecnie rozwiązaniem, na którym oparta jest większa część ekosystemu JS. Pozwala ona nie tylko w łatwiejszy sposób tworzyć nowe aplikacje czy biblioteki, poprzez proste ponowne używanie już istniejącego kodu, ale także dowolnie żonglować dostępnymi rozwiązaniami, tworząc rozwiązania specyficzne dla naszych problemów. I w tym świecie miliona barbarzyńskich osad pojawia się nagle jedno cywilizowane miasto, otoczone wysokim murem. Już to przerabialiśmy i historia nie była specjalnie łaskawa dla tej ostoi wyższej kultury. Barbarzyńcy nader wszystko bowiem cenią sobie wolność – a tej za wysokimi murami za bardzo nie ma. Natomiast nawet za nimi są [wewnętrzne kliki](https://github.com/facebookexperimental/rome/tree/master/packages/%40romejs).

Dlatego ze spokojem stoję na Kapitolu, brzękolę na swojej lutni i patrzę, jak płomyki radośnie podrygują pomiędzy dachami wspaniałego Rzymu. I czekam. Czekam, aż miasto spłonie… albo barbarzyńcy chwycą nagle za wiadra i zaczną gasić.

