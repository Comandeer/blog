---
layout: post
title:  "Jak strzelić sobie różdżką w stopę?"
author: Comandeer
date: 2021-06-30T23:22:00+0200
tags: 
    - refleksje
    - javascript
comments: true
permalink: /jak-strzelic-sobie-rozdzka-w-stope.html
---

W życiu niemal każdego programisty przychodzi taki moment, w którym stwierdza, że w jego kodzie przyda się więcej magii. A potem za zabawę z tymi ciemnymi mocami płaci wysoką cenę. Nie inaczej było też i w mojej przypadku. Ale po kolei…

## Problem

Jako JS-owy tradycjonalista używam sprawdzonych przez lata rozwiązań. Tym sposobem do testów wciąż używam [Mochy](https://mochajs.org/) + [Chai](https://www.chaijs.com/) + [Sinona](https://sinonjs.org/) + kilku innych rzeczy. Niemniej zauważyłem, że zaczyna mnie pomału irytować potrzeba zasysania wszystkich tych pakietów, konfigurowanie ich itp. itd. A że jestem sobą, to równocześnie stwierdziłem, że przesiadka na [jesta](https://jestjs.io/) byłaby pójściem na łatwiznę. I tak też się narodził [`@comandeer/mocha-lib-tester`](https://www.npmjs.com/package/@comandeer/mocha-lib-tester) – pakiet spinający wszystkie pakiety od testów w jeden (nawet o tym nie myśl, po prostu użyj jesta). No a skoro już mam własny pakiet od testów, to przecież nie zaszkodzi dodać do niego trochę magii, prawda? Nie miała to być wyszukana magia, po prostu dodanie na początku każdego testu ładnego setupu (wczytanie Chai i innych bibliotek, przypisanie `chai.expect`  do `expect` itd.). Ot, kilka linijek kodu robiącego rzeczy, które robię w każdym teście:

```javascript
import { expect } from 'chai';
import { use as chaiUse } from 'chai';
import sinon from 'sinon';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import { noCallThru as pqNoCallThru } from 'proxyquire';

chaiUse( chaiAsPromised );
chaiUse( sinonChai );

const proxyquire = pqNoCallThru();
```

Całość dość łatwo opędzlowałem przy pomocy [hooków na `require`](https://blog.comandeer.pl/html-w-node.html). Po prostu doklejam ten kod na sam początek pliku. Co tu może pójść źle?

Otóż okazuje się, że [naprawdę sporo rzeczy](https://github.com/Comandeer/mocha-lib-tester/issues/48):

* podpowiadanie kodu w [Visual Studio Code](https://code.visualstudio.com/) (VSC) przestało działać, ponieważ edytor nie ma zielonego pojęcia, skąd bierze się `expect`, `sinon` itd.,
* z tego samego powodu ESLint podkreśla te zmienne jako niezdefiniowane, co prowadziło do tego, że na początku każdego tekstu musiałem [deklarować je jako globalne](https://eslint.org/docs/user-guide/configuring/language-options#using-configuration-comments-1),
* jakiekolwiek błędy wskazywały na niewłaściwe linijki w kodzie, ponieważ to, co widziałem w edytorze, było tylko fragmentem kodu (na jego początku był doklejony fragment mający kilkanaście linii),
* w każdym teście ładowałem wszystkie biblioteki, mimo że nie wszystkie były wykorzystywane,
* sam doklejany fragment był przechowywany jako ciąg tekstowy w kodzie, więc dbanie o jego poprawność czy prosta edycja były prawdziwym wrzodem na tylnej części ciała.

Na szczęście konsekwencje mojej czarnej magii nie okazały się aż tak poważne, jak mogłoby się wydawać na pierwszy rzut oka. [Większość bolączek z powyższej listy udało mi się rozwiązać](https://github.com/Comandeer/mocha-lib-tester/issues/48#issuecomment-774347537) – mniej lub bardziej. Jedynym nierozwiązanym problemem pozostało ładowanie wszystkich bibliotek za każdym razem. Niemniej rozwiązanie go wymagałoby już jakieś formy heurystyki (np. analizy kodu testu w celu sprawdzenia, jakie narzędzia wywołuje), a zysk byłby znikomy. Stwierdziłem więc, że nie boli mnie to na tyle, by poświęcać temu więcej czasu.

## Rozwiązanie #1: TypeScript

Pierwszy raz w życiu TS mi się do czegoś przydał!

A tak już na poważniej, dość oczywistym rozwiązaniem problemów z brakiem podpowiedzi w edytorze kodu jest dostarczenie mu [TS-owego pliku z definicjami typów](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html) (`*.d.ts`). Dzięki temu plikowi można na sztywno określić, że `expect` to nic innego jak stare, dobre Chai, `sinon` to Sinon itd. Przyznam, że nie poświęciłem jakoś super dużo czasu na to, po prostu [wyklepałem na kolanie plik](https://github.com/Comandeer/mocha-lib-tester/blob/30ad51c180bc00a1771d04a5797a2876dca23ee4/mlt.d.ts), który przypisuje typy do poszczególnych zmiennych globalnych. Co prawda w rzeczywistości nie są to zmienne globalne, ale z punktu widzenia edytora – jak najbardziej są. Ich definicji nie ma bezpośrednio w kodzie, więc wniosek jest prosty: muszą to być zmienne globalne. Minus jest taki, że podpowiedzi pojawiają się też w plikach innych niż testy, ale nie sądzę, by to był jakiś spory problem.

Większym problemem okazało się to, że, owszem, podpowiedzi się pokazały, ale wyłącznie w samym pakiecie `@comandeer/mocha-lib-tester`. W pakietach, które go załączały jako zależność, żadnych podpowiedzi dalej nie było. Po dłuższym poszperaniu okazało się, że VSC wczytuje tylko typy z pakietów `@types/*` – ponieważ używa do tego TS-a, który [robi tak domyślnie](https://www.typescriptlang.org/tsconfig/#typeRoots). Niemniej dodanie [pliku `jsconfig.json`](https://code.visualstudio.com/docs/languages/jsconfig) do projektu z odpowiednio ustawioną [opcją `typeRoots`](https://github.com/Comandeer/rollup-lib-bundler/blob/64e6000f6e99ecfcf6c6794343a1937f9cbe6ccc/jsconfig.json#L3-L6) działa. Nie jest to idealne rozwiązanie, ale na tę chwilę wystarczające. W przyszłości pokuszę się może o dodanie typów dla mojego testera do [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped), żeby wszystko działało automatycznie, bez potrzeby dodawania pliku konfiguracyjnego do każdego projektu. Pytanie tylko po co, skoro raczej nikt inny nigdy nie użyje mojego testera w swoim projekcie (serio, użyj jesta)?

## Rozwiązanie #2: konfiguracja ESLinta

Problem z ESLintem rozwiązałem podobnie jak problem z brakiem podpowiedzi: [dodałem odpowiednią konfigurację](https://github.com/Comandeer/eslint-config/commit/9e9673c571b305f00ed6849822cd4dae2d2c951c). Na szczęście mam swój własny pakiet zawierający całą konfigurację ESLinta, [`@comandeer/eslint-config`](https://npmjs.com/package/@comandeer/eslint-config), więc zmianę wystarczyło wprowadzić w jednym miejscu i wszystkie projekty używające moich reguł ESLinta same się dostosowały.

Nowa konfiguracja nie jest złożona. Po prostu [dodaje odpowiednie zmienne globalne](https://eslint.org/docs/user-guide/configuring/language-options#using-configuration-files-1) – czyli mocno podobnie do tego, co robi TS-owy plik z definicjami typów. Z tym, że [ESLint pozwala dodać konfigurację dla poszczególnych plików](https://eslint.org/docs/user-guide/configuring/configuration-files#configuration-based-on-glob-patterns), dzięki temu te zmienne globalne są rozpoznawane tylko w plikach z testami, a w innych – traktowane są jako błąd.

## Rozwiązanie #3: minifikacja

W jaki sposób zadbać o to, by po doklejeniu kodu na początku pliku numery linii pozostały bez zmian? To proste: zminifikować doklejany kod tak, aby był w jednej linii, po czym dokleić go na początek pierwszej linii pliku JS. Tym sposobem numery linii się nie zmienią. Co prawda rozjadą się numery znaków w pierwszej linii, ale ta najczęściej i tak zawiera jakiś import lub inną mało błędogenną rzecz

W tym wypadku wykorzystałem [`terser`a](https://www.npmjs.com/package/terser). I to w sumie tyle, nie ma tutaj za bardzo co opisywać.

## Rozwiązanie #4: osobny plik

Żeby łatwiej było edytować doklejany kod, po prostu [przeniosłem go do osobnego pliku](https://github.com/Comandeer/mocha-lib-tester/blob/30ad51c180bc00a1771d04a5797a2876dca23ee4/src/hooks/chaiPreamble.js), `chaiPreamble.js`. Problem polega na tym, że nie mogę go użyć bezpośrednio, bo [potrzebuję jego zminifikowanej wersji](https://github.com/Comandeer/mocha-lib-tester/blob/30ad51c180bc00a1771d04a5797a2876dca23ee4/src/hooks/chai.js#L3) w pliku `chai.js`. Dlatego [stworzyłem sobie skrypt](https://github.com/Comandeer/mocha-lib-tester/blob/30ad51c180bc00a1771d04a5797a2876dca23ee4/dev/prepareChaiPreamble.js), który podmienia obecnie wykorzystywaną wersję w `chai.js` na świeżo zminifikowaną na podstawie zawartości pliku `chaiPreamble.js`. [Podmianka jest wykonywana przy pomocy Babela](https://blog.comandeer.pl/bujajac-sie-na-galezi-ast.html).

Na razie skrypt jest mocno naiwny i robi podmianę przy każdym wywołaniu `npm run build`. Jeśli plik `chai.js` po podmianie jest inny, mój skrypt commituje zmiany. Problem w tym, że czasami zmiany są wprowadzone w innym miejscu, czego skrypt nie wykrywa i traktuje je jako zmianę zminifikowanego fragmentu. Pewnie w przyszłości dodam do niego wykrywanie, czy to faktycznie ten fragment się zmienił. Co nie powinno być trudne: wystarczy pobrać w Babelu wartość odpowiedniej zmiennej z pliku `chai.js` i porównać z tym, co otrzymuję w wyniku minifikacji pliku `chaiPreamble.js`.

## Podsumowanie

Magia w kodzie potrafi napsuć sporo krwi, ale jak się człowiek odpowiednio uprze, to może ją zrobić _niemal_ użyteczną. W tym przypadku ta sztuka mi się udała.

Niemniej następnym razem mocno zastanowię się, zanim dodam magię do jakiegoś innego mojego projektu. Czas i wysiłek, jaki włożyłem w próbę naprawienia tego, co magia zepsuła, nie jest w żaden sposób rekompensowany przez to, co ta magia mi dała. A dała mi… brak kilku importów na początku każdego pliku z testami.

Magia – fajnie działa, ale nie polecam.

I serio, użyj jesta.

