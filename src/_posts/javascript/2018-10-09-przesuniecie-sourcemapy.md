---
layout: post
title:  "Przesunięcie sourcemapy"
description: "Krótki opis buga w generowaniu sourcemapy oraz sposobu jego rozwiązania przy pomocy ręcznejj modyfikacji sourcemapy."
author: Comandeer
date: 2018-10-09T23:59:00+0200
tags:
    - javascript
comments: true
permalink: /przesuniecie-sourcemapy.html
redirect_from:
    - /javascript/2018/10/09/przesuniecie-sourcemapy.html
---

W ten weekend mierzyłem się z kolejnym błędem w [moim najsłynniejszym projekcie na GitHubie](https://github.com/Comandeer/rollup-plugin-babel-minify) – [niepoprawnym generowaniem sourcemapy](https://github.com/Comandeer/rollup-plugin-babel-minify/issues/133). Problem okazał się na tyle ciekawy, że postanowiłem go opisać.<!--more-->

## Sourcemapa – co to takiego?

### Definicja sourcemapy

Sourcemapa – która jest nieładnym spolszczeniem terminu <i lang="en">sourcemap</i> – to inaczej mapa źródła. Jej zadaniem jest połączenie przetranspilowanej i zminifikowanej wersji kodu z jej wersją pierwotną. Jest to osiągane poprzez przypisanie pozycji (linii i kolumny) w przerobionym kodzie  odpowiadającej jej pozycji w kodzie źródłowym. Brzmi to mocno enigmatycznie, więc rozważmy prosty przykład. Załóżmy, że mamy taki kod źródłowy:

```javascript
/* Superważny komentarz */
class Test {
	constructor() {
		console.log( 'Constructed' );
	}
}
```

Wrzucamy ten kod do [Babela](https://babeljs.io/) z [`babel-preset-minify`](https://github.com/babel/minify/tree/master/packages/babel-preset-minify) (można też wrzucić do [Uglify.js](https://github.com/mishoo/UglifyJS) czy [Tersera](https://github.com/terser-js/terser); nie ma to większego znaczenia – nam zależy jedynie na fakcie uzyskania sourcemapy) i otrzymujemy taki kod:

```javascript
/* Superważny komentarz */class Test{constructor(){console.log("Constructed")}}

//# sourceMappingURL=output.js.map
```

Jak widać zmiany nie są duże. Ot, usunęło nam nowe linie i spacje. Dodatkowy komentarz na dole to instrukcja dla przeglądarki, gdzie ma szukać sourcemapy dla danego pliku.

Dodatkowo powstaje nowy plik (`nazwa-wynikowego-pliku.js.map`), w którym znajduje się tajemniczo wyglądający ciąg znaków:

```json
{"version":3,"sources":["input.js"],"names":[],"mappings":"0BACA,KAAM,CAAA,IAAK,CACV,WAAW,EAAG,CACb,OAAO,CAAC,GAAR,CAAa,aAAb,CACA,CAHS","file":"output.js","sourcesContent":["/* Superważny komentarz */\nclass Test {\n\tconstructor() {\n\t\tconsole.log( 'Constructed' );\n\t}\n}\n"]}
```

### Format sourcemapy

Gdy go potraktujemy [`JSON.parse`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse), otrzymamy taki oto ładny obiekt:

```javascript
{
	version: 3,
	sources: [
		'input.js'
	],
	names: [],
	mappings: '0BACA,KAAM,CAAA,IAAK,CACV,WAAW,EAAG,CACb,OAAO,CAAC,GAAR,CAAa,aAAb,CACA,CAHS',
	file: 'output.js',
	sourcesContent: [
		`/* Superważny komentarz */\nclass Test {\n\tconstructor() {\n\t\tconsole.log( 'Constructed' );\n\t}\n}\n`
	]
}
```

Pole `version` – jak łatwo się domyślić – określa wersję sourcemapy. Jego wartość od zamierzchłych czasów (2011 roku) wynosi `3` i nic nie wskazuje na to, by miało się to zmienić.

Pole `sources` z kolei to tablica nazw plików źródłowych, z których pochodzi oryginalny kod (może być ich więcej, jeśli używamy bundlera i łączymy kilka plików). Każdemu plikowi z tablicy `sources` odpowiada odpowiedni kod z tablicy `sourcesContent`.

Pole `names` to tablica nazw występujących w kodzie. Najczęściej wykorzystuje się ją wtedy, gdy nazwy zmiennych zostały zminifikowane. W naszym wypadku to się nie stało, bo klasa `Test` jest globalna i Babel słusznie założył, że stanowi część publicznego API. A tym głupio się posługiwać, jeśli nagle `WszystkoTlumaczacaNazwaKlasy` zmieni się w `c`.

Pole `file` zawiera nazwę pliku, w którym znajduje się przerobiony kod.

I zostało nam pole `mappings`, które wygląda przerażająco i takie jest też w istocie… Gdy spojrzymy do [specyfikacji sourcemap](https://sourcemaps.info/spec.html), zauważymy, że [pole `mappings` jest w istocie danymi binarnymi zakodowanymi w formacie Base64VLQ](https://sourcemaps.info/spec.html#h.qz3o9nc69um5) ([cokolwiek to oznacza](https://github.com/Rich-Harris/vlq#what-is-a-vlq-string)).  I właśnie w tym polu rozgrywa się cała magia, bo te dane binarne określają wzajemnie pozycje poszczególnych fragmentów kodu pomiędzy przerobioną a oryginalną wersją. Te dane podzielone są na linie, a te z kolei – na segmenty. Linie oddzielane są średnikami (`;`), a segmenty – przecinkami (`,`). I jeśli samo pojęcie linii kodu wydaje się oczywiste, to warto pochylić się nieco nad segmentem. Jest to najmniejsza możliwa i sensowna do wydzielenia cząstka kodu, którą można przypasować do odpowiadającego jej segmentu w oryginalnym kodzie. Takim segmentem może być słowo kluczowe `class`, kolejnym – nazwa klasy `Test`, kolejnym – nawias klamrowy otwierający (`{` – jako znak ograniczający blok) itd. Tak drobiazgowy wręcz podział kodu pozwala na swobodniejsze posługiwanie się debuggerem, którego breakpointy możemy dodawać w kodzie źródłowym, a przeglądarka sama przetłumaczy je na breakpointy w odpowiednim miejscu przerobionego kodu.

Jak dokładnie przebiega podział kodu, można zobaczyć w [narzędziu `source-map-visualization`](https://sokra.github.io/source-map-visualization/#base64,LyogU3VwZXJ3YcW8bnkga29tZW50YXJ6ICovY2xhc3MgVGVzdHtjb25zdHJ1Y3Rvcigpe2NvbnNvbGUubG9nKCJDb25zdHJ1Y3RlZCIpfX0KCi8vIyBzb3VyY2VNYXBwaW5nVVJMPW91dHB1dC5qcy5tYXA=,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImlucHV0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiIwQkFDQSxLQUFNLENBQUEsSUFBSyxDQUNWLFdBQVcsRUFBRyxDQUNiLE9BQU8sQ0FBQyxHQUFSLENBQWEsYUFBYixDQUNBLENBSFMiLCJmaWxlIjoib3V0cHV0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogU3VwZXJ3YcW8bnkga29tZW50YXJ6ICovXG5jbGFzcyBUZXN0IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0Y29uc29sZS5sb2coICdDb25zdHJ1Y3RlZCcgKTtcblx0fVxufVxuIl19,LyogU3VwZXJ3YcW8bnkga29tZW50YXJ6ICovCmNsYXNzIFRlc3QgewoJY29uc3RydWN0b3IoKSB7CgkJY29uc29sZS5sb2coICdDb25zdHJ1Y3RlZCcgKTsKCX0KfQo=). Poszczególne segmenty są oznaczone odpowiednimi kolorami.

Natomiast, gdybyśmy chcieli rozkodować dane binarne do formatu strawnego dla ludzi, należy ~~posłużyć się wzorem~~ skorzystać z odpowiedniego narzędzia, [`sourcemap-codec`](https://github.com/Rich-Harris/sourcemap-codec). Gdy przepuścimy mapowania przez tę bibliotekę, otrzymamy wielowymiarową tablicę:

```javascript
[ [ Int16Array [ 0, 0, 0, 0 ],
    Int16Array [ 26, 0, 1, 0 ],
    Int16Array [ 31, 0, 1, 6 ],
    Int16Array [ 32, 0, 1, 6 ],
    Int16Array [ 36, 0, 1, 11 ],
    Int16Array [ 37, 0, 2, 1 ],
    Int16Array [ 48, 0, 2, 12 ],
    Int16Array [ 50, 0, 2, 15 ],
    Int16Array [ 51, 0, 3, 2 ],
    Int16Array [ 58, 0, 3, 9 ],
    Int16Array [ 59, 0, 3, 10 ],
    Int16Array [ 62, 0, 3, 2 ],
    Int16Array [ 63, 0, 3, 15 ],
    Int16Array [ 76, 0, 3, 2 ],
    Int16Array [ 77, 0, 4, 2 ],
    Int16Array [ 78, 0, 1, 11 ] ] ]
```

<p class="note"><code>Int16Array</code> to jedna z tzw. <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray" hreflang="en" rel="noreferrer noopener">Typed Arrays</a> (ang. Typowane Tablice). Ten szczegół dla nas jest całkowicie nieistotny, bo tablica ta zachowuje się praktycznie tak samo jak normalna.</p>

Najbardziej zewnętrzna tablica reprezentuje cały plik. Wewnątrz niej znajdują się tablice reprezentujące linie. W naszym wypadku kod jest tylko w jednej linii, więc mamy tylko jedną tablicę. Natomiast w jej środku – jak łatwo się domyślić – znajdują się tablice reprezentujące poszczególne segmenty. Przyjrzyjmy się jednemu z nich:

```javascript
Int16Array [ 26, 0, 1, 0 ]
```

Poszczególne liczby oznaczają, od lewej:

1. Kolumnę w przerobionym kodzie (linijka jest określana przez indeks tablicy, w której znajduje się segment); w naszym przypadku `26`, czyli dwudziestą siódmą (bo numerujemy – jak na prawdziwych programistów przystało – od zera).
2. Indeks pliku z tablicy `sources`, w którym znajduje się oryginalny kod tego segmentu; w naszym przypadku `0`, zatem plik `input.js`.
3. Linię w pliku źródłowym; w naszym przypadku `1`, czyli drugą.
4. Kolumnę w oryginalnym kodzie; w naszym przypadku `0`, czyli pierwszą.
5. Jeśli sourcemapa ma wypełnioną tablicę `names`, to w segmencie może pojawić się też piąta liczba, przyporządkowująca oryginalną nazwę do tej zmienionej.

## Wykorzystanie sourcemapy

Dobrze, wiemy już jak sourcemapa wygląda, ale wciąż nie wiemy, jak ją wykorzystać. Zobaczmy zatem prosty [przykład strony wykorzystującej sourcemapę](/assets/przesuniecie-sourcemapy/example1.html). Zgodnie z poleceniem na stronie otwieramy devtools przeglądarki (<kbd>F12</kbd>) i przechodzimy do zakładki Sources (Źródła). W panelu po lewej znajduje się lista plików wczytanych przez daną stronę. Możemy zauważyć, że oprócz pliku `output.js` znajduje się też tam plik `input.js` – nawet pomimo tego, że [fizycznie go tam nie ma](/assets/przesuniecie-sourcemapy/input.js)! _Magia_…

{% include 'figure' src="../../images/przesuniecie-sourcemapy/example1.jpg" link="/assets/images/przesuniecie-sourcemapy/example1.jpg" alt="Otwarta zakładka &quot;Sources&quot; w devtools Google Chrome pokazująca przerobiony kod oraz drzewko wyboru plików po lewej, zawierającc zarówno plik output.js, jak i input.js" %}

Ale to jeszcze nie koniec magii… Przejdźmy do zakładki Console (Konsola) i stwórzmy nowy obiekt klasy `Test`:

```javascript
new Test();
```

Jak można się domyśleć, w konsoli pojawi się komunikat <q>Constructed</q>, niemniej obok pojawi się informacja, że wywołanie tej funkcji nastąpiło w pliku `input.js` w linii 4!

{% include 'figure' src="../../images/przesuniecie-sourcemapy/example1-console.jpg" link="/assets/images/przesuniecie-sourcemapy/example1-console.jpg" alt="Konsola wyświetlająca wynik stworzenia nowego obiektu klasy Test, pokazująca, że wywołanie console.log nastąpiło w 4 linii pliku input.js" %}

<div style="width:100%;height:0;padding-bottom:67%;position:relative;"><iframe src="https://giphy.com/embed/xT0xeJpnrWC4XWblEk" width="100%" height="100%" style="position:absolute" frameBorder="0" class="giphy-embed" allowFullScreen></iframe></div><p><a href="https://giphy.com/gifs/whoa-hd-tim-and-eric-xT0xeJpnrWC4XWblEk">via GIPHY</a></p>

Jak już wspominałem wcześniej, [podobna magia działa także z debuggerem](https://trackjs.com/blog/debugging-with-sourcemaps/). Tym sposobem nasi klienci dostaną w pełni zoptymalizowany kod, a my – przyjemne poprawianie istniejących w nim błędów.

## Komentarz chaosu

Mając za sobą ten mocno przydługi wstęp, możemy przejść do głównego dania tego wpisu: problemu, który pojawił się dzięki mojemu niedbalstwu. W końcu jednak [został on zgłoszony](https://github.com/Comandeer/rollup-plugin-babel-minify/issues/133) i byłem zmuszony coś z nim zrobić.

Na czym w ogóle problem polegał? A na niczym szczególnym. W wersji `4.0.0` mojego wspaniałego `rollup-plugin-babel-minify` dodałem możliwość oddzielenia początkowego komentarza w kodzie od reszty kodu przy pomocy nowej linii. Zatem nasz wynikowy kod zmieniał się w:

```javascript
/* Superważny komentarz */
class Test{constructor(){console.log("Constructed")}}

//# sourceMappingURL=output.js.map
```

Niby nic takiego, prawda? A jednak, gdy spojrzymy na format sourcemapy, problem staje się dość oczywisty: sourcemapa zawiera odniesienia do konkretnej linii w przerobionym kodzie. Gdy nagle z jednej linii zrobiły się dwie, [sourcemapa wskazuje na nieistniejący kod](https://sokra.github.io/source-map-visualization/#base64,LyogU3VwZXJ3YcW8bnkga29tZW50YXJ6ICovCmNsYXNzIFRlc3R7Y29uc3RydWN0b3IoKXtjb25zb2xlLmxvZygiQ29uc3RydWN0ZWQiKX19CgovLyMgc291cmNlTWFwcGluZ1VSTD1vdXRwdXQuanMubWFwCg==,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImlucHV0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBCQUNBLEtBQU0sQ0FBQSxJQUFLLENBQ1YsV0FBVyxFQUFHLENBQ2IsT0FBTyxDQUFDLEdBQVIsQ0FBYSxhQUFiLENBQ0EsQ0FIUyIsImZpbGUiOiJvdXRwdXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBTdXBlcndhxbxueSBrb21lbnRhcnogKi9cbmNsYXNzIFRlc3Qge1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRjb25zb2xlLmxvZyggJ0NvbnN0cnVjdGVkJyApO1xuXHR9XG59XG4iXX0=,LyogU3VwZXJ3YcW8bnkga29tZW50YXJ6ICovCmNsYXNzIFRlc3QgewoJY29uc3RydWN0b3IoKSB7CgkJY29uc29sZS5sb2coICdDb25zdHJ1Y3RlZCcgKTsKCX0KfQo=). Tym samym należy ją uaktualnić.

Takimi rzeczami jednak za programistów zajmują się odpowiednie narzędzia. I tu pojawił się mały szkopuł: Babel nie pozwala na wstawienie nowej linii. Jeśli weszlibyśmy w to, jak działa Babel (a czego nie chcę tutaj robić, bo o tym można by książkę napisać), to ma to jak najbardziej sens. Niemniej dla mnie to była kłoda pod nogi. Na szczęście Rich Harris (tak, ten sam, co stworzył wspomniane już `sourcemap-codec` i bibliotekę `vlq.js`, i ten sam, co stworzył Rollupa i Svelte; serio, gość jest przerażający…) stworzył [bibliotekę `magic-string`](https://github.com/Rich-Harris/magic-string), która umożliwia tego typu zabawy z kodem i – co najważniejsze! – generuje sourcemapę.

Dodałem więc nową linię dzięki tej bibliotece, wygenerowałem nową sourcemapę i zadowolony z siebie zrobiłem release wersji `4.0.0`. Aż tu nagle ktoś korzystający z wersji `6.1.0` oznajmia, że sourcemapa nie działa. Nie powiem, lekko mnie to zdziwiło – głównie dlatego, że 2.5 wersji nikt nie zauważył, że coś nie działa… Niemniej faktycznie – generowana sourcemapa była _pusta_.

Źródło problemu było dość oczywiste, gdy [spojrzałem już w kod](https://github.com/Comandeer/rollup-plugin-babel-minify/blob/fd8ad6516246b309e27c95e02ce4a614280a8b2e/src/index.js#L47-L51). Do `magic-string` przekazywałem już przerobiony przez Babela kod i to dla zmian w nim generowałem sourcemapę. Innymi słowy: `magic-string` uznawał przerobiony kod za kod źródłowy. Tym samym wypluwał pustą sourcemapę, ponieważ jedyną zmianą był… znak nowej linii, w żaden sposób nie wpływający na działanie kodu. I tą sourcemapą radośnie nadpisywałem tę zwracaną przez Babela.

I trzeba było to jakoś naprawić…

## Podejście 1.: połączenie sourcemap

Pierwszym pomysłem, na jaki wpadłem, było połączenie obydwu sourcemap. W końcu skoro jedna sourcemapa zawierała informacje na temat pierwszej transformacji, a druga na temat drugiej transformacji, to powinna być możliwość stworzenia trzeciej sourcemapy, zawierającej informacje o obydwu transformacjach – proste i logiczne, prawda?

Oczywiście pewnie nikogo nie zdziwi fakt, że Rich Harris po raz kolejny miał odpowiednie narzędzie w swoim repertuarze – tym razem była to [biblioteka `sorcery`](https://github.com/Rich-Harris/sorcery). Znalazłem też [forka z przyjaźniejszym API](https://github.com/aleclarson/sorcery). Niemniej jakbym nie kombinował, jak temu narzędziu nie podsuwał kodu i sourcemap, tak nic z tego nie wychodziło. Wynikowa sourcemapa była cały czas uparcie pusta. Poszukałem zatem innego narzędzia i znalazłem [bibliotekę `source-map` od Mozilli](https://github.com/mozilla/source-map). Tutaj jednak problemem okazało się bardzo rozbudowane API, które w dodatku jest asynchroniczne. Tym sposobem pierwszy pomysł upadł.

## Podejście 2.: indeks sourcemap

Po raz kolejny spojrzałem do specyfikacji i zobaczyłem tam [podrozdział <b>Index map: supporting post processing</b> [Indeks sourcemap: wsparcie dla postprocesowania]](https://sourcemaps.info/spec.html#h.535es3xeprgt). Brzmiało dokładnie jak to, czego potrzebowałem!

Indeks to nic innego jak sourcemapa zawierająca inne sourcemapy, wraz z określeniem, od której linii i kolumny się zaczynają. Dla naszego pliku taki indeks prezentowałaby się mniej więcej tak:

```javascript
{
	version: 3,
	file: 'output.js',
	sections: [
		{
			offset: {
				line: 1,
				column: 0
			},
			map: [tutaj sourcemapa]
        }
	]
}
```

Proste i skuteczne rozwiązanie! Czemu nie skorzystałem? Bo praktycznie żadne narzędzie nie wspiera tego formatu sourcemap, włączając w to Rollupa…

## Podejście 3.: ręczne przesunięcie sourcemapy

Doszedłem do smutnego wniosku: jeśli chcę mieć poprawną sourcemapę, muszę sobie zrobić ją sam. Nie wydawało się to szczególnie trudnym zadaniem. Tak po prawdzie wystarczy zrobić kilka prostych kroków:

1. Dodać do mapowań nową pustą linię na początku, która będzie reprezentować początkowy komentarz (w przypadku, gdy chcemy też mapować sam komentarz – czego w swojej bibliotece nie robię – zamiast pustej linii musimy po prostu wydzielić pierwszy segment z kodu jako osobną linię na samym początku).
2. Przesunąć mapowania w drugiej linii w lewo o długość komentarza (ponieważ nie ma go już tam).
3. W sumie to tyle, nie ma trzeciego kroku.

Brzmi to bardzo prosto. Problemem pozostaje jedynie egzotyczny format mapowań, ale tutaj z pomocą przychodzi nam wykorzystana już wcześniej biblioteka `sourcemap-codec`. Wystarczy zatem rozkodować za jej pomocą mapowania, dokonać odpowiednich zmian i zakodować na nowo. Proste! Zróbmy to zatem:

```javascript
const map = [nasza sourcemapa];
const { decode, encode } = require( 'sourcemap-codec' ); // 1
const mappings = decode( map.mappings ); // 2

mappings.unshift( [] ); // 3

const offset = mappings[ 1 ][ 0 ][ 0 ]; // 6

mappings[ 1 ].forEach( ( segment ) => { // 4
	segment[ 0 ] -= offset; // 5
} );

map.mappings = encode( mappings ); // 7
```

 Na sam początek importujemy potrzebne nam metody z biblioteki `sourcemap-codec` (1). Przy pomocy tak zaimportowanej metody `decode` zamieniamy `mappings` naszej mapy `map` na wielowymiarową tablicę (2). Do tej tablicy na początek dołączamy pustą tablicę, która reprezentuje linię z komentarzem (3). Następnie pobieramy każdy segment z drugiej tablicy  – czyli przesuniętej o jeden w dół linii reprezentującej kod (4). Każdemu segmentowi zmieniamy kolumnę (pierwszą wartość) na odpowiednią wartość (5). Tą wartością jest obecny numer kolumny minus numer kolumny, od której zaczyna się pierwszy segment (6). Dlaczego tak? Ponieważ pierwszy segment zaczyna się tuż za komentarzem, a więc po usunięciu komentarza (przeniesieniu do linii wyżej) pierwszy segment zacznie się od 1 kolumny, kolejny zacznie się od swojej starej pozycji minus tyle, o ile został przesunięty pierwszy segment, itd. itd. Na sam koniec kodujemy mapowania na nowo i zapisujemy je z powrotem do sourcemapy (7).

Tym samym dla naszego kodu z nową linią ostatecznie otrzymujemy taką oto cudną sourcemapę:

```json
{"version":3,"sources":["input.js"],"names":[],"mappings":";AACA,KAAM,CAAA,IAAK,CACV,WAAW,EAAG,CACb,OAAO,CAAC,GAAR,CAAa,aAAb,CACA,CAHS","file":"output.js","sourcesContent":["/* Superważny komentarz */\nclass Test {\n\tconstructor() {\n\t\tconsole.log( 'Constructed' );\n\t}\n}\n"]}
```

[Działa](https://sokra.github.io/source-map-visualization/#base64,LyogU3VwZXJ3YcW8bnkga29tZW50YXJ6ICovCmNsYXNzIFRlc3R7Y29uc3RydWN0b3IoKXtjb25zb2xlLmxvZygiQ29uc3RydWN0ZWQiKX19CgovLyMgc291cmNlTWFwcGluZ1VSTD1vdXRwdXQuanMubWFwCg==,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImlucHV0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFDQSxLQUFNLENBQUEsSUFBSyxDQUNWLFdBQVcsRUFBRyxDQUNiLE9BQU8sQ0FBQyxHQUFSLENBQWEsYUFBYixDQUNBLENBSFMiLCJmaWxlIjoib3V0cHV0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogU3VwZXJ3YcW8bnkga29tZW50YXJ6ICovXG5jbGFzcyBUZXN0IHtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0Y29uc29sZS5sb2coICdDb25zdHJ1Y3RlZCcgKTtcblx0fVxufVxuIl19,LyogU3VwZXJ3YcW8bnkga29tZW50YXJ6ICovCmNsYXNzIFRlc3QgewoJY29uc3RydWN0b3IoKSB7CgkJY29uc29sZS5sb2coICdDb25zdHJ1Y3RlZCcgKTsKCX0KfQo=)!

[W mojej bibliotece ten kod jest bardziej skomplikowany](https://github.com/Comandeer/rollup-plugin-babel-minify/blob/master/src/utils.js#L9-L27), ponieważ obsługuje kilka dodatkowych przypadków (komentarz na początku rozciągający się na kilka wierszy, pusty kod czy… [obsługa błędu w `babel-minify`](https://github.com/babel/minify/issues/912), który przy okazji odkryłem). Niemniej jego głowną ideę w pełni oddaje kod powyżej.

Sprawdziłem to cudo organoleptycznie na jednym ze swoich projektów i działało. Mam zatem nadzieję, że to faktycznie działa i nikt nie zgłosi się z kolejnymi pretensjami, że teraz mu build wybucha…

W każdym razie jedno muszę przyznać: sourcemapy to bardzo niewdzięczny temat, w którym mało osób czuje się jak ryba w wodzie (poza Richem Harrisem – on jest rekinem w tym morzu). I mam nadzieję, że kolejny zgłoszony błąd będzie dotyczył czegoś zupełnie innego.
