import { fireEvent, screen } from '@testing-library/react';
import Cookies from 'js-cookie';
import { currentPath, loginAsTeam, renderWithRouter, stubLocationAssign } from '../test/render';
import Header from './Header';

const teamMenu = (container: HTMLElement) => container.querySelector('.loggedInUserHead') as HTMLElement;

describe('Header', () => {
    it('shows the name and the character of the logged in team', () => {
        loginAsTeam({ name: 'Team Yoshi', character: 'Yoshi' });

        renderWithRouter(<Header />);

        expect(screen.getByText('Team Yoshi')).toBeInTheDocument();
        expect(screen.getByAltText('Yoshi')).toHaveAttribute('src', '/characters/Yoshi.png');
    });

    it('shows no avatar when nobody is logged in', () => {
        renderWithRouter(<Header />);

        expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    describe('team menu', () => {
        it('is closed initially', () => {
            loginAsTeam();

            renderWithRouter(<Header />);

            expect(screen.queryByText('Abmelden')).not.toBeInTheDocument();
        });

        it('opens and closes when the team is clicked', () => {
            loginAsTeam();
            const { container } = renderWithRouter(<Header />);

            fireEvent.click(teamMenu(container));
            expect(screen.getByText('Abmelden')).toBeInTheDocument();

            fireEvent.click(teamMenu(container));
            expect(screen.queryByText('Abmelden')).not.toBeInTheDocument();
        });

        it.each(['Enter', ' '])('opens with the "%s" key', (key) => {
            loginAsTeam();
            const { container } = renderWithRouter(<Header />);

            fireEvent.keyDown(teamMenu(container), { key });

            expect(screen.getByText('Abmelden')).toBeInTheDocument();
        });

        it('ignores other keys', () => {
            loginAsTeam();
            const { container } = renderWithRouter(<Header />);

            fireEvent.keyDown(teamMenu(container), { key: 'a' });

            expect(screen.queryByText('Abmelden')).not.toBeInTheDocument();
        });

        it('closes when something outside of it is pressed', () => {
            loginAsTeam();
            const { container } = renderWithRouter(<Header />);
            fireEvent.click(teamMenu(container));

            fireEvent.mouseDown(document.body);

            expect(screen.queryByText('Abmelden')).not.toBeInTheDocument();
        });

        it('stays open when something inside of it is pressed', () => {
            loginAsTeam();
            const { container } = renderWithRouter(<Header />);
            fireEvent.click(teamMenu(container));

            fireEvent.mouseDown(screen.getByText('Abmelden'));

            expect(screen.getByText('Abmelden')).toBeInTheDocument();
        });
    });

    describe('logout', () => {
        it('forgets the team and reloads the app at its root', () => {
            loginAsTeam();
            const assign = stubLocationAssign();
            const { container } = renderWithRouter(<Header />);
            fireEvent.click(teamMenu(container));

            fireEvent.click(screen.getByText('Abmelden'));

            expect(Cookies.get('user')).toBeUndefined();
            expect(assign).toHaveBeenCalledWith('/');
        });

        it.each(['Enter', ' '])('works with the "%s" key', (key) => {
            loginAsTeam();
            const assign = stubLocationAssign();
            const { container } = renderWithRouter(<Header />);
            fireEvent.click(teamMenu(container));

            fireEvent.keyDown(screen.getByText('Abmelden'), { key });

            expect(Cookies.get('user')).toBeUndefined();
            expect(assign).toHaveBeenCalledWith('/');
        });
    });

    describe('survey link', () => {
        it('opens the surveys on click', () => {
            renderWithRouter(<Header />, { route: '/tab1' });

            fireEvent.click(screen.getByTitle('Umfragen'));

            expect(currentPath()).toBe('/survey');
        });

        it.each(['Enter', ' '])('opens the surveys with the "%s" key', (key) => {
            renderWithRouter(<Header />, { route: '/tab1' });

            fireEvent.keyDown(screen.getByTitle('Umfragen'), { key });

            expect(currentPath()).toBe('/survey');
        });

        it('ignores other keys', () => {
            renderWithRouter(<Header />, { route: '/tab1' });

            fireEvent.keyDown(screen.getByTitle('Umfragen'), { key: 'Tab' });

            expect(currentPath()).toBe('/tab1');
        });
    });
});
