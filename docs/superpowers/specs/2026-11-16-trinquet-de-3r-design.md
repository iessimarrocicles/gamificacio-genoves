# Pla: «El Trinquet de 3r» — gamificació d'aula amb la pilota valenciana (des de zero)

## Context

Una escola del Genovés (la Costera) vol una eina d'aula per a 3r de Primària, de l'estil dels sistemes de punts de classe, però amb identitat pròpia: la pilota valenciana. El mestre/a reparteix «Quinzes» des de la pissarra digital (PDI), cada alumne/a té un pilotari que puja de nivell i guanya complements, i tota la classe empeny junta una «Partida» cap a un premi comú. Tot en valencià.

El projecte es fa **des de zero** a `c:\proyectos-ia\apps\gamificacio-genoves` (carpeta buida, sense git). No es reutilitza res del projecte anterior.

### Decisions ja preses per l'usuari
- **Dades només en local** (navegador), sense núvol.
- **Vista d'alumne a la mateixa pissarra**: s'obri tocant la targeta; sense PIN ni comptes.
- **Abast: tot l'enunciat** (trinquet, punts, classe, rifa, partida, gestió d'alumnes, categories, avatars amb complements, vista d'alumne, informes).
- **Barem de millora: es tria en el moment** → botons «Avís» (anota, no resta) i «−1 Quinze».
- Plugins: frontend-design, superpowers, supabase (sense ús ara), context7 (pendent d'autoritzar; si no està, es consulta la documentació oficial).

## Enfocaments considerats

| Enfocament | A favor | En contra |
|---|---|---|
| **A. React + Vite + Tailwind, dades a `localStorage`** ✅ | Components reutilitzables, proves automàtiques, fàcil de créixer i de connectar al núvol més avant | Cal `npm install` i un pas de compilació |
| B. Un sol fitxer HTML amb JS pla | S'obri amb doble clic, sense instal·lar res | Amb aquest abast (8 pantalles, avatars, informes) seria difícil de mantindre i de provar |
| C. Vue + Vite | Equivalent a A | Cap avantatge real ací; A té millor suport d'eines |

**Triat: A.** `localStorage` és suficient (una aula, ~25 alumnes, uns pocs KB); no cal IndexedDB.

## Disseny

### Regles del joc (decisions meues, corregibles)
- **Quinzes** = saldo actual. **Rècord** = màxim històric. El **nivell i els complements depenen del rècord**, així un −1 mai fa perdre nivell ni complements. Els Quinzes no baixen de 0.
- **Nivells** (rècord mínim): Aficionat/da 0 · Marxador/a 10 · Punter/a 25 · Mitger/a 45 · Rest 70 · Campió/ona del Genovés 100.
- **Complements desbloquejables**: didals (0), faixa (5), mocador al coll (15), guant (30), espardenyes de careta (50), faixa daurada (75), trofeu (100). Samarreta blava o roja, pell i cabell sempre lliures.
- **Partida de la classe**: cada Quinze positiu de qualsevol alumne/a suma a la partida. Un joc es canta 15 → 30 → Val → Joc (per defecte 40 Quinzes de classe per joc). Objectiu per defecte: 5 jocs → premi configurable («10 minuts més de pati»). Els −1 no resten a la partida.
- **Avís**: queda al registre per als informes; so suau i frase en positiu, sense res de roig agressiu.
- **Desfés**: l'última acció (individual o de tota la classe) es pot desfer des d'un avís a peu de pantalla.
- **Absents**: es poden marcar; queden fora de «Tota la classe» i de la rifa.
- **Picades d'ullet al Genovés**: nivell final, frases d'ànim, menció al Genovés com a bressol de pilotaris i al Museu de la Pilota; modalitats raspall i escala i corda com a noms de reptes/frases.
- **So i veu**: efectes generats amb Web Audio (sense fitxers); veu opcional amb la veu catalana del navegador si n'hi ha; botó per a silenciar.

### Pantalles
1. **El Trinquet** (principal): capçalera amb nom d'aula i Marcador de Partida; graella de targetes (avatar, nom, Quinzes, nivell); botons «Tota la classe», «La rifa de la pilota», «Informes», «⚙️».
2. **Donar Quinzes** (finestra): categories positives i de millora amb botons grans; animació i so en aplicar.
3. **La rifa**: animació d'una pilota que bota entre targetes i tria un/a alumne/a present.
4. **Vista d'alumne/a**: pilotari gran, Quinzes, nivell i barra fins al següent, complements (desbloquejats i per desbloquejar), Partida de la classe, botó «Canvia el meu pilotari».
5. **Editor d'avatar**: samarreta, pell, cabell i complements disponibles.
6. **Configuració**: aula · alumnes (afegir, editar, esborrar, enganxar llista) · categories (nom, icona, valor, tipus) · partida (Quinzes per joc, jocs, premi) · dades (còpia de seguretat: exportar/importar fitxer, reiniciar).
7. **Informes**: individual i de grup, per període (setmana/mes/tot), Quinzes per categoria, avisos, evolució; imprimir i baixar CSV.
8. **Celebracions**: pujada de nivell, complement nou, joc guanyat, partida guanyada.

Pensat per a PDI (1920×1080, tàctil) i tauletes: botons ≥ 56 px, text gran, respecta «reduir moviment».

### Tecnologia i estructura
React 18 + Vite + Tailwind CSS · Vitest + Testing Library · sense backend. Versions exactes: les estables en el moment d'instal·lar.

```
gamificacio-genoves/
├─ index.html, package.json, vite.config.js, README.md
├─ docs/
│  ├─ superpowers/specs/2026-11-16-trinquet-de-3r-design.md   (aquest disseny)
│  └─ DIARI.md                      (registre de passos, prompts i plugins)
└─ src/
   ├─ main.jsx, App.jsx, index.css
   ├─ domini/      (lògica pura, amb proves)
   │  ├─ barem.js          categories, nivells i complements per defecte
   │  ├─ nivells.js        nivell, progrés, complements desbloquejats
   │  ├─ partida.js        15/30/Val/Joc, jocs, premi
   │  ├─ reductor.js       totes les accions (atorgar, avís, desfer, alumnes, categories…)
   │  └─ informes.js       resums per alumne/a, grup i període
   ├─ dades/
   │  ├─ repositori.js     interfície carregar/guardar + adaptador localStorage (clau versionada)
   │  └─ copia.js          exportar/importar JSON, CSV
   ├─ estat/ClasseContext.jsx      Context + useReducer + guardat automàtic
   ├─ so/so.js                     efectes Web Audio i veu
   └─ components/
      Trinquet, TargetaAlumne, MarcadorPartida, FinestraQuinzes, Rifa,
      VistaAlumne, AvatarPilotari (SVG), EditorAvatar, Celebracio,
      Configuracio (+ pestanyes), Informes, Finestra, Pilota (SVG)
```

La capa `dades/repositori.js` és l'únic lloc que sap on es guarda: canviar a Supabase més avant serà afegir un altre adaptador.

**Dades**: `aula`, `alumnes[]` (id, nom, avatar, quinzes, record, absent), `categories[]` (id, nom, icona, valor, tipus), `esdeveniments[]` (data, alumneId, categoriaId, valor, tipus quinze/avís, lot per a desfer), `partida`, `config` (so, veu). Només noms de pila; res ix de l'aparell.

## Passos d'execució

0. **Preparació**: `git init`, esquelet Vite + React + Tailwind + Vitest, guardar el document de disseny i començar `docs/DIARI.md`. Primer commit.
1. **Domini amb proves primer** (TDD): barem, nivells, partida, reductor (atorgar, avís, −1 sense baixar de 0, tota la classe, desfer, absents), informes.
2. **Dades**: repositori local amb clau versionada, guardat automàtic, exportar/importar.
3. **Identitat visual** (skill frontend-design): paleta blau/roig de trinquet, tipografia, components base, `AvatarPilotari` i `Pilota` en SVG.
4. **El Trinquet + Donar Quinzes**: graella, finestra de categories, animacions i sons, Desfés.
5. **Tota la classe, Rifa, Marcador de Partida i Celebracions.**
6. **Vista d'alumne/a + Editor d'avatar + complements.**
7. **Configuració** (aula, alumnes, categories, partida, dades).
8. **Informes** (individual, grup, imprimir, CSV).
9. **Repàs final**: accessibilitat, textos en valencià, README, actualitzar el DIARI.

Un commit per pas. No es puja a GitHub ni es publica si no es demana.

## Verificació
- `npm test` — proves del domini i dels components principals en verd.
- `npm run build` — compila sense errors.
- `npm run dev` i recorregut al navegador a 1920×1080 i a mida de tauleta: crear aula i alumnes, donar +1/+2, avís i −1, tota la classe, rifa, completar un joc i una partida, pujar de nivell, desbloquejar i equipar un complement, obrir la vista d'alumne, generar un informe, exportar i tornar a importar la còpia, recarregar la pàgina i comprovar que tot es conserva. Consola sense errors.

## Fora d'abast (ara)
Núvol i comptes, ús en diversos aparells alhora, PIN de mestre/a, publicació en línia, diverses aules.
