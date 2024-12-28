import '../../interface/interfaces'
import '../RegisterTeam.css'
import {LinearGradient} from "react-text-gradients";
import {
    IonContent,
    IonPage,
    IonIcon,
    IonToast
} from "@ionic/react";
import {arrowBackOutline} from 'ionicons/icons';
import React, {useEffect, useState} from "react";
import "./Points.css"
import {TeamReturnDTO} from "../../util/api/config/dto";
import {getTeamTop4FinalRanked} from "../../util/service/adminService";
import {useHistory, useLocation} from "react-router";
import {checkToken, getUser} from "../../util/service/loginService";
import {errorToastColor} from "../../util/api/config/constants";

const Results: React.FC<LoginProps> = (props: LoginProps) => {
    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [userCharacter, setUserCharacter] = useState<string | null>(null);
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState(false);

    const user = getUser();
    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
        if (!checkToken()) {
            window.location.assign('/admin/login');
        }
        console.log('Results');

        const teamNames = getTeamTop4FinalRanked();
        teamNames.then((response) => {
            setTeams(response);
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        });
        setUserCharacter(user.character);
    },[location]);

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className={"back"} onClick={() => history.push('/admin/dashboard')}
                     tabIndex={0}
                     onKeyDown={(e) => {
                         if (e.key === 'Enter' || e.key === ' ') {
                             history.push('/admin/dashboard');
                         }
                     }}

                >
                    <IonIcon slot="end" icon={arrowBackOutline}></IonIcon>
                    <a>Zurück</a>
                </div>
                <h2>
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                        Endergebnisse
                    </LinearGradient>
                </h2>

                <div className={"flexContainer"}>
                    {teams ? (
                        teams
                            .map(team => (
                                <div key={team.id}
                                     className={`teamContainer ${userCharacter === team.character.characterName ? 'userTeam' : ''}`}>
                                    <div className={"imageContainer"}>
                                        <img src={`/characters/media/${team.character.characterName}.png`} alt={team.character.characterName}
                                             className={"iconTeam"}/>
                                    </div>
                                    <div>
                                        <p>{team.teamName}</p>
                                        <p className={"punkte"}>{team.finalPoints} Punkte</p>
                                    </div>
                                </div>
                            ))
                    ) : (
                        <p>loading...</p>
                    )}
                </div>
            </IonContent>
            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={error}
                duration={3000}
                className={ user ? 'tab-toast' : ''}
                cssClass="toast"
                style={{
                    '--toast-background': toastColor
                }}
            />
        </IonPage>
    )
        ;
};

export default Results;
