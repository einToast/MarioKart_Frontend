import React, { useState, useEffect, useRef } from 'react';
import { IonHeader, IonAvatar, IonIcon } from '@ionic/react';
import { pieChartOutline } from 'ionicons/icons';
import './Header.css';
import characters from "../interface/characters";
import {useHistory} from "react-router";
import {getUser, removeUser} from "../util/service/loginService";

const Header: React.FC = () => {
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const user = getUser();
    const history = useHistory();

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleLogout = () => {
        removeUser();
        window.location.assign('/');
        // history.push('/');
    };

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
                    {characters.includes(user.character) &&
                        <img src={`../resources/media/${user.character}.png`} alt={user.character} className="iconTeam" />
                    }
                </IonAvatar>
                <p>{user.name}</p>
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
                            >Abmelden</li>
                        </ul>
                    </div>
                )}
            </div>
            <a onClick={() => history.push('/survey')}
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
