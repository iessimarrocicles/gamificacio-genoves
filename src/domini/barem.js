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
