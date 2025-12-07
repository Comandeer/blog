---
layout: post
title: "Całkowicie swobodna dyskusja"
description: "Druga część walki z komentarzami na blogu. Tym razem mierzymy się z komentarzami do nowych wpisów!"
author: Comandeer
date: 2025-12-08T00:10:00+0100
project: blog
tags:
    - adwent-2025
    - javascript
comments: true
permalink: /calkowicie-swobodna-dyskusja.html
---

Wczoraj opisałem [częściowe rozwiązanie problemu z komentarzami](https://blog.comandeer.pl/swobodna-dyskusja). Dzisiaj pora zająć się drugą częścią problemu i pozbyć się go raz na zawsze!<!--more-->

## Co udało się dotąd osiągnąć?

Dla przypomnienia: [problem z komentarzami](https://github.com/Comandeer/blog/discussions/51) polegał na tym, że nie istniały dyskusje dla wszystkich wpisów. Przez to osoby, które nie zaakceptowały ciasteczek, nie miały możliwości dodawania komentarzy.

Dlatego stworzyłem skrypt, który sprawdza, jakie dyskusje istnieją, a następnie tworzy wszystkie brakujące. W tym celu wykorzystałem [APi GitHuba](https://docs.github.com/en/graphql) i [personalny token dostępowy](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens). Niemniej to rozwiązanie naprawia komentarze tylko już w istniejących wpisach. Jeśli teraz dodałbym nowy, w nim problem znowu by się pojawił. Więc musiałbym regularnie odpalać swój naprawiający dyskusje skrypt… Albo przygotować rozwiązanie, które dodaje dyskusje dla każdego nowego wpisu.

## Na ratunek GitHub Actions!

Z racji tego, że moim hobby jest spędzanie kilku godzin na próbie automatyzacji 3-minutowych czynności, postanowiłem zautomatyzować dodawanie dyskusji dla każdego nowego wpisu. Na całe szczęście GitHub udostępnia narzędzie, które to zdecydowanie ułatwia – [GitHub Actions](https://github.com/features/actions). Jest to rozwiązanie typu CI/CD – [<i lang="en">Continuous Integration</i>](https://en.wikipedia.org/wiki/Continuous_integration) (Ciągła Integracja)/[<i lang="en">Continuous Delivery</i>](https://en.wikipedia.org/wiki/Continuous_delivery) (Ciągłe Dostarczanie). Tego typu rozwiązania służą do monitoringu zmian w kodzie. Jeśli coś trafia do repozytorium, system CI/CD dba o to, by spełniało określone standardy. Odpali testy, wygeneruje dokumentację, a następnie może nawet automatycznie opublikować paczkę w npm-ie czy innym repozytorium pakietów. Słowem: automatyzuje te części procesu wypuszczania oprogramowania, które warto zautomatyzować.

GitHub Actions integrują się ze zdarzeniami, które mogą zajść w repozytorium na GitHubie, takimi jak [dodanie nowego issue](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#issues) czy [wypchnięcie zmian do konkretnego brancha](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#push). Dzięki temu można np. sprawdzić, czy osoba zgłaszająca błąd dodała potrzebne informacje, albo wypuścić nową wersję pakietu npm za każdym razem, gdy nowy kod trafi do głównego brancha. Można też… dodać nową dyskusję, gdy pojawi się nowy wpis!

## Konfiguracja akcji

Żeby móc odpalić akcję, trzeba dodać do repozytorium odpowiedni plik konfiguracyjny, tzw. [<i lang="en">workflow</i>](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax). Jest to plik w [formacie YAML](https://learnxinyminutes.com/docs/yaml/), który zawiera informacje, jakie akcje chcemy odpalić oraz kiedy. Ten plik następnie umieszcza się w katalogu `.github/workflows`.

Dodajmy zatem plik `.github/workflows/fix-discussions.yml`:

```yaml
name: Fix discussions # 1

permissions: # 2
  discussions: write # 3

on: # 4
  push:
    branches:
      - main #5
    paths:
      - 'src/_posts/**/*.md' #6

jobs: # 7
  fix-discussions: # 8
    runs-on: ubuntu-latest # 9
    steps: # 10
      - uses: actions/checkout@8e8c483db84b4bee98b60c0593521ed34d9990e8 # 11
        with:
          fetch-depth: 2 # 12
      - uses: actions/setup-node@395ad3262231945c25e8478fd5baf05154b1d79f # 13
        with:
          node-version: 24 # 14
      - run: npm install --no-save @octokit/action # 15
      - run: node .github/actions/fix-discussions.mjs # 16
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # 17
          CATEGORY_ID: '[ciach]' # 18
          POSTS_DIR_PATH: 'src/_posts' # 19
          BLOG_URL: 'https://blog.comandeer.pl' # 20

```

Na początku podajemy nazwę workflowu (1). Następnie określamy [uprawnienia dla domyślnego tokena dostępowego](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#permissions) (2). Każdy workflow posiada token, który jest wykorzystywany do autoryzacji wszystkich operacji. W naszym wypadku token musi umożliwiać dodawanie dyskusji (3), więc dostaje tylko takie uprawnienia. Następnie określamy, kiedy workflow ma się wykonać (4). Chcemy, żeby zachodził, gdy zmiany zostaną [wypchnięte do brancha `main`](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#running-your-workflow-only-when-a-push-to-specific-branches-occurs) (5) i do tego [dotyczyć będą plików wpisów](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#running-your-workflow-only-when-a-push-affects-specific-files) (6). Potem ustalamy, co tak naprawdę ma się stać, tworząc zadania – `jobs`  (7). W naszym wypadku jest tylko jedno zadanie, `fix-discussions` (8). [Odpalamy je](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idruns-on) na Linuksie (9). Następnie w `steps` (10) ustalamy poszczególne kroki zadania. Na początku korzystamy z [akcji `actions/checkout`](https://github.com/actions/checkout) (11). Pobiera ona zawartość naszego repozytorium, pozwalając na nim pracować. W naszym przypadku dodatkowo musimy ustawić opcję `fetch_depth` na `2` (12). Domyślnie akcja pobiera tylko ostatni commit, a my potrzebujemy dwóch ostatnich (przy logice akcji ten wymóg się wyjaśni). Kolejnym krokiem jest wykorzystanie [akcji `actions/setup-node`](https://github.com/actions/setup-node/) w celu instalacji Node.js (13). Zaznaczamy, że chcemy wersję 24 (14). Gdy już Node.js zostanie zainstalowany, instalujemy [pakiet npm `@octokit/action`](https://www.npmjs.com/package/@octokit/action) (15). To specjalna odmiana wykorzystywanej przez nas ostatnio biblioteki [Octokit.js](https://github.com/octokit), dostosowana pod GitHub Actions. Na sam koniec uruchamiamy nasz skrypt JS (16), przekazując mu szereg zmiennych środowiskowych: token dostępowy GitHuba (17), ID kategorii dyskusji (18), względną ścieżkę do katalogu z wpisami (19) oraz URL bloga (20).

{% note %}Jak można zauważyć, po nazwach wykorzystanych akcji znajduje się `@<ciąg znaków>`. Ten ciąg znaków wskazuje na konkretny commit w repozytorium akcji. Dzięki temu mamy pewność, że [nasz kod zawsze użyje tej konkretnej wersji akcji](https://docs.github.com/en/actions/reference/security/secure-use#:~:text=Pin%20actions%20to%20a%20full%2Dlength%20commit%20SHA). Innymi słowy: nawet jeśli w wyniku ataku ktoś wypuści nową wersję akcji, nasz kod powinien być bezpieczny, bo taką wersję zignoruje.{% endnote %}

## Logika akcji

Skrypt, będący "mózgiem" naszego workflowu, znajduje się w pliku `.github/actions/fix-discussions.mjs`. Jego główna logika prezentuje się następująco:

```javascript
const octokit = new Octokit();

await main();

async function main() { // 1
	const fullPostsDirPath = resolvePath( cwd(), env.POSTS_DIR_PATH );
	const postFiles = getPostFiles( env.GITHUB_SHA, env.POSTS_DIR_PATH ); // 4
	const posts = await getPostMetadata( postFiles ); // 2
	const missingPosts = await getPostsWithoutDiscussions( { // 5
		posts,
		repository: env.GITHUB_REPOSITORY
	} );

	console.log( 'Brakujących dyskusji:', missingPosts.length );

	await createMissingDiscussions( { // 3
		repository: env.GITHUB_REPOSITORY,
		categoryId: env.CATEGORY_ID,
		posts: missingPosts,
		blogUrl: env.BLOG_URL
	} );
}
```

Całość zamknięta jest w asynchronicznej funkcji `main()` (1). W gruncie rzeczy jest ona bardzo podobna do wczorajszego kodu. Wewnątrz funkcji `getPostMetadata()` (2) została zamknięta pętla wyciągająca metadane dla każdego wpisu. Sam [kod je wyciągający](https://blog.comandeer.pl/swobodna-dyskusja#stworzenie-listy-wpis%C3%B3w:~:text=Z%20kolei%20funkcja%20getMetadata()%20prezentuje%20si%C4%99%20nast%C4%99puj%C4%85co) jest identyczny. Tak samo praktycznie bez zmian została funkcja tworząca nowe dyskusje, `createMissingDiscussions()` (3). Jedyną różnicą jest przekazywanie jej zmiennej środowiskowej `GITHUB_REPOSITORY`, zamiast osobno właściciela i nazwy repozytorium. Ta zmienna środowiskowa ma format `<WŁAŚCICIEL>/<REPOZYTORIUM>`, więc uzyskanie właściciela i nazwy sprowadza się do [podzielenia](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split) wartości zmiennej na znaku `/`. Zmiany natomiast zaszły w funkcji pobierającej listę plików z wpisami (4) oraz w funkcji sprawdzającej, czy dla podanych postów istnieją dyskusje (5).

Przyjrzyjmy się najpierw funkcji `getPostFiles()`:

```javascript
import { execSync } from 'node:child_process'; // 2

[…]

function getPostFiles( commitHash, postsDirPath ) { // 1
	const rawCommitInfo = execSync( `git diff-tree --no-commit-id --name-only ${ commitHash } -r` ); // 3
	const commitInfo = rawCommitInfo.toString( 'utf-8' ); // 4
	const lines = commitInfo.split( '\n' ); // 5

	return lines // 8
		.filter( ( line ) => {
			const trimmedLine = line.trim();

			return trimmedLine.startsWith( postsDirPath ) && trimmedLine.endsWith( '.md' ); // 6
		} )
		.map( ( path ) => {
			return resolvePath( cwd(), path.trim() ); // 7
		} );
}
```

Funkcja przyjmuje dwa argumenty (1): [hash aktualnego commita](https://graphite.com/guides/git-hashing) oraz względną ścieżkę do katalogu z wpisami. Na sam początek wykorzystujemy [funkcję `execSync()`](https://nodejs.org/api/child_process.html#child_processexecsynccommand-options) z wbudowanego modułu `node:child_process` (2), aby wywołać [komendę `git diff-tree`](https://git-scm.com/docs/git-diff-tree) na przekazanym hashu commita (3). Komenda ta zwróci nam listę plików zmienionych w danym commicie. A że lista ta jest generowana na podstawie porównania tego commita z poprzednimi, stąd potrzeba wymuszenia na akcji `actions/checkout` pobrania dwóch ostatnich commitów (domyślnie pobiera tylko ostatni). Funkcja `execSync()` zwróci nam wynik w postaci [bufora](https://nodejs.org/api/buffer.html), więc musimy go [skonwertować na ciąg znaków](https://nodejs.org/api/buffer.html#buftostringencoding-start-end) (4). Z racji tego, że `git diff-tree` wyświetla jedną nazwę pliku w linii, musimy podzielić wynik tej komendy na poszczególne linie (5). Następnie filtrujemy tablicę linii i znajdujemy tylko te, które dotyczą plików z wpisami (6). Następnie dla każdego wpisu [rozwiązujemy pełną ścieżkę](https://nodejs.org/api/path.html#pathresolvepaths) (7). Tak spreparowaną tablicę ścieżek zwracamy z funkcji (8).

Przejdźmy teraz do funkcji `getPostsWithoutDiscussions()`:

```javascript
async function getPostsWithoutDiscussions( options ) {
	const postsWithoutDiscussions = []; // 1

	for ( const post of options.posts ) { // 2
		if ( await isMissingDiscussion( options.repository, post.slug ) ) { // 3
			postsWithoutDiscussions.push( post ); // 4
		}

		await sleep( getRandomNumber( 1, 5 ) ); // 5
	}

	return postsWithoutDiscussions; // 6
}
```

Na początku tworzymy w niej tablicę wpisów, które nie mają dyskusji (1). Następnie iterujemy po wszystkich przekazanych postach (2) i sprawdzamy, czy każdy z nich ma swoją dyskusję (3). Jeśli nie, trafia do tablicy (4). Następnie odczekujemy losową liczbę sekund (5), żeby nie nadziać się na limity GitHub API. Jak już przerobimy wszystkie posty, zwracamy naszą tablicę (6).

Przyjrzyjmy się więc funkcji `isMissingDiscussion()`:

```javascript
async function isMissingDiscussion( repository, title ) {
	const searchQuery = `repo:${ repository } in:title "${ title }"`; // 2
	/* 1 */ const graphqlQuery = `
		query($searchQuery: String!) {
			search(query: $searchQuery, type: DISCUSSION, first: 1) {
				edges {
					node {
						... on Discussion {
							title
						}
					}
				}
			}
		}
	`;

	const result = await octokit.graphql( graphqlQuery, {
		searchQuery
	} );
	const discussions = result.search.edges.map( ( edge ) => {
		return edge.node;
	} );

	return discussions.findIndex( ( discussion ) =>  {
		return discussion.title === title; // 3
	} ) === -1; // 4
}
```

Zawiera ona zapytanie GraphQL (1), które korzysta z wyszukiwarki GitHuba, żeby znaleźć dyskusję o konkretnym tytule. Samo zapytanie do wyszukiwarki (2) można… testować w wyszukiwarce GitHuba – [składnia jest identyczna](https://docs.github.com/en/search-github/searching-on-github/searching-discussions#search-by-the-title-body-or-comments). Po otrzymaniu wyniku zapytania z API, sprawdzamy, czy znajduje się w nim rekord dla naszego wpisu (3). Jeśli tak, funkcja zwróci `false`. W innym wypadku zwróci `true`. Dzieje się tak, ponieważ [metoda `Array#findIndex()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex) zwróci `-1` (4) tylko wtedy, gdy szukanej rzeczy nie ma w tablicy.

I to w sumie tyle, reszta logiki skryptu działa praktycznie identycznie jak tego wczorajszego. Ale dzięki przeniesieniu tej logiki do akcji, dyskusje dla nowych wpisów powinny dodawać się automatycznie. Jak choćby [dla _tego_ wpisu](https://github.com/Comandeer/blog/discussions/categories/komentarze?discussions_q=category%3AKomentarze+%2Fcalkowicie-swobodna-dyskusja)!

<small>A jeśli powyższy link jednak nie działa, to jutro zapewne kolejna część tej sagi…</small>
