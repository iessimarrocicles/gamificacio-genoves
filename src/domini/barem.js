// El barem: categories de comportament, nivells i complements.
// És l'únic lloc on viuen les regles «de contingut» del joc.

export const CATEGORIES_INICIALS = [
  {
    id: 'bon-traure',
    nom: 'Bon traure',
    icona: '🤚',
    valor: 1,
    tipus: 'positiu',
    descripcio: 'Fer les tasques a temps i amb cura.',
  },
  {
    id: 'joc-net',
    nom: 'Joc net',
    icona: '🤝',
    valor: 1,
    tipus: 'positiu',
    descripcio: 'Cavallerositat: respectar, ajudar i saber compartir.',
  },
  {
    id: 'atencio-canxa',
    nom: 'Atenció a la canxa',
    icona: '👀',
    valor: 1,
    tipus: 'positiu',
    descripcio: 'Escoltar i mantindre el silenci quan toca.',
  },
  {
    id: 'treball-equip',
    nom: 'Treball d’equip',
    icona: '👥',
    valor: 2,
    tipus: 'positiu',
    descripcio: 'Col·laborar correctament en grup.',
  },
  {
    id: 'quinze-directe',
    nom: 'Quinze directe',
    icona: '⚡',
    valor: 2,
    tipus: 'positiu',
    descripcio: 'Superar un repte o fer un esforç destacat.',
  },
  {
    id: 'falta-traure',
    nom: 'Falta al traure',
    icona: '💭',
    valor: 1,
    tipus: 'millora',
    descripcio: 'Distracció recurrent.',
  },
  {
    id: 'pilota-galeria',
    nom: 'Pilota a la galeria',
    icona: '📣',
    valor: 1,
    tipus: 'millora',
    descripcio: 'Cridar o no respectar el torn de paraula.',
  },
];

// Propostes amb vocabulari de pilota per al desplegable de Configuració → Categories.
// Inclouen les de l'enunciat (per si s'esborren i es volen recuperar) i moltes més.
export const CATEGORIES_TRINQUET = [
  ...CATEGORIES_INICIALS,

  // Sumen quinzes
  { id: 'bon-marxador', nom: 'Bon marxador', icona: '🎒', valor: 1, tipus: 'positiu', descripcio: 'Portar el material i l’agenda a punt, com qui porta el compte de la partida.' },
  { id: 'canxa-neta', nom: 'Canxa neta', icona: '🧹', valor: 1, tipus: 'positiu', descripcio: 'Deixar la taula i l’aula ben endreçades.' },
  { id: 'galeria-animada', nom: 'Galeria animada', icona: '👏', valor: 1, tipus: 'positiu', descripcio: 'Animar i felicitar els companys i companyes.' },
  { id: 'bona-volea', nom: 'Bona volea', icona: '🙋', valor: 1, tipus: 'positiu', descripcio: 'Participar i respondre bé quan toca.' },
  { id: 'partida-casa', nom: 'Partida a casa', icona: '🏠', valor: 1, tipus: 'positiu', descripcio: 'Portar fets els deures de casa.' },
  { id: 'lectura-trinquet', nom: 'Veu de trinquet', icona: '📖', valor: 1, tipus: 'positiu', descripcio: 'Llegir en veu alta amb bona entonació.' },
  { id: 'a-punt-traure', nom: 'A punt per a traure', icona: '⏰', valor: 1, tipus: 'positiu', descripcio: 'Arribar puntual i començar la tasca de seguida.' },
  { id: 'tanto-mitger', nom: 'Tanto de mitger', icona: '🤲', valor: 2, tipus: 'positiu', descripcio: 'Ajudar un company/a a entendre la tasca.' },
  { id: 'rest-ferro', nom: 'Rest de ferro', icona: '💪', valor: 2, tipus: 'positiu', descripcio: 'Mantindre l’esforç tota la sessió sense rendir-se.' },
  { id: 'quinze-dau', nom: 'Quinze al dau', icona: '🎯', valor: 2, tipus: 'positiu', descripcio: 'Fer una tasca extra o voluntària.' },
  { id: 'paret-escala', nom: 'Pilota a l’escala', icona: '🪜', valor: 2, tipus: 'positiu', descripcio: 'Millorar molt respecte a l’última vegada.' },
  { id: 'jugada-mestra', nom: 'Jugada mestra', icona: '🏆', valor: 3, tipus: 'positiu', descripcio: 'Un treball excel·lent que mereix un aplaudiment.' },

  // Per a millorar
  { id: 'pilota-corda', nom: 'Pilota baix la corda', icona: '🪢', valor: 1, tipus: 'millora', descripcio: 'No acabar la tasca que tocava.' },
  { id: 'sense-didals', nom: 'Sense didals', icona: '🧤', valor: 1, tipus: 'millora', descripcio: 'Oblidar el material o l’agenda.' },
  { id: 'canxa-bruta', nom: 'Canxa bruta', icona: '🗑️', valor: 1, tipus: 'millora', descripcio: 'Deixar la taula o l’aula desordenades.' },
  { id: 'fora-trinquet', nom: 'Fora del trinquet', icona: '🚪', valor: 1, tipus: 'millora', descripcio: 'Alçar-se o eixir del lloc sense permís.' },
  { id: 'tard-partida', nom: 'Tard a la partida', icona: '🐌', valor: 1, tipus: 'millora', descripcio: 'Arribar tard o tardar molt a començar.' },
  { id: 'joc-brut', nom: 'Joc brut', icona: '🟨', valor: 2, tipus: 'millora', descripcio: 'Faltar al respecte a un company/a.' },
];

// El nivell depén del rècord (màxim de quinzes assolit), de manera que mai es perd.
export const NIVELLS = [
  { numero: 1, nom: 'Aficionat/da', minim: 0, lema: 'Tot gran pilotari va començar mirant des de l’escala.' },
  { numero: 2, nom: 'Marxador/a', minim: 10, lema: 'Ja portes el compte de la partida!' },
  { numero: 3, nom: 'Punter/a', minim: 25, lema: 'Davant de tot, a punt per a rematar.' },
  { numero: 4, nom: 'Mitger/a', minim: 45, lema: 'Al mig de la canxa, on es decideix el joc.' },
  { numero: 5, nom: 'Rest', minim: 70, lema: 'El pes de la partida és teu.' },
  { numero: 6, nom: 'Campió/ona del Genovés', minim: 100, lema: 'Com les grans figures del Genovés, bressol de pilotaris.' },
];

export const COMPLEMENTS = [
  { id: 'didals', nom: 'Didals', minim: 0, descripcio: 'Protegeixen els dits del colp de la pilota.' },
  { id: 'faixa', nom: 'Faixa', minim: 5, descripcio: 'La faixa del teu equip, ben cenyida.' },
  { id: 'mocador', nom: 'Mocador al coll', minim: 15, descripcio: 'Per a les partides de dia de festa.' },
  { id: 'guant', nom: 'Guant de pilota', minim: 30, descripcio: 'Cuiro i esparadrap: la mà preparada.' },
  { id: 'espardenyes', nom: 'Espardenyes de careta', minim: 50, descripcio: 'Les de tota la vida per a jugar al carrer.' },
  { id: 'faixa-daurada', nom: 'Faixa daurada', minim: 75, descripcio: 'Només per a finals.' },
  { id: 'trofeu', nom: 'Trofeu del Genovés', minim: 100, descripcio: 'El premi dels campions i les campiones.' },
];

export const OPCIONS_AVATAR = {
  samarreta: ['blava', 'roja'],
  pell: ['#f6d3b3', '#e8b98a', '#c98d5d', '#9a6239', '#6b4226'],
  cabellColor: ['#2b2118', '#5a3a1e', '#a8672a', '#e0b860', '#c0392b'],
  cabellEstil: ['curt', 'llarg', 'cua', 'arrissat', 'trenes'],
};

// Frases curtes en positiu. S'usen en pantalla i, si la veu està activada, en veu alta.
export const FRASES_QUINZE = [
  'Quinze!',
  'Bona pilota!',
  'Això és jugar bé!',
  'Bon colp!',
  'Va de bo!',
  'Quina volea!',
  'Pilota ben tornada!',
];

export const FRASES_AVIS = [
  'Tornem a traure. Tu pots!',
  'Ànim, que la partida és llarga.',
  'Pilota nova: ho tornem a provar.',
  'Respira i torna a la canxa.',
];

export const FRASES_RESTA = [
  'Un quinze que se’n va. El pròxim és teu!',
  'Falta. A recuperar-lo en la pròxima jugada!',
];

export const PREMIS_SUGGERITS = [
  '10 minuts més de pati',
  'Una partida de raspall al pati',
  'Vesprada de jocs de taula',
  'Triem la música de la classe',
  'Excursió al trinquet del poble',
];

export function fraseAleatoria(llista, atzar = Math.random) {
  return llista[Math.floor(atzar() * llista.length)];
}
