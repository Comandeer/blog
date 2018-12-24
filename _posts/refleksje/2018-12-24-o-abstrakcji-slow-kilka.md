---
layout: post
title:  "O abstrakcji słów kilka"
author: Comandeer
date:   2018-12-24 16:01:00 +0100
categories: refleksje javascript
comments: true
---

Ostatnio miałem przyjemność przeczytać [książkę Nicholása Bevacquy <cite>Mastering Modular JavaScript</cite>](https://helion.pl/ksiazki/mastering-modular-javascript-nicolas-bevacqua,e_0xjn.htm#format/e). Z racji tego, że książka ta porusza bardzo szeroko rolę abstrakcji w tworzeniu oprogramowania, stwierdziłem, że najwyższy czas spisać także garść własnych przemyśleń.

<p class="note">To faktycznie garść przemyśleń, które od dość dawna kotłowały mi się w głowie. Pod żadnym pozorem nie jest to poradnik, jak tworzyć dobre abstrakcje. Raczej garść przemyśleń starego, zrzędliwego programisty. Jeśli szukasz faktycznego poradnika, polecam wymienioną wyżej książkę!</p>

## Abstrakcja – co to takiego?

W swoich rozważań pozwolę wyjść sobie z tego samego punktu co Bevacqua: tworzone oprogramowanie pełne jest <i>złożoności</i>. Złożony kod to kod składający się z wielu różnych elementów, realizujących różne zadania, które połączone razem są trudne do zrozumienia i ogarnięcia. Złożony kod to… praktycznie _każdy_ kod; im bardziej program się rozwija, tym bardziej jest złożony. I nie wynika to z nieumiejętności programistów czy złego projektu (przynajmniej nie zawsze), a z samego faktu, że kod się rozwija i realizuje coraz więcej zadań – wszak wszechświat dąży do entropii!

Im bardziej złożony kod, tym trudniejszy się staje w utrzymaniu i dalszym rozwoju. Powód jest prosty: obniża się czytelność kodu, a równocześnie wzrasta koszt poznawczy związany z potrzebą rozumienia wielu różnych zależności pomiędzy poszczególnymi częściami kodu, by móc dopisać kolejny jego fragment. W końcu dojdziemy do takiej złożoności, że nikt nie będzie w stanie ogarnąć całości systemu – [jak już lat temu stało się z platformą sieciową](http://html5doctor.com/interview-with-ian-hickson-html-editor/):

> The platform has been too complex for any one person to fully understand for a long time already.

I choć w przypadku platformy sieciowej nie jest to szczególnie dziwne, dobrze by było, gdyby ten sam los nie spotkał naszej frontendowej/backendowej aplikacji. Wszak nie jest to wielki system, na którym opierają się wszystkie strony internetowe, a raptem jedna z takich stron, zaprojektowana najczęściej według [modelu CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete). Jeśli nagle kod staje się równie niezrozumiały, co zaawansowana fizyka kwantowa, to znaczy, że złożoność wymknęła się spod kontroli i należy ją obniżyć.

Jednym z najbardziej skutecznych sposobów obniżania złożoności jest dobór odpowiedniej <i>abstrakcji</i>. Gdybym miał określić, czym jest <dfn>abstrakcja</dfn>, to powiedziałbym, że to po prostu przebieranie złożoności w ładne fatałaszki. Dzięki temu można przemycić fizykę kwantową w postaci prostej bajki.

Przykładem prostej abstrakcji może być poniższa funkcja `createLink`:

```javascript
function createLink( href ) {
	const link = document.createElement( 'a' );
	link.href = href;

	return link;
}
```

Jest to funkcja, która opakowuje wszystkie czynności związane z tworzeniem nowego elementu `a`. Dzięki temu, zamiast w wielu miejscach używać tworzenia elementu, ustawiania jego atrybutów itd., wystarczy wywołać funkcję `createLink`.

Zdecydowanie podnosi to czytelność kodu, bo przechodzimy od kodu opisującego, _jak_ coś robimy (`document.createElement( 'a')` itd.), do kodu opisującego, _co_ robimy ( `createLink( URL )` ). Tym samym kod zaczyna wyrażać nasze intencje i cele biznesowe a nie – szczegóły techniczne. Można wręcz pokusić się o stwierdzenie, że dobra abstrakcja to język, w jakim aplikacja komunikuje zewnętrznemu światu, jakie jest jej zadanie. Stąd [uważam BEM za dobry przykład abstrakcji](https://blog.comandeer.pl/html-css/javascript/daj-sie-poznac-2017/2017/05/12/bem-jako-architektura.html).

## Interfejsy i implementacje

Aplikacja jest tak dobra jak jej <dfn>publiczny interfejs</dfn> (API). A API jest najczęstszą formą abstrakcji w aplikacjach. Interfejs stanowi pomost łączący resztę aplikacji z implementacją danej funkcji. Jest pośrednikiem tłumaczącym dane otrzymywane z aplikacji na format sensowny dla danej implementacji oraz odwrotnie – tłumaczącym dane zwracane przez implementację na format strawny dla reszty aplikacji. Mówiąc jeszcze inaczej: to protokół dyplomatyczny, pozwalający nawiązać relację między aplikacją a konkretną jej funkcją.

<dfn>Implementacja</dfn> to z kolei nic innego jak wszystkie szczegóły techniczne potrzebne do realizacji konkretnego zadania. Podczas gdy interfejs odpowiada na pytanie _co_ dana funkcja robi, implementacja odpowiada na pytanie _jak_ to robi.

W naszym powyższym przykładzie, `createLink`, interfejs stanowi sygnatura tej funkcji. Wiemy, że możemy funkcji przekazać URL, a ona wypluje nam gotowy element DOM. Wnętrze tej funkcji stanowi z kolei implementację. Widać, że w tej funkcji cała złożoność jest ukryta za interfejsem i mieści się właśnie w implementacji.

I właśnie na tym polega dobra abstrakcja: jest prosta, łatwo uzasadnić jej istnienie i ukrywa przed nami niepotrzebne szczegóły techniczne. Nasza funkcja `createLink` spełnia wszystkie te punkty. Jej API jest proste i opisowe. Wystarczy rzucić okiem na wywołanie tej funkcji, by domyślić się, co robi. Łatwo też uzasadnić istnienie tej funkcji. Bez niej musielibyśmy powtarzać tworzenie elementu, nadawanie mu atrybutów itd., a tak wywołujemy jedną funkcję, która dodatkowo zajmuje mniej miejsca na ekranie i szybciej można zrozumieć, co dany fragment kodu robi. A techniczne szczegóły są zamknięte w jej wnętrzu i na dobrą sprawę będą nas interesowały dopiero wówczas, gdy funkcja zacznie nieprawidłowo tworzyć nowy link.

Jest jeszcze jedna cecha dobrej abstrakcji: jest niezależna od ukrywanej pod nią implementacji. Dobry interfejs to taki, który nie musi się zmienić, gdy zmieni się sposób wykonywania konkretnej czynności. Dobrym przykładem jest potrzeba tworzenia linku w postaci węzła <abbr title="virtual DOM" lang="en">vDOM</abbr> zamiast zwykłego elementu DOM przy zachowaniu tej samej sygnatury funkcji `createLink`:

```javascript
function createLink( href ) {
	const link =  new vDOMNode( 'a', {
		attributes: {
			href
		}
	} );

	return link;
}
```

Nietrudno sobie wyobrazić aplikację z <abbr title="Server-Side Rendering" lang="en">SSR</abbr>, która na serwerze będzie używać implementacji opierającej się na vDOM, a w przeglądarce na normalnym DOM, pozostawiając jednak dla spójności to same API.

## Modularność

Innym elementem, który pozwala nam ograniczyć złożoność poprzez rozbicie jej na wiele mniejszych, prostszych części, jest modularność. Praktycznie każda dzisiejsza aplikacja składa się z wielu niezależnych od siebie modułów, które dopiero razem tworzą spójną, działającą aplikację.

Modularność stanowi jeden z podstawowych warunków tworzenia prostych i łatwych w utrzymaniu aplikacji. Pozwala na zamknięcie abstrakcji dotyczących konkretnego problemu w ich własnym mikroświecie, mogącym rozwijać się niezależnie od reszty aplikacji. Dzięki temu niejako gwarantują sensowny <dfn>podział obowiązków</dfn> (ang. <i lang="en">separation of concerns</i>).

W JS modularność jest możliwa dzięki [natywnej składni modułów (ESM)](http://exploringjs.com/es6/ch_modules.html).

## DOM, czyli czemu jQuery nie jest wcale takie złe

W przypadku aplikacji uruchamianych w przeglądarce abstrakcje często pełnią dodatkową funkcję warstwy zgodności. Poruszone to zostało lata temu przez m.in. [książkę Nicholasa Zakasa <cite>The Problem with Native JavaScript APIs</cite>](https://www.oreilly.com/programming/free/native-javascript-apis.csp). Choć dzisiaj problem ten nie jest tak palący jak kiedyś, pomiędzy poszczególnymi przeglądarkami wciąż istnieją różnice w implementacjach poszczególnych standardów. Dodatkowo część aplikacji musi wspierać starsze przeglądarki, takie jak Internet Explorer 11. To sprawia, że kod pisany bezpośrednio w natywnych APIs przeglądarki niekoniecznie musi działać wszędzie tak samo.

Bardzo dobrym przykładem takich różnic w natywnym API może być wprowadzone po ES6 [`NodeList#forEach`](https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach). W starszych przeglądarkach ta metoda nie istnieje i jeśli chcemy jej użyć, mamy dwa wyjścia: skorzystać z polyfilla lub użyć abstrakcji.

Drugie z tych rozwiązań ma tę przewagę nad pierwszym, że w żaden sposób nie ogranicza nas API narzucone przez twórców standardu DOM. Jeśli uznamy, że wolimy posługiwać się odmianą pętli, w której aktualny element jest wskazywany przez kontekst `this`, nic nie stoi na przeszkodzie, by takie rozwiązanie wprowadzić. Co więcej, możemy uczynić API naszego rozwiązania o wiele przyjaźniejszym niż natywne DOM API. Kształt naszej abstrakcji ogranicza wyłącznie nasza wyobraźnia.

W teorii stworzenie dodatkowej abstrakcji na DOM umożliwia jeszcze jedną rzecz: przeniesienie naszej aplikacji w środowisko pozbawione DOM-u. Jeśli nasza abstrakcja faktycznie dobrze maskuje szczegóły implementacyjne, to ostatecznie wcale nie musi generować DOM-u, a zamiast tego wypluwać szereg komend do rysowania na `canvas` czy zbudować drzewko vDOM. Przykładem tego typu abstrakcji jest JSX w React, które w zależności od wykorzystania odpowiedniego środowiska tej biblioteki będzie tworzyć kod przeglądarkowy lub serwerowy.

Innym dobrym przykładem abstrakcji na DOM może być… jQuery. Choć biblioteka ta ostatnimi czasy dochrapała się sporej liczby nieprzejednanych przeciwników, to prawda jest taka, że [wciąż jest to jedno z najpopularniejszych rozwiązań](https://remysharp.com/2017/12/15/is-jquery-still-relevant) i to nie bez powodu. Gdy się przyjrzymy bliżej tej bibliotece, dostrzeżemy, że spełnia niemal wszystkie warunki dobrej abstrakcji. W porównaniu do natywnego DOM API sprawia, że kod staje się czytelniejszy. Dodatkowo kod jest też prostszy, gdyż jQuery ukrywa przed nami choćby szczegóły dotyczące nadawania stylów CSS poszczególnym elementom czy szczegóły animacji. Biblioteka jQuery jest też doskonała jako warstwa zgodności, eliminująca różnice pomiędzy poszczególnymi przeglądarkami. Jedyną wadą w jej przypadku jest fakt, że jest związana z jedną, konkretną implementacją – DOM-em. Rekompensuje to jednak niezwykle prostym, elastycznym API, o którego jakości może świadczyć to, że wiele pomysłów z tej biblioteki zostało następnie przeniesionych na standardy sieciowe lub przynajmniej te standardy zainspirowało (`querySelectorAll`, `classList`, Fetch API, Web Animation API itp.).

To oczywiście nie oznacza, że jQuery jest _najlepszą_ abstrakcją na DOM. W wielu przypadkach współczesne frameworki i biblioteki, takie jak Vue czy React, będą lepsze. Nie można bowiem zapominać, że jQuery nie próbuje dostarczać wysokiego poziomu abstrakcji do tworzenia aplikacji sieciowych. To po prostu prosta warstwa abstrakcji na DOM, uprzyjemniająca pracę z nim, a zatem - dość niskopoziomowe rozwiązanie. Niemniej nie można tego narzędzia demonizować, bo w swojej klasie jest <i lang="la">de facto</i> niekwestionowanym liderem od wielu, wielu lat.

### Zaraz, zaraz: że niby DOM jest zły?

Tak, osobiście uważam używanie DOM API bezpośrednio za złą praktykę. I choć akurat problem zgodności międzyprzeglądarkowej nie jest już dzisiaj aż tak istotny jak jeszcze kilka lat temu, wciąż istnieje szereg przesłanek za tym, by nie używać bezpośrednio DOM.

Jak wspomniałem już wyżej, dobry interfejs to taki, który oddziela implementację (_jak_) od logiki i przepływu aplikacji (_co_). DOM API z kolei grzęźnie właśnie na odpowiedzi na to, jak chcemy coś osiągnąć. W naszej aplikacji przecież stworzenie elementu czy umieszczenie go w odpowiednim kontenerze nie jest celem samo w sobie, ale służyć ma wykonaniu jakiegoś większego założenia. Nie tworzymy elementu `a` dla samego jego tworzenia, tworzymy go, by otrzymać link. I choć `createLink` samo w sobie też nie realizuje w pełni jakiegokolwiek celu biznesowego, zamienia żmudne dłubanie w DOM na krótki, prosty opis czynności.

Co więcej, poniżej DOM nie ma już nic, stanowi on najbardziej podstawowy element platformy sieciowej. Tym samym DOM jest <i lang="la">de facto</i> implementacją – technicznym szczegółem związanym mocno z tym, w jakim środowisku nasza aplikacja jest uruchamiana. A przecież właśnie takie rzeczy wprowadzają z jednej strony niepotrzebny szum informacyjny, z drugiej – wiążą aplikację z konkretnym środowiskiem uruchomieniowym. Współczesne biblioteki, takie jak React, pokazały, czemu nie jest to dobry pomysł i czemu [warto być niezależnym od środowiska](https://overreacted.io/how-does-setstate-know-what-to-do/).

No i wreszcie: wystarczy zastanowić się przez chwilę, czemu jQuery stało się tak popularne, a przecież nie robiło nic nadzwyczajnego (pomijając aspekt zgodności międzyprzeglądarkowej). Sekret tkwił w tym, że było tak _proste_ i przyjemne w użyciu. DOM API nigdy nie było ani zbyt proste, ani za przyjemne w użyciu. Dopiero zmiany wprowadzone dzięki jQuery sprawiły, że DOM API stało się przyjemniejsze – ale nie aż tak, by wmawiać sobie, że warto w nim pisać obecnie aplikacje.

Czy istnieją zatem przypadki, w których warto pisać bezpośrednio w DOM? Tak, ale są dość nieliczne. Jednym z nich jest na pewno prototypowanie wszelkiego rodzaju rozwiązań. Innym jest potrzeba zachowania jak największej wydajności. Nie można bowiem nie zauważyć, że głównym celem abstrakcji jest podniesienie łatwości utrzymania kodu i jego czytelności, niekoniecznie zaś – wydajności.

## Pułapki abstrakcji

Nietrudno jednak wpaść w pułapki wprowadzenia do kodu złej abstrakcji, co może być o wiele kosztowniejsze niż nieużywanie abstrakcji w ogóle.

### Zbyt wiele abstrakcji

Chyba najczęstszym problemem z abstrakcją jest to, że często próbujemy wprowadzić jej do kodu zbyt wiele. Choć początkowo brzmi to bez sensu, warto się nieco głębiej nad tym zastanowić.

Podstawowym założeniem wprowadzenia abstrakcji jest ograniczenie (czy też ukrycie) złożoności, zatem: sprawienie, że kod staje się prostszy i czytelniejszy. Niemniej czasami kod, który chcemy ukryć pod abstrakcją, jest na tyle prosty sam w sobie, że wprowadzenie dodatkowej abstrakcji jedynie podniesie złożoność, nie dając wymiernych korzyści. Czasami można się zagalopować nawet o wiele dalej i proste rzeczy ukryć pod przygniatającą wręcz ilością abstrakcji.

Wyobraźmy sobie, że mamy taki oto kod:

```javascript
console.log( 'Hello, world!' );
```

Chcielibyśmy jednak, by nasze "Hello, world!" zostało ukryte pod ładną abstrakcją, która pozwoli nam podmienić `console.log` na inny sposób wyświetlania komunikatu. W najbardziej przejaskrawionej wersji możemy skończyć z takim oto potworem:

```javascript
class Renderer {
	render() {
		throw new Error( 'Render method must be implemented in subclass!' );
	}
}

class ConsoleRenderer extends Renderer {
	constructor( console ) {
		super();
		this.console = console;
	}

	render( str ) {
		this.console.log( str );
	}
}

class HelloWorld {
	constructor( renderer ) {
		if ( !( renderer instanceof Renderer ) ) {
			throw new TypeError( 'Renderer must be an instanceof Renderer!' );
		}

		this.renderer = renderer;
	}

	render() {
		this.renderer.render( 'Hello, world!' );
	}
}

const consoleRenderer = new ConsoleRenderer( console );
const helloWorld = new HelloWorld( consoleRenderer );

helloWorld.render();
```

I choć ten kod może wydawać się na pierwszy rzut oka _bardziej pro_, to prawda jest taka, że jest to przykład fatalnie dobranej abstrakcji. Kod nie stał się czytelniejszy. O prostocie to nawet nie ma co mówić, bo zamiast prostego wywołania `console.log`, mamy wywołanie metody `render` klasy `HelloWorld`. A o tym, co dokładnie ta metoda robi, decyduje typ renderera przekazany do instancji klasy `HelloWorld`. Tym sposobem, żeby zrozumieć, co dzieje się w linijce `helloWorld.render()`, musimy tak naprawdę przetrawić też linijki wcześniejsze (by sprawdzić, jaki typ renderera przekazaliśmy do `helloWorld`), a następnie – odpowiednią klasę renderera (w naszym przypadku `ConsoleRenderer`). Dopiero łącząc te wszystkie informacje jesteśmy w stanie zrozumieć, co tak naprawdę wydarzyło się w powyższym kodzie.

I choć co prawda kod ten rozwiązuje nasz problem podmiany `console.log` na coś innego, istnieje też o wiele prostszy sposób, niepowodujący takiego narzutu poznawczego: po prostu _nadpisanie_ linijki z `console.log`. Nie ma sensu zamieniać prostych rzeczy na o wiele bardziej skomplikowane tylko po to, by przemycić jakąś abstrakcję. Najlepszym przykładem pokazującym, co się wtedy dzieje, jest słynne [FizzBuzz Enterprise Edition](https://github.com/EnterpriseQualityCoding/FizzBuzzEnterpriseEdition). Dlatego też trzeba pamiętać, że abstrakcja opłaca się tylko do pewnego momentu, od którego zaczyna podnosić złożoność zamiast ją obniżać.

### Obniżenie wydajności

Innym problemem związanym z nadmiarem abstrakcji, który był już wspomniany, jest obniżenie wydajności. Abstrakcje celują bowiem w podniesienie czytelności i łatwości zrozumienia kodu, nie zaś jego wydajności.  Wprowadzanie kolejnej warstwy abstrakcji wiąże się ze spadkiem wydajności. I choć początkowo nie będzie to odczuwalne, to [kumulacja wszystkich abstrakcji może powodować dość spory narzut wydajnościowy](https://aerotwist.com/blog/react-plus-performance-equals-what/).

Niemniej dopóki jesteśmy w stanie wypracować sensowny kompromis pomiędzy abstrakcją a wydajnością i od ułamka milisekundy nie będzie zależeć czyjeś życie, warto postawić na zwiększenie czytelności niż wyciśnięcie kolejnej milisekundy. Pozwoli nam to szybciej rozwijać aplikację, bez potrzeby przekopywania się przez skrajnie zoptymalizowany kod. W końcu gdyby to wydajność liczyła się najbardziej, wszyscy pisalibyśmy dzisiaj w asmie.

### Zbyt wąska abstrakcja

Abstrakcje powinny być jak najszersze i pokrywać jak najwięcej przypadków. Jeśli w naszym kodzie obok siebie istnieją dwie różne abstrakcje wykonujące podobne zadania, to znaczy, że coś zrobiliśmy źle.

Wyobraźmy sobie, że w naszej aplikacji edytującej obrazki potrzebna jest funkcja do obracania obrazków o 90° w lewo. W pierwszym porywie być może napiszemy taki kod:

```javascript
function rotateLeft( img ) {
	// Tutaj magiczny obrót w lewo.
}
```

Ale co jeśli za tydzień pojawi się wymóg obracania obrazka w prawo? Jasne, można stworzyć drugą funkcję, `rotateRight`, która będzie robić dokładnie to samo. A za kolejny tydzień `rotateTop`, za 2 – `rotateBottom`…

Zamiast tego wypada poświęcić chwilkę na próbę _przewidzenia_ tego, w jaki sposób aplikacja w najbliższej przyszłości może się rozwijać i spróbować stworzyć odpowiednią abstrakcję. W tym wypadku najprościej byłoby stworzyć jedną funkcję, `rotate`, która przyjmowałaby jako drugi parametr kierunek obrotu:

```javascript
function rotate( img, direction ) {
	// Tutaj magiczny obrót w stronę wskazywaną przez direction.
}
```

### Zbyt wczesna abstrakcja

Często warto wprowadzić nieco ogólniejsze abstrakcje, by móc je rozwijać (jak powyższa funkcja `rotate`). Czasami jednak zbyt wczesne wprowadzenie abstrakcji czy próba przewidzenia, jak aplikacja będzie się rozwijać w nieco dłuższej perspektywie sprawi, że dobrana abstrakcja zacznie nas ograniczać i zdławi naturalny rozwój naszej aplikacji.

Dobrym przykładem może być założenie od samego początku, że nasza aplikacja powinna bez problemu uruchamiać się na różnych środowiskach serwerowych i dorobienie całej warstwy abstrakcji zajmującej się niwelowaniem różnic pomiędzy różnymi serwerami, co oznacza np. konieczność używania jej do obsługi danych przesyłanych przez użytkownika, a następnie uruchamianie tej aplikacji wyłącznie na serwerach Apache 2.4.2 działających w systemie Ubuntu 16.10. Innym przykładem może być dorobienie do naszej funkcji `rotate` obsługi kąta obrotu, mimo że nasza aplikacja do końca świata będzie używać kąta 90°. Tym samym właśnie poświęciliśmy nasz czas na implementację rzeczy, której nikt nie potrzebuje.

Kod i abstrakcje powinny być przewidujące, czyli łatwe w rozwoju. Nie powinny być z kolei dostosowane do wszystkich możliwych scenariuszy, jakie wystąpią w przyszłości. Nie dość, że to najzwyczajniej w świecie niemożliwe, to dodatkowo możemy coś przewidzieć źle. A wycofanie złej abstrakcji może być bardzo trudne lub wręcz niemożliwe (`window.event` może być tego dobrym przykładem).

### Zbyt sztywna abstrakcja

Powróćmy jeszcze raz do naszej funkcji `rotate`. Wyobraźmy sobie, że jednak potrzeba dorobić możliwość wyboru kąta obrotu. Nic prostszego:

```javascript
function rotate( img, direction, deg = 90 ) {
	// Tutaj magiczny obrót w stronę wskazywaną przez direction.
}
```

Wraz z rozwojem aplikacji pojawi się też potrzeba określenia, czy obrót ma być animowany i jak długo ma trwać animacja oraz potrzeba dodania funkcji zwrotnej:

```javascript
function rotate( img, direction, deg, isAnimated, animationDuration, callback ) {
	// Tutaj magiczny obrót w stronę wskazywaną przez direction.
}
```

Wyobraźmy sobie teraz, że chcemy wykonać standardowy obrót w lewo o 90°, ale równocześnie dodać funkcję zwrotną. Przy obecnym API będziemy zmuszeni podać wszystkie parametry:

```javascript
rotate( img, 'left', 90, false, 0, myCallback );
```

Bez rzucania okiem na dokumentację funkcji, trudno spamiętać, który parametr za co odpowiada i w jakiej są kolejności. Kształt tego API jest zbyt sztywny.

Na szczęście istnieje prosty sposób, by uczynić to API o wiele elastyczniejszym. Wystarczy wszystkim parametrom (oprócz `img`, które zmienia się za każdym razem) przypisać sensowne wartości domyślne i ukryć je pod jednym parametrem, `options`:

```javascript
function rotate( img, {
	direction = 'left',
	deg = 90,
	isAnimated = false,
	animationDuration = 0,
	callback = false
} = {} ) {
	// Tutaj magiczny obrót w stronę wskazywaną przez direction.
}
```

Tym sposobem do `rotate` będziemy mogli przekazać tylko interesujące nas parametry, zdając się w przypadku reszty na sensowne wartości domyślne. Co więcej parametr `options` staje się samodokumentujący się, dzięki składni obiektów:

```javascript
rotate( img, {
	callback: myCallback
} );
```

Według podobnej zasady jest zaprojektowane np. [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

## Rozwój abstrakcji w JS

Moje osobiste zdanie jest takie, że na ekosystemie JS można ładnie pokazać, jak stopniowo przebiega rozwój abstrakcji:

* natywne DOM API,
* jQuery,
* React,
* Angular.

Na samym początku mamy tak naprawdę brak abstrakcji i niskopoziomowe szczegóły implementacji danego środowiska. W przypadku platformy sieciowej tę rolę pełni DOM API. Choć da się w tym pisać, nie oszukujmy się: nie należy to do najprzyjemniejszych rzeczy na świecie. A że siedzę w tym biznesie od wielu lat, to wierzcie mi: drzewiej nawet gorzej bywało.

Skoro mamy już szczegóły implementacyjne danego środowiska, można na nich zbudować jakąś prostą abstrakcję, która sprawi, że praca stanie się o wiele przyjemniejsza. Dodatkowo można dodać parę nowości, które nie są dostępne bezpośrednio z poziomu środowiska. Tym sposobem zrodziło się jQuery, dodające m.in. możliwość wyszukiwania elementów przy pomocy selektorów CSS (co wówczas nie było możliwe przy użyciu natywnego DOM API) oraz przyjemniejszą składnię, opartą na [łańcuchowaniu](https://medium.com/@saginadir/native-function-chaining-in-javascript-what-we-can-learn-from-jquery-3b42d5d4a0d). I w sumie to tyle, głównym celem było ułatwienie pracy z danym środowiskiem.

Gdy już mamy taką prostą abstrakcję, wypada pomyśleć o czymś bardziej dojrzałym, a równocześnie – tak samo prostym lub nawet prostszym. I tutaj na scenę wkracza React, który idzie o krok dalej od jQuery i wprowadza rozwiązanie oparte o konstrukcję drzewa (ukrytego najczęściej pod postacią JSX-a), które jest następnie tłumaczone na DOM lub inny model danych, zrozumiały dla wykorzystywanego środowiska. Tym samym nie musimy w ogóle myśleć o środowisku, dla którego piszemy, a o tym, co chcemy osiągnąć dzięki naszemu kodowi. Nasze komponenty zaczynają działać tak samo sprawnie na serwerze, sprawiając, że DOM w końcu staje się tym, czym zawsze miał być: szczegółem implementacyjnym. Osobiście uważam, że jest to optymalny poziom abstrakcji: oderwany od środowiska uruchomieniowego, pozwalający nam wyrażać w kodzie co chcemy robić i zajmujący się wszelkimi aspektami tego, jak to jest robione. Mniej abstrakcji sprawiałoby, że pozostalibyśmy na poziomie jQuery, jedynie uprzyjemniając sobie pracę z DOM, a więcej abstrakcji mogłoby przekroczyć delikatną granicę, po której abstrakcje zaczynają podnosić złożoność.

Po React następuje faza Angulara, którego osobiście uznaję za reprezentanta drugiego krańca spektrum abstrakcji. Jest to dla mnie framework niebezpiecznie balansujący na granicy abstrakcji, które jedynie podnoszą złożoność, nie dając tym samym wymiernych korzyści. Wystarczy przyjrzeć się składni atrybutów dla elementów, w których różnica w zachowaniu jest wyrażana przez rodzaj otaczających je nawiasów:

```html
<element (click)="whatever" attr1="whenever" [attr2]="wherever"></element>
```

Choć zamysł jest dobry (odróżnienie różnego rodzaju zachowania), to sposób wprowadzenia go w życie już niekoniecznie. Powoduje to niepotrzebny narzut poznawczy i konieczność spamiętania, co dany nawias oznacza. Tego typu małych smaczków i konwencji w Angularze jest sporo, co utrudnia jego opanowanie i zrozumienie kodu.

## Casus `getStore`

Bardzo często w różnych dyskusjach w grupach na Facebooku czy na forach dyskusyjnych pada takie mniej więcej pytanie:

> Chcę zrobić prostą aplikację to-do i zastanawiam się, do jakiej bazy danych zapisywać informacje o poszczególnych zadaniach. Możecie jakąś polecić?

Jeśli zaczynasz tworzyć aplikację i Twoim pierwszym problemem jest dobór odpowiedniej bazy danych, to polecam przystopować na chwilę i przemyśleć raz jeszcze cały temat. Bo tak naprawdę dobór bazy danych (zwłaszcza dla tak prostej aplikacji) jest całkowicie wtórnym problemem.

### Najpierw API

Projektowanie aplikacji najlepiej rozpocząć od zastanowienia się, jakie API powinna posiadać. Innymi słowy: co tak naprawdę aplikacja powinna robić. Zasada "najpierw API" pozwala się skupić na logice biznesowej, spychając na bok wszelkie rozważania dotyczące szczegółów implementacyjnych. Dzięki temu jesteśmy w stanie stworzyć prostą i przejrzystą strukturę aplikacji, choćby w postaci pseudokodu. Mając taką strukturę, możemy dopisać kod realizujący rzeczy obiecane przez API – czyli implementację.

Gdybyśmy mieli podejść w taki sposób do rozwiązania problemu doboru bazy danych, musielibyśmy się zastanowić, _co_ pozwala nam ona osiągnąć. I tak naprawdę można tutaj z pamięci zacytować model CRUD:

* <b lang="en">Create</b> – tworzenie zadań,
* <b lang="en">Read</b> – wczytywanie informacji o zadaniach,
* <b lang="en">Update</b> – edytowanie zadań,
* <b lang="en">Delete</b> – usuwanie zadań.

Wiemy już zatem, jakie metody powinno udostępniać nasze API. Spróbujmy zatem przelać to na prosty pseudokod:

```javascript
class Store {
	createTask( data ) {}
	getAllTasks() {}
	getTask( id ) {}
	editTask( id, data ) {}
	deleteTask( id ) {}
}
```

Uzyskaliśmy zatem prostą klasę `Store`, realizującą wszystkie zadania z powyższej listy z dodatkową metodą `getAllTasks` do pobrania wszystkich istniejących zadań. Możemy ją teraz zapisać jako osobny moduł naszej aplikacji, `Store.js`.

### Zamienne implementacje

Mając zaprojektowane API, możemy spróbować dorobić do niego prostą implementację. W przypadku magazynu najprostsza implementacja może po prostu zapisywać wszystkie zadania do jakiegoś obiektu:

```javascript
import generateId from './generateId.js';

class Store {
	constructor() {
		this.store = {};
	}

	createTask( data ) {
		const id = generateId();

		this.store[ id ] = data;

        return id;
	}

	getAllTasks() {
		return this.store;
	}

	getTask( id ) {
		return this.store[ id ];
	}

	editTask( id, data ) {
		this.store[ id ] = data;
	}

	deleteTask( id ) {
		delete this.store[ id ];
	}
}

export default Store;
```

Tego typu implementacja będzie doskonała choćby w przypadku pisania prototypu aplikacji. Zamiast zastanawiać się nad wyborem bazy danych, możemy zapisywać dane właśnie w takim obiekcie lub w `localStorage`, a gdy aplikacja będzie sensownie działać, wówczas podmienimy implementację na taką korzystającą z Firebase czy innego MySQL. Tym sposobem problem bazy danych nie będzie nas blokował niemal przez cały proces tworzenia aplikacji.

Tego typu zamienne implementacje bardzo przydadzą się także podczas testowania, ponieważ będziemy mogli na jego czas podstawić magazyn wykonujący dodatkowe operacje na danych.

### Dependency Injection, czyli jak to wykorzystać?

Najprostszym sposobem na podmienianie implementacji magazynu w aplikacji będzie wykorzystanie mechanizmu [Dependency Injection](https://en.wikipedia.org/wiki/Dependency_injection). Dzięki niemu będziemy mogli dokładnie powiedzieć aplikacji, jakiego magazynu ma użyć:

```javascript
// index.js

import FirebaseStore from './stores/firebase.js';
import App from './app.js';

const store = new FirebaseStore( 'admin', 'admin' );
const app = new App( store );
```

```javascript
// app.js

class App {
	constructor( store ) {
		this.store = store;
	}

	renderTasks() {
		const tasks = this.store.getAllTasks();

		// itd.
	}
}
```

Dzięki tej prostej technice jesteśmy w stanie podmieniać w locie wykorzystywaną bazę danych.

## Przyszłość abstrakcji

Nie oszukujmy się: abstrakcje są dla programistów, aby byli w stanie rozumieć swój własny kod i szybciej realizowali cele i założenia biznesowe. Dobra abstrakcja w żaden pozytywny sposób nie przekłada się na ostateczne doświadczenia użytkownika. Może natomiast to doświadczenie zdecydowanie obniżyć, sprawiając, że wydajność aplikacji zostanie obniżona. A przecież żyjemy w czasach, w których [wydajność jest uznawana za jeden z głównych ficzerów](https://dassur.ma/things/120fps/). Jak to zatem pogodzić z równoczesnym trendem wprowadzania coraz bardziej zaawansowanych abstrakcji?

W teorii można odrzucić abstrakcje i wrócić do pisania w czystym JS-ie i DOM API. To jednak może mieć naprawdę przykre konsekwencje i obniżyć znacząco produktywność programistów. Nie oszukujmy się: przez lata [DX stało się naprawdę istotne](https://hackernoon.com/developer-experience-dx-devs-are-people-too-6590d6577afe). Nie można udawać, że programiści poradzą sobie z każdym, nawet najbardziej nieczytelnym kodem. Stąd nie można odrzucić w pełni abstrakcji. A w przypadku bardziej zaawansowanych aplikacji tworzenie ich bez abstrakcji brzmi jak misja samobójcza.

Czy jest jakiś kompromis? Pewnie się powtórzę, ale widzę go w [przejściu od frameworków do kompilatorów](https://tomdale.net/2017/09/compilers-are-the-new-frameworks/). Tym samym biblioteki pokroju Reacta służyłyby do pisania kodu w przyjaznych i łatwych do zrozumienia abstrakcjach, a do przeglądarki trafiałby skrajnie zoptymalizowany kod, wykorzystujący natywne mechanizmy przeglądarki (i tutaj Web Components by błyszczały!). [I to już zaczyna się dziać](https://svelte.technology/)!

Dzięki tej – tak po prawdzie prostej – zmianie podejścia w końcu obydwie strony będą zadowolone. Programiści będą pisać prosty, zrozumiały kod, a użytkownicy – korzystać z wydajnych aplikacji.

---

A tak w ogóle, to wesołych świąt 🎄!
