---
layout: post
title:  "Asynchroniczny DOM"
author: Comandeer
date:   2018-05-27 19:01:00 +0100
categories: refleksje javascript standardy-sieciowe
comments: true
permalink: /asynchroniczny-dom.html
redirect_from:
    - /refleksje/javascript/2018/05/27/asynchroniczny-dom.html
---

Ostatnio natrafiłem na [artykuł opisujący, jak działa React Fiber](https://engineering.hexacta.com/didact-fiber-incremental-reconciliation-b2fe028dcaec) i doznałem momentu z cyklu "hej, przecież ja to znam!". Ba, koncept użyty w React 16 do polepszenia wydajności posłużył mi do napisania sporej części [mojej książki](https://helion.pl/ksiazki/javascript-programowanie-zaawansowane-tomasz-comandeer-jakut,jascpz.htm#format/d). Dlatego dzisiaj zapraszam na krótką podróż po meandrach (a)synchronicznego DOM-u.

## Na początku był DOM

Historia DOM jest nierozerwalnie związana z historią JS-a. Co prawda nie jestem aż tak stary, by pamiętać dobrze te czasy, niemniej Wikipedia zdaje się potwierdzać: [zalążki DOM powstały w 1995](https://en.wikipedia.org/wiki/Document_Object_Model#History) – razem z JS. Nie jest to nic zaskakującego, bowiem DOM bez JS nie ma sensu.

Czym tak naprawdę w ogóle jest DOM? To struktura drzewiasta reprezentująca kod HTML. Każda wczytywana przez przeglądarkę strona WWW jest na takie drzewko przetwarzana i każdy znacznik HTML ma w tym drzewie swoje odzwierciedlenie. Weźmy na przykład najprostszą stronę świata:

```html
<!DOCTYPE html>
	<html lang="pl">
		<head>
			<meta charset="UTF-8">
			<title>Hello world</title>
		</head>
		<body>
			<h1>Hello world!</h1>
		</body>
	</html>
```

Drzewko DOM dla tej strony wyglądałoby następująco (stosuję notację CSS-ową, by zapisać atrybuty elementów):

```
#document
|
| -- html[lang=pl]
     |
     | -- head
     |    |
     |    | -- meta[charset=UTF-8]
     |    |
     |    | -- title
     |         |
     |         | -- #text(Hello world)
     |
     | -- body
          |
          | -- h1
               |
               | -- #text(Hello world!)
```

Tego typu struktura drzewiasta pozwala w prosty sposób na dodanie interakcji z poszczególnymi elementami strony, które są traktowane jako obiekty w kodzie JS. Trzeba przyznać, że to sensowny sposób, odznaczający się sporą swobodą.

Oczywiście drzewko DOM można dowolnie zmieniać i przekształcać, gdyż jest żywą strukturą. Dzięki temu nasze aplikacje _zaczynają żyć_ i przestają być tylko tekstem zamkniętym w tekstowym kodzie HTML.

## "Potrzebujemy abstrakcji!" – narodziny jQuery

DOM powstał w wyniku wojen przeglądarek, więc nic dziwnego, że pomiędzy poszczególnymi przeglądarkami istniały spore różnice – nawet pomimo tego, że istniał odgórny standard. Z tego też powodu korzystanie z czystego DOM było prawdziwą udręką. Pojawiła się potrzeba stworzenia dodatkowej abstrakcji, która ukryłaby przed oczami developerów niespójności i dodatkowo uprzyjemniała pracę z DOM. I tutaj na scenę wkracza [jQuery](http://jquery.com/) – najpopularniejsza od lat biblioteka JS, której głównym (i w sumie jedynym zadaniem) jest dostarczenie takiego samego interfejsu dla DOM we wszystkich wspieranych przeglądarkach. Dzięki temu nie musimy się przejmować różnicami pomiędzy poszczególnymi przeglądarkami. I mimo że problem ten nie jest aż tak odczuwalny dzisiaj, taka warstwa abstrakcji i tak się przydaje (choćby dlatego, że wciąż istnieją edge case'y i bugi w przeglądarkach).

Oczywiście przez lata typy takich warstw abstrakcji się zmieniały, niemniej jQuery przez lata udawało się ([i w sumie wciąż udaje](https://remysharp.com/2017/12/15/is-jquery-still-relevant)) utrzymać dominację. Był on także jedną z pierwszych prób ujarzmienia DOM i uczynienia go przyjaźniejszym – niemniej głównie dla developerów.

## Asynchroniczny DOM

Początkowo rozwiązania pokroju jQuery sprawdzały się wyśmienicie, niemniej nie da się uciec od konstatacji, że skupiały się wyłącznie na tym, co ostatnio dostało ładną nazwę – DX, Develeper Experience (w analogii i opozycji do UX, User Experience). Niemal w ogóle nie dotykały natomiast kwestii wydajności. To, co nie było problemem w dobie raczej prostych, mało skomplikowanych stron WWW, zaczęło uwierać, gdy strony WWW zaczęły się przekształcać w pełnoprawne aplikacje webowe. Liczba elementów i interakcji na stronach wzrastała w przerażającym tempie i w końcu uświadomiono sobie smutną prawdę: DOM jest wolny.

Niemniej po długich i żmudnych badaniach odkryto jeszcze smutniejszą prawdę: DOM jest wolny – ale w 98% przypadków to wina developera. Owszem, modyfikacja drzewiastej struktury to najczęściej ten fragment aplikacji, który jest najwolniejszy, niemniej używając odpowiednich technik optymalizacyjnych można z DOM-u wycisnąć naprawdę sporo. Pojawiło się określenie [<i lang="en">layout thrashing</i>](http://wilsonpage.co.uk/preventing-layout-thrashing/) (ang. zaśmiecanie/niszczenie układu strony). Opisuje ono częste i bezzasadne wymuszanie wyliczania układu strony przez przeglądarkę. Można się na to nadziać stosunkowo łatwo:

```javascript
const paragraphs = [ ...document.querySelectorAll( 'p' ) ];

paragraphs.forEach( ( paragraph ) => {
	paragraph.style.height = `${ document.body.offsetHeight }px`;
} );
```

W tym wypadku dochodzi do zaśmiecania układu strony, ponieważ mieszamy odczytywanie wartości z DOM z ich zapisywaniem.

Ustrzec się przed tym możemy względnie łatwo: najpierw odczytując informacje z DOM, a potem zapisując zmiany do DOM:

```javascript
const paragraphs = [ ...document.querySelectorAll( 'p' ) ];
const offsetHeight = document.body.offsetHeight;

paragraphs.forEach( ( paragraph ) => {
	paragraph.style.height = `${ offsetHeight }px`;
} );
```

Teoria piękną teorią, ale przy bardziej skomplikowanych aplikacjach utrzymanie rozgraniczenia pomiędzy odpytywaniem a modyfikowaniem DOM może być bardzo trudne (zwłaszcza, gdy nie ma silnego podziału pomiędzy logiką aplikacji a operacjami na DOM). I właśnie w tym miejscu na scenę wkracza asynchroniczny DOM.

Wszystkie operacje na DOM z zasady są synchroniczne (zatem przeglądarka wykonuje je w momencie natknięcia się na nie w kodzie i w takiej kolejności, w jakiej są one w kodzie). To oznacza, że nawet jeśli podzielimy kod na części odpytujące i modyfikujące DOM, nie mamy gwarancji, że nie dojdzie do ich wymieszania (bo np. skrypt odpali dwie funkcje wpływające na DOM) [w ramach jednej ramki](https://developers.google.com/web/fundamentals/performance/rendering/). To może spowodować wspomniane już wcześniej zjawisko zaśmiecania układu strony i tym samym – spadek wydajności.

Na szczęście jest prosty sposób wymuszania, aby nasz kod modyfikujący strukturę strony odpalał się na początku kolejnej ramki – umieszczenie go w `requestAnimationFrame`. Pozostaje zatem problem odpowiedniego przekazania wszelkich naszych instrukcji DOM-owych do tego `requestAnimationFrame` tak, by zachować ich kolejność. Najłatwiej to zrobić po prostu przy pomocy kolejki zadań do wykonania – dokładnie to robi [biblioteka FastDom](https://github.com/wilsonpage/fastdom), a jej niezwykle prymitywną wersję opisywałem w swojej książce.

Zasada działania FastDom jest bardzo prosta: każdą operację na DOM zamykamy odpowiednio w `fastdom.measure` (jeśli chcemy odpytać DOM) lub `fastdom.mutate` (jeśli chcemy zmodyfikować DOM). Biblioteka te operacje zapisuje do tablicy, a następnie wywołuje `requestAnimationFrame`, w którym wszystkie zapisane operacje zostaną wykonane – najpierw odpytujące, a podem modyfikujące. Tym sposobem cała nasza interakcja z DOM przeszła od bycia synchroniczną do bycia asynchroniczną.

## Virtual DOM

Niemniej wydaje się, że środowisko JS-owe poszło w zupełnie inną stronę i wraz z popularyzacją Reacta został też spopularyzowany koncept Virtual DOM. Jest to bardzo prosta technika polegająca na… stworzeniu drzewka odzworowującego DOM. Tak, Virtual DOM to struktura drzewiasta imitująca inną strukturę drzewiastą.

Na pierwszy rzut oka nie ma to najmniejszego sensu, ale diabeł – jak zawsze – tkwi w szczegółach. Virtual DOM (vDOM), w przeciwieństwie do normalnego DOM, jest strukturą skrajnie uproszczoną, zawierającą jedynie najważniejsze informacje. Gdybyśmy wrócili do naszego wcześniejszego drzewka DOM, jego reprezentacja w vDOM mogłaby wyglądać mniej więcej tak (na podstawie implementacji w [bibliotece `virtual-dom`](https://github.com/Matt-Esch/virtual-dom/blob/master/vdom/README.md)):

```json
{
	"tagName": "HTML",
	"properties": {
		"lang": "pl"
	},
	"children": [
		{
			"tagName": "HEAD",
			"properties": {},
			"children": [
				{
					"tagName": "META",
					"properties": {
						"charset": "UTF-8"
					},
					"children": []
				},
				{
					"tagName": "TITLE",
					"properties": {},
					"children": [
						{
							"text": "Hello world"
						}
					]
				}
			]
		},
		{
			"tagName": "BODY",
			"properties": {},
			"children": [
				{
					"tagName": "H1",
					"properties": {},
					"children": [
						{
							"text": "Hello world!"
						}
					]
				}
			]
		}
	]
}
```

Jak widać, w porównaniu do normalnego DOM, vDOM jest o wiele prostszą strukturą. Poszczególne węzły nie zawierają żadnych metod, a jedynie podstawowe informacje pozwalające na wygenerowanie na tej podstawie prawdziwego DOM. Dodatkowo większość implementacji vDOM posiada mechanizm obliczania różnic pomiędzy dwoma drzewami. To pozwala na ominięcie renderowania całego drzewa DOM i jedynie zmiany tych elementów, które faktycznie zmodyfikowano.

Najbardziej naiwna implementacja takiego algorytmu obliczania różnic po prostu przechodziłaby w pętli po wszystkich węzłach w drzewie i porównywała poszczególne atrybuty i dzieci. Wyobraźmy sobie, że mamy prosty akapit:

```html
<p class="unread">Nie przeczytałeś mnie!</p>
```

W chwili, gdy wykryjemy, że użytkownik go przeczytał, zostaje on zamieniony na:

```html
<p class="read">Przeczytałeś mnie!</p>
```

Drzewka vDOM dla tego elementu przed i po zmianach wyglądałyby następująco:

```json
// Przed zmianami
{
	"tagName": "P",
	"properties": {
		"class": "unread"
	},
	"children": [
		{
			"text": "Nie przeczytałeś mnie!"
		}
	]
}

// Po zmianach
{
	"tagName": "P",
	"properties": {
		"class": "read"
	},
	"children": [
		{
			"text": "Przeczytałeś mnie!"
		}
	]
}
```

Napiszmy zatem prostą funkcję, która wykrywałaby istnienie zmian w danym węźle (nie obchodzi nas w tym momencie rodzaj zmian):

```javascript
function isNodeChanged( oldNode, node ) {
	// Jeśli przekazany węzeł to węzeł tekstowy, po prostu porównujemy zawartość.
	if ( typeof oldNode.text === 'string' ) {
		return oldNode.text !== node.text;
	}

	// Przeleć przez własności i sprawdź, czy któraś się zmieniła.
	const propertiesChanged = Object.entries( node.properties ).some( ( [ key, value ] ) => {
		return value !== oldNode.properties[ key ];
	} );

	// Przeleć przez dzieci i sprawdć, czy któreś się zmieniło.
	const childrenChanged = node.children.some( ( child, i ) => {
		// Najsensowniejszy sposób na to to rekurencja, bo przecież dzieci to
		// też węzły.
		return isNodeChanged( oldNode.children[ i ], child );
	} );

	// Zwracamy true/false w zależności, czy zmieniły się własności lub dzieci.
	return propertiesChanged || childrenChanged;
}
```

Jak widać, stosuję tutaj rekurencję, by przelecieć też po wszystkich potomkach danego węzła. W rzeczywistości takie algorytmy obliczania różnic są bardziej skomplikowane, gdyż, oprócz samego wykrywania różnic, muszą też określić, w jaki sposób najwydajniej wprowadzić wykryte zmiany oraz od którego węzła (bo jeśli zmieni się literka w stopce, to nie ma sensu zmieniać drzewa od elementu `html`). Niemniej samo ich istnienie pozwala ograniczyć liczbę operacji na DOM do niezbędnego minimum, co pozwala zachować wysoką wydajność.

Inną, poboczną korzyścią z korzystania z vDOM jest możliwość wykorzystywania tej struktury drzewiastej do generowania widoku aplikacji w miejscach, gdzie DOM jest niedostępny. To pozwala na zastąpienie szablonów jako ciągów tekstowych przestrzennymi strukturami danych choćby po stronie serwera. Z kolei sporą wadą vDOm jest większe zużycie pamięci (w końcu nowe drzewko trzeba gdzieś przechowywać).

## Virtual DOM 2.0

Jeszcze inną wadą związaną z vDOM jest fakt, że całe obliczanie różnic, a następnie aplikowanie ich, odbywa się synchronicznie. A to oznacza, że im większa jest nasza strona i im więcej na niej elementów, tym wykorzystanie vDOM zabiera więcej czasu. A więcej zabranego czasu to dłuższe blokowanie głównego wątku. A dłuższe blokowanie głównego wątku to strona niereagująca na działania użytkownika. Tym samym vDOM był równocześnie krokiem w przód (dodatkowa, niezwykle użyteczna warstwa abstrakcji), ale też i krokiem w tył (odejście od asynchronicznego podejścia z FastDom). W React 16 postanowiono ten palący problem rozwiązać.

Zaproponowane rozwiązanie jest koncepcyjnie podobne do tego z FastDom: zmiany nie są wykonywane natychmiast, ale _planowane_ do wykonania asynchronicznie. Najważniejszą różnicą jest stopień skomplikowania implementacji i wykorzystana technologia. React dzieli zmiany na tzw. <i lang="en">units of work</i> (ang. jednostki pracy), które są następnie planowane do wykonania (ang. <i lang="en">schedule</i>). Samo wykonanie odbywa się z kolei przy pomocy [`requestIdleCallback`](https://developers.google.com/web/updates/2015/08/using-requestidlecallback).

Podstawowa różnica pomiędzy `requestAnimationFrame` a `requestIdleCallback` polega na tym, że ta druga funkcja pozwala kontrolować _budżet wydajności_ przy pomocy parametru `deadline`. Parametr ten pozwala określić, ile nam jeszcze czasu zostało. A jak go już nie zostało, to przewalić zalegające zadania do kolejnego wywołania `requestIdleCallback`:

```javascript
requestIdleCallback( ( deadline ) => {
	while ( queue.length > 0 && ( deadline.timeRemaining() > 0 || deadline.didTimeout) ) {
		do( queue.shift() );
	}

	if ( queue.length > 0 ) {
		return requestIdleCallback( resumeWork );
	}
} );
```

Tym sposobem mamy większą kontrolę nad tym, jak przebiega asynchroniczne wykorzystanie DOM i pewność, że nadmiar zmian do wprowadzenia w żaden sposób nie wpłynie na responsywność aplikacji. To oczywiste rozwinięcie i ulepszenie idei asynchronicznego DOM-u.

## Wielowątkowe aplikacje i 120fps

`requestIdleCallback` to nasza teraźniejszość – a co czeka nas w przyszłości? Googlerzy już przymierzają się do [rozpoczęcia ery 120 fps-ów](https://dassur.ma/things/120fps/). By to osiągnąć, często proponuje się dość radykalne rozwiązanie: pozostawienie głównego wątku **wyłącznie** dla UI i jego logiki, podczas, gdy cała logika aplikacji będzie znajdowała się niejako w osobnym wątku, w [Web Workerze](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers). To sprawi, że nie będziemy się musieli przejmować tym, że jakieś kosztowne obliczenia lub inne operacje będą wpływać na to, że interfejs użytkownika nie odświeży się wystarczająco szybko. Dodając do tego techniki związane z asynchronicznym DOM-em (czy to te z FastDom, czy takie, jak implementuje React), dostajemy niezwykle wydajne rozwiązanie z bardzo jasno zarysowaną granicą pomiędzy warstwą prezentacji i logiki.

Co więcej, trwają wstępne prace nad [natywnym mechanizmem obliczania zmian w DOM, `DOMChangeList`](https://github.com/whatwg/dom/issues/270). Tym samym jedno z głównych zadań vDOM może zostać przerzucone na przeglądarkę, co pozwoli vDOM przenieść wyłącznie na serwery, a w przeglądarkach wycisnąć maksimum mocy wykorzystując to, co dostarcza przeglądarka.

Jak zatem widać, przyszłość asynchronicznego i wydajnego DOM rysuje się w naprawdę jasnych barwach. Jedynie można się zastanawiać, czemu popularyzacja tych – w gruncie rzeczy bardzo prostych – pomysłów zajęło tak długo (FastDom powstał ok. 2013 roku, 5 lat temu). Niemniej w końcu są popularne i DOM znów jest szybki!
