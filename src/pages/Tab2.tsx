import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/header';
import './Tab2.css';
import axios from 'axios';
import {useEffect, useState} from "react";
import '../interface/interfaces';
import {LinearGradient} from "react-text-gradients";
import Header from "../components/header";
import {TeamReturnDTO} from "../util/api/config/dto";
import {getTeamsRanked} from "../util/service/dashboardService";

const Tab2: React.FC = () => {

    const [teams, setTeams] = useState<TeamReturnDTO[] | null>(null);
    const storageItem = localStorage.getItem('user');
    const user = JSON.parse(storageItem);
    const [userCharacter, setUserCharacter] = useState<string | null>(null);

    useEffect(() => {
        setUserCharacter(user.character);

        const teamsRanked = getTeamsRanked();

        teamsRanked.then((response) => {
            console.log(response);
            setTeams(response);
        }).catch((error) => {
            console.error(error);
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
        </IonPage>
    );
};

export default Tab2;
