import { IonAvatar, IonHeader, IonIcon } from '@ionic/react';
import { pieChartOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from "react-router";
import { User } from '../util/api/config/interfaces';
import { PublicCookiesService } from '../util/service';
import './Header.css';

const Header: React.FC = () => {
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(PublicCookiesService.getUser());
    const dropdownRef = useRef<HTMLDivElement>(null);

    const history = useHistory();

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleLogout = () => {
        PublicCookiesService.removeUser();
        window.location.assign('/');
    };

    useEffect(() => {
        setUser(PublicCookiesService.getUser());
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <IonHeader>
            <div className="loggedInUserHead" onClick={toggleDropdown} ref={dropdownRef}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        toggleDropdown();
                    }
                }}
            >
                <IonAvatar>
                    {user && user.character &&
                        <img src={`/characters/${user.character}.png`} alt={user.character}
                            className="iconTeam" />
                    }
                </IonAvatar>
                <p>{user?.name}</p>
                {dropdownOpen && (
                    <div className="dropdownMenu">
                        <ul>
                            <li onClick={handleLogout}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        handleLogout();
                                    }
                                }}
                            >Abmelden
                            </li>
                        </ul>
                    </div>
                )}
            </div>
            <a onClick={() => history.push('/survey')}
                title="Umfragen"
                style={{ cursor: "pointer" }}
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        history.push('/survey');
                    }
                }}
            >
                <IonIcon aria-hidden="true" icon={pieChartOutline} />
            </a>
        </IonHeader>
    );
};

export default Header;
