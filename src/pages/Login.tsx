import {createContext, useEffect, useState} from 'react';
import {useHistory} from "react-router";
import axios from "axios";
import '../interface/interfaces'
import './Login.css'
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

const Login: React.FC<LoginProps> = (props: LoginProps) => {
    const [teamName, setTeamName] = useState('');
    const [selectedCharacter, setSelectedCharacter] = useState('');
    const history = useHistory();
    const [characterNames, setCharacterNames] = useState<string[] | null>(null);
    const [updatedCharacterNames, setUpdatedCharacterNames] = useState<string[] | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    const getCharacterNames = () => {
        axios.get('http://localhost:3000/api/team/all')
            .then((response) => {
                const responseData = response.data as Team[];
                const charactersPlay = responseData.map((team) => team.character);
                setCharacterNames(existingCharacterNames => {
                    const updatedCharacterNames = existingCharacterNames ? characters.filter(character => !existingCharacterNames.includes(character)) : null;
                    setUpdatedCharacterNames(updatedCharacterNames);
                    return charactersPlay;
                });
            })
            .catch((error) => {
                console.log(error);
            });
    };

    useEffect(() => {
        getCharacterNames();
    }, []);


    const handleLogin = () => {
        const data = {
            "name": teamName,
            "character": selectedCharacter,
        }

        if (!teamName) {
            setToastMessage("Der Teamname darf nicht leer sein!");
        } else if (!selectedCharacter) {
            setToastMessage("Der Charakter darf nicht leer sein!");
        } else {
            setToastMessage("Es ist ein Fehler aufgetreten, versuche einen anderen Charakter");
        }

        const user: User = {
            loggedIn: false,
            name: null,
            character: null
        };

        axios.post('http://localhost:3000/api/team/create', data)
            .then((response) => {
                console.log(response)
                if (response.status === 200) {
                    user.loggedIn = true;
                    user.name = teamName;
                    user.character = selectedCharacter;

                    // save user to localStorage and set reactive variable
                    localStorage.setItem("user", JSON.stringify(user));
                    props.setUser(user);

                    history.push('/tab1');
                } else {
                    setShowToast(true);
                    setToastMessage("Ein Fehler ist aufgetreten");
                }
            })
            .catch((error) => {
                setShowToast(true);
            });
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
                    <a href="/LoginTeam">registriertem Team beitreten</a>
                </div>
            </IonContent>
        </IonPage>
    )
        ;
};

export default Login;
