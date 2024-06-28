import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/header';
import './Tab2.css';
import axios from 'axios';
import {useEffect, useState} from "react";
import '../interface/interfaces';
import {LinearGradient} from "react-text-gradients";
import Header from "../components/header";

const Tab2: React.FC = () => {

    const [teams, setTeam] = useState<Team[] | null>(null);
    const storageItem = localStorage.getItem('user');
    const user = JSON.parse(storageItem);
    const [userCharacter, setUserCharacter] = useState<string | null>(null);


    const getTeamName = () => {
        axios.get('http://localhost:3000/api/team/all')
            .then ((response) => {
                const responseData = response.data as Team[]
                setTeam(responseData)
            })
            .catch((error) => {console.log(error)});
    }

    useEffect(() => {
        getTeamName();
        setUserCharacter(user.character);
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
                            .sort((a, b) => b.punkte - a.punkte)
                            .map(team => (
                                <div key={team.id} className={`teamContainer ${userCharacter === team.character ? 'userTeam' : ''}`}>
                                    <div className={"imageContainer"}>
                                        <img src={`../resources/media/${team.character}.png`} alt={team.character}
                                             className={"iconTeam"}/>
                                    </div>
                                    <div>
                                        <p>{team.name}</p>
                                        <p className={"punkte"}>{team.punkte} Punkte</p>
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
