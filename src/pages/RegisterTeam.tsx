import {useEffect, useState} from 'react';
import {useHistory, useLocation} from "react-router";
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
import {
    createTeam,
    getAllAvailableCharacters,
    getRegistrationOpen, getTournamentOpen
} from "../util/service/teamRegisterService";
import {setUser} from "../util/service/loginService";
import {errorToastColor} from "../util/api/config/constants";
import ErrorCard from "../components/cards/ErrorCard";

const RegisterTeam: React.FC<LoginProps> = (props: LoginProps) => {
    const [teamName, setTeamName] = useState('');
    const [selectedCharacter, setSelectedCharacter] = useState('');
    const history = useHistory();
    const [updatedCharacterNames, setUpdatedCharacterNames] = useState<string[] | null>(null);
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState(false);

    const location = useLocation();

    const handleEnterPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    const getCharacterNames = () => {
        const allCharacters = getAllAvailableCharacters()

        allCharacters.then((response) => {
            setUpdatedCharacterNames(response.map(character => character.characterName));
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        } );
    };

    useEffect(() => {
        const registrationOpen = getRegistrationOpen();
        const tournamentOpen = getTournamentOpen();

        registrationOpen.then((response) => {
            if (!response) {
                history.push('/login');
            }
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        });

        tournamentOpen.then((response) => {
            if (!response) {
                history.push('/admin');
            }
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        });
        getCharacterNames();
    }, [location]);


    const handleLogin = async () => {
        try {
            const team = await createTeam(teamName, selectedCharacter);

            if (team) {
                const user: User = {
                    loggedIn: true,
                    name: team.teamName,
                    character: team.character.characterName
                };
                setUser(user);
                props.setUser(user);
                history.push('/tab1');
            } else {
                throw new Error("Team konnte nicht erstellt werden");
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
            getCharacterNames();
        }
    }


    return (
        <IonPage>
            <IonContent fullscreen class="no-scroll">
                <div className={"contentLogin"}>
                    <h2>
                        <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                            Team
                        </LinearGradient>
                    </h2>
                    <h1>Register</h1>
                    <p>Registriere Dich und dein Team um gemeinsam am Turnier teilzunehmen.</p>

                    <div className={"loginContainer"}>
                        <div className={"borderContainer selectCharacter"}>
                            <select value={selectedCharacter} onChange={(e) => setSelectedCharacter(e.target.value)} style={{cursor: "pointer"}}>
                                <option value="" disabled hidden={true}>
                                    Wähle deinen Charakter
                                </option>
                                {updatedCharacterNames && updatedCharacterNames.map((character) => (
                                    <option
                                        key={character}
                                        value={character}
                                        style={{backgroundImage: `url(/characters/${character}.png)`}} // Verwende url() anstelle von backgroundImage
                                    >
                                        {character}
                                    </option>
                                ))}
                            </select>
                            {selectedCharacter && (
                                <div className="selected-character">
                                    {characters.includes(selectedCharacter) && (
                                        <img
                                            src={`/characters/${selectedCharacter}.png`}
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
                                onKeyPress={handleEnterPress}
                            />
                        </div>
                        <IonButton onClick={handleLogin} slot="start"
                                   tabIndex={0}
                                   onKeyDown={(e) => {
                                       if (e.key === 'Enter' || e.key === ' ') {
                                           handleLogin();
                                       }
                                   }}
                        >
                            <div>
                                <p>Team registrieren</p>
                                <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                            </div>
                        </IonButton>
                    </div>
                    <a onClick={() => history.push("/login")}
                       style={{ cursor: "pointer", textDecoration: "underline" }}
                       tabIndex={0}
                       onKeyDown={(e) => {
                           if (e.key === 'Enter' || e.key === ' ') {
                               history.push('/login');
                           }
                       }}
                    >
                        registriertem Team beitreten
                    </a>
                </div>
            </IonContent>
            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={error}
                duration={3000}
                // className={ user ? 'tab-toast' : ''}
                cssClass="toast"
                style={{
                    '--toast-background': toastColor
                }}
            />
        </IonPage>
    )
        ;
};

export default RegisterTeam;
