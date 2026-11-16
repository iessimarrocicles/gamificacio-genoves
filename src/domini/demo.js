import { crearAlumne } from './reductor.js';

// Classe d'exemple per a provar l'app sense haver d'escriure cap nom.
export const NOMS_DEMO = [
  'Aitana', 'Blai', 'Carme', 'Dídac', 'Empar', 'Ferran', 'Gemma', 'Hug', 'Isabel', 'Jaume', 'Laia',
  'Marc', 'Neus', 'Oriol', 'Pau', 'Queralt', 'Roser', 'Sergi', 'Tonet', 'Úrsula', 'Vicent', 'Xavi',
];

export function alumnesDemo() {
  return NOMS_DEMO.map((nom, i) => crearAlumne(nom, i));
}
