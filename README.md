# UTM Manager

Strona do zarządzania linkami z UTM
Cały projekt docelowo powinien być czymś w rodzaju [UTM Base](https://app.utmbase.com/login)

## Etapy
1. Prosta strona (single page) z formularzem do generowania - zwykłe inputy (*[przykład](https://utmbase.com/)*)
2. Słowniki do pól - zrobienie podpowiadania do pól z historią wpisywanych danych
3. Zrobienie strony wielojęzycznej (początkowo PL/EN)
4. Możliwość zapisywania, edytowania i usuwania linków (oparte na localStorage)
5. Podział na projekty i kampanie. Projekt zawiera kampanie, a kampanie zawierają linki z UTMami
6. Logowanie
7. Współdzielenie projektów między użytkownikami (przerobienie z localStorage na bazę danych)
8. Zarządzanie użytkownikami (tworzenie, blokowanie, usuwanie) z poziomu admina
9. Tworzenie grup użytkowników oraz przypisanie grupy do projektu

## Stack technologiczny
- [React](https://pl.reactjs.org/)
- [Redux](https://redux.js.org/basics/usage-with-react)
- [Shards](https://designrevision.com/docs/shards-react/getting-started)

Na start projektu myślę, że to wystarczy.
Nad stackiem backendowym (logowanie, baza danych, itp) przysiądziemy jak będzie bliżej tego etapu.
