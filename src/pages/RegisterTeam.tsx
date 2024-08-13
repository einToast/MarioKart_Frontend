import {createContext, useEffect, useState} from 'react';
import {useHistory} from "react-router";
import axios from "axios";
import '../interface/interfaces'
import './RegisterTeam.css'
import {LinearGradient} from "react-text-gradients";
import {
    IonButton,
    IonContent,
    IonPage,
    IonIcon,
    IonToast
} from "@ionic/react";
import {arrowForwardOutline} from 'ionicons/icons';
import characters from "../interface/characters";
import {createTeam, getAllAvailableCharacters, getAllCharacters} from "../util/service/teamRegisterService";

const RegisterTeam: React.FC<LoginProps> = (props: LoginProps) => {
    const [teamName, setTeamName] = useState('');
    const [selectedCharacter, setSelectedCharacter] = useState('');
    const history = useHistory();
    const [characterNames, setCharacterNames] = useState<string[] | null>(null);
    const [updatedCharacterNames, setUpdatedCharacterNames] = useState<string[] | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const getCharacterNames = () => {
        const allCharacters = getAllAvailableCharacters()

        allCharacters.then((response) => {
            setUpdatedCharacterNames(response.map(character => character.characterName));
        }).catch((error) => {
            console.error(error);
            setToastMessage("Fehler beim Laden der Charaktere");
            setShowToast(true);
        } );
    };

    useEffect(() => {
        getCharacterNames();
    }, []);


    const handleLogin = async () => {
        try {
            const team = await createTeam(teamName, selectedCharacter);

            if (team) {
                const user: User = {
                    loggedIn: true,
                    name: team.teamName,
                    character: team.character.characterName
                };
                localStorage.setItem("user", JSON.stringify(user));
                props.setUser(user);
                history.push('/tab1');
            } else {
                throw new Error("Ein Fehler ist aufgetreten");
            }
        } catch (error) {
            console.error(error);
            setToastMessage(error.message);
            setShowToast(true);
            getCharacterNames();
        }
    }

    return (
        <IonPage>
            <IonContent fullscreen class="no-scroll">
                <div className={"contentLogin"}>
                    <IonToast isOpen={showToast} message={toastMessage} duration={5000}
                              onDidDismiss={() => setShowToast(false)}/>
                    <h2>
                        <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                            Team
                        </LinearGradient>
                    </h2>
                    <h1>Register</h1>
                    <p>Registriere Dich und dein Team um gemeinsam am Turnier teilzunehmen.</p>

                    <div className={"loginContainer"}>
                        <div className={"borderContainer selectCharacter"}>
                            <select value={selectedCharacter} onChange={(e) => setSelectedCharacter(e.target.value)}>
                                <option value="">
                                    Bitte wähle deine Charakter
                                </option>
                                {updatedCharacterNames && updatedCharacterNames.map((character) => (
                                    <option
                                        key={character}
                                        value={character}
                                        style={{backgroundImage: `url(../resources/media/${character}.png)`}} // Verwende url() anstelle von backgroundImage
                                    >
                                        {character}
                                    </option>
                                ))}
                            </select>
                            {selectedCharacter && (
                                <div className="selected-character">
                                    {characters.includes(selectedCharacter) && (
                                        <img
                                            src={`../resources/media/${selectedCharacter}.png`}
                                            alt={`${selectedCharacter} character`}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                        <div className={"borderContainer"}>
                            <input
                                type="text"
                                placeholder="Teamname"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                            />
                        </div>
                        <IonButton onClick={handleLogin} slot="start">
                            <div>
                                <p>Team registrieren</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                    </div>
                    <a href="/login">registriertem Team beitreten</a>
                </div>
            </IonContent>
        </IonPage>
    )
        ;
};

export default RegisterTeam;