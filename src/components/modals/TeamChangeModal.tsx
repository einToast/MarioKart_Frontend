import { IonButton, IonContent, IonIcon, IonModal } from '@ionic/react';
import { arrowForwardOutline } from "ionicons/icons";
import React, { useEffect, useState } from 'react';
import "../../pages/RegisterTeam.css";
import "../../pages/admin/SurveyAdmin.css";
import { TeamReturnDTO } from "../../util/api/config/dto";
import { TeamModalResult } from "../../util/api/config/interfaces";
import { AdminRegistrationService, PublicRegistrationService, PublicUserService } from '../../util/service';
import Toast from '../Toast';

const TeamChangeModal: React.FC<{ showModal: boolean, closeModal: (team: TeamModalResult) => void, team: TeamReturnDTO }> = ({ showModal, closeModal, team }) => {

    const [teamName, setTeamName] = useState<string>('');
    const [character, setCharacter] = useState<string>('');
    const [availableCharacters, setAvailableCharacters] = useState<string[]>([]);

    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState<boolean>(false);

    const user = PublicUserService.getUser();

    const resetTeam = () => {
        setTeamName('');
    }

    const handleChange = async () => {
        try {
            const newTeam = await AdminRegistrationService.updateTeamNameAndCharacter(team, teamName, character);

            if (newTeam) {
                resetTeam();
                closeModal({ teamChanged: true });
            } else {
                throw new TypeError('Team konnte nicht geändert werden');
            }
        } catch (error) {
            setError(error.message);
            setShowToast(true);
        }

    };

    const getCharacterNames = () => {
        const allCharacters = PublicRegistrationService.getAvailableCharacters();

        allCharacters.then((response) => {
            setAvailableCharacters(response.map(character => character.characterName));
        }).catch((error) => {
            setError(error.message);
            setShowToast(true);
        });
    };

    useEffect(() => {
        setTeamName(team.teamName);
        setCharacter(team.character.characterName || '');
        if (showModal) getCharacterNames();
    }, [showModal]);

    //TODO: publish survey & add to survey Container
    return (
        <IonModal isOpen={showModal} onDidDismiss={() => closeModal({ teamChanged: false })}>
            <IonContent>
                <h4>Team</h4>
                <form onSubmit={handleChange}>

                    <div className="borderContainer">
                        <p>Teamname</p>
                        <input
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="Name eingeben"
                            required
                        />
                    </div>
                    <div className={"borderContainer"}>
                        <p>Charakter</p>
                        <select value={character} onChange={(e) => setCharacter(e.target.value)}
                            style={{ cursor: "pointer" }}>
                            <option
                                value={character}
                            >
                                {character}
                            </option>
                            {availableCharacters && availableCharacters.map((character) => (
                                <option
                                    key={character}
                                    value={character}
                                >
                                    {character}
                                </option>
                            ))}
                        </select>
                    </div>
                </form>
                <div className={"playedContainer"}>

                    <IonButton className={"secondary round"} onClick={() => closeModal({ teamChanged: false })}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                closeModal({ teamChanged: false });
                            }
                        }}
                    >
                        <div>
                            <p>Abbrechen</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                    <IonButton className={"round"} onClick={handleChange}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleChange();
                            }
                        }}
                    >

                        <div>
                            <p>Team ändern</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                </div>
            </IonContent>
            <Toast
                message={error}
                showToast={showToast}
                setShowToast={setShowToast}
                isError={true}
            />
        </IonModal>
    );
};

export default TeamChangeModal;
