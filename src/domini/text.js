/** «1 quinze», «3 quinzes». */
export function quinzes(n) {
  return `${n} ${n === 1 ? 'quinze' : 'quinzes'}`;
}

/** Tria la forma singular o plural segons la quantitat. */
export function plural(n, un, molts) {
  return n === 1 ? un : molts;
}
