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

## Versió en línia

**https://iessimarrocicles.github.io/gamificacio-genoves/**

Cada vegada que es puja un canvi a la branca `main`, GitHub passa les proves, compila l'app i la publica a GitHub Pages (`.github/workflows/pages.yml`). Si alguna prova falla, no es publica.

Encara que estiga en línia, les dades continuen guardant-se només en el navegador de qui l'obri.

## Com s'usa

El **menú lateral** porta a tot arreu: les classes, les seccions (El trinquet, Grups, Informes i Configuració) i el selector Mestre/a o Alumnat. En pantalles estretes s'obri amb el botó **Menú**.

- **Classes:** se'n poden tindre diverses. Cada una té els seus alumnes, grups, categories, partida i registre. «+ Classe nova» en crea una amb les mateixes categories i la mateixa configuració de partida que la classe on estàs.
- **Grups:** taules, equips o colles dins d'una classe. Es creen a mà o repartint la classe a l'atzar, i es poden canviar sempre que es vulga: els Quinzes són de cada alumne/a i no es perden. Un/a alumne/a pot estar en més d'un grup.
- **Donar Quinzes a un grup:** amb el botó del grup que apareix al trinquet, o des de la secció Grups. Només en reben els membres que han vingut.
- **Donar Quinzes:** toca la targeta d'un/a alumne/a i tria la categoria.
- **Tota la classe:** premia tots els presents d'un colp.
- **La rifa de la pilota:** tria un/a alumne/a a l'atzar.
- **Tria'n uns quants:** marca diverses targetes i premia-les juntes (per exemple, un grup de treball).
- **Per a millorar:** en tocar «Falta al traure» o «Pilota a la galeria» es tria entre **Avís** (queda anotat, no resta) i **−1 quinze**.
- **Desfés:** després de cada acció apareix un avís a baix amb el botó per a desfer-la.
- **Mode Alumnat:** amb el selector de baix del menú, tocar un nom obri el pilotari de l'alumne/a, on pot veure els seus Quinzes i el seu nivell i canviar-se els complements. En este mode no es pot canviar de classe ni entrar a les altres seccions.
- **Informes:** resum de la classe, dels grups o d'un/a alumne/a per setmana, mes o curs. Es poden imprimir o baixar en CSV.
- **Configuració:** alumnes, categories, partida, nom de la classe, sons i dades. Des d'ací també s'esborra una classe.

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

Per això convé baixar una còpia de tant en tant des de **Configuració → Dades → Baixa una còpia**. Eixe fitxer porta totes les classes i es pot recuperar en qualsevol aparell. Recuperar una còpia substitueix totes les classes que hi haja en eixe moment.

Les dades guardades amb la versió d'una sola classe (i les còpies antigues) continuen valent: apareixen com a primera classe.

## Estructura

```
src/
├─ domini/        Regles del joc, sense res de pantalla (amb proves)
│  ├─ barem.js    Categories, nivells, complements i frases
│  ├─ nivells.js  Nivell, progrés i complements desbloquejats
│  ├─ partida.js  Marcador de la classe: 15, 30, Val, Joc
│  ├─ reductor.js Totes les accions d'una classe: atorgar, avís, −1, desfer, alumnes, grups…
│  ├─ escola.js   Diverses classes: crear-ne, canviar d'una a altra i esborrar-ne
│  ├─ grups.js    Colors i noms dels grups i repartiment a l'atzar en equips
│  ├─ efectes.js  Què s'ha de celebrar després de donar Quinzes
│  └─ informes.js Resums per alumne/a, classe, grups i període
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
