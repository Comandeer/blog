---
layout: post
title:  "Pakując manatki"
description: "Zaczynamy opakowywać czasomierze w pakiet npm!"
author: Comandeer
date: 2026-08-03T18:20:00+0200
project: czasomierze
tags:
    - javascript
comments: true
permalink: /pakujac-manatki.html
---

[Tak jak obiecałem](https://blog.comandeer.pl/podsumowanie-2025), na początku tego roku – w ten piękny zimowy dzionek – zajmujemy się zrobieniem z naszych czasomierzy pełnoprawnego pakietu npm!

<!--more-->

## Erm…

Dzięki temu, że mamy styczeń, mamy też mnóstwo czasu na… Że co? Że jest już sierpień?!

{% figure "../../../images/pakujac-manatki/blink-meme.jpg" "Mężczyzna w styczniu zamyka oczy, by mrugnąć, ale gdy je otwiera, jest już sierpień." "Ja w tym roku" %}

No więc tak, projekt czasomierzy zdecydowanie zaliczył poślizg – ale hej! To raptem tylko 7 miesięcy, [nie ma powodów do paniki](https://www.youtube.com/watch?v=NuAKnbIr6TE). Wróćmy może do kodu…!

## Tworzymy repozytorium

{% note %}

Ten artykuł zakłada, że masz zainstalowanego [gita](https://git-scm.com/install/) oraz [Node'a](https://nodejs.org/en/download) z [npm-em](https://docs.npmjs.com/cli/v12/configuring-npm/install).

{% endnote %}

Jeśli spojrzymy na stronę przykładowego pakietu npm, np. [Reacta](https://www.npmjs.com/package/react), zauważymy, że składa się ona z dwóch części: dokumentacji pakietu oraz dodatkowych informacji o nim (instrukcji instalacji, liczby pobrań, itd.). Większość pakietów wśród tych informacji zawiera także linka do repozytorium, w którym znaleźć można ich kod źródłowy – tak jest też [w przypadku Reacta](https://github.com/react/react). Najczęściej takie repozytorium jest hostowane na [GitHubie](https://github.com/) (GH). Na dzień dzisiejszy to największe miejsce, w którym rozwijane jest oprogramowanie open source. GitHub, jak sama nazwa wskazuje, został zbudowany wokół [systemu kontroli wersji git](https://git-scm.com/).

Z racji tego, że większość pakietów npm zaczyna się od repozytorium na GH i jest to w sumie dość wygodny sposób rozwijania oprogramowania open source, to nasze czasomierze również tam wylądują. W tym celu należy [stworzyć repozytorium](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository). W trakcie tworzenia GitHub zapyta nas o parę rzeczy:

* **Nazwa repozytorium** – z racji tego, że projekt nazywa się <cite>czasomierze</cite>, tak też wypada nazwać nasze repozytorium. Aczkolwiek nazwa może być całkowicie dowolna.
* **Opis** – krótki opis zawartości repozytorium. Można go całkowicie pominąć.
* **Widoczność repozytorium** – publiczne repozytoria są widoczne dla wszystkich, podczas gdy prywatne tylko dla nas i osób, które zaprosimy. W przypadku czasomierzy nie ma to większego znaczenia. Ja zwykle wybieram publiczne repozytoria, bo nie widzę potrzeby chowania kodu open source.
* **Szablon** – pewien czas temu GitHub dodał [szablony](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository), czyli specjalny typ repozytoriów, które można wykorzystywać jako punkt startowy do własnych projektów. W przypadku czasomierzy szablon nie jest nam potrzebny.
* **Plik `README`** – GitHub może stworzyć ten plik za nas.
* **Plik `.gitignore`** – GitHub może stworzyć za nas również ten plik. Z listy wybrać można wykorzystywaną technologię, żeby był jak najlepiej dostosowany do projektu. W naszym przypadku "Node" może się dobrze sprawdzić.
* **Plik `LICENSE`** – kolejny plik, który GitHub może wygenerować dla nas. Ja zwykle używam [licencji MIT](https://opensource.org/license/mit).

{% note %}

W dalszej części artykułu opisuję pokrótce te pliki.

{% endnote %}

Gdy już stworzymy repozytorium na GitHubie, wypada je [sklonować lokalnie](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository), by móc na nim pracować:

```shell
git clone git@github.com:Comandeer/czasomierze.git
```

## Tworzymy szkielet

Gdy już mamy repozytorium postawione, trzeba w nim dodać pewne podstawowe pliki.

### `.gitignore`

Zacznijmy od magicznego [pliku `.gitignore`](https://git-scm.com/docs/gitignore). Zawiera on listę plików i folderów, które git ma ignorować. Takie pliki nie znajdą się w repozytorium. Zwyczajowo omija się w ten sposób np. katalog `node_modules`, zawierający zależności, oraz katalog zawierający zbudowaną/skompilowaną wersję projektu. Stąd na potrzeby naszego projektu wypada dodać następujące wpisy do pliku:

```
dist/
node_modules/
```

{% note %}

Jeśli plik został wygenerowany przez GitHuba, prawdopodobnie zawiera już wszystkie potrzebne wpisy.

Natomiast kwestię pomijania akurat zależności i zbudowanej wersji pozwolę sobie poruszyć w osobnym artykule.

{% endnote %}

### `package.json`

[Plik `package.json`](https://docs.npmjs.com/cli/v12/configuring-npm/package-json/) to podstawowy plik w każdym pakiecie npm. Zawiera wszystkie najważniejsze informacje o nim, takie jak nazwa, lista zależności, skrypty itd. Nie musimy go jednak tworzyć ręcznie, możemy wykorzystać do tego [komendę `npm init`](https://docs.npmjs.com/cli/v12/commands/npm-install):

```shell
npm init --y
```

Komenda pyta o różne rzeczy, takie jak nazwa pakietu. Możemy to pominąc, dodając flagę `--y`. Informuje ona npm, że akceptujemy wszystkie sugerowane wartości. Dzięki temu powinniśmy dostać mniej więcej taki plik `package.json`:

```json
{
  "name": "czasomierze",
  "version": "1.0.0",
  "description": "A simpler and friendler timers.",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/Comandeer/czasomierze.git"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "type": "commonjs",
  "bugs": {
    "url": "https://github.com/Comandeer/czasomierze/issues"
  },
  "homepage": "https://github.com/Comandeer/czasomierze#readme"
}
```

Wprowadzimy do niego jednak kilka modyfikacji. Po pierwsze, pole `type` zmienimy z `commonjs` na `module`, a pole `main` zastąpimy [polem `exports`](https://nodejs.org/api/packages.html#exports):

```json
{
    "exports": {
        ".": {
            "types": "./dist/index.d.ts",
            "import": "./dist/index.js"
        }
    }
}
```

{% note %}

Dzięki tym zmianom informujemy npm oraz Node.js, że nasz pakiet jest w formacie ESM. Co to dokładnie oznacza, opiszę w jednych z kolejnych artykułów.

{% endnote %}

Dodamy też pole `files`:

```json
{
    "files": [
    	"dist"
    ]
}
```

Dzięki niemu przy publikacji pakietu zostaną opublikowane tylko pliki z katalogu `dist` – a więc skompilowana wersja naszej biblioteki.

{% note %}

Tak, publikacji pakietu również będzie poświęcony osobny artykuł.

{% endnote %}

A jak już mowa o skompilowanej wersji biblioteki mowa, to warto od razu [zainstalować](https://docs.npmjs.com/cli/v12/commands/npm-install) transpiler TypeScripta:

```shell
npm i -D typescript
```

Ta komenda zainstaluje najnowszą wersję TS-a i doda ją do zależności developerskich projektu. Potrzebujemy jeszcze skryptu, dzięki któremu zbudujemy naszą bibliotekę:

```json
{
	"scripts": {
		"build": "tsc"
    }
}
```

Dzięki temu będziemy mogli wywołać komendę `npm run build`, która stworzy z naszych plików TS pliki JS.

Warto także dodać autora (`author`), słowa kluczowe (`keywords`) czy opis (`description`). Osobiście zmieniam także wersję na niższą, jak `0.0.1` czy `0.1.0`. Pierwszą wersję bezpieczniej opublikować z takim _eksperymentalnym_ numerem, zamiast psuć sobie od razu _poważną_ wersję `1.0.0`, gdyby coś poszło nie tak.

Ostatecznie nasz plik `package.json` powinien wyglądać mniej więcej tak:

```json
{
  "name": "czasomierze",
  "version": "0.0.1",
  "description": "A simpler and friendler timers.",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/Comandeer/czasomierze.git"
  },
  "keywords": [
    "timers"
  ],
  "author": "Comandeer",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/Comandeer/czasomierze/issues"
  },
  "homepage": "https://github.com/Comandeer/czasomierze#readme",
  "devDependencies": {
    "typescript": "7.0.2"
  }
}
```

### `package-lock.json`

Po instalacji TypeScriptu powinien pojawić się plik `package-lock.json`. To plik zawierający dokładne informacje o zainstalowanych zależnościach i wersjach. Na ten moment nie musimy się nim martwić, wrócimy do niego w artykule o zależnościach.

### `tsconfig.json`

Żeby móc transpilować naszą bibliotekę, przyda się także [konfiguracja TypeScriptu](https://www.typescriptlang.org/tsconfig/), którą zapiszemy w pliku `tsconfig.json`:

```json
{
	"include": [
		"src/**/*"
	],
	"compilerOptions": {
		"rootDir": "./src",
		"outDir": "dist/",

		"module": "nodenext",
		"moduleResolution": "nodenext",
		"resolveJsonModule": true,
		"target": "esnext",
		"declaration": true,
		"declarationMap": true,
		"sourceMap": true,
		"skipLibCheck": true,
		"verbatimModuleSyntax": true,
		"allowImportingTsExtensions": true,
		"rewriteRelativeImportExtensions": true,

		"strict": true,
		"strictNullChecks": true,
		"exactOptionalPropertyTypes": true,
		"noImplicitOverride": true,
		"noUncheckedIndexedAccess": true,
		"noFallthroughCasesInSwitch": true,
		"noImplicitReturns": true,
		"noPropertyAccessFromIndexSignature": true
	}
}
```

Nie będę wchodził w szczegóły – to zdecydowanie temat na osobny artykuł. Wypada jedynie wspomnieć, że pole `include` zawiera listę plików, które mają zostać stranspilowane, natomiast opcja `compilerOptions.outDir` – ścieżkę do katalogu, w którym mają być zapisane wygenerowane pliki JS.

### `src/index.ts`

To plik zawierający kod naszych czasomierzy! To [niemal ten sam kod](https://blog.comandeer.pl/projektujemy-czasomierze#ca%C5%82o%C5%9B%C4%87-kodu), co w poprzednim artykule:

```typescript
type Hours = `${ number }h`;
type Minutes = `${ number }m`;
type Seconds = `${ number }s`;
type MiliSeconds = `${ number }ms`;
type Delay =
	| number
	| Exclude<
		`${ Hours | ''}${ Minutes | '' }${ Seconds | '' }${ MiliSeconds | ''}`,
		''
	>;

interface SetTimeoutOptions {
	signal?: AbortSignal;
}

export async function wait( // 1
	delay: Delay,
	{ signal }: SetTimeoutOptions = {}
): Promise<number> {
	return new Promise( ( resolve, reject ) => {
		if ( signal?.aborted ) {
			reject( signal.reason );

			return;
		}

		const delayInMs = convertDelayToMs( delay );
		const timeoutId = globalThis.setTimeout( () => {
			resolve( Date.now() );
		}, delayInMs );

		if ( signal !== undefined ) {
			signal.addEventListener( 'abort', () => {
				clearTimeout( timeoutId );
				reject( signal.reason );
			} );
		}
	} );
}

export async function* tick( // 2
	tick: Delay,
	options: SetTimeoutOptions = {}
): AsyncIterableIterator<number> {
	while ( true ) {
		yield wait( tick, options );
	}
}

interface DelayGroups {
	hours?: Hours;
	minutes?: Minutes;
	seconds?: Seconds;
	miliseconds?: MiliSeconds;
}

function convertDelayToMs( delay: Delay ): number {
	if ( typeof delay === 'number' ) {
		return delay;
	}

	const delayRegex = /^(?<hours>\d+h)?(?<minutes>\d+m(?!s))?(?<seconds>\d+s)?(?<miliseconds>\d+ms)?$/;
	const matched = delay.match( delayRegex );
	const { hours, minutes, seconds, miliseconds } = matched!.groups as DelayGroups;
	let totalDelay = 0;

	if ( hours !== undefined ) {
		totalDelay += removeUnit( hours ) * 3600000;
	}

	if ( minutes !== undefined ) {
		totalDelay += removeUnit( minutes ) * 60000;
	}

	if ( seconds !== undefined ) {
		totalDelay += removeUnit( seconds ) * 1000;
	}

	if ( miliseconds !== undefined ) {
		totalDelay += removeUnit( miliseconds );
	}

	return totalDelay;
}

function removeUnit( delay: Hours | Minutes | Seconds | MiliSeconds ): number {
	return Number( delay.replaceAll( /[a-z]/g, '' ) );
}

```

Pojawiła się w nim tylko jedna, mała zmiana: funkcje `wait()` (1) i `tick()` (2) są eksportowane. Dzięki temu, gdy ktoś zainstaluje nasz pakiet, będzie mógł go użyć w swoim kodzie:

```typescript
import { wait, tick } from 'czasomierze';

await wait( '5s' );

for await ( const _ of tick( 1000 ) ) {
    console.log( 'tick' )
}
```

Skoro już mamy plik z kodem, to możemy przy okazji przetestować, czy nasz kod poprawnie się transpiluje. W tym celu wystarczy wywołać polecenie:

```shell
npm run build
```

Jeśli wszystko pójdzie dobrze, powinien pojawić się katalog `dist`, a w nim plik `index.js` z kodem JS naszej biblioteki.

### `README.md`

W tym pliku znajduje się opis projektu wraz z podstawową dokumentacją. To jego zawartość widać zarówno na npm-ie, jak i GitHubie. Dobrze więc, żeby był jak najbardziej czytelny i zawierał wszystkie potrzebne informacje. Osobiście stosuję taki szablon:

````markdown
# <nazwa pakietu

<informacyjne tarcze>

<Opis projektu w jednym zdaniu>

## Installation

```bash
npm install <nazwa pakietu>
```

## Usage

<Przykład użycia, najlepiej z kodem>

<Dodatkowe sekcje z potrzebnymi informacjami>

## License

See [LICENSE](./LICENSE) file for details.
````

Dla czasomierzy plik `README.md` może wyglądać następująco:

````markdown
# czasomierze

Simpler and friendler timers.

## Installation

```bash
npm install czasomierze
```

## Usage

```typescript
import { wait, tick } from 'czasomierze';

await wait( 5000 ); // Waits for 5 seconds
await wait( '10m' ) // waits 10 minutes

for await ( const _ of tick( '1s' ) ) {
	console.log( 'tick' ); // Logs in 1 second intervals
}
```

## License

See [LICENSE](./LICENSE) file for details.
````

{% note %}

Choć nie ma obowiązku tworzenia pliku `README.md` w języku angielskim, to jednak jest on de facto standardem w branży. Jeśli chcemy dodać także informacje w innym języku, można stworzyć dodatkowe pliki `README-<kod języka>.md`, np. `README-pl.md` dla języka polskiego.

{% endnote %}

### `LICENSE`

Ten plik zawiera treść licencji, na której rozprowadzamy nasze oprogramowanie. Osobiście w większości przypadków wybieram [licencję MIT](https://opensource.org/license/mit). Z kolei npm proponuje domyślnie [licencję ISC](https://opensource.org/license/isc) – która jest praktycznie tożsama z MIT. Strona [<cite lang="en">Choose an open source license</cite>](https://choosealicense.com/) zawiera więcej licencji przeznaczonych dla projektów open source.

Licencje open source to oczywiście niejedyny możliwy wybór. Niektóre pakiety npm są na licencjach komercyjnych (wówczas najczęściej nie linkują też do repozytorium z kodem). Coraz popularniejsze robią się także licencje typu [<i lang="en">source-available</i>](https://en.wikipedia.org/wiki/Source-available_software), które np. mogą mieć dodatkowe ograniczenia dotyczące komercyjnego wykorzystania kodu.

### `CONTRIBUTING.md`

Ten plik zawiera [informacje dla osób, które chcą dołączyć do projektu](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors). Powinien wskazywać, w jaki sposób zakładać nowe [issues](https://docs.github.com/en/issues/tracking-your-work-with-issues/learning-about-issues/quickstart), jakie wymogi muszą spełniać [PR-y](https://docs.github.com/en/pull-requests/reference/pull-requests), jaki styl kodu jest używany w projekcie, itd. Jeśli nasz projekt jest małym, prywatnym projektem, to raczej można się obejść bez tego pliku. Natomiast jeśli chcemy go rozwijać na większą skalę, to taki plik warto dodać prędzej niż później.

### `CHANGELOG.md`

Jeśli ktoś chce się szybko zorientować, co zmieniło się w naszej bibliotece, najczęściej zagląda właśnie do pliku `CHANGELOG.md`. Ten plik w czytelny sposób powinien opisywać, jakie rzeczy zmieniły się w poszczególnych wersjach. Jest wiele przyjętych formatów tego pliku, ja osobiście stosuję [<cite lang="en">Keep a Changelog</cite>](https://keepachangelog.com/en/1.1.0/):

```markdown
# czasomierze Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

---

## 0.1.0
### Added
* First working version, yay!

```

### `.github`

W tym katalogu znajdują się [ustawienia _społecznościowe_ GitHuba](https://docs.github.com/en/communities), pozwalające zmienić np. [szablony dla nowych issues](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository) czy [szablon dla nowych PR-ów](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/creating-a-pull-request-template-for-your-repository). Można w nim także umieścić wspomniany już plik `CONTRIBUTING.md`.

### `.editorconfig`

Ten plik zawiera ustawienia dla edytora kodu w formacie [EditorConfig](https://editorconfig.org/). Format ten jest rozpoznawany przez wiele różnych edytorów (niektóre wymagają rozszerzeń, jak np. [VSC](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)). Dzięki niemu można ustawić m.in. preferowany styl nowych linii czy szerokość i styl wcięć.  Mój standardowy plik `.editorconfig` wygląda następująco:

```ini
root = true

# Unix-style newlines with a newline ending every file
[*]
end_of_line = lf
insert_final_newline = true
indent_style = tab
indent_size = 4

[*.yml]
indent_style = space
indent_size = 2

[package.json]
indent_style = space
indent_size = 2
```

### `.nvmrc`

Jeśli mamy zainstalowaną tylko jedną wersję Node'a na komputerze, ten plik nie jest nam do niczego potrzebny. Niemniej, gdy pracuje się nad kilkoma projektami równocześnie, bardzo szybko się okazuje, że różne projekty potrzebują różnych wersji Node. I tutaj na pomoc przychodzą managery wersji Node'a. Osobiście stosuję [nvm](https://github.com/nvm-sh/nvm), stąd plik konfiguracyjny `.nvmrc`. W przypadku naszego projektu można skonfigurować nvm, żeby zawsze używał najnowszej dostępnej wersji Node'a:

```
node
```

### `.gitattributes`

[Plik `.giattributes`](https://git-scm.com/docs/gitattributes) ustawia atrybuty dla wybranych plików. Na ten moment nie będziemy się wgłębiać, co to dokładnie oznacza – na to przyjdzie czas w osobnym artykule. Na potrzeby naszego projektu starczy nam taki plik `.gitattributes`:

```
* text=auto
*.js eol=lf
*.ts eol=lf
```

### Podsumowanie

Nasz szkielet powinien wyglądać mniej więcej tak:

```
| - .github/
|   | - ISSUE_TEMPLATE.md
|   | - PULL_REQUEST_TEMPLATE.md
| - src/
|   | - index.ts
| - .editorconfig
| - .gitattributes
| - .gitignore
| - .nvmrc
| - CHANGELOG.md
| - CONTRIBUTING.md
| - LICENSE
| - package-lock.json
| - package.json
| - README.md
| - tsconfig.json
```

Możemy go teraz [scomiitować](https://github.com/git-guides/git-commit) i [wypchnąć do repozytorium](https://github.com/git-guides/git-push):

```shell
git add . && git commit -m "chore: Add skeleton" && git push origin main
```

{% note %}

O śmiesznym formacie commitów (`chore: <treść>`) porozmawiamy kiedy indziej!

{% endnote %}

I tym oto sposobem [nasze repozytorium](https://github.com/Comandeer/czasomierze) zawiera działający zalążek pakietu npm!

## Co dalej?

Postawiliśmy repozytorium na GitHubie i ogarnęliśmy szkielet pakietu npm. Dalszą pracę rozbijemy na zdecydowanie mniejsze etapy (totalnie nie po to, żeby łatwiej mi się pisało posty…). W następnych odcinkach przyglądniemy się bliżej niektórym plikom w repozytorium, dodamy testy i lintery, a na końcu – opublikujemy paczkę w npmie!
