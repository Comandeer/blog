---
layout: post
title:  "Piękny kod"
description: "Jak można stworzyć własny formatter kodu JS?"
author: Comandeer
date: 2023-09-27T00:08:00+0200
tags:
    - javascript
    - eksperymenty
comments: true
permalink: /piekny-kod.html
---

Ostatnio doszedłem do wniosku, że do formatowania mógłbym używać jakiegoś faktycznego formatera zamiast [ESLinta](https://eslint.org/). Oczywistym wyborem byłby [Prettier](https://prettier.io/), ale nie byłbym sobą, gdybym nie pisał swojego kodu w stylu, pod który nijak się nie da Prettiera skonfigurować. A nie uśmiechało mi się zmieniać styl pisania kodu tylko po to, żeby odhaczyć sobie na liście "rozpoczęcie używania formatera". Zacząłem szukać alternatywy i… trafiłem tak naprawdę na jedną obiecującą – [dprint](https://dprint.dev/). Szybki, mocno konfigurowalny i ogólnie bardzo miły w pracy – tylko że brakowało mu _dosłownie_ 3 opcji konfiguracyjnych, żeby formatował dokładnie tak, jak chcę.

Zatem zrobiłem tylko jedną logiczną rzecz… Co? Nie, oczywiście, że nie chodzi mi o przygotowanie PR-a do dprinta. Zacząłem rzeźbić [własny formater](https://github.com/Comandeer/formatter/)!<!--more-->

## Problem

Ale w zasadzie jaki problem chciałem rozwiązać formaterem? No w sumie to żaden… Po prostu zauważyłem, że zdecydowana większość rzeczy, na które zwraca mi uwagę ESLint, to właśnie formatowanie. Czyli akurat ta część pisania kodu, którą można najłatwiej zautomatyzować. Więc zacząłem się zastanawiać, czy nie byłoby wydajniej, gdybym nie musiał w ogóle martwić się podkreślaniem brakujących spacji wewnątrz tablic czy innymi przecinkami w nieodpowiednich miejscach. Zwłaszcza, że [nieużywanie lintera do formatera powoli staje się dobrą praktyką](https://typescript-eslint.io/linting/troubleshooting/formatting/).

No i formater pozwoliłby mi także na formatowanie bardziej złożonych przypadków, które przy pomocy ESLinta trudno obsłużyć. W końcu linter niekoniecznie musi nawet wiedzieć o tym, jak sformatowany jest kod – dla niego najważniejsza jest semantyka kodu. To formater jest choćby od tego, by wiedzieć, ile jest znaków w danej linijce i jak przełamać ciąg znaków, jeśli ktoś się uprze, że linia nie może mieć więcej niż 100 znaków.

Pierwszym krokiem do formaterowej rewolucji było [wydzielenie reguł formatujących do osobnej konfiguracji ESLinta](https://github.com/Comandeer/eslint-config/blob/5a4b12f765f494e5358535063cefe0d12c836c68/src/formatting.js). Dzięki temu będę w stanie je szybciej wyłączyć, gdy już podłączę formater. Drugim krokiem było przeglądnięcie istniejących opcji. A tych, wbrew pozorem, nie jest dużo. Jest oczywiście Prettier – król formaterów – ale sam nazywa siebie mocno <i lang="en">opinionated</i> (upartym), co jest eufemizmem na "powodzenia z konfigurowaniem". Dlatego też odpadł w przedbiegach. Następny w kolejce był dprint. Trzeba przyznać – ma imponującą liczbę opcji konfiguracyjnych. Ale mimo to nie udało mi się znaleźć niektórych opcji pozwalających na np. wstawianie spacji wewnątrz definicji pętli. A że całość jest napisana w [Ruście](https://www.rust-lang.org/), w którym nie czuję się jakoś szczególnie mocny, to na ten moment dopisanie do dprinta potrzebnych mi ficzerów odłożyłem na półkę. Spojrzałem nawet na [Rome](https://github.com/rome/tools), niemniej pod względem konfiguracji było równie nieciekawie, co w przypadku Prettiera.

No więc została tylko jedna opcja: napisać to samemu!

## Koncept

W gruncie rzeczy formater nie różni się zbytnio od pozostałych zabaw z JS-em, jakie ostatnio uskuteczniałem. Jego fundamentem jest – a jakże – [AST](https://blog.comandeer.pl/bujajac-sie-na-galezi-ast.html). Z tym, że dotąd interesowały mnie głównie transformacje samego drzewka, całkowicie nie zważałem na to, co ostatecznie się z tym drzewkiem dzieje. A zatem: nie interesowało mnie, jak będzie wyglądał wyprodukowany kod JS. W tym przypadku jest jednak odwrotnie: to właśnie ten generowany kod mnie najbardziej interesuje.

Na dobrą sprawę formater można nazwać generatorem kodu, który tym się różni od tradycyjnego generatora (takiego jak [`@babel/generator`](https://www.npmjs.com/package/@babel/generator)), że dba o to, aby zwracany kod był _czytelny_ dla człowieka. Zasada działania generatora jest w miarę prosta:

* weź drzewko AST,
* dla każdego węzła zwróć jego tekstową reprezentację,
* posklejaj wszystkie te ciągi w jeden i go zwróć.

## Wyzwania

Brzmi dość prosto, ale okazuje się, że niekoniecznie takie jest.

### Liczba węzłów

Pierwszym problemem, na jaki można się natknąć, jest przekształcanie węzłów do ich reprezentacji tekstowej. Weźmy prosty, przykładowy kod:

```javascript
console.log( 'test' );
```

Jeśli spojrzymy na [wygenerowane drzewko](https://astexplorer.net/#/gist/85739028a46e9b5b442efe79e8b5483a/latest), zauważymy, że wcale nie jest takie proste. Całość opakowana jest w węzeł `File`, który reprezentuje plik JS. W tym pliku znajduje się z kolei `Program` – a więc całość kodu JS. Wewnątrz programu mamy `ExpressionStatement` (czyli instrukcję, która jest także wyrażeniem; to nasz `console.log()` wraz ze średnikiem na końcu), a dalej samo wyrażenie. Ale żeby nie było za łatwo, to wyrażenia mają swoje typy! W tym przypadku – `CallExpression`, czyli wywołanie funkcji. Ale samo wywołanie funkcji składa się z kolejnych dwóch węzłów – argumentu będącego `StringLiteral`em (ciągiem znaków) oraz nazwy wywoływanej funkcji. Ta nazwa z kolei to `MemberExpression`, czyli odwołanie do własności obiektu (bo tak naprawdę wywołujemy metodę `log()` obiektu `console`), a ten składa się z dwóch `Identifier`ów – nazwy obiektu oraz nazwy samej własności.

W postaci uproszczonego drzewka wyglądałoby to mniej więcej tak:

```
File
| - Program
|   | - ExpressionStatement
|   |   | - CallExpression
|   |   |   | - StringLiteral
|   |   |   | - MemberExpression
|   |   |   |   | - Identifier
|   |   |   |   | - Identifier
```

W sumie: 7 rodzajów węzłów. A wywołaliśmy tylko `console.log()`a! Jasne, część z tego drzewka to niepotrzebne nam "śmieci" (jak `File` czy `Program`), ale reszty nie da się tak prosto pozbyć. Co oznacza, że nawet dla prostych programów trzeba dodać obsługę sporej liczby węzłów. Części z nich nie da się pominąć, ale niektóre rzeczy można próbować upraszczać (jak np. literały czy typowe przypisy z TS-a). Niemniej: na start widać, że to nie będzie przyjemna praca, tylko żmudne rzeźbienie w oceanie pojedynczych węzłów.

### Wcięcia

Kolejnym, dość nieoczywistym problemem, są wcięcia. Prosty przykład:

```javascript
function test() {
    return true;
}
```

Formater musi wiedzieć, że wewnątrz funkcji na początku nowej linii musi być wcięcie. I w takim prostym przypadku da się to zrobić "na chama", wstawiając odpowiednie wcięcie na sztywno. Ale w bardziej skomplikowanych przypadkach już niekoniecznie to zadziała:

```javascript
function test() {
    if ( true ) {
        return false;
    }
}
```

W każdym przypadku, gdy będzie więcej niż jeden poziom zagłębienia, formater musi wiedzieć, ile wcięć powinien wstawić. Zatem musi w jakiś sposób śledzić to, jak wygląda generowany kod.

### Długość linii

Wreszcie – długość linii. Załóżmy, że chcemy, aby linie nie przekraczały 120 znaków. Tylko w jaki sposób formater miałby to wykryć? Zwłaszcza, że ta długość linii może zacząć przekraczać 120 znaków dopiero po _sformatowaniu_. Kolejny problem pojawia się przy pytaniu, co z tym zrobić. Formater musiałby wiedzieć, jak np. łamać ciągi znaków albo zapisywać całe funkcje w taki sposób, żeby np. rozdzielać parametry na linie:

```javascript
function test(
	a,
    b,
    c
) {
    return true;
}
```

Ze wszystkich problemów ten wydaje się najbardziej złożony.

## Implementacja

Zacząłem rzeźbić pomału [własny formater](https://github.com/Comandeer/formatter/). Z racji tego, że uwielbiam ironię, nie jest w żaden sposób konfigurowalny. Co ma w sumie sens, zważając na to, że ~~nigdy go nie ukończę~~ tylko ja go będę używał. Na ten moment rozwój idzie dość niemrawo. Okazało się bowiem, że stworzenie podstawowej architektury i rozwiązanie większości problemów zajmują bardzo mało czasu w porównaniu do… tworzenia obsługi poszczególnych typów węzłów. A to jest po prostu żmudna robota, która skutecznie mnie zniechęca do dłuższego grzebania przy tym.

Ale do rzeczy!

### Formatery

Trzon rozwiązania stanowią tzw. [formatery](https://github.com/Comandeer/formatter/tree/4d580bd6df1d2345319a56bac5ed17f61fdd3d1c/src/formatters) ("Słyszałem, że lubisz formatować swój kod, więc umieściłem formatery wewnątrz formatera, żebyś mógł formatować kod w trakcie jego formatowania!") – czyli funkcje zajmujące się mieleniem poszczególnych węzłów do ich tekstowej reprezentacji. Każdy formater ma identyczną strukturę. Weźmy dla przykładu [ten dla `BooleanLiterala`](https://github.com/Comandeer/formatter/blob/main/src/formatters/BooleanLiteral.ts) (czyli wartości boolean):

```typescript
import { isBooleanLiteral } from '@babel/types'; // 3
import { FormatterContext } from '../context.js';

export default function BooleanLiteral( context: FormatterContext ): string { // 1
	const { node } = context;

	if ( !isBooleanLiteral( node ) ) { // 2
		throw new Error( 'Incorrect node type' ); // 4
	}

	return String( node.value ); // 5
}
```

Formater przyjmuje jako argument kontekst (o nim za chwilę) i zwraca ciąg znaków (1). Na samym początku następuje sprawdzenie, czy na pewno mamy do czynienia z booleanem (2) przy pomocy funkcji udostępnianej przez samego Babela (3). Jeśli nie, rzucamy błąd (4). Taka sytuacja nigdy nie powinna się zdarzyć, a samo sprawdzenie jest w sumie kompromisem, na jaki poszedłem z TS-em, żeby niepotrzebnie nie komplikować typów w innych miejscach. Dlatego praktycznie zawsze zwracana jest tekstowa reprezentacja węzła (5). W przypadku booleana całość to po prostu skonwertowanie wartości węzła do stringu. W innych przypadkach konwersja może być zdecydowanie bardziej skomplikowana.

<p class="note">Tak, przesiadłem się na TS. Głównym powodem był… brak dobrych podpowiedzi w <a href="https://code.visualstudio.com/" hreflang="en" rel="noreferrer noopener">VSC</a> dla czystego JS-a.</p>

### Konteksty

I właśnie w tych innych przypadkach przydają się konteksty. To [prosta struktura](https://github.com/Comandeer/formatter/blob/4d580bd6df1d2345319a56bac5ed17f61fdd3d1c/src/context.ts), która przechowuje aktualnie formatowany węzeł wraz z aktualnym stanem całego formatowania. Do tego dochodzą proste metody do wywołania formatowania na potomnym węźle (np. na argumencie, gdy jesteśmy wewnątrz deklaracji funkcji) czy do pobrania poprzedniego/następnego węzła w drzewie. Z kolei w stanie, na ten moment, znajdują się tylko dwie rzeczy: kod źródłowy JS-a oraz aktualny poziom zagnieżdżenia. Dzięki temu drugiemu udało się rozwiązać problem z wcięciami. Teraz zwiększenie poziomu wcięcia rozwiązuję, wywołując [metodę `context#formatDescendant()`](https://github.com/Comandeer/formatter/blob/4d580bd6df1d2345319a56bac5ed17f61fdd3d1c/src/context.ts#L18) z odpowiednim argumentem:

```javascript
context.formatDescendant( node, {
	increaseIndent: true
} );
```

Opcja ta jest wykorzystywana np. do [automatycznego wcinania kodu wewnątrz bloków](https://github.com/Comandeer/formatter/blob/4d580bd6df1d2345319a56bac5ed17f61fdd3d1c/src/formatters/BlockStatement.ts#L12-L16).

Z kolei trzymanie kodu źródłowego w stanie pozwoliło na rozwiązanie dość nieoczekiwanego problemu. Nie tak dawno temu [opisywałem makra](https://blog.comandeer.pl/makrony.html). Korzystały one z nowej składni tzw. [atrybutów importów](https://github.com/tc39/proposal-import-attributes). Problem w tym, że wcześniej nazywało się to asercjami importów i używało innego słowa kluczowego:

```javascript
// Nowa składnia
import test from './test.js' with { type: 'whatever' };

// Stara składnia
import test from './test.js' assert { type: 'whatever' };
```

Obecnie obydwie te wersje są wspierane przez silniki JS (zwłaszcza [V8](https://v8.dev/), którego używa m.in. Node.js), ale Babel reprezentuje je _w ten sam sposób_. Innymi słowy: z poziomu drzewka AST nie da się dowiedzieć, które słowo kluczowe zostało użyte. Na szczęście Babel przy parsowaniu pliku dołącza do każdego węzła informacje o tym, gdzie się znajduje jego kod źródłowy w tymże pliku. Dlatego też napisałem [prostą funkcję do wyciągania kodu danego węzła](https://github.com/Comandeer/formatter/blob/4d580bd6df1d2345319a56bac5ed17f61fdd3d1c/src/utils/extractNodeFromCode.ts). Następnie [przy pomocy wyrażenia regularnego przeszukuję ten kod](https://github.com/Comandeer/formatter/blob/4d580bd6df1d2345319a56bac5ed17f61fdd3d1c/src/formatters/ImportDeclaration.ts#L89-L90) i ustalam, jakie słowo kluczowe zostało użyte. Brutalne, ale działa.

Z kolei funkcje pobierające poprzedni i następny węzeł pozwoliły mi na rozwiązanie innego problemu: ustalenia, gdzie wstawić puste linie w kodzie. Na ten moment jest to wykorzystywane w f[ormaterze `if`ów do generowania pustej linii przed nimi](https://github.com/Comandeer/formatter/blob/4d580bd6df1d2345319a56bac5ed17f61fdd3d1c/src/formatters/IfStatement.ts#L12-L13). Ale zapewne użyję tego w wielu innych miejscach, bo dość chętnie stosuję puste linie.

### Tło fabularne

Ale czemu w zasadzie konteksty powstały? Zapewne osoby trochę siedzące w JS-owym AST zauważą, że ich API jest dość podobne do [ścieżek z Babela](https://github.com/jamiebuilds/babel-handbook/blob/c6828415127f27fedcc51299e98eaf47b3e26b5f/translations/en/plugin-handbook.md#toc-paths). Niemniej ścieżki zawierają sporo informacji, które nie są dla mnie interesujące, a równocześnie – nie zawierają informacji, które są dla mnie istotne (np. poziom zagłębienia). Co więcej, oficjalne API Babela "odwiedza" węzły w kolejności ich występowania w kodzie, a bardzo szybko przekonałem się, że o wiele wygodniejsze byłoby dla mnie robienie tego rekurencyjnie (zatem nie "w bok", a w głąb). Wróćmy do naszego `console.log()`a. Przy wykorzystaniu [oficjalnej paczki `@babel/traverse`](https://www.npmjs.com/package/@babel/traverse), Babel będzie odwiedzał węzły w następującej kolejności:

```
enter Program
enter ExpressionStatement
enter CallExpression
enter MemberExpression
enter Identifier
exit Identifier
enter Identifier
exit Identifier
exit MemberExpression
enter StringLiteral
exit StringLiteral
exit CallExpression
exit ExpressionStatement
exit Program
```

Babel pozwala na określenie, czy chcemy obsłużyć węzeł przy wchodzeniu do niego (`enter`), czy przy wychodzeniu (`exit`). W przypadku `console.log();`a wejście oznacza dotarcie do `console`, a wyjście – dotarcie do średnika na końcu. Niemniej to oznacza, że generowanie np. `ExpressionStatement` musiałoby być podzielone na dwie części. Na wejściu, na dobrą sprawę, nie mielibyśmy pojęcia, jak wygląda instrukcja, moglibyśmy jedynie zaznaczyć w jakimś wewnętrznym stanie, że w takowej jesteśmy. Następnie każdy węzeł byłby uważany za część naszej instrukcji. I dopiero, gdy napotkalibyśmy wyjście z instrukcji, moglibyśmy ją w całości zwrócić. To może dość utrudniać poprawną obsługę wcięć i białych znaków, nie wspominając już o problemie z długością linii.

Taka metoda dodatkowo średnio pozwala na pominięcie węzłów, które z różnych powodów nas nie interesują. Dlatego doszedłem do wniosku, że o wiele lepiej byłoby móc przechodzić drzewo rekurencyjnie (w głąb). Stąd stworzyłem konteksty, które zastępują Babelowe ścieżki i pozwalają na ręczne ustalenie, czy chcemy wchodzić w głąb jakiegoś węzła. Każdy formater dostaje swój własny kontekst, zawierający węzeł do sformatowania wraz z aktualnym stanem formatowania i informacjami o najbliższym otoczeniu węzła. Kontekst pozwala także na wywołanie formatowania potomnego węzła – albo i nie, dzięki czemu nie trzeba obsługiwać wszystkich dziwnych przypadków lub [obsłużyć je w rodzicu](https://github.com/Comandeer/formatter/blob/4d580bd6df1d2345319a56bac5ed17f61fdd3d1c/src/formatters/TSTypeAnnotation.ts#L11-L20).

### Nierozwiązany problem długości linii

Główny nierozwiązany problem, jaki pozostał, to problem zbyt długich linii. Zastanawiałem się, czy uda mi się znaleźć jakieś sensowne rozwiązanie dla niego, ale na tę chwilę nic mi nie przychodzi do głowy. Jedyne na co wpadłem, to sformatowanie danego węzła, po czym sprawdzenie, czy wynikowy ciąg ma więcej niż 120 znaków. W takim przypadku byłby uruchamiany "tryb wielolinowy", który formatowałby dany węzeł tak, by ten mieścił się w określonej liczbie znaków. Jeśli nie wymyślę nic sensowniejszego, to prawdopodobnie ostatecznie spróbuję z tym sposobem.

## Dalsze plany

Dalszych planów za bardzo nie ma. Prace uznam za zakończone, gdy uda mi się przepuścić przez formater kod [mojego bundlera](https://github.com/Comandeer/rollup-lib-bundler) i dostać na wyjściu dokładnie taki sam kod, jaki był na wejściu. Ale do tego jeszcze długa droga, bo na ten moment formater obsługuje kilkanaście typów węzłów z jakichś _kilkuset_ potrzebnych. Więc jest spora szansa, że zarzucę całość, zanim na dobre ją ukończę…

…albo dprint doda brakujące opcje konfiguracyjne. Jedno z tych dwóch.
