---
layout: post
title:  "Oswojony Zalgo"
description: "Błędy w implementacji asynchronicznych API."
author: Comandeer
date: 2021-03-31T18:58:00+0200
tags:
    - refleksje
    - javascript
comments: true
permalink: /oswojony-zalgo.html
---

Wieki temu Isaac Z. Schlueter napisał artykuł na temat [projektowania asynchronicznyczh API](https://blog.izs.me/2013/08/designing-apis-for-asynchrony). Przestrzegł w nim przed wypuszczaniem na świat Zalgo.<!--more-->

## Zalgo?

Zalgo czyha poza kurtyną poznania, by swymi długimi mackami siać zamęt i terror w umysłach ludzi niezdolnych do pojęcia jego wszechpotężnej grozy. I nadchodzi, jest coraz bliżej…

A w kontekście artykułu chodzi po prostu o API, które czasami zachowuje się asynchronicznie, a czasami – synchronicznie. Przez to trudno jest w pełni przewidzieć jego zachowanie, a tym samym – zarządzać przepływem w aplikacji. Żeby zatem nie wypuszczać Zalgo w swoim kodzie i nie powodować szaleństwa wśród innych programistów, wypada tworzyć API, które zawsze są synchroniczne albo zawsze asynchroniczne.

## Zalgo!

Przypomniałem sobie o asynchronicznym Zalgo przy pisaniu nowego projektu. Moje publiczne API zwykle są asynchroniczne, więc, niewiele myśląc, naskrobałem coś takiego:

```javascript
async function publicAPI( data ) {
	return data.repeat( 2 );
}
```

Teraz tylko jeszcze dodać jeszcze walidację przekazanych danych:

```javascript
async function publicAPI( data ) {
	if ( typeof data !== 'string' ) {
		throw new TypeError( 'I need a string!!!' );
	}

	return data.repeat( 2 );
}
```

_Voilà_! Tylko że nie zachowywało się to tak, jak publiczne API w moich innych bibliotekach… Porównałem zatem z jakimś innym moim kodem:

```javascript
function publicAPI( data ) {
	if ( typeof data !== 'string' ) {
		throw new TypeError( 'I need a string!!!' );
	}

	return new Promise( ( resolve ) => {
		resolve( data.repeat( 2 ) );
	} );
}
```

Co Bardziej Rozgarnięty Czytelnik w tym momencie pewnie już wie, gdzie ~~czai się mroczn~~ leży problem. Większość moich API wypuszczała Zalgo. W chwili, gdy występował w nich błąd, błędy były rzucane synchronicznie, podczas gdy wynik był zwracany asynchronicznie. Funkcja asynchroniczna z kolei _zawsze_ rzuca błędy i zwraca wynik asynchronicznie:

```javascript
function zalgoAPI( data ) {
	if ( typeof data !== 'string' ) {
		throw new TypeError( 'I need a string!!!' );
	}

	return new Promise( ( resolve ) => {
		resolve( data.repeat( 2 ) );
	} );
}

async function safeAPI( data ) {
	if ( typeof data !== 'string' ) {
		throw new TypeError( 'I need a string!!!' );
	}

	return data.repeat( 2 );
}

try {
	zalgoAPI( 1 );
} catch( error ) {
	console.error( error );
}

safeAPI( 1 ).catch( console.error );
```

Problem robi się dość oczywisty, gdy chcemy dorobić obsługę błędów dla takiego zalgoconego API. Bo musimy dorobić ją podwójnie: jedną, synchroniczną, dla walidacji danych i drugą, asynchroniczną, dla błędów, jakie mogą pojawić się w czasie rozwiązywania wynikowej obiecanki:

```javascript
try {
	zalgoAPI( someValue ).catch( console.error );
} catch( error ) {
	console.error( error );
}
```

W moim kodzie najczęściej problem omijałem, stosując składnię `async`/`await`, która wszystkie błędy pozwala łapać przy pomocy `try`/`catch`:

```javascript
function zalgoAPI( data ) {
	if ( typeof data !== 'string' ) {
		throw new TypeError( 'I need a string!!!' );
	}

	return new Promise( ( resolve, reject ) => {
		reject( new Error( 'A kuku!' ) );
	} );
}

( async function() {
	try {
		await zalgoAPI( 1 );
	} catch( error ) {
		console.error( error ); // Błąd walidacji.
	}

	try {
		await zalgoAPI( 'string' );
	} catch( error ) {
		console.error( error ); // Błąd z obiecanki.
	}
}() );
```

Nie zmienia to faktu, że powinno to działać także poza składnią `async`/`await`, przy wykorzystaniu samych `Promise`. Czeka mnie zatem nieco refaktoryzacji…

Chociaż dziwne, że tak długo wydawało mi się wręcz, że mój sposób jest bardziej _intuicyjny_. Czyżbym zaraził się szaleństwem Zalgo? <span aria-hidden="true">Przeċ̵̨̢̨͇̞̜̦̟̯̰̪̞̘̱̺͍̱̻̪̘̱̤̻̞͍̱̤͓̼̥͓͇̟̹̰͍̤͕̬̱̙̲̹̝͇̜̖̘̱̃̇͌̀̐̈͜͠ͅi̵̡̧̨̻̳̤͙͇̟͈͓̘̮̩͔̘̻͓͇̳͓̳̣̩̙̜͉̟͖̟͖̓́̄́̒͐̒͂̐́̈͑̅̌̌̀̓̈́̈́͐̽͆̎̿͛͆̌̿͛̂̈́̓̽̇̒͒̒̓̔͌͛̀̑̔̇̌̍̃̕̚̚͘̚͠͝͝ͅͅͅę̵̨̢̡̳̞̻̯͔͈̪̱̻͇̫̯̮̼͕̙̘̗̻̼̗̦͕̖̤͇͙͍̹̠̦̘̠̦͖̝̜͚̱̖̪̭͔̦͇͚̟͙̬͙̼͚̭̪̺͔͕̃̈́̄̄̂̓̈́̇͗͛͛́̈́̈́̑̃͛̒̓̓̈́̀̀̔̊̉̓̅̓̐̀͘͜͜͠͠ż̸̨̨̛̲̼̯͔̳͈̰͕̣̰̘̫̲͍̳̤͕̞͛̌̀̾̍̀͒̓͗̆͆̈́͗̒̋̇̾̅̏͆͊̀̄̃͆̅̔̒̊̋́̎̍̏̾̽̈́͒͒̋̂̈̓̅̌͊̾͂̓͆̅̍̀̅̒̍̃̄̈́̈́̂̚̚̕̕͘͝͝ͅ ̸̨̢̠̤̮̖̗̩͍͇̝̦̗̟̮͍̩̙̟͍̬͎̜͈̩́̈́̈́͊̆̍̓͐̇͒̀̆̂̇̊̅̑̇̉̉͋̄̑͋̏̋̉̍̋̌̓́̔͆͋̄̀̓̊̎̀͋̈́̽̒͆͒̅͛̿̆̿͘̕̚̕̕͘͜͜͜͝͝͝͠͝ͅͅt̸̡̧̡̧̧̖̤̖̩̫̲̭̪̥̠̗̳̮̙͖̣̱͇̳̹̟̩̟̙̳̤̟͔̦͕̳͙͓̯̫͍̼̯͚̪̲͈̙͔̘͈̣̀̓̓̊̒́͆̅̇̍̀͆̉̎̾͋̽̇͆͊͒͆͌̓̒́͐͆͂̂͗̅̏̈͋̆̓́͘͜͝͠͠͝ơ̵͔̜̙̮̤̖͈͚̞͎̖̩͚̱̥̟͓͙͓͕̩͒̄̔̈͒̉̾̏̔̏͂̾͛̽͒̄̈́̈̓̎͐͊̈́͌̿̽̉̍͐͋̅͋́̓̐̂̓̕͠͠͝͝͝ͅ ̴̧̢̧̨̡̤̖͔̩͙̝͚̻̞͇̗̰͚͔̻͙͍̩͕̱͉͙̥͓̲̜̩̩̝̭̰̦̦͕̰̲͎͎͉̣̦̰̩̺̣͖̣̗̦̥̗͎̀̑͊͊̈̔͊̐̅̒́̉̈́̆̓̈́̈́̄̈̆̆̀̽͊͐͌̑̍̏͑̄̃́̔͒̍̓͒̿̔̀͊̾̐͌̋͆̐̓̽̇̕̕̚͜͝ͅͅͅn̴̨̡̨̛̛͈͔̥̼̙͍̱̺̯̭̼̮̥͍̲̦̝̠̲̹͙̈́͐͑̊̓̔̉́̽͐̿͑͒̒́͂̄͊̏̈́̒̔̾̾̃̓͆̎̈͗̊͆̈́̅̓̔̊͑̾̎̈́͛̔̈́̓͆̀͗̊̈́͆̌͛̍̅͊̑̀̕̕̚͜͠͝͝ͅͅͅi̴̢̛̛̛̛̬͍͖̘̝͓͎͍̖̹̦̭̠͈̱͇͉̭̳͐̌́͛̿̈͒̐̏̃͐̓̈́̉̌́͗̍́̍̎̉̑̓̾̂̅̆̏̄̈͛̀͑̾̈́͆̈́̀̈́̈́́̿̈̊́̑͗̎̂̆̎͛̒̀̌̇̊͑͘͘̚͠͝͝͠ͅe̶̡̡̛͉͎̖̘͚̰͖̭̞͖̯͎͍̩̥͚̯̮̘̜̹̤̪̲̲̼̬̯͈̹̺̲̭͔̯̜̲͚̟̗̫̫̩͖̦̗̱̗͚̿̾̎̓͂̅̈́̐͛̅̒́̅̊́̄̒͛̆̽́̓̍̽̀̊̈́͒͊̓́̋̍͐͗̋̇̓̑̈́̉́͛́͒̃̓̇̌̌́͆̈́̅́̈́̿̈́̚̚̕͘̕̚͜͜͝͝͝͠͝ͅm̶̢̡̛͙̼̮̥̥͍̜̭͖̦̝̰̺̩̖̞̞̩͓̜̺̤̯͖̮̘̘̅̊̋̀̃͑̅̆̔̑̌͒̇̓̅̎̇̇͗̈́̃͋͑̈́̓̓̔̍͒̐̉̾̌̄̈̀̉̄̀̑̉̆̈̆̽̈́̄͒͊̓͂̒̕̚͘͘͘͝͠͝͝͝͝ͅơ̵̢̧̡̢̡̻͍̼̝̮̟͈̪̖̠͇̱͖̗̫̪̥͙̞̞̠͖͉̳̗̠̲͉̱̳͓̭͖̹̦̱̟̟̇́̀́͂̈̔̆͌́̉̈̋̈̈̾̈́̐̈̿̊͌̿̆̔̑͒̔̌̒̏͘̕͘͘͜͜͝ͅż̷̧̢̢͕̦̮̭̭̬͇͖̘̠̥̤̘͓̤̟͇͍͉͉̰̬̟̪͙̫̪̱̹͈̯͇͓̻͖̼͎̳̬̙̬͖̪͇͔͙̻̠̮̼̣̙̲̘͕̼̱̜͗̂͑̈́̈̐́͌̈́͂͐̈́̊̉̈́͒̓̾͊̽̓̀̌̂̀̾̏̋̏͋͌̏͒͛͐͗͂̄̾̾̅̈͛͑̇́̀̇̐̿̆̅́́̌͌̈́̔͆͒̌̔̒͌͛́͂̚͝ͅl̴̢̢̞̭̝̫̬̼̩̜͍̟̱̫̱̣͚̦͖̪̳̘̗̭͇̖̼̫͕̪̐̊̓͋͊̒̓̄̍̀̀̈́̐̿̽̋̆́̄̒̈͊̒̄̂͆͋̒̋̓̈́̾͐̈́̀͛̐̆͊̈́̋̃͊̕̕̕͜͝͠i̴̢̬̞̯̞̫̖̽̓̌̈́̀̎̀͆̉͑̃͆͊̃̎̔̀̄̌͑̈̉̔̆̊̔́̕͘̕͘̚͘͝w̷̨̢̨̛̛̛̛̛͈̪̦̙̣̦̯͖̺̜̻̮͉͇̣̤̼̥̖̬̱̳̯̰̠̘͍̻̌̒̿͂̆̿̓̃̌̂͆̔̉́̍͆͑͊̏̋̈́̑̊̉̉͌̿̏̾̑̒̒̍̀͆̀̊̍͑̇̒̈́̆́̃͛̊͛̆̓̉̍̚̕̕͘͘̚͘̚͜͝͠ͅe̷̜̠̝̠̱̞̗̎͐̾…̷̧̡̡̙̩̬̠̥͚͔͉̘̱̥͚̩̜͖̠͕̟͉̤͉͔͍̼͚̦̟̜̥̘͍̝͙̤̻̠͇̤͈͔̬̦̙̥̩͖̗̊̑͊̒͋͗̓̈́̅͌̀̅͆̍̇͋̈̀̋̈́̎̈́̋́͘̕͜͜͝ͅ</span>
