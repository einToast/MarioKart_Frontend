import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { backend } from '../../test/backend';
import { makeTeam } from '../../test/fixtures';
import { buttonOf } from '../../test/render';
import { expectErrorToast } from '../../test/overlays';
import TeamChangeModal from './TeamChangeModal';
import TeamDeleteModal from './TeamDeleteModal';

const CHARACTERS_URL = '/public/teams/characters/available';

const team = () => makeTeam({ id: 5, teamName: 'Team Toad', character: { id: 4, characterName: 'Toad' }, finalReady: false, active: true });

describe('TeamChangeModal', () => {
    const renderModal = (showModal = true) => {
        const closeModal = vi.fn();
        const view = render(<TeamChangeModal showModal={showModal} closeModal={closeModal} team={team()} />);
        return { ...view, closeModal };
    };

    const characterOptions = () => screen.getAllByRole('option').map(option => option.textContent);

    beforeEach(() => {
        backend.get(CHARACTERS_URL, [{ id: 1, characterName: 'Mario' }, { id: 2, characterName: 'Yoshi' }]);
    });

    it('stays hidden and loads nothing while closed', () => {
        renderModal(false);

        expect(screen.queryByPlaceholderText('Name eingeben')).not.toBeInTheDocument();
        expect(backend.requests).toEqual([]);
    });

    it('is prefilled with the name and the character of the team', async () => {
        renderModal();

        expect(await screen.findByPlaceholderText('Name eingeben')).toHaveValue('Team Toad');
        expect(screen.getByRole('combobox')).toHaveValue('Toad');
    });

    it('offers the current character and every free character', async () => {
        renderModal();

        await waitFor(() => expect(characterOptions()).toEqual(['Toad', 'Mario', 'Yoshi']));
    });

    it('saves the new name and character and reports the change', async () => {
        backend.put('/admin/teams/5', team());
        const { closeModal } = renderModal();
        await waitFor(() => expect(characterOptions()).toContain('Yoshi'));

        fireEvent.change(screen.getByPlaceholderText('Name eingeben'), { target: { value: 'Die Pilze' } });
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Yoshi' } });
        fireEvent.click(screen.getByText('Team ändern'));

        await waitFor(() => expect(closeModal).toHaveBeenCalledWith({ teamChanged: true }));
        expect(backend.requestsTo('PUT', '/admin/teams/5')).toEqual([{
            method: 'PUT',
            url: '/admin/teams/5',
            body: { teamName: 'Die Pilze', characterName: 'Yoshi', finalReady: false, active: true },
        }]);
    });

    it.each(['Enter', ' '])('saves with the "%s" key', async (key) => {
        backend.put('/admin/teams/5', team());
        const { closeModal } = renderModal();
        await screen.findByPlaceholderText('Name eingeben');

        fireEvent.keyDown(buttonOf('Team ändern'), { key });

        await waitFor(() => expect(closeModal).toHaveBeenCalledWith({ teamChanged: true }));
    });

    it('shows the error and stays open when the character is already taken', async () => {
        backend.fail('PUT', '/admin/teams/5', 400);
        const { closeModal } = renderModal();
        await screen.findByPlaceholderText('Name eingeben');

        fireEvent.click(screen.getByText('Team ändern'));

        await expectErrorToast('Charakter ist bereits vergeben');
        expect(closeModal).not.toHaveBeenCalled();
    });

    it('reports an error when the backend answers without the updated team', async () => {
        backend.put('/admin/teams/5', undefined);
        const { closeModal } = renderModal();
        await screen.findByPlaceholderText('Name eingeben');

        fireEvent.click(screen.getByText('Team ändern'));

        await expectErrorToast('Team konnte nicht aktualisiert werden');
        expect(closeModal).not.toHaveBeenCalled();
    });

    it('shows an error when the characters cannot be loaded', async () => {
        backend.fail('GET', CHARACTERS_URL, 500);

        renderModal();

        await expectErrorToast('Charaktere konnten nicht geladen werden');
    });

    it('closes without saving on cancel', async () => {
        const { closeModal } = renderModal();
        await screen.findByPlaceholderText('Name eingeben');

        fireEvent.click(screen.getByText('Abbrechen'));

        expect(closeModal).toHaveBeenCalledWith({ teamChanged: false });
        expect(backend.requestsTo('PUT', '/admin/teams/5')).toEqual([]);
    });

    it.each(['Enter', ' '])('cancels with the "%s" key', async (key) => {
        const { closeModal } = renderModal();
        await screen.findByPlaceholderText('Name eingeben');

        fireEvent.keyDown(buttonOf('Abbrechen'), { key });

        expect(closeModal).toHaveBeenCalledWith({ teamChanged: false });
    });
});

describe('TeamDeleteModal', () => {
    const DELETE = 'Team löschen';

    const renderModal = (showModal = true) => {
        const closeModal = vi.fn();
        const view = render(<TeamDeleteModal showModal={showModal} closeModal={closeModal} team={team()} />);
        return { ...view, closeModal };
    };

    // "Team löschen" is both the title and the button label; this is the button
    const deleteButton = () => screen.getByText(DELETE, { selector: 'p' });

    it('stays hidden while closed', () => {
        renderModal(false);

        expect(screen.queryByText(/wirklich löschen/)).not.toBeInTheDocument();
    });

    it('asks for confirmation and names the team', async () => {
        renderModal();

        expect(await screen.findByText(/wirklich löschen/)).toHaveTextContent('Willst du das Team Team Toad wirklich löschen?');
        expect(screen.getByText('Diese Aktion kann nicht rückgängig gemacht werden.')).toBeInTheDocument();
    });

    it('deletes the team and reports the deletion', async () => {
        backend.delete('/admin/teams/5');
        const { closeModal } = renderModal();
        await screen.findByText(/wirklich löschen/);

        fireEvent.click(deleteButton());

        await waitFor(() => expect(closeModal).toHaveBeenCalledWith({ teamDeleted: true }));
        expect(backend.requests).toEqual([{ method: 'DELETE', url: '/admin/teams/5', body: undefined }]);
    });

    it.each(['Enter', ' '])('deletes with the "%s" key', async (key) => {
        backend.delete('/admin/teams/5');
        const { closeModal } = renderModal();
        await screen.findByText(/wirklich löschen/);

        fireEvent.keyDown(deleteButton().closest('ion-button') as Element, { key });

        await waitFor(() => expect(closeModal).toHaveBeenCalledWith({ teamDeleted: true }));
    });

    it('shows the error and stays open when the team cannot be deleted', async () => {
        backend.fail('DELETE', '/admin/teams/5', 409);
        const { closeModal } = renderModal();
        await screen.findByText(/wirklich löschen/);

        fireEvent.click(deleteButton());

        await expectErrorToast('Spielplan wurde bereits erstellt');
        expect(closeModal).not.toHaveBeenCalled();
    });

    it('closes without deleting on cancel', async () => {
        const { closeModal } = renderModal();
        await screen.findByText(/wirklich löschen/);

        fireEvent.click(screen.getByText('Abbrechen'));

        expect(closeModal).toHaveBeenCalledWith({ teamDeleted: false });
        expect(backend.requests).toEqual([]);
    });
});
