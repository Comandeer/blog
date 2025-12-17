---
layout: post
title:  "Agenci wpływu"
description: "TAG wypuścił ostatnio definicję agenta osoby użytkowniczej – przyjrzyjmy się jej!"
author: Comandeer
date: 2025-12-18T00:00:00+0100
tags:
    - adwent-2025
    - standardy-sieciowe
comments: true
permalink: /agenci-wplywu.html
---

Określenie <i lang="en">user agent</i> (agent osoby użytkowniczej) na stałe już wrosło w tkankę Sieci. Jednak najczęściej jest używane jako [brzmiący profesjonalniej synonim słowa przeglądarka](https://gwd.comandeer.pl/przegladarki/).  Tymczasem [TAG proponuje (przypomina?) o wiele szersze znaczenie](https://w3ctag.github.io/user-agents/).<!--more-->

## Definicja

TAG proponuje następującą [definicję agenta osoby użytkowniczej](https://w3ctag.github.io/user-agents/#what):

> <p lang="en">A <dfn>web user agent</dfn> is any software entity that interacts with websites outside the entity itself, on behalf of its user, including simply rendering the content of websites. […] The most common type of web user agent is the web browser, including in-app browsers that can follow cross-site links. However, user agents also include other tools like search engines, voice-driven assistants, and generative AI systems that present snippets or summaries of website content, or help people navigate and interact with websites.</p>
>
> [<dfn>Sieciowy agent osoby użytkowniczej</dfn> to każde oprogramowanie, wchodzące w interakcje ze stronami WWW, pozostającymi poza tym oprogramowaniem, na polecenie swojej osoby użytkowniczej; interakcje obejmują m.in. samo renderowanie zawartości stron. […] Najpopularniejszym typem sieciowego agenta osoby użytkowniczej jest przeglądarka, włączając w to przeglądarki wbudowane w aplikacje, mogące korzystać z linków między stronami. Niemniej termin "agenty osoby użytkowniczej" zawiera także inne narzędzia, takie jak wyszukiwarki, asystenci do sterowania głosem oraz systemy generatywnego AI, które prezentują wycinki lub podsumowania zawartości stron lub pomagają osobom nawigować i wchodzić w interakcje ze stronami.]

Brzmi to strasznie zawile, więc spróbujmy to uprościć. W największym skrócie: sieciowy agent osoby użytkowniczej to dowolny progam, dzięki któremu można coś zrobić ze stroną WWW. Przeglądarka spełnia tę definicję, ponieważ pozwala wyświetlać stronę WWW. Wyszukiwarka spełnia tę definicję, bo umożliwia znalezienie konkretnej strony lub przeszukanie jej treści. ChatGPT też spełnia tę definicję, ponieważ może podsumować treść strony.

Warto też zwrócić uwagę, że w definicji pada sformułowanie _sieciowy_ agent. Jak bowiem TAG zauważa, istnieć mogą też inne agenty, np. mailowy agent – a więc taki, przez którego wyślemy i odbierzemy maila.

Oprócz definicji TAG wymienia też [trzy obowiązki agenta](https://w3ctag.github.io/user-agents/#duties):

* [**ochrona**](https://w3ctag.github.io/user-agents/#protection) – interakcje ze stronami WWW muszą być bezpieczne, czyli np. strona nie może bez pozwolenia zmieniać ustawień komputera, a przeglądarka nie może sama z siebie wysłać stronie numeru karty kredytowej swojej osoby użytkowniczej;
* [**szczerość**](https://w3ctag.github.io/user-agents/#honesty) – agent powinien zawsze informować osobę użytkowniczą, co się dzieje, i to w sposób dla niej zrozumiały, np. pasek adresu w przeglądarce powinien pokazywać poprawny adres obecnie przeglądanej strony;
* [**lojalność**](https://w3ctag.github.io/user-agents/#loyalty) – agent powinien przedkładać interes swojej osoby użytkowniczej ponad interes kogokolwiek innego, np. przeglądarka wbudowana w aplikację nie może utrudniać próby otwarcia strony w innej przeglądarce tylko po to, by zatrzymać kogoś wewnątrz siebie.

## TAG?

No dobrze, ale czym jest ten cały TAG? TAG, a dokładniej [W3C Technical Architecture Group (Grupa Architektury Technicznej W3C)](https://tag.w3.org/), to trochę taka starszyzna standardów sieciowych. W jej skład wchodzą osoby wybierane na dwuletnie kadencje przez członków W3C (czyli firmy zgromadzone w W3C) lub wskazywane przez zespół W3C oraz [Tim Berners-Lee](https://en.wikipedia.org/wiki/Tim_Berners-Lee), jedyny dożywotni członek. [Zadanie TAG](https://www.w3.org/policies/process/#tag-role) jest ściśle określone i sprowadza się przede wszystkim do doradzania innym grupom, w jaki sposób rozwiązywać techniczne zagwozdki, oraz do dokumentowania zasad, jakie powinny przyświecać standardom sieciowym. Przykładem tej drugiej części działalności grupy jest definicja agenta osoby użytkowniczej, ale też [<cite lang="en">Ethical Web Principles</cite> (Zasady Etycznej Sieci)](https://w3ctag.github.io/ethical-web-principles/). Z kolei przykładem pierwszej są [publiczne dyskusje nad propozycjami nowych standardów](https://github.com/w3ctag/design-reviews).

Co prawda TAG nie bierze bezpośredniego udziału w tworzeniu standardów, a ma jedynie doradzać, jednak uwagi zgłaszane przez tę grupę najczęściej są brane pod uwagę. W TAG-u siedzą ludzie, którzy zjedli zęby na standardach sieciowych i są w stanie zauważyć niedoskonałości w większości pokazywanych im API. Czy to na poziomie czysto technicznym, czy też na poziomie np. potencjalnych zagrożeń prywatności. Mając osoby z takim doświadczeniem na wyciągnięcie ręki, głupio byłoby z ich wsparcia nie skorzystać.

Więc korzystajmy!
