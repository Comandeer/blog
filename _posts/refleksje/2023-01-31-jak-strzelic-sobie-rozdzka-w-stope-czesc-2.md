---
layout: post
title:  "Jak strzelić sobie różdżką w stopę, część 2."
author: Comandeer
date: 2023-01-31T23:55:00+0100
tags: 
    - refleksje
    - javascript
comments: true
permalink: /jak-strzelic-sobie-rozdzka-w-stope-czesc-2.html
---

W czerwcu 2021 opisywałem nieco [mój pomysł na pakiet testowy](https://blog.comandeer.pl/jak-strzelic-sobie-rozdzka-w-stope.html) dla reszty moich projektów. Ostatecznie jednak postanowiłem, że nie będę go dłużej rozwijał, ponieważ jest zbyt problematyczny. I w tym poście postaram się wyjaśnić dlaczego.

## Natywne wsparcie dla ESM w Node.js

Kiedy `mocha-lib-tester` (mlt) powstawał, natywne wsparcie dla [modułów JS (ESM)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) w Node.js wydawało się odległą przyszłością. Było na etapie kłótni, czy lepiej to zrobić przy pomocy nowego pola w pliku `package.json`, czy nowego rozszerzenia plików `.mjs`. Ostatecznie wprowadzono obydwa rozwiązania i [ekosystem powoli zaczął się przepisywać](https://scribe.rip/sindre-sorhus/hello-modules-d1010b4e777b).

Niemniej mlt był mocno związany ze "starym" systemem modułów w Node.js, [CommonJS (CJS)](https://nodejs.org/dist/latest-v19.x/docs/api/modules.html) . Cała magia, która w nim się działa, opierała się właśnie na tym systemie, który pozwalał w locie modyfikować wczytywane pliki JS. Dzięki temu mogłem załączać [`chai`](https://www.chaijs.com/) oraz inne potrzebne mi biblioteki czy instrumentować kod przy pomocy [Istanbula](https://istanbul.js.org/) w celu [liczenia pokrycia kodu testami](https://blog.comandeer.pl/jak-dziala-narzedzie-do-code-coverage.html).

Natywne wsparcie dla ESM w Node.js oferuje zupełnie inny mechanizm od tego, który nie pozwala na [dynamiczne dopisywanie obsługi nowego rodzaju plików](https://blog.comandeer.pl/html-w-node.html) – coś, z czego właśnie korzystałem. Taką obsługę można dodać jedynie w trakcie odpalania całego pakietu, jako [dodatkową flagę przekazywaną do Node.js](https://nodejs.org/dist/latest-v19.x/docs/api/esm.html#loaders). Dlatego też zacząłem prace nad [`esm-loader-manager`em](https://github.com/Comandeer/esm-loader-manager), który pozwalałby na dołączanie wielu takich loaderów przy pomocy składni podobnej do tej z [`pirates`](https://github.com/danez/pirates), które dotąd stosowałem w mlt. Projekt jak na razie jest dość biedny, ale działa i w sumie spełniałby swoje zadanie w mlt.

Tylko pojawił się inny problem: tryb watch, pozwalający na obserwowanie zmian w projekcie i odpalanie testów na nowo, gdy jakaś zmiana zostanie wykryta. W tym celu opróżniałem cache dla modułów wczytanych przez `require()`, co wymuszało ich ponowne pobranie, tym samym sprawiając, że wszystkie zmiany w kodzie zostały uwzględnione. Moduły ES nie mają API do sterowania cache'em – pobrane zostaną tylko raz i (a przynajmniej tak wynikało z moich testów kilka miesięcy temu) późniejszy ich import nawet nie przechodzi przez jakikolwiek custumowy loader, tylko leci bezpośrednio z cache'u. Możliwe, że da się to obejść (stosując [techniki podobne do tych z przeglądarkowego świata](https://www.keycdn.com/support/what-is-cache-busting)), ale, szczerze, to nie miałem ochoty się z tym kopać.

Zwłaszcza, że to nie był jedyny problem związany z ESM. Oznaczałoby to także m.in. konieczność napisania od nowa całej integracji z [Babelem](https://babeljs.io/). Obecna opiera się bowiem o [`@babel/register`](https://www.npmjs.com/package/@babel/register), który dodaje sobie nowy hook dla `require()` i w locie mieli pliki JS. Zrobienie tego przy pomocy mojego `esm-loader-manager`a wymagałoby tak naprawdę napisania bardzo podobnej rzeczy samemu. I choć robialne, to zaczyna się to robić mocno nużące.

Natywne wsparcie dla ESM w Node.js bez wątpienia było największym gwoździem do trumny mlt. Ale zdecydowanie nie jedynym.

## Wydajność

Nie będę się oszukiwał: mlt był wolny. Niesamowicie wolny. Wynikało to zarówno z podjętych decyzji projektowych, jak i wykorzystanej technologii.

Największym błędem z mojej strony było zaprojektowanie całego systemu tak, by wszystko działo się tam jedno po drugim. I jeśli faktycznie wysłanie informacji o code coverage do [Codecov](https://about.codecov.io/) ma sens dopiero po puszczeniu testów, tak odpalenie [ESLinta](https://eslint.org/) mogło dziać się spokojnie "w tle", równocześnie z testami.

Powoli przymierzałem się, żeby w jakiś sposób ten problem ogarnąć. Wydzieliłem nawet poszczególne kroki (lintowanie, testowanie itd.) do oddzielnych [wątków roboczych](https://nodejs.org/dist/latest-v19.x/docs/api/worker_threads.html). To sprawiło, że całość stała się bardziej responsywna ([spinner](https://github.com/Comandeer/cli-spinner) – tak, [napisałem swój](https://blog.comandeer.pl/kreciolek.html) – mniej chrupał), ale w zamian za… bycie jeszcze wolniejszą. No cóż.

Problemem był też fakt, że sercem mlt była [Mocha](https://mochajs.org/). Wciąż uważam, że w połączeniu z `chai` tworzy jeden z najprzyjemniejszych duetów do pisania testów. Tylko że jest zaprojektowana z myślą o tym, by testy odpalać seryjnie – jeden po drugim. To pozwala na pewne rzeczy trudne czy wręcz niemożliwe do zrobienia przy frameworkach takich jak [ava](https://github.com/avajs/ava), które odpalają testy równolegle, np. [hook `beforeEach()`](https://mochajs.org/#hooks) odpalany przed każdym testem i "czyszczący" po poprzednim. Ale oznacza też, że Mocha jest zdecydowanie wolniejsza od takiej avy.

Cały pakiet mlt to było połączenie wolnych rozwiązań. Swoje dokładały nawet hooki, mielące w locie pliki JS przy pomocy Babela czy dokładające kod Istanbula. Nic zatem dziwnego, że ostateczny produkt był najzwyczajniej w świecie wolny.

## Output

Zresztą podjęte decyzje architektoniczne sprawiły, że mlt nie tylko był wolny, ale robił też absolutnie wszystko, by _wydawać się_ wolny. A to za sprawą tego, że output był wyświetlany dopiero po zakończeniu danego kroku. I znów: w takiej avie wynik każdego testu jest wyświetlany w konsoli od razu po jego zakończeniu. W przypadku mlt tak nie jest – mlt pokazuje wyniki testów dopiero po wykonaniu wszystkich. Do tego czasu użytkownik może sobie poobserwować obracający się spinner – do tego najprawdopodobniej zacinający się nieco.

Sposób raportowania wyników testów to bez wątpienia coś, nad czym będę musiał dokładnie przysiąść, jeśli kiedykolwiek stwierdzę, że czas powrócić do stworzenia własnego pakietu testowego.

## Typy

Typy, a dokładniej plik `.d.ts` z [deklaracjami typów](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) dla mlt, miał być odpowiedzią na problemy związane z globalnym [`expect()`](https://www.chaijs.com/api/bdd/). I choć wymagał sporych zabaw (dodanie odpowiedniej konfiguracji w pliku [`jsconfig.json`](https://code.visualstudio.com/docs/languages/jsconfig)), to ostatecznie działało to dość fajnie i w testach pojawiały się podpowiedzi przy pisaniu asercji.

Do czasu. Pewnego dnia przestały i… prawdę mówiąc, nigdy nie miałem ochoty ani czasu zagłębiać się w to, co dokładnie się stało. Niemniej brak podpowiedzi przy pisaniu asercji niemal całkowicie eliminował jakąkolwiek sensowność globalnego `expect()`, bo obniżało to [DX](https://developerexperience.io/articles/good-developer-experience) praktycznie do zera. Tak, piszę w `chai` od lat i mniej więcej pamiętam, jak wygląda składnia. Ale mimo wszystko byłoby fajnie widzieć jakiekolwiek potwierdzenie ze strony edytora, że nie piszę jakichś bzdur.

## Możliwość rozwoju

No i wreszcie możliwość rozwoju tego cuda. Takim najprostszym ficzerem, jaki przyszedł mi do głowy, było dodanie obsługi kodu w TypeScripcie – zarówno źródłowego, jak i testów. Tylko że to wymagałoby dodania kolejnego hooka (prawdopodobnie opartego również na Babelu) i… wymyślenia, w jaki sposób przepisać to na ESM. Bo za każdym razem, gdy korzystam z jakiegokolwiek pakietu [Sindre'a Sorhusa](https://sindresorhus.com/), przypominam sobie, że CJS jest skazane na zagładę i lepiej przesiąść się jak najszybciej, żeby potem nie płakać i nie utonąć w [piekle dynamicznych importów](https://github.com/Comandeer/rollup-lib-bundler/blob/5651546b0d33ea39849bfa5b7253e5a5e14b94a3/src/packageParser.js#L204-L208).

A że ava nie ma problemów z natywnym wsparciem dla ESM w Node.js, jest o wiele wydajniejsza od mlt i dzięki swojemu API ma także bardzo ładne podpowiedzi w edytorze, to wybór wydaje się dość oczywisty. Zdecydowanie lepszym rozwiązaniem jest przesiadka na sprawdzone rozwiązanie, niż utopienie mnóstwa czasu, by próbować przepisać architekturę mlt. Tym bardziej, że w takim `esm-loader-manager`ze, który – o ironio – powstał jako narzędzie dla mlt, używam właśnie avy – bo całość jest pisana z wykorzystaniem ESM.

Więc tak, mlt to [kolejny projekt, który odesłałem na emeryturę](https://blog.comandeer.pl/bramkarz-na-urlopie.html), bo okazał się bardziej upierdliwy, niż początkowo zakładałem. I, o dziwo, po raz kolejny stało się tak z powodu natywnego wsparcia dla ESM w Node.js…
