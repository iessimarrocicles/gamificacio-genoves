import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { reductor, nouId } from '../domini/reductor.js';
import { reductorEscola, normalitzaEscola, vistaActiva, llistaAules } from '../domini/escola.js';
import { efectesAtorgar } from '../domini/efectes.js';
import { FRASES_QUINZE, FRASES_AVIS, FRASES_RESTA, fraseAleatoria } from '../domini/barem.js';
import { crearRepositoriLocal } from '../dades/repositori.js';
import { sons, parla } from '../so/so.js';

const ClasseContext = createContext(null);

function hiHaAlgunaCosa(efectes) {
  return efectes.pujades.length > 0 || efectes.complements.length > 0 || efectes.jocGuanyat || efectes.partidaGuanyada;
}

export function ClasseProvider({ children, repositori }) {
  const repo = useMemo(() => repositori ?? crearRepositoriLocal(), [repositori]);
  const [escola, dispatch] = useReducer(reductorEscola, null, () => normalitzaEscola(repo.carregar()));
  // La classe activa, amb la forma que usen totes les pantalles.
  const estat = useMemo(() => vistaActiva(escola), [escola]);
  const aules = useMemo(() => llistaAules(escola), [escola]);
  const [errorGuardat, setErrorGuardat] = useState(false);
  const [ultimaAccio, setUltimaAccio] = useState(null); // { lot, text } → per a «Desfés»
  const [esclats, setEsclats] = useState({}); // alumneId → { clau, text, to }
  const [celebracio, setCelebracio] = useState(null);

  const estatRef = useRef(estat);
  estatRef.current = estat;
  const ultimaRef = useRef(ultimaAccio);
  ultimaRef.current = ultimaAccio;

  useEffect(() => {
    setErrorGuardat(!repo.guardar(escola));
  }, [escola, repo]);

  // En canviar de classe, s'obliden els avisos i animacions de l'anterior.
  useEffect(() => {
    setUltimaAccio(null);
    setEsclats({});
    setCelebracio(null);
  }, [escola.activaId]);

  const so = useCallback((nom) => {
    if (estatRef.current.config.so) sons[nom]?.();
  }, []);

  const digues = useCallback((text) => {
    if (estatRef.current.config.so && estatRef.current.config.veu) parla(text);
  }, []);

  /** Dona quinzes (o un avís, o un −1) a un o més alumnes. mode: 'quinze' | 'avis' | 'resta'. */
  const atorgar = useCallback(
    (alumneIds, categoriaId, mode = 'quinze', grupId = null) => {
      const abans = estatRef.current;
      const categoria = abans.categories.find((c) => c.id === categoriaId);
      if (!categoria) return;
      const accio = {
        type: 'ATORGAR',
        alumneIds,
        categoriaId,
        mode,
        lot: nouId('lot'),
        data: new Date().toISOString(),
        ...(grupId ? { grupId } : {}),
      };
      const despres = reductor(abans, accio);
      if (despres === abans) return;
      dispatch(accio);

      const esPositiva = categoria.tipus === 'positiu';
      const esAvis = !esPositiva && mode !== 'resta';
      const to = esPositiva ? 'quinze' : esAvis ? 'avis' : 'resta';
      const nous = {};
      for (const ev of despres.esdeveniments.filter((e) => e.lot === accio.lot)) {
        const text = esAvis ? 'Avís' : ev.valor > 0 ? `+${ev.valor}` : ev.valor < 0 ? `−${-ev.valor}` : '0';
        nous[ev.alumneId] = { clau: ev.id, text, to };
      }
      setEsclats((actuals) => ({ ...actuals, ...nous }));

      const afectats = abans.alumnes.filter((a) => alumneIds.includes(a.id));
      const nomGrup = grupId ? abans.grups.find((g) => g.id === grupId)?.nom : null;
      const aQui = nomGrup ?? (afectats.length === 1 ? afectats[0].nom : `${afectats.length} alumnes`);
      const frase = fraseAleatoria(esPositiva ? FRASES_QUINZE : esAvis ? FRASES_AVIS : FRASES_RESTA);
      setUltimaAccio({
        lot: accio.lot,
        to,
        text: esPositiva
          ? `${categoria.nom}: +${categoria.valor} per a ${aQui}`
          : esAvis
            ? `Avís de «${categoria.nom}» per a ${aQui}`
            : `${categoria.nom}: −${categoria.valor} per a ${aQui}`,
        frase,
      });

      const efectes = efectesAtorgar(abans, despres);
      if (hiHaAlgunaCosa(efectes)) {
        setCelebracio({ ...efectes, premi: despres.partida.premi, clau: accio.lot });
        so(efectes.partidaGuanyada ? 'partida' : efectes.jocGuanyat ? 'joc' : 'nivell');
        if (efectes.partidaGuanyada) digues('Partida guanyada! Enhorabona, classe!');
        else if (efectes.pujades.length === 1) digues(`${efectes.pujades[0].nom} puja de nivell!`);
      } else {
        so(esPositiva ? (categoria.valor >= 2 ? 'doble' : 'quinze') : esAvis ? 'avis' : 'resta');
        digues(frase);
      }
    },
    [so, digues],
  );

  const desfer = useCallback(() => {
    const ultima = ultimaRef.current;
    if (!ultima) return;
    dispatch({ type: 'DESFER', lot: ultima.lot });
    so('desfer');
    setUltimaAccio(null);
    setCelebracio(null);
  }, [so]);

  const valor = useMemo(
    () => ({
      estat,
      aules,
      totesLesAules: escola,
      dispatch,
      atorgar,
      desfer,
      so,
      digues,
      ultimaAccio,
      oblidaUltimaAccio: () => setUltimaAccio(null),
      esclats,
      celebracio,
      tancaCelebracio: () => setCelebracio(null),
      errorGuardat,
    }),
    [estat, aules, escola, atorgar, desfer, so, digues, ultimaAccio, esclats, celebracio, errorGuardat],
  );

  return <ClasseContext.Provider value={valor}>{children}</ClasseContext.Provider>;
}

export function useClasse() {
  const valor = useContext(ClasseContext);
  if (!valor) throw new Error('useClasse s’ha d’usar dins de <ClasseProvider>');
  return valor;
}
