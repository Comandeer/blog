---
layout: post
title:  "Szkic architekturalny"
description: Krótki opis podstawowych założeń architektonicznych ComSemRela.
author: Comandeer
date: 2017-03-13T23:20:00+0100
tags:
    - daj-sie-poznac-2017
comments: true
permalink: /szkic-architekturalny.html
redirect_from:
    - /daj-sie-poznac-2017/2017/03/13/szkic-architekturalny.html
---

Technologię już wybrałem, pora zatem w kilku słowach opisać, jak mniej więcej wyobrażam sobie architekturę ComSemRela.<!--more-->

## Aplikacja konsolowa jako trzon

Głównym pakietem całego projektu bez wątpienia będzie [`comsemrel`](https://github.com/ComSemRel/comsemrel), czyli prosta aplikacja konsolowa. Będzie ona umożliwiała zrobienie dwóch podstawowych rzeczy: stworzenie pliku konfiguracyjnego dla ComSemRela oraz odpalenie i kontrolowanie samego procesu release'owania.

Jak zatem widać, aplikację tę można podzielić na <b>komendy</b> – i tak właśnie mam zamiar uczynić. Komenda stanie się podstawową jednostką architektoniczną. Na chwilę obecną przewiduję ich aż 3:

*   `help`
*   `init`
*   `release`

Oprócz komend sama aplikacja konsolowa będzie jeszcze posiadać <b>renderer</b>, czyli małą bibliotekę, która pozwoli jej wyświetlać wyniki swoich działań w konsoli. Najprawdopodobniej w tym celu użyję [`inquirer`a](https://www.npmjs.com/package/inquirer), być może opakowanego w jakiś prosty wrapper. W idealnym świecie całość powinna wyglądać mniej więcej tak:

```javascript
const comsemrel = new CliApp( require( './commands' ), require( 'inquirer' ) );

comsemrel.render( userInput );
```

Tyle! Do takiego prostego kodu powinien się sprowadzać kod pakietu `comsemrel`. Oczywiście cała magia będzie odbywać się pod spodem i będzie podzielona na jak najmniejsze [mikropakiety](http://developer.telerik.com/content-types/opinion/era-micro-packages/) (praktycznie każda komenda będzie posiadała swój własny pakiet), umieszczone w scope `@comsemrel`.

## Komenda `init`

Tę komendę będzie można podzielić na 3 etapy:

*   wykrycie środowiska projektu,
*   wyświetlenie kreatora konfiguracji użytkownikowi,
*   zapisanie konfiguracji do pliku `.comsemrelrc`, `.comsemrel.yml` lub podobnego.

Najciekawszym i jedynym wartym omówienia podpunktem z tej listy jest bez wątpienia wykrycie środowiska projektu. ComSemRela będą interesowały trzy rzeczy:

*   hosting kodu (GitHub, BitBucket, GitLab, inny git),
*   manager pakietów (npm, w przyszłości być może inne, np. Composer),
*   środowisko CI (na razie planuję tylko Travisa).

Manager pakietów i środowisko CI można łatwo wykryć analizując pliki znajdujące się w repozytorium, np. wiadomo, że `package.json` wskazuje na npm, `composer.json` na Composera, `.travis.yml` na Travisa itd. Z kolei hosting kodu bardzo łatwo wykryć wywołując komendę `git remote -v` i pobierając wyświetlone linki, np:

```bash
$ git remote -v
origin	git@github.com:Comandeer/blog.git (fetch)
origin	git@github.com:Comandeer/blog.git (push)
```

I już wiemy, że użytkownik używa GitHuba.

Problem polega na tym, że kombinacji tych elementów jest _nieskończenie wiele_ i nawet wspieranie choćby 10 najpopularniejszych może się skończyć pakietem ważącym kilkadziesiąt megabajtów albo i więcej. Dlatego w mojej głowie zrodził się szaleńczy pomysł: **warunkowa instalacja pakietów**. Cały zabieg jest bardzo prosty: na oficjalnej stronie ComSemRela będzie znajdował się plik, w którym nazwy plików i adresy hostingów kodu znalezione w projekcie będą sparowane z dostępnymi pluginami dla ComSemRela, np.

```json
{
	"code-hosting": {
		"github.com": "@comsemrel/github-init-creator"
	},

	"package-manager": {
		"package.json": "@comsemrel/npm-init-creator"
	},

	"ci": {
		".travis.yml": "@comsemrel/travis-init-creator"
	}
}
```

ComSemRel będzie pobierał ten plik i następnie dopasowywał uzyskane w projekcie informacje do tych z pliku. Na sam koniec zainstaluje wymagane pakiety przy pomocy `npm install -g` (globalnie, bo sam ComSemRel w końcu też jest globalnym pakietem), od razu je załączy i wykorzysta do wygenerowania kreatora konfiguracji:

```javascript
installPackages( [ packages ] )
.then( requirePackages )
.then( renderConfigWizard );
```

Chyba nie muszę zaznaczać, że sama instalacja pakietów dostanie swój własny, uroczy pakiet (mikropakiety – FTW!).

Brzmi jak totalne szaleństwo? Pewnie tak, ale to nasensowniejszy sposób ze wszystkich, które mi przyszły do głowy.

## Komenda `release`

Ta komenda jest o wiele prostsza. To po prostu prosta implementacja task runnera jest: dostaje listę zadań i wykonuje je po kolei. Najprawdopodobniej użyję tutaj wzorca middleware… ale to zasługuje na osobnego posta. Na chwilę obecną zamysł jest taki, że ComSemRel na podstawie konfiguracji zainstaluje potrzebne pakiety (tym razem lokalnie, dla konkretnego projektu), a następnie po prostu wykona zawarty w nich kod. Brzmi prosto, ale pewnie i tak przy tym osiwieję.

---

Brzmi jak prosty plan, prawda? I właśnie dlatego tak bardzo się tego boję…
