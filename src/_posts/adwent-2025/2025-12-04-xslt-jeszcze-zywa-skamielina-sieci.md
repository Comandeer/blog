---
layout: post
title: "XSLT – (jeszcze) żywa skamielina Sieci"
description: "XSLT to niszowa technologia, nawet jak na technologie oparte o XML"
author: Comandeer
date: 2025-12-04T00:50:00+0100
tags:
    - adwent-2025
    - standardy-sieciowe
comments: true
permalink: /xslt-jeszcze-zywa-skamielina-sieci.html
---

Do zabawy z XSLT przymierzałem się od dłuższego czasu. Aż w końcu [Chromium ogłosiło, że ma zamiar usunąć tę technologię z przeglądarki](https://github.com/whatwg/html/issues/11523). I… cóż, zrobiło się dziwnie. [_Bardzo_ dziwnie](https://github.com/whatwg/html/issues/11590). Niemniej jest to też naprawdę ostatni moment, żeby spojrzeć na tę żywą skamielinę Sieci, zanim zniknie na dobre.<!--more-->

## Monstrum, albo XSLT opisanie

XSLT, a dokładniej [<i lang="en">eXtensible Stylesheet Language Transformations</i> (Transformacje Rozszerzalnego Języka Stylów)](https://www.w3.org/TR/xslt-10/), to standard, który stał się rekomendacją w listopadzie _1999_ roku. To były tak dawne czasy, że wtedy nie interesowałem się jeszcze webdevem! Nazwa tego języka oddaje bardzo dobrze, czym on jest. W największym skrócie: to język szablonów, stworzony przez kogoś fanatycznie zafascynowanego XML-em. Jeśli to brzmi źle, to dalej jest już tylko gorzej. Cały proces _transformacji_ polega na dołączeniu do dokumentu XML specjalnego [_arkusza stylów_](https://developer.mozilla.org/en-US/docs/Web/XML/Guides/XML_introduction#displaying_xml). Ten arkusz stylów, przy pomocy selektorów [XPath](https://developer.mozilla.org/en-US/docs/Web/XML/XPath), pozwala zamieniać wybrane elementy XML na inne elementy XML, tekst lub HTML.

Powstały trzy wersje tego standardu: [1.0](https://www.w3.org/TR/xslt-10/), [2.0](https://www.w3.org/TR/xslt20/) oraz [3.0](https://www.w3.org/TR/xslt-30/). Przeglądarki doczekały się obsługi tylko wersji 1.0. Oczywiście zaimplementowały ją w taki sposób, żeby nie dało się napisać sensownego arkusza XSLT, działającego we wszystkich przeglądarkach. Więc jakakolwiek próba transformacji XML-a sprowadza się do odświeżania dokumentu XML w Chrome, Firefoksie i Safari i patrzenia, czy nic nie wybuchło. A jeśli wybuchło, to wtedy trzeba zerknąć do Firefoksa, bo tylko on wyświetla komunikaty o błędach. Które, a jakże by inaczej, są całkowicie niepomocne – co jest problemem z [drakońską obsługą błędów XML](https://www.w3.org/html/wg/wiki/DraconianErrorHandling) _od zawsze_. Innymi słowy: XSLT to system szablonów, który robi absolutnie wszystko, żeby z niego nie korzystać.

Zresztą, nie ma za bardzo powodów, dla których ktoś _miałby_ korzystać z XML-owych transformacji w internecie, w którym [XHTML 2.0 przegrał walkę z HTML-em](https://kornel.ski/xhtml). A jak już ktoś by chciał, to praktycznie wszystkie rzeczy możliwe w XSLT można zrobić łatwiej dowolnym systemem szablonów na serwerze. Nie dość, że składnia będzie przyjemniejsza, to jeszcze odpada problem nieprawidłowego wyświetlania w różnych przeglądarkach. Jeśli natomiast ktoś bardzo nie lubi robienia rzeczy na serwerze, to może wybrać dowolny framework JS-owy. I znów: zrobi daną rzecz o wiele łatwiej. A jak ktoś już naprawdę _musi_ skorzystać z XSLT, to… [może to zrobić na serwerze](https://en.wikipedia.org/wiki/Saxon_XSLT), korzystając z najnowszej wersji standardu, a nie antycznej i zabugowanej w przeglądarkach.

Zatem tak, absolutnie nic dziwnego, że ktoś w końcu stwierdził, że pora pozbyć się przestarzałej technologii, która jedynie powoduje problemy z bezpieczeństwem (ten kod ma z dobre 25 lat!), ale przynajmniej nie działa poprawnie. I dziwią mnie aż tak spore emocje, jakie ta decyzja wywołała. Owszem, śmierć dowolnej technologii sieciowej jest smutna. Ale XSLT nie znika! Zostaje jedynie usunięte z przeglądarek. Co prawda, w idealnym świecie zamiast usunięcia XSLT, doczekalibyśmy się [implementacji XSLT 3.0 w przeglądarkach](https://github.com/whatwg/html/issues/11578), ale nie żyjemy w idealnym świecie. Nikt nie wyłoży forsy na implementację, a następnie utrzymywanie, [niszowej technologii](https://github.com/whatwg/html/issues/11523#issuecomment-3152491911) w przeglądarkach.

Aczkolwiek istnieje jeden przypadek, w którym XSLT okazuje się niezastąpione: [wyświetlanie RSS-a/Atoma w sposób czytelny dla człowieka](https://martin-fieber.de/blog/feed-at-its-best/). I właśnie do tego chciałem użyć XSLT. Nawet jeśli efekt mojej pracy zobaczy jedna osoba (i zapewne będę to ja podczas testowania).

## XPath

Zanim jednak przejdziemy bezpośrednio do XSLT, warto na chwilę zatrzymać się nad cichym bohaterem drugiego planu – [XPathem](https://www.w3.org/TR/xpath/). Jest to język selektorów, pozwalający precyzyjnie wyszukiwać elementy w drzewie XML. Choć doczekał się kilku wersji (najnowsza to 3.1), to przeglądarki, podobnie jak w przypadku XSLT, [zatrzymały się na wersji 1.0](https://github.com/whatwg/dom/issues/903).

Od razu nasuwa się pytanie, po co nam osobny język selektorów, skoro mamy CSS? Cóż, XPath powstał w 1999 roku, kiedy CSS był o wiele mniej zaawansowanym tworem niż obecnie. Ba, XPath, nawet w wersji 1.0, posiada kilka ficzerów, których CSS (wciąż) nie ma, np. wyszukiwanie elementów po zawartości:

```
//*[contains(text(), "teraz")]
```

Ten selektor pobierze wszystkie elementy, które zawierają w sobie słowo <q>teraz</q>. Przy okazji możemy przyjrzeć się składni selektora:

* `//` oznacza, że chcemy szukać w całym dokumencie,
* `*[]` oznacza dowolny element, który spełnia warunek w nawiasach,
* `contains(A, B)` to funkcja sprawdzająca, czy wartość `A` zawiera w sobie wartość `B`,
* `text()` to funkcja zwracająca tekstową zawartość danego elementu.

Działanie takiego selektora można przetestować przy pomocy [JS-owego API](https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Guides/Introduction_to_using_XPath_in_JavaScript):

```javascript
const elements = document.evaluate( // 1
	'//*[contains(text(), "teraz")]', // 2
	document, // 3
	null, // 4
	XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, // 5
	null // 6
);

for ( let i = 0; i < elements.snapshotLength; i++ ) { // 7
	console.log( elements.snapshotItem(i) ); // 8
}
```

Do zmiennej `elements` zapisujemy wynik wywołania metody `document#evaluate()` (1). Metodzie tej przekazujemy selektor (2), węzeł, od którego chcemy rozpocząć przeszukiwanie (3), funkcję zajmującą się rozwiązywaniem [XML-owych przestrzeni nazw](https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/Namespaces_crash_course) (4), typ wyniku, jaki ma zwrócić zapytanie (5), oraz wynik poprzedniego zapytania, który ma być ponownie użyty (6). Następnie możemy przeiterować pętlą po wyniku (7) i przy pomocy metody `#snapshotItem()` dostać się do wybranego elementu (8).

Tak, to API jest całkowicie absurdalne, zwłaszcza, gdy porówna się go do [`document.querySelectorAll()`](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll), które korzysta z CSS-a. Dlatego też XPath praktycznie nie jest nigdzie używany – a przynajmniej: nie przez JS-owe API.

Można też np. wyciągnąć zawartość atrybutów:

```
//a/@href
```

Ten selektor pobierze wartości atrybutów `[href]` ze wszystkich elementów `a` w dokumencie.

Można również dokładniej określić miejsce elementu w strukturze:

```
/html/body
```

Ten selektor pobierze element `body` znajdujący się bezpośrednio w elemencie `html`. Natomiast poniższy:

```
/html//p
```

Wszystkie elementy `p` będące potomkami elementu `html`. Wyrażenie `//` pozwala pominąć dowolną liczbę poziomów drzewa.

Ok, przejdźmy do ciekawszych rzeczy.

## Transformujemy Atoma

Na blogu korzystam z formatu [Atom](https://en.wikipedia.org/wiki/Atom_(web_standard)), żeby udostępniać blog osobom korzystającym z [agregatorów wiadomości/czytników kanałów/feed readerów](https://en.wikipedia.org/wiki/News_aggregator). Upodobnijmy zatem moje kanały (feedy) do HTML-owej wersji bloga. Na sam początek stworzymy plik `feed-stylesheet.xsl` i podlinkujemy go w plikach kanałów:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/feed-stylesheet.xsl"?>
<feed xmlns="http://www.w3.org/2005/Atom">[…]</feed>
```

Przejdźmy do samego arkusza. Na początku tworzymy jego szkielet:

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
</xsl:stylesheet>
```

Stworzyliśmy element `xsl:stylesheet`, który korzysta z przestrzeni nazw XSLT. Dodatkowo dodaliśmy drugą przestrzeń nazw (`atom`) dla Atoma – będzie nam to potrzebne do stworzenia poprawnych selektorów.

Wszystkie pozostałe elementy arkusza muszą się znaleźć wewnątrz elementu `xsl:stylesheet`. Pierwszym z nich jest `xsl:output`, określający, jaką treść chcemy wyświetlić:

```xml
<xsl:output method="html" doctype-system="about:legacy-compat" indent="yes" />
```

Ten element informuje, że chcemy dostać HTML-a (`[method=html]`). Natomiast atrybut  `[doctype-system]` wskazuje, jaki `DOCTYPE` chcemy wygenerować. Podajemy tutaj `about:legacy-compat`, co wymusza wygenerowanie tzw. [<i lang="en">DOCTYPE legacy string</i> (przestarzałego ciągu tekstowego DOCTYPE)](https://html.spec.whatwg.org/multipage/syntax.html#doctype-legacy-string). Inaczej Firefox w ogóle nie chce wygenerować poprawnego `DOCTYPE`. Ukłon dla Bena Nadela, bo to [jego blogpost](https://www.bennadel.com/blog/3770-using-xslt-and-xml-transformations-to-style-my-blogs-rss-feed-as-an-html-page.htm) podsunął mi rozwiązanie tego problemu.

Następnie tworzymy szablon dla naszego kanału:

```xml
<xsl:template match="/atom:feed">
	<html lang="pl">
		<head>
			<!-- tutaj metadane strony i arkusze stylów-->
		</head>
		<body>
			<!-- Tutaj glówna treść-->
		</body>
	</html>
</xsl:template>
```

Atrybut `[match]` określa, dla jakich elementów dany szablon ma być zastosowany. W naszym przypadku – dla elementu `feed` w przestrzeni nazw Atom (czyli dla głównego elementu). W szablonie generujemy elementy HTML, które chcemy wyświetlić.

W `head` możemy umieścić tytuł strony:

```xml
<head>
	<xsl:value-of select="./atom:title" />
</head>
```

Element `xsl:value-of` wyświetla tekstową zawartość elementu wskazywanego przez atrybut `[select]`. W tym przypadku chcemy wyświetlić zawartość elementu `atom:title` znajdującego się bezpośrednio w obecnym elemencie. A że jesteśmy w szablonie dla elementu `/atom:feed`, to ten selektor jest równoważny takiemu:

```
/atom:feed/atom:title
```

Natomiast w `body` możemy wyświetlić poszczególne wpisy:

```xml
<xsl:for-each select="./atom:entry">
	<article>
		<h2>
			<a href="{ ./atom:link[@href]/@href }">
				<xsl:value-of select="./atom:title" disable-output-escaping="yes" />
			</a>
		</h2>
		<xsl:value-of select="./atom:content" disable-output-escaping="yes" />
	</article>
</xsl:for-each>
```

Element `xsl:for-each` pozwala na stworzenie pętli po wszystkich elementach wskazywanych przez atrybut `[select]`. Dla każdego wpisu (elementu `atom:entry`) tworzymy element `article` z nagłówkiem i treścią. Treść (zawartość elementu `atom:content`) jest wyświetlana przy pomocy znanego już nam atrybutu `xsl:value-of`, ale pojawia się w nim nowy atrybut, `[disable-output-escaping]`. Wyłącza on znaki ucieczki wokół treści elementu, dzięki czemu może ona zostać zinterpretowana jako HTML. Jest to możliwe dlatego, że w swoim Atomie treść wpisów otoczyłem w sekcję `CDATA`, wewnątrz której znajduje się surowy HTML:

```xml
<content type="html"><![CDATA[<p>Treść zawierająca HTML</p>]]&gt;</content>
```

Bez wyłączenia znaków ucieczki treść zostałaby odpowiednio sparsowana:

```xml
&lt;p&gt;Treść zawierająca HTML&lt;/p&gt;
```

Wyłączenie tego procesu sprawia, że treść jest interpretowana tak, jakby została wstawiona przy pomocy [`innerHTML`](https://developer.mozilla.org/en-US/docs/Web/API/Element/innerHTML).

Zawartość linku do artykułu również została tak obsłużona. Jednak o wiele ciekawszy jest atrybut `[href]` tego linku. Okazuje się, że XSLT miał swoją formę wąsów, których można było użyć do generowania atrybutów. W naszym przypadku wykorzystujemy atrybut `[href]` elementu `atom:link`.

Warto przy tym zwrócić uwagę, że pętla `xsl:for-each` zmienia kontekst wyszukiwania: `.` wewnątrz pętli wskazuje na aktualny element `atom:entry`.

I to w sumie tyle z takich _ciekawych_ technikaliów. [Finalny kod arkusza XSLT](https://blog.comandeer.pl/feeds/stylesheet.xsl) zawiera do tego różni się głównie HTML-em. Skopiowałem bowiem kod strony głównej, żeby jak najbardziej upodobnić do niej kanał.

## Jak to działa?

Powiedziałbym, że… zadziwiająco dobrze! W Chrome kanał Atom wygląda praktycznie identycznie jak strona główna:

{% figure "../../images/xslt-jeszcze-zywa-skamielina-sieci/chrome.png" "Fragment strony z paskiem tytułowym, pod którym znajduje się tytuł bloga &quot;Comandeerowy blog&quot; wraz z mottem, a poniżej znajduje się fragment wpisu &quot;W gąszczu jednakowości&quot; z poprawnie wyświetlonym bloczkiem kodu; całość korzysta z ciemnego motywu." %}

W Safari wynik jest praktycznie identyczny:

{% figure "../../images/xslt-jeszcze-zywa-skamielina-sieci/safari.png" "Identycznie wyglądająca strona, jak w przypadku Chrome." %}

Jeśli miałbym obstawiać, to jest to spowodowane [wspólną historią obydwu przeglądarek](https://techcrunch.com/2013/04/03/google-forks-webkit-and-launches-blink-its-own-rendering-engine-that-will-soon-power-chrome-and-chromeos/) i Chrome po prostu odziedziczył kod po Safari.

Natomiast w Firefoksie jest spory problem:

{% figure "../../images/xslt-jeszcze-zywa-skamielina-sieci/firefox.png" "Fragment strony z paskiem tytułowym, pod którym znajdują się tytuł bloga &quot;Comandeerowy blog&quot; wraz z mottem, a poniżęj znajduje się nagłówek wpisu &quot;W gąszczu jednakowości&quot;, pod którym zamiast poprawnie wyświetlonej treści znajduje się kod źródłowy HTML." %}

Firefox odmawia interpretowania treści postu jako HTML. Mimo moich poszukiwań, większość materiałów wskazywało właśnie na [`xsl:value-of` jako sposób na zamianę `CDATA` na HTML](https://p2p.wrox.com/xslt/2252-cdata-xml-convert-html.html). Żeby to faktycznie zaczęło działać, musiałbym prawdopodobnie całkowicie zrezygnować z `CDATA` i po prostu mielić mój HTML do XHTML-a wyłącznie na potrzeby Atoma. Dla tak niszowego ficzera to się po prostu nie opłaca. Więc, cóż, w Firefoksie będzie zepsute…

Chociaż jest szansa, że za niedługo problem sam zniknie. W moim [Chrome dev](https://www.google.com/chrome/dev/) bowiem już obsługa XSLT jest wyłączona:

{% figure "../../images/xslt-jeszcze-zywa-skamielina-sieci/chrome-dev.png" "Nieostylowany plik XML, nad którym przeglądarka wyświetliła komunikat &quot;This document cannot be formatted as intended. It uses XSLT, which the browser does not support. You might be able to install a browser extension that allows you to view it.&quot;." %}

Wspomniane [rozszerzenie przeglądarki](https://chromewebstore.google.com/detail/xslt-polyfill/hlahhpnhgficldhfioiafojgdhcppklm) zostało [przygotowane przez Masona Freeda](https://github.com/whatwg/html/issues/11523#issuecomment-3145903171) w ramach procesu usuwania XSLT z Chrome'a. Obecnie używają go aż 184 osoby – czyli mniej więcej tyle, ile wypowiedziało się w dyskusji o ubiciu XSLT w przeglądarkach. Innymi słowy: XSLT w przeglądarkach raczej można uznać za martwe.

Tak oto kończy się historia technologii, która nigdy nie podbiła Sieci.
