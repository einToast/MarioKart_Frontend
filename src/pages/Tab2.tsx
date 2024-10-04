import {IonContent, IonHeader, IonPage, IonTitle, IonToast, IonToolbar} from '@ionic/react';
import ExploreContainer from '../components/Header';
import './Tab2.css';
import React, {useEffect, useState} from "react";
import '../interface/interfaces';
import {LinearGradient} from "react-text-gradients";
import Header from "../components/Header";
import {TeamReturnDTO} from "../util/api/config/dto";
import {getTeamsRanked} from "../util/service/dashboardService";
import {getUser} from "../util/service/loginService";
import {errorToastColor} from "../util/api/config/constants";

const Tab2: React.FC = () => {

    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [userCharacter, setUserCharacter] = useState<string | null>(null);
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState(false);

    const user = getUser();

    useEffect(() => {
        setUserCharacter(user.character);

        const teamsRanked = getTeamsRanked();

        teamsRanked.then((response) => {
            setTeams(response);
        }).catch((error) => {
            console.error(error);
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        });
    },[])

    return (
        <IonPage>
            <Header></Header>
            <IonContent fullscreen>
                <h1>
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                        Rangliste
                    </LinearGradient>
                </h1>
                <div className={"flexContainer"}>
                    {teams ? (
                        teams
                            .map(team => (
                                <div key={team.id} className={`teamContainer ${userCharacter === team.character.characterName ? 'userTeam' : ''}`}>
                                    <div className={"imageContainer"}>
                                        <img src={`../resources/media/${team.character.characterName}.png`} alt={team.character.characterName}
                                             className={"iconTeam"}/>
                                    </div>
                                    <div>
                                        <p>{team.teamName}</p>
                                        <p className={"punkte"}>{team.groupPoints} Punkte</p>
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
    );
};

export default Tab2;
