import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { reductor, estatInicial, normalitzaEstat, nouId } from '../domini/reductor.js';
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
  const [estat, dispatch] = useReducer(reductor, null, () => {
    const guardat = repo.carregar();
    return guardat ? normalitzaEstat(guardat) : estatInicial();
  });
  const [errorGuardat, setErrorGuardat] = useState(false);
  const [ultimaAccio, setUltimaAccio] = useState(null); // { lot, text } → per a «Desfés»
  const [esclats, setEsclats] = useState({}); // alumneId → { clau, text, to }
  const [celebracio, setCelebracio] = useState(null);

  const estatRef = useRef(estat);
  estatRef.current = estat;
  const ultimaRef = useRef(ultimaAccio);
  ultimaRef.current = ultimaAccio;

  useEffect(() => {
    setErrorGuardat(!repo.guardar(estat));
  }, [estat, repo]);

  const so = useCallback((nom) => {
    if (estatRef.current.config.so) sons[nom]?.();
  }, []);

  const digues = useCallback((text) => {
    if (estatRef.current.config.so && estatRef.current.config.veu) parla(text);
  }, []);

  /** Dona quinzes (o un avís, o un −1) a un o més alumnes. mode: 'quinze' | 'avis' | 'resta'. */
  const atorgar = useCallback(
    (alumneIds, categoriaId, mode = 'quinze') => {
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
      const aQui = afectats.length === 1 ? afectats[0].nom : `${afectats.length} alumnes`;
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
    [estat, atorgar, desfer, so, digues, ultimaAccio, esclats, celebracio, errorGuardat],
  );

  return <ClasseContext.Provider value={valor}>{children}</ClasseContext.Provider>;
}

export function useClasse() {
  const valor = useContext(ClasseContext);
  if (!valor) throw new Error('useClasse s’ha d’usar dins de <ClasseProvider>');
  return valor;
}
