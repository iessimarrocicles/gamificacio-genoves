# El Trinquet de 3r

App de gamificació d'aula per a 3r de Primària del Genovés (la Costera), amb la pilota valenciana com a fil conductor. El mestre o la mestra reparteix **Quinzes** des de la pissarra digital, cada alumne/a té el seu pilotari, i tota la classe juga junta una **Partida** per a guanyar un premi comú.

Tota la interfície està en valencià.

## Posar-la en marxa

Cal tindre [Node.js](https://nodejs.org) instal·lat.

```bash
npm install     # només la primera vegada
npm run dev     # obri http://localhost:5180
```

Altres ordres:

| Ordre | Què fa |
|---|---|
| `npm test` | Passa les proves automàtiques |
| `npm run build` | Crea la versió final a la carpeta `dist/` |
| `npm run preview` | Obri la versió final per a comprovar-la |

La carpeta `dist/` és una web estàtica: es pot copiar a qualsevol servidor o obrir-la amb `npm run preview`.

## Com s'usa

- **Donar Quinzes:** toca la targeta d'un/a alumne/a i tria la categoria.
- **Tota la classe:** premia tots els presents d'un colp.
- **La rifa de la pilota:** tria un/a alumne/a a l'atzar.
- **Tria'n uns quants:** marca diverses targetes i premia-les juntes (per exemple, un grup de treball).
- **Per a millorar:** en tocar «Falta al traure» o «Pilota a la galeria» es tria entre **Avís** (queda anotat, no resta) i **−1 quinze**.
- **Desfés:** després de cada acció apareix un avís a baix amb el botó per a desfer-la.
- **Mode Alumnat:** amb el selector de dalt, tocar un nom obri el pilotari de l'alumne/a, on pot veure els seus Quinzes i el seu nivell i canviar-se els complements.
- **Informes:** resum de la classe o d'un/a alumne/a per setmana, mes o curs. Es poden imprimir o baixar en CSV.
- **Configuració:** alumnes, categories, partida, sons i dades.

## Regles del joc

| | |
|---|---|
| **Nivells** (segons el rècord de Quinzes) | Aficionat/da 0, Marxador/a 10, Punter/a 25, Mitger/a 45, Rest 70, Campió/ona del Genovés 100 |
| **Complements** | Didals 0, faixa 5, mocador 15, guant 30, espardenyes 50, faixa daurada 75, trofeu 100 |
| **Partida de la classe** | Per defecte 5 jocs de 100 Quinzes. Cada joc es canta 15, 30, Val i Joc |

- El nivell i els complements depenen del **rècord**, així que un −1 mai fa perdre el que ja s'ha guanyat.
- Els Quinzes no baixen mai de zero.
- Els −1 no resten a la partida de la classe.

## On es guarden les dades

**Només en el navegador de l'aparell on s'usa** (`localStorage`). No hi ha servidor ni comptes, i no ix cap dada de l'aparell.

Això vol dir que:

- Si s'obri en un altre aparell o navegador, la classe estarà buida.
- Si s'esborren les dades del navegador, es perd tot.

Per això convé baixar una còpia de tant en tant des de **Configuració → Dades → Baixa una còpia**. Eixe fitxer es pot recuperar en qualsevol aparell.

## Estructura

```
src/
├─ domini/        Regles del joc, sense res de pantalla (amb proves)
│  ├─ barem.js    Categories, nivells, complements i frases
│  ├─ nivells.js  Nivell, progrés i complements desbloquejats
│  ├─ partida.js  Marcador de la classe: 15, 30, Val, Joc
│  ├─ reductor.js Totes les accions: atorgar, avís, −1, desfer, alumnes…
│  ├─ efectes.js  Què s'ha de celebrar després de donar Quinzes
│  └─ informes.js Resums per alumne/a, grup i període
├─ dades/         Guardar i recuperar (localStorage, còpia, CSV)
├─ estat/         Estat compartit de l'app (React Context)
├─ so/            Sons (Web Audio) i veu del navegador
└─ components/    Pantalles i peces de la interfície
```

`src/dades/repositori.js` és l'únic fitxer que sap on es guarden les dades. Per a passar-les al núvol més avant, n'hi ha prou amb escriure un altre repositori amb les mateixes tres funcions (`carregar`, `guardar`, `esborrar`).

## Tecnologia

React 19, Vite 8, Tailwind CSS 4 i Vitest. Les lletres (Alfa Slab One i Lexend) van dins de l'app, així que funciona sense Internet una vegada carregada.

## Més documentació

- [Disseny i decisions](docs/superpowers/specs/2026-11-16-trinquet-de-3r-design.md)
- [Diari de com s'ha fet](docs/DIARI.md): prompts, plugins i passos
