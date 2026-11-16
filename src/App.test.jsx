import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';
import { CLAU } from './dades/repositori.js';
import { estatInicial, reductor, crearAlumne } from './domini/reductor.js';

function guardaClasse(...noms) {
  const estat = reductor(estatInicial(), {
    type: 'ALUMNES_AFEGIR',
    alumnes: noms.map((n, i) => crearAlumne(n, i, `a${i}`)),
  });
  localStorage.setItem(CLAU, JSON.stringify({ ...estat, config: { so: false, veu: false } }));
}

const targeta = (nom) => screen.getByRole('button', { name: new RegExp(`^${nom}:`) });
const guardat = () => JSON.parse(localStorage.getItem(CLAU));

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
    expect(guardat().alumnes[0].quinzes).toBe(2);
    expect(guardat().partida.acumulat).toBe(2);

    await usuari.click(screen.getByRole('button', { name: 'Desfés' }));
    expect(targeta('Aitana')).toHaveAccessibleName(/Aitana: 0 quinzes/);
    expect(guardat().esdeveniments).toEqual([]);
  });

  it('«Tota la classe» premia tots els presents', async () => {
    const usuari = userEvent.setup();
    guardaClasse('Aitana', 'Blai', 'Carme');
    render(<App />);

    await usuari.click(screen.getByRole('button', { name: 'Tota la classe' }));
    await usuari.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Bon traure/ }));

    expect(guardat().alumnes.map((a) => a.quinzes)).toEqual([1, 1, 1]);
    expect(guardat().partida.acumulat).toBe(3);
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
    expect(guardat().alumnes[0].quinzes).toBe(2);
    expect(guardat().esdeveniments.at(-1).tipus).toBe('avis');

    await usuari.click(targeta('Aitana'));
    await usuari.click(screen.getByRole('button', { name: /Pilota a la galeria/ }));
    await usuari.click(screen.getByRole('button', { name: '−1 quinze' }));
    expect(guardat().alumnes[0].quinzes).toBe(1);
    expect(guardat().alumnes[0].record).toBe(2);
  });

  it('a Configuració es poden afegir propostes del trinquet i posar −2 a una de millora', async () => {
    const usuari = userEvent.setup();
    guardaClasse('Aitana');
    render(<App />);

    await usuari.click(screen.getByRole('button', { name: 'Configuració' }));
    await usuari.click(screen.getByRole('tab', { name: 'Categories' }));

    await usuari.selectOptions(screen.getByRole('combobox', { name: 'Afig una categoria que suma' }), 'rest-ferro');
    await usuari.click(screen.getAllByRole('button', { name: 'Afig' })[0]);
    expect(guardat().categories.find((c) => c.id === 'rest-ferro')).toMatchObject({ valor: 2, tipus: 'positiu' });

    await usuari.selectOptions(screen.getByRole('combobox', { name: 'Afig un aspecte a millorar' }), 'sense-didals');
    await usuari.click(screen.getAllByRole('button', { name: 'Afig' })[1]);
    expect(guardat().categories.find((c) => c.id === 'sense-didals')).toMatchObject({ tipus: 'millora' });

    const galeria = screen.getByRole('group', { name: 'Quinzes de Pilota a la galeria' });
    await usuari.click(within(galeria).getByRole('button', { name: 'Més quinzes' }));
    expect(within(galeria).getByText('−2')).toBeInTheDocument();
    expect(guardat().categories.find((c) => c.id === 'pilota-galeria').valor).toBe(2);

    await usuari.click(screen.getByRole('button', { name: 'Tanca' }));
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
