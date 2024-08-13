import '../../interface/interfaces'
import '../RegisterTeam.css'
import {LinearGradient} from "react-text-gradients";
import {
    IonButton,
    IonContent,
    IonPage,
    IonIcon,
    IonCheckbox, IonAccordion,
    IonAccordionGroup,
    IonItem, IonLabel, IonToast
} from "@ionic/react";
import {arrowBackOutline, arrowForwardOutline} from 'ionicons/icons';
import {useEffect, useRef, useState} from "react";
import axios from "axios";
import "./Points.css"
import {TeamReturnDTO} from "../../util/api/config/dto";
import {createTeamMatchPlan, getRegisteredTeams, getTeamFinalRanked} from "../../util/service/adminService";
import {useHistory} from "react-router";
import {checkToken} from "../../util/service/loginService";

const MatchPlan: React.FC<LoginProps> = (props: LoginProps) => {
    const [teams, setTeams] = useState<TeamReturnDTO[]>(null);
    const storageItem = localStorage.getItem('user');
    const user = JSON.parse(storageItem);
    const [userCharacter, setUserCharacter] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [toastColor, setToastColor] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);

    const history = useHistory();

    useEffect(() => {
        if (!checkToken()) {
            window.location.assign('/admin/login');
        }

        const teamNames = getRegisteredTeams();
        teamNames.then((response) => {
            setTeams(response);
        }).catch((error) => {
            console.error(error);
            setError('Fehler beim Laden der Teams');
            setShowToast(true);
        });
        setUserCharacter(user.character);
    },[])

    const handleMatchPlanCreation = async () => {
        try {
            const newRounds = await createTeamMatchPlan();
            if (newRounds) {
                setShowToast(true);
                setError('Spielplan erfolgreich erstellt');
                history.push('/admin/dashboard');
            } else {
                throw new TypeError('Spielplan konnte nicht erstellt werden');
            }
        } catch (error) {
            if (error instanceof TypeError) {
                setError('Spielplan konnte nicht erstellt werden');
            } else {
                setError(error.message);
            }
            setShowToast(true);
        }
    }

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className={"back"} onClick={() => history.push('/admin/dashboard')}>
                    <IonIcon slot="end" icon={arrowBackOutline}></IonIcon>
                    <a>Zurück</a>
                </div>
                <h2>
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                        Endergebnisse
                    </LinearGradient>
                </h2>

                <div className={"flexContainer"} style={{paddingBottom: "50px"}}>
                    {teams ? (
                        teams
                            .map(team => (
                                <div key={team.id}
                                     className={`teamContainer ${userCharacter === team.character.characterName ? 'userTeam' : ''}`}>
                                    <div className={"imageContainer"}>
                                        <img src={`../resources/media/${team.character.characterName}.png`}
                                             alt={team.character.characterName}
                                             className={"iconTeam"}/>
                                    </div>
                                    <div>
                                        <p>{team.teamName}</p>
                                        {/*<p className={"punkte"}>{team.finalPoints} Punkte</p>*/}
                                    </div>
                                </div>
                            ))
                    ) : (
                        <p>loading...</p>
                    )}
                </div>

                <div className={"playedContainer"}>
                    <IonButton slot="start" shape="round" className={"round"}>
                        <div onClick={handleMatchPlanCreation}>
                            <p>Spielplan erzeugen</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                </div>
            </IonContent>
            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={error}
                duration={3000}
            />
        </IonPage>
    )
        ;
};

export default MatchPlan;
