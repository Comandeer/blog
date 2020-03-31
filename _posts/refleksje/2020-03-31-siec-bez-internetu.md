---
layout: post
title:  "Sieć bez Internetu"
author: Comandeer
date:   2020-03-31 22:40:00 +0200
categories: refleksje standardy-sieciowe
comments: true
permalink: /siec-bez-internetu.html
---

Przez długi czas słowa "Sieć" i "Internet" były używane zamiennie. Ale w 2020 przestały być synonimami!

## Internet i Sieć

Kiedy mówisz "Internet", masz tak naprawdę na myśli "Sieć". Jednak te słowa nie miały znaczyć tego samego. Na najbardziej podstawowym poziomie Internet jest tak po prawdzie siatką połączonych ze sobą,  przy pomocy stosu TCP/IP, komputerów,  – a więc infrastrukturą. Sieć z kolei (a także e-mail, FTP, protokoły P2P…) to jedynie usługa korzystająca z Internetu do roztaczania swej magii.

Bądźmy jednak szczerzy: 99% czynności wymagających Internetu jest ściśle związanych z używaniem Sieci (pozostały 1% to wysyłanie maili). Jeśli stracimy połączenie z Internetem, będzie nam brakować możliwości sprawdzenia naszej ściany na Facebooku, a nie możliwości skorzystania z [Telnetu](https://pl.wikipedia.org/wiki/Telnet). Jest raczej dość oczywiste, czemu "Internet" i "Sieć" zaczęły znaczyć to samo.

## Era offline

Niemniej najnowsze prace nad standardami sieciowymi mogą to zmienić. Wszystko rozpoczęło się wraz z [HTML5 i jego Application Cache](https://www.w3.org/TR/html50/browsers.html#appcache). Ta dość prymitywna technologia pozwalała stworzyć plik (manifest) zawierający listę wszystkich plików (HTML, CSS, JS itd.), które powinny być dostępne w trybie offline. Dzięki temu Internet stawał się niezbędny wyłącznie w czasie pierwszego wczytywania strony. Później wszystko mogło być serwowane z lokalnego cache'u. Niemniej aktualizowanie strony stawało się równocześnie mocno problematyczne: przeglądarki widziały zmiany w poszczególnych plikach dopiero wówczas, gdy plik manifestu również się zmienił. Łatwo było to przeoczyć i serwować użytkownikom starą wersję strony…

[AppCache był dupkiem](https://alistapart.com/article/application-cache-is-a-douchebag/). Dlatego też powstały [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API). Są o wiele bardziej ogólnym mechanizmem, który działa podobnie do serwera proxy: znajduje się pomiędzy przeglądarką i serwerem i obsługuje cały ruch sieciowy. Można przejąć każde żądanie HTTP i zdecydować, czy ma zostać przesłane dalej do serwera, czy odpowiemy samodzielnie przy pomocy czegoś z lokalnego cache'u. Jest to niezwykle potężny mechanizm wymagający [bezpiecznego środowiska pracy](https://w3c.github.io/webappsec-secure-contexts/).

Łatwo sobie wyobrazić, jak Service Workers mogą być użyte do stworzenia de facto aplikacji sieciowej działającej całkowicie offline, która wymaga Internetu wyłącznie do wczytania samego Service Workera. Ale co, jeśli można by było całkowicie wyeliminować potrzebę połączenia z Internetem?

## Web Bundles
Wszystko zaczęło się w 2018 roku, gdy Google ogłosiło, że ma [zamiar standaryzować technologie związane z AMP](https://blog.comandeer.pl/standaryzacja-amp.html). [Web Packaging](https://github.com/WICG/webpackage) był jedną z tych technologii. Standard ten przeistoczył się w dwie osobne specyfikacje: [<i lang="en">signed HTTP exchanges</i>](https://wicg.github.io/webpackage/draft-yasskin-http-origin-signed-responses.html) (ang. podpisane wymiany HTTP) oraz [<i lang="en">Web Bundles</i>](https://wicg.github.io/webpackage/draft-yasskin-wpack-bundled-exchanges.html) (ang. Sieciowe Paczki).

Pomysł jest dość prosty: pozwólmy jakiejś zewnętrznej stronie (np. Google'owemu cache'owi AMP) serwować stronę w naszym imieniu. Tym sposobem Google będzie w stanie dostarczyć wszystkie zasoby, używając do tego swoich superszybkich serwerów, a użytkownik będzie wiedział, że to wciąż nasza strona – po prostu Google dostało pozwolenie na serwowanie jej. I w tym miejscu kończy się łatwa część…

Web Packaging ma być naprawdę wydajnym i bezpiecznym sposobem na dostarczanie treści. Z tych założeń wzięły się wymiany HTTP. Są to po prostu pary żądań i odpowiedzi HTTP. Zamiast pytać serwer o określony zasób, przeglądarka po prostu go dostaje. Wraz z nim dostarczane jest żądanie HTTP, które pozwala przeglądarce zrozumieć, co dokładnie dostała; żądanie spełnia rolę metadanych. Dzięki temu strony dostawców treści mogą serwować treść w imieniu innych stron (co samo w sobie zaczyna brzmieć jak zdecentralizowana Sieć!). Oczywiście musi równocześnie istnieć sposób na stwierdzenie, które strony mają uprawnienia do serwowania konkretnej treści. I tutaj wkraczają Signed HTTP Exchanges (SXG)! Taka wymiana zawiera dane dla konkretnej pary żądanie ↔ odpowiedź i jest podpisana przy pomocy [specjalnie przygotowanego certyfikatu SSL](https://web.dev/how-to-set-up-signed-http-exchanges/#step-1). I, jeśli mam być szczery, brzmi to dla mnie jak czarna magia (i prawdopodobnie nią jest…).

Niemniej SXG skupiają się na wsparciu dla _pojedynczych_ wymian HTTP. To oznacza, że mogą przesyłać jeden plik naraz. Niespecjalnie zachwycające, biorąc pod uwagę, że współczesne strony mogą składać się z setek, jeśli nie _tysięcy_, plików. Ale na szczęście istnieją jeszcze Web Bundles (WB)! Są to to po prostu paczki zawierajace wiele wymian HTTP. Pojedynczy Web Bundle jest [plikiem CBOR](https://cbor.io/) z typem MIME ustawionym na `application/webbundle` i zawiera wszystkie informacje potrzebne do wczytania całej strony z pojedynczego pliku. Wymiany HTTP wewnątrz WB mogą być podpisane, tak samo jak SXG. Innymi słowy: WB są jak ZIP-y zawierające naszą stronę, które mogą być otwarte bezpośrednio w przeglądarce.

Tak, ostro pogmatwane…

## Paczkowanie strony

Załóżmy, że chcemy stworzyć WB z [mojej strony z tutorialami](https://github.com/Comandeer/comandeers-tutorials). Najpierw musimy pobrać kopię repozytorium – czy to przez klonowanie, czy po prostu [ściągnięcie ZIP-a](https://github.com/Comandeer/comandeers-tutorials/archive/master.zip). To, co będzie nas interesować, to katalog `public`, zawierający stronę gotową do publikacji. Będzie on zawartością naszego WB.

Otwórzmy terminal wewnątrz katalogu repozytorium. Żeby stworzyć WB, użyjemy [pakietu npm `wbn`](https://github.com/WICG/webpackage/tree/master/js/bundle) – oficjalnej biblioteki od Google:

```bash
npx wbn --dir public --baseURL https://tutorials.comandeer.pl/ --output tutorials.wbn
```
<p class="note">Komenda <code>npx</code> to narzędzie dołączane do nowszych wersji npm-a, które pozwala uruchamiać dowolne pakiety npm bez ich uprzedniej instalacji.</p>

Uruchamiamy komendę `wbn` przy pomocy `npx`-a. Parametr `--dir` określa ścieżkę zawierającą zawartość WB (czyli katalog `public` w tym wypadku), `--baseURL` zawiera adres URL strony (czyli wersję online zawartości WB), a `--output` to nazwa generowanego pliku. Po wywołaniu tej komendy, w katalogu repozytorium powinien pojawić się nowy plik, `tutorials.wbn`.

Żeby uruchomić takie WB, potrzebujemy Chrome'a 79+ z włączoną eksperymentalną obsługą Web Bundles. Można to zrobić przechodząc na adres `chrome://flags/#web-bundles` i wybierając opcję "Enable" po prawej. Jeśli mamy już odpowiednią przeglądarkę, możemy po prostu otworzyć plik `tutorials.wbn` i naocznie się przekonać, że wyświetlona strona wygląda _dokładnie_ jak [wersja online](https://tutorials.comandeer.pl).

Jedyny brakujący element to fakt, że nasze WB nie jest wciąż podpisane. Niemniej nie da się tego (jeszcze) zrobić przy pomocy pakietu `wbn`. W tym celu trzeba użyć [odpowiedniego narzędzia napisanego w Go](https://github.com/WICG/webpackage/tree/master/go/bundle#sign-bundle) i posiadać certyfikat SSL z odpowiednim rozszerzeniem (podobnie jak w przypadku SXG). Dodatkowo Chrome na razie wspiera jedynie niepodpisane WB, więc nie musimy się tym na razie martwić.

## Super, i co mogę z tym zrobić?

Na chwilę obecną: absolutnie nic. To wciąż eksperymentalna technologia i wydaje się, że jedynie Google podchodzi do niej entuzjastycznie. [Mozilla już oficjalnie zaprotestowała przeciwko SXG](https://mozilla.github.io/standards-positions/#http-origin-signed-responses), stwierdzając, że zezwolenie konkretnym stronom na serwowanie treści z innych stron spowoduje zbyt duże przesunięcie w modelu bezpieczeństwa Sieci – i nie można się z tym nie zgodzić. Niemniej [WB wydają się całkiem inną parą kaloszy](https://github.com/mozilla/standards-positions/issues/264), zwłaszcza te niepodpisane. Bez podpisu są tak naprawdę niczym innym, jak wersją offline strony, ładnie zapakowaną w jeden, łatwy w dystrybucji plik.

A to otwiera szereg możliwości, jak np. wysłanie całej strony kumplowi przez Bluetooth (coś, czym [Google mocno reklamuje cały koncept](https://web.dev/web-bundles/#explaining-web-bundles)). "No fajnie, ale mogę to samo zrobić z ZIP-em" – zakrzyknie od razu Co Bardziej Rozgarnięty Czytający… i to prawda. Niemniej, żeby otworzyć stronę przesłaną w ZIP-ie, trzeba go najpierw rozpakować. A nawet jak już to zrobimy, to wciąż będzie to po prostu plik wczytany z dysku – a więc papa, Ajaksie, papa, Service Workers, papa, CORS, itp., itd. Kiedy jednak uruchomimy tę samą stronę z poziomu pliku `.wbn`, to Po Prostu Będzie Działać™. Wszystko dzięki temu, że [WB mają działać jak normalne strony](https://github.com/WICG/webpackage/blob/master/explainers/navigation-to-unsigned-bundles.md).

Niemniej nie to ekscytuje mnie w tym najbardziej. Moja wizja jest zdecydowanie bardziej przyszłościowa, chociaż [część webdevów wydaje się myśleć w podobny sposób](https://github.com/pwa-builder/PWABuilder-CLI/issues/340): WB jako uniwersalny format aplikacji (sieciowych). Wyobraźmy to sobie: aplikacja, która może być uruchomiona na praktycznie _każdym_ systemie operacyjnym, który ma przeglądarkę. I to bez konieczności zmiany _ani jednej_ linijki kodu. Po prostu ściągasz plik `.wbn` i odpalasz aplikację, bez żadnej instalacji. Takich czarów to nawet [Electron.js](https://www.electronjs.org/) nie potrafi. Jest też inna zaleta w porównaniu do Electrona: wszystkie aplikacje współdzielą to samo środowisko uruchomieniowe – przeglądarkę. Nigdy więcej aplikacji zapychających RAM setkami instancji Chromium. Wystarczy sama przeglądarka. Wręcz perfekcyjna implementacja [konceptu Mini Apps](https://w3c.github.io/miniapp/white-paper/). Dodajmy do tego [moduły WASM-a](https://hacks.mozilla.org/2019/11/announcing-the-bytecode-alliance/) i mamy w pakiecie nawet wydajność bliską natywnej – wszystko wewnątrz przeglądarki! Jedynym ograniczeniem będzie tak naprawdę sama przeglądarka, ale hej, nawet [dostęp do USB](https://wicg.github.io/webusb/) już jest! Ograniczenia znikają naprawdę szybko (a czy to dobrze, czy niekoniecznie, to już temat na zupełnie inny wpis…). A bez nich nie widzę, czemu `.wbn` nie miałoby się stać uniwersalnym formatem dla wszystkich app store'ów. Wtedy z czystym sumieniem będę mógł się nazwać [<i lang="en">10x programmer</i>](https://medium.com/ingeniouslysimple/the-origins-of-the-10x-developer-2e0177ecef60) (ang. dziesięciokrotny programista), ponieważ będę robił aplikacje sieciowe – więc tak naprawdę aplikacje na Windowsa, Linuksa, macOS-a, iOS-a, Androida, Tizena i system operacyjny pralki Twojej ciotki z Australii. Wszystko na tym samym kodzie.

I właśnie dlatego zawsze stawiam na Sieć.