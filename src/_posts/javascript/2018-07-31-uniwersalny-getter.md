---
layout: post
title:  "Uniwersalny getter"
description: "Jak wykorzystać Proxy w JS-ie do implementacji odpowiednika __get() z PHP?"
author: Comandeer
date: 2018-07-31T19:40:00+0100
tags:
    - javascript
comments: true
permalink: /uniwersalny-getter.html
redirect_from:
    - /javascript/2018/07/31/uniwersalny-getter.html
---

Chociaż magia niezbyt idzie w parze z programowaniem, to mimo to polubiłem PHP-owe metody magiczne, wśród których chyba najbardziej przypadło mi do gustu `__get`. Ta prosta metoda pozwalała przechwycić odwołania do nieistniejących pól klasy:

```php
<?php
class Test {
	public $iAmAlive = 'nope';

	public function __get( $var ) {
		return $var . ' value';
	}
}

$test = new Test();
var_dump( $test->test ); // test value
var_dump( $test->qwerty ); // qwerty value
var_dump( $test->iAmAlive ); // nope

```

W przypadku JS-a nie było to, niestety, możliwe. Aż do ES6…<!--more-->

## Nieuniwersalny getter

Pierwsze zarzewie tego typu mechanizmów pojawiło się w ES5, wraz z getterami. Niemniej można je było przypiąć tylko do konkretnej właściwości, co sprawiało, że getterów musiało być tyle, ile własności, które chcemy obserwować. Dodatkowo nie dało się ich przypiąć do nieistniejących właściwości:

```javascript
const obj = {};

Object.defineProperty( obj, 'test', {
	get() {
		return 'hublabubla';
	}
} );

console.log( obj.test ); // hublabubla
console.log( obj.whatever ); // undefined
```

Wynikało to z prostego faktu: getter był tak naprawdę [_cechą_ konkretnej właściwości obiektu](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty#Description).

## Proxy

Naprawdę potężny mechanizm, `Proxy`, który pozwala kontrolować dostęp do obiektu, pojawił się dopiero w ES6, wraz z towarzyszącym mu [mechanizmem refleksji](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect). `Proxy` pozwala na tworzenie tzw. pułapek (ang. <i lang="en">trap</i>) – funkcji odpalanych w momencie zajścia konkretnej interakcji z obiektem skrytym za `Proxy`. Stąd wzięła się też nazwa tego mechanizmu – `Proxy` działa jak… proxy, pośrednicząc pomiędzy prawdziwym obiektem a próbującym go użyć programistą.

Pułapek jest naprawdę sporo i pozwalają kontrolować niemal każdą interakcję z obiektem (nawet jeśli chcemy kontrolować odczytywanie deskryptorów właściwości obiektu, to [odpowiednia pułapka](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/getOwnPropertyDescriptor) istnieje i na to). Niemniej nam przyda się tylko jedna – `get`. Jak sama jej nazwa wskazuje, pułapka ta uaktywnia się, gdy ktoś chce się dostać do jakiejkolwiek właściwości naszego obiektu.

Zobaczmy zatem, jak ukryć obiekt za proxy:

```javascript
const obj = {};
const proxy = new Proxy( obj, {} );
```

Obiekt, który chcemy ukryć, to `obj`. Przekazujemy go jako pierwszy parametr do konstruktora `Proxy`. Drugi parametr to tzw. handler, czyli obiekt zawierający definicję pułapek.

W powyższym wypadku nasze proxy nie robi absolutnie nic – przepuszcza wszystko do oryginalnego obiektu:

```javascript
proxy.a = 'whatever'; // 1
console.log( obj.a ); // 2 – whatever
```

Jak widać ustawiamy właściwość na proxy (1), co automatycznie ustawia ją także w oryginalnym obiekcie (2).

Dodajmy zatem w końcu nasz getter.

## Uniwersalny getter

Załóżmy, że chcemy, by każda właściwość naszego obiektu zwracała shruga (` ¯\_(ツ)_/¯`):

```javascript
const obj = {};
const proxy = new Proxy( obj, {
	get() {
		return '¯\\_(ツ)_/¯';
	}
} );

console.log( proxy.a ); // ¯\_(ツ)_/¯
```

I już, tyle. Teraz każda właściwość będzie zwracała shruga.

<p class="note">Warto zauważyć, że w przypadku używania proxy, wszystkie operacje wykonujemy właśnie na nim. W zależności od zdefiniowanych pułapek, nasze działania na proxy będą miały odpowiednie odbicie na rzeczywistym obiekcie.</p>

I mówiąc _każda_ mam na myśli naprawdę _każdą_:

```javascript
const obj = {
	a: 'whatever'
};
const proxy = new Proxy( obj, {
	get() {
		return '¯\\_(ツ)_/¯';
	}
} );

console.log( proxy.a ); // ¯\_(ツ)_/¯
```

Pułapka `get` – w przeciwieństwie do PHP-owego `__get` – działa bowiem dla wszystkich właściwości danego obiektu, nawet tych zdefiniowanych. Tym samym wypada dodać trochę kodu, aby się przed tym uchronić.

Pułapka `get` dostaje 3 parametry:

* `target` – nasz oryginalny obiekt;
* `property` – nazwę właściwości, którą użytkownik chce odczytać;
* `receiver` – obiekt proxy, który wywołał pułapkę.

Te informacje wystarczą nam aż nadto, by dorobić obsługę zdefiniowanych właściwości:

```javascript
const obj = {
	a: 'whatever'
};
const proxy = new Proxy( obj, {
	get( target, property ) {
		if ( Reflect.has( target, property ) ) { // 1
			return Reflect.get( target, property ); // 2
		}

		return '¯\\_(ツ)_/¯'; // 3
	}
} );

console.log( proxy.a ); // whatever
console.log( proxy.b ); // ¯\_(ツ)_/¯
```

Używamy tutaj mechanizmu refleksji do sprawdzenia, czy oryginalny obiekt ma odpowiednią właściwość (1), a jeśli tak – zwracamy ją (2). W innym wypadku zwracamy shruga (3).

<p class="note">Oczywiście można zastosować bardziej tradycyjne metody niż refleksja (<code>for...in</code> i <code>target[ property ]</code>), niemniej uważam, że refleksja jest po prostu czytelniejsza i bardziej elegancka. No i co najważniejsze: `Reflect` ma metody odpowiadające pułapkom `Proxy`. Te mechanizmy doskonale się uzupełniają i wręcz grzechem byłoby ich nie wykorzystać razem.</p>

I to tyle. Małym nakładem środków udało nam się odtworzyć _magię PHP-a_, yay!
