# Diari de com s'ha fet «El Trinquet de 3r»

Registre dels passos, prompts, plugins i decisions, perquè es puga explicar o repetir el procés.

## Eines

| Eina | Per a què s'ha usat |
|---|---|
| **Claude Code** (extensió de VS Code) | Planificar, escriure el codi, executar les proves i revisar l'app |
| Plugin **superpowers** | Mètode de treball: preguntes abans de construir, pla escrit, proves primer i comprovació abans de donar res per acabat |
| Plugin **frontend-design** | Direcció visual: paleta, lletres i composició pròpies del món del trinquet |
| Plugin **supabase** | Activat però sense ús: les dades es guarden en local |
| Plugin **context7** | Activat però pendent d'autoritzar; no s'ha arribat a usar |
| **Claude in Chrome** (extensió) | Obrir l'app al navegador i provar-la amb clics reals i captures |
| **GitHub CLI (`gh`) i GitHub Actions** | Crear el repositori i publicar l'app a GitHub Pages |
| **Mode pla** de Claude Code | Aprovar el disseny abans d'escriure cap línia de codi |

Els quatre plugins estan activats a `.claude/settings.json`.

## Passos, per ordre (16 de novembre de 2026)

### 1. Preparació de la sessió
- **Prompt:** llista dels plugins que es volien usar, amb permís perquè Claude n'afegira d'altres si calia.
- **Resultat:** creat `.claude/settings.json` amb els quatre plugins.

### 2. Decisions prèvies
- **Prompt:** «este projecte el vull fer des de 0 sense tindre en compte els anteriors creats».
- **Prompt:** «per ara tota la informació es guardarà en local encara que et diga el contrari en el prompt».

### 3. El prompt principal
Un sol prompt llarg amb aquesta estructura:

1. **Rol:** «Actua com un desenvolupador web expert en aplicacions educatives (EdTech) i gamificació a l'aula».
2. **Temàtica i identitat visual:** pilota valenciana, trinquets, raspall, escala i corda, el Genovés; estètica per a 8-9 anys; avatars de pilotaris.
3. **Rols d'usuari:** mestre/a (admin) i alumne/a.
4. **Sistema de puntuació:** Quinzes, barem positiu (+1 i +2), barem de millora (−1 o avís) i sis nivells.
5. **Pantalla principal:** Trinquet Virtual, «Tota la classe», rifa i Marcador de Partida.
6. **Requisits tècnics:** React o Tailwind, apta per a PDI i tauletes, dades en local.
7. **Entregables:** estructura del projecte, disseny UI/UX i codi funcional de la pantalla del mestre.

### 4. Preguntes abans de construir
Claude va fer tres preguntes i es va triar:

| Pregunta | Resposta |
|---|---|
| Com veu cada alumne/a el seu pilotari, si les dades són locals? | A la mateixa pissarra |
| Què entra en la primera versió? | Tot el que diu l'enunciat |
| Com funciona el «−1 o avís»? | Es tria en el moment |

### 5. Pla aprovat
Amb el mode pla es va escriure i aprovar el disseny: enfocaments comparats (React + Vite + Tailwind, un sol fitxer HTML, o Vue), regles del joc, pantalles, estructura i passos. Està guardat a `docs/superpowers/specs/2026-11-16-trinquet-de-3r-design.md`.

### 6. Construcció
1. Esquelet: Vite, React, Tailwind, Vitest i `git init`.
2. **Regles del joc amb les proves escrites primer:** nivells, partida, donar Quinzes, avís, −1, desfer i informes.
3. Capa de dades: `localStorage`, còpia de seguretat i CSV.
4. Identitat visual i dibuix del pilotari en SVG.
5. Pantalles: Trinquet, finestra de Quinzes, rifa, celebracions, vista d'alumne, editor d'avatar, configuració i informes.
6. Revisió al navegador i correccions.

### 7. Problemes trobats en revisar i com es van resoldre
| Problema | Solució |
|---|---|
| L'emoji de «Treball d'equip» eixia com a quadrets en Windows 10 | Canviat per un emoji compatible (👥) |
| El cabell dels pilotaris deixava veure el cap per dalt | Redibuixades les formes del cabell |
| En premiar tota la classe, les targetes mostraven avatars repetits | Dues peces de la targeta compartien identificador; se'ls va donar un de propi |
| La celebració no cabia en pantalla quan pujava de nivell tota la classe | Versió compacta amb la llista de noms quan en són més de quatre |
| Amb 22 alumnes, la partida es guanyava en cinc tocs | El joc passa de 40 a 100 Quinzes per defecte |

### 8. Repositori i publicació
- **Prompt:** «Crea un repositori en local i un repositori en github». El local ja existia; es va crear `iessimarrocicles/gamificacio-genoves` a GitHub (privat) amb la ferramenta `gh` i es va pujar.
- **Prompt:** «pots fer-la pública i a Pages per poder-la provar». El repositori passa a públic i s'afig una publicació automàtica amb GitHub Actions: proves, compilació i publicació a https://iessimarrocicles.github.io/gamificacio-genoves/

## Canvis respecte al pla
- **React 19** en lloc de React 18: és la versió estable actual.
- **Joc de 100 Quinzes** en lloc de 40 (vegeu la taula anterior).
- Afegit **«Tria'n uns quants»** per a premiar un grup de treball, que no estava al pla.

## Comprovacions fetes
- 66 proves automàtiques en verd (`npm test`).
- Compilació sense errors (`npm run build`).
- Recorregut al navegador: classe d'exemple, +2 individual, tota la classe, avís i −1, complement nou, rifa, vista d'alumne, posar-se la faixa, informes, canviar la partida i recarregar la pàgina conservant les dades.
- Sense desbordament horitzontal ni botons menuts a 768, 1024 i 1920 píxels d'amplada.

## No comprovat
- El so i la veu (no es poden escoltar des de les proves).
- La impressió dels informes en paper.
- L'ús en una pissarra digital real.
