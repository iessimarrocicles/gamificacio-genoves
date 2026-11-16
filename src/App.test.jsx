import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';
import { CLAU } from './dades/repositori.js';
import { estatInicial, reductor, crearAlumne } from './domini/reductor.js';
import { escolaInicial, reductorEscola } from './domini/escola.js';

const alumnes = (noms) => noms.map((n, i) => crearAlumne(n, i, `a${i}`));

/** Dades guardades amb el format antic: una sola classe. */
function guardaClasse(...noms) {
  const estat = reductor(estatInicial(), { type: 'ALUMNES_AFEGIR', alumnes: alumnes(noms) });
  localStorage.setItem(CLAU, JSON.stringify({ ...estat, config: { so: false, veu: false } }));
}

/** Dades guardades amb el format nou: s'apliquen les accions una darrere de l'altra. */
function guardaEscola(...accions) {
  const escola = accions.reduce(reductorEscola, escolaInicial());
  localStorage.setItem(CLAU, JSON.stringify({ ...escola, config: { so: false, veu: false } }));
}

const ambAlumnes = (...noms) => ({ type: 'ALUMNES_AFEGIR', alumnes: alumnes(noms) });
const ambGrup = (nom, alumneIds, color = 'roig') => ({ type: 'GRUP_AFEGIR', grup: { id: 'g1', nom, color, alumneIds } });

const targeta = (nom) => screen.getByRole('button', { name: new RegExp(`^${nom}:`) });
const guardat = () => JSON.parse(localStorage.getItem(CLAU));
/** La classe activa, tal com ha quedat guardada. */
const aula = () => guardat().aules.find((a) => a.id === guardat().activaId);
const classes = () => screen.getByRole('navigation', { name: 'Classes' });
const seccio = (nom) => within(screen.getByRole('navigation', { name: 'Seccions' })).getByRole('button', { name: nom });

describe('pantalla del mestre/a', () => {
  beforeEach(() => localStorage.clear());

  it('amb el trinquet buit convida a afegir alumnes i pot carregar una classe d’exemple', async () => {
    const usuari = userEvent.setup();
    render(<App />);
    expect(screen.getByText('El trinquet està buit')).toBeInTheDocument();
    await usuari.click(screen.getByRole('button', { name: /classe d’exemple/ }));
    expect(screen.getAllByRole('button', { name: /: 0 quinzes, Aficionat\/da/ })).toHaveLength(22);
  });

  it('dona quinzes a un/a alumne/a, els guarda i els pot desfer', async () => {
    const usuari = userEvent.setup();
    guardaClasse('Aitana', 'Blai');
    render(<App />);

    await usuari.click(targeta('Aitana'));
    const finestra = screen.getByRole('dialog', { name: 'Aitana' });
    await usuari.click(within(finestra).getByRole('button', { name: /Treball d’equip/ }));

    expect(targeta('Aitana')).toHaveAccessibleName(/Aitana: 2 quinzes/);
    expect(targeta('Blai')).toHaveAccessibleName(/Blai: 0 quinzes/);
    expect(aula().alumnes[0].quinzes).toBe(2);
    expect(aula().partida.acumulat).toBe(2);

    await usuari.click(screen.getByRole('button', { name: 'Desfés' }));
    expect(targeta('Aitana')).toHaveAccessibleName(/Aitana: 0 quinzes/);
    expect(aula().esdeveniments).toEqual([]);
  });

  it('«Tota la classe» premia tots els presents', async () => {
    const usuari = userEvent.setup();
    guardaClasse('Aitana', 'Blai', 'Carme');
    render(<App />);

    await usuari.click(screen.getByRole('button', { name: 'Tota la classe' }));
    await usuari.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Bon traure/ }));

    expect(aula().alumnes.map((a) => a.quinzes)).toEqual([1, 1, 1]);
    expect(aula().partida.acumulat).toBe(3);
  });

  it('el barem de millora deixa triar entre avís i −1', async () => {
    const usuari = userEvent.setup();
    guardaClasse('Aitana');
    render(<App />);

    await usuari.click(targeta('Aitana'));
    await usuari.click(screen.getByRole('button', { name: /Quinze directe/ }));

    await usuari.click(targeta('Aitana'));
    await usuari.click(screen.getByRole('button', { name: /Falta al traure/ }));
    await usuari.click(screen.getByRole('button', { name: 'Avís' }));
    expect(aula().alumnes[0].quinzes).toBe(2);
    expect(aula().esdeveniments.at(-1).tipus).toBe('avis');

    await usuari.click(targeta('Aitana'));
    await usuari.click(screen.getByRole('button', { name: /Pilota a la galeria/ }));
    await usuari.click(screen.getByRole('button', { name: '−1 quinze' }));
    expect(aula().alumnes[0].quinzes).toBe(1);
    expect(aula().alumnes[0].record).toBe(2);
  });

  it('a Configuració es poden afegir propostes del trinquet i posar −2 a una de millora', async () => {
    const usuari = userEvent.setup();
    guardaClasse('Aitana');
    render(<App />);

    await usuari.click(seccio('Configuració'));
    await usuari.click(screen.getByRole('tab', { name: 'Categories' }));

    await usuari.selectOptions(screen.getByRole('combobox', { name: 'Afig una categoria que suma' }), 'rest-ferro');
    await usuari.click(screen.getAllByRole('button', { name: 'Afig' })[0]);
    expect(aula().categories.find((c) => c.id === 'rest-ferro')).toMatchObject({ valor: 2, tipus: 'positiu' });

    await usuari.selectOptions(screen.getByRole('combobox', { name: 'Afig un aspecte a millorar' }), 'sense-didals');
    await usuari.click(screen.getAllByRole('button', { name: 'Afig' })[1]);
    expect(aula().categories.find((c) => c.id === 'sense-didals')).toMatchObject({ tipus: 'millora' });

    const galeria = screen.getByRole('group', { name: 'Quinzes de Pilota a la galeria' });
    await usuari.click(within(galeria).getByRole('button', { name: 'Més quinzes' }));
    expect(within(galeria).getByText('−2')).toBeInTheDocument();
    expect(aula().categories.find((c) => c.id === 'pilota-galeria').valor).toBe(2);

    await usuari.click(seccio('El trinquet'));
    await usuari.click(targeta('Aitana'));
    await usuari.click(screen.getByRole('button', { name: /Pilota a la galeria/ }));
    expect(screen.getByRole('button', { name: '−2 quinzes' })).toBeInTheDocument();
  });

  it('en mode alumnat, tocar el nom obri el pilotari i no deixa donar quinzes', async () => {
    const usuari = userEvent.setup();
    guardaClasse('Aitana');
    render(<App />);

    await usuari.click(screen.getByRole('button', { name: 'Alumnat' }));
    expect(screen.queryByRole('button', { name: 'Tota la classe' })).not.toBeInTheDocument();
    await usuari.click(targeta('Aitana'));

    const vista = screen.getByRole('dialog', { name: 'El pilotari de Aitana' });
    expect(within(vista).getByText('Aficionat/da')).toBeInTheDocument();
    expect(within(vista).getByRole('button', { name: /^Faixa.*Als 5 quinzes/ })).toBeDisabled();
    expect(within(vista).getByRole('button', { name: /Didals/ })).toBeEnabled();
  });
});

describe('diverses classes', () => {
  beforeEach(() => localStorage.clear());

  it('unes dades guardades amb la versió d’una sola classe apareixen com a primera classe', () => {
    guardaClasse('Aitana', 'Blai');
    render(<App />);

    expect(within(classes()).getByRole('button', { name: /3r de Primària/ })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('heading', { level: 1, name: '3r de Primària' })).toBeInTheDocument();
    expect(targeta('Blai')).toBeInTheDocument();
  });

  it('crea una classe nova, buida, i porta a Configuració per a afegir-hi alumnes', async () => {
    const usuari = userEvent.setup();
    guardaClasse('Aitana');
    render(<App />);

    await usuari.click(screen.getByRole('button', { name: '+ Classe nova' }));
    await usuari.type(screen.getByRole('textbox', { name: 'Nom de la classe nova' }), '4t B');
    await usuari.click(screen.getByRole('button', { name: 'Crea la classe' }));

    expect(guardat().aules.map((a) => a.aula.nom)).toEqual(['3r de Primària', '4t B']);
    expect(aula().aula.nom).toBe('4t B');
    expect(aula().alumnes).toEqual([]);
    expect(screen.getByRole('heading', { level: 1, name: 'Configuració' })).toBeInTheDocument();
    expect(screen.getByText('Encara no hi ha alumnes')).toBeInTheDocument();
  });

  it('en canviar de classe es veuen els seus alumnes, i els quinzes van només a eixa classe', async () => {
    const usuari = userEvent.setup();
    guardaEscola(ambAlumnes('Aitana'), { type: 'AULA_CREAR', id: 'b', nom: '4t B' }, ambAlumnes('Blai'));
    render(<App />);

    expect(targeta('Blai')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Aitana:/ })).not.toBeInTheDocument();
    await usuari.click(targeta('Blai'));
    await usuari.click(screen.getByRole('button', { name: /Quinze directe/ }));

    await usuari.click(within(classes()).getByRole('button', { name: /3r de Primària/ }));
    expect(targeta('Aitana')).toHaveAccessibleName(/Aitana: 0 quinzes/);
    expect(screen.queryByRole('button', { name: /^Blai:/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Desfés' })).not.toBeInTheDocument();

    const [tercer, quart] = guardat().aules;
    expect(tercer.alumnes[0].quinzes).toBe(0);
    expect(tercer.partida.acumulat).toBe(0);
    expect(quart.alumnes[0].quinzes).toBe(2);
  });

  it('a Configuració es canvia el nom de la classe i es pot esborrar, però no l’última', async () => {
    const usuari = userEvent.setup();
    guardaEscola(ambAlumnes('Aitana'), { type: 'AULA_CREAR', id: 'b', nom: '4t B' });
    render(<App />);

    await usuari.click(seccio('Configuració'));
    await usuari.click(screen.getByRole('tab', { name: 'Classe i so' }));
    await usuari.type(screen.getByRole('textbox', { name: 'Nom de la classe' }), '!');
    expect(within(classes()).getByRole('button', { name: /4t B!/ })).toBeInTheDocument();

    await usuari.click(screen.getByRole('button', { name: 'Esborra esta classe' }));
    await usuari.click(screen.getByRole('button', { name: 'Sí' }));
    expect(guardat().aules.map((a) => a.aula.nom)).toEqual(['3r de Primària']);
    expect(aula().alumnes).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Esborra esta classe' })).toBeDisabled();
  });

  it('en mode alumnat no es pot canviar de classe ni entrar a les seccions del mestre/a', async () => {
    const usuari = userEvent.setup();
    guardaEscola(ambAlumnes('Aitana'), { type: 'AULA_CREAR', id: 'b', nom: '4t B' });
    render(<App />);

    await usuari.click(seccio('Informes'));
    await usuari.click(screen.getByRole('button', { name: 'Alumnat' }));

    expect(screen.getByRole('heading', { level: 1, name: '4t B' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Seccions' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '+ Classe nova' })).not.toBeInTheDocument();
    expect(within(classes()).getByRole('button', { name: /3r de Primària/ })).toBeDisabled();
  });
});

describe('grups dins d’una classe', () => {
  beforeEach(() => localStorage.clear());

  it('a Grups es crea un grup, s’hi posen alumnes i se li donen quinzes', async () => {
    const usuari = userEvent.setup();
    guardaClasse('Aitana', 'Blai', 'Carme');
    render(<App />);

    await usuari.click(seccio('Grups'));
    await usuari.click(screen.getByRole('button', { name: 'Grup nou' }));
    await usuari.click(screen.getByRole('button', { name: 'Aitana' }));
    await usuari.click(screen.getByRole('button', { name: 'Blai' }));
    expect(aula().grups[0]).toMatchObject({ nom: 'Grup 1', alumneIds: ['a0', 'a1'] });

    await usuari.click(screen.getByRole('button', { name: 'Dona quinzes al grup' }));
    await usuari.click(within(screen.getByRole('dialog', { name: 'Grup 1' })).getByRole('button', { name: /Bon traure/ }));

    expect(aula().alumnes.map((a) => a.quinzes)).toEqual([1, 1, 0]);
    expect(aula().esdeveniments.map((ev) => ev.grupId)).toEqual([aula().grups[0].id, aula().grups[0].id]);
    expect(screen.getByRole('status')).toHaveTextContent('Bon traure: +1 per a Grup 1');
  });

  it('des del trinquet es donen quinzes a un grup, només als membres que han vingut', async () => {
    const usuari = userEvent.setup();
    guardaEscola(ambAlumnes('Aitana', 'Blai', 'Carme'), ambGrup('Els Rojos', ['a0', 'a1']), {
      type: 'ALUMNE_ABSENT',
      id: 'a1',
      absent: true,
    });
    render(<App />);

    const grups = screen.getByRole('group', { name: 'Grups' });
    await usuari.click(within(grups).getByRole('button', { name: /Els Rojos/ }));
    await usuari.click(within(screen.getByRole('dialog', { name: 'Els Rojos' })).getByRole('button', { name: /Quinze directe/ }));

    expect(aula().alumnes.map((a) => a.quinzes)).toEqual([2, 0, 0]);
    expect(aula().esdeveniments).toHaveLength(1);
    expect(aula().esdeveniments[0].grupId).toBe('g1');
  });

  it('els grups no es veuen en mode alumnat', async () => {
    const usuari = userEvent.setup();
    guardaEscola(ambAlumnes('Aitana'), ambGrup('Els Rojos', ['a0']));
    render(<App />);

    await usuari.click(screen.getByRole('button', { name: 'Alumnat' }));
    expect(screen.queryByRole('group', { name: 'Grups' })).not.toBeInTheDocument();
  });

  it('Informes té una vista per grups amb els membres i els quinzes de cada un', async () => {
    const usuari = userEvent.setup();
    guardaEscola(ambAlumnes('Aitana', 'Blai', 'Carme'), ambGrup('Els Rojos', ['a0', 'a1']), {
      type: 'ATORGAR',
      alumneIds: ['a0', 'a1'],
      categoriaId: 'quinze-directe',
      lot: 'l1',
      data: new Date().toISOString(),
      grupId: 'g1',
    });
    render(<App />);

    await usuari.click(seccio('Informes'));
    await usuari.click(screen.getByRole('button', { name: 'Per grups' }));

    const fila = screen.getByRole('row', { name: /Els Rojos/ });
    expect(within(fila).getAllByRole('cell').map((c) => c.textContent)).toEqual(['2', '4', '4']);
  });
});

describe('còpia de seguretat', () => {
  beforeEach(() => localStorage.clear());

  it('recuperar una còpia torna totes les classes', async () => {
    const usuari = userEvent.setup();
    const copia = [ambAlumnes('Aitana'), { type: 'AULA_CREAR', id: 'b', nom: '4t B' }, ambAlumnes('Blai', 'Carme')].reduce(
      reductorEscola,
      escolaInicial(),
    );
    const fitxer = new File([JSON.stringify({ app: 'trinquet-de-3r', creada: '2026-11-16T10:00:00Z', estat: copia })], 'copia.json', {
      type: 'application/json',
    });
    render(<App />);

    await usuari.click(seccio('Configuració'));
    await usuari.click(screen.getByRole('tab', { name: 'Dades' }));
    await usuari.upload(screen.getByLabelText('Fitxer de còpia'), fitxer);

    expect(await screen.findByText('Còpia recuperada: 2 classes i 3 alumnes.')).toBeInTheDocument();
    expect(guardat().aules.map((a) => a.aula.nom)).toEqual(['3r de Primària', '4t B']);
    expect(within(classes()).getByRole('button', { name: /4t B/ })).toHaveAttribute('aria-current', 'true');
  });
});
