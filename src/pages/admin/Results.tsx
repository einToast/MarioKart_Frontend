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
    IonItem, IonLabel
} from "@ionic/react";
import {arrowBackOutline, arrowForwardOutline} from 'ionicons/icons';
import {useEffect, useRef, useState} from "react";
import axios from "axios";
import "./Points.css"

const results: React.FC<LoginProps> = (props: LoginProps) => {
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
            <IonContent fullscreen>
                <div className={"back"}>
                    <IonIcon slot="end" icon={arrowBackOutline}></IonIcon>
                    <a href={"/admin/dashboard"}>Zurück</a>
                </div>
                <h2>
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                        Endergebnisse
                    </LinearGradient>
                </h2>

                <div className={"flexContainer"}>
                    {teams ? (
                        teams
                            .sort((a, b) => b.punkte - a.punkte)
                            .slice(0, 4)
                            .map(team => (
                                <div key={team.id}
                                     className={`teamContainer ${userCharacter === team.character ? 'userTeam' : ''}`}>
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
    )
        ;
};

export default results;
