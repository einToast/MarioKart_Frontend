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
import {TeamReturnDTO} from "../../util/api/config/dto";
import {getRegisteredTeams, getTeamFinalRanked} from "../../util/service/adminService";
import {useHistory} from "react-router";
import {checkToken} from "../../util/service/loginService";

const MatchPlan: React.FC<LoginProps> = (props: LoginProps) => {
    const [teams, setTeams] = useState<TeamReturnDTO[]>(null);
    const storageItem = localStorage.getItem('user');
    const user = JSON.parse(storageItem);
    const [userCharacter, setUserCharacter] = useState<string | null>(null);
    const history = useHistory();

    useEffect(() => {
        if (!checkToken()) {
            window.location.assign('/admin/login');
        }

        const teamNames = getRegisteredTeams();
        teamNames.then((response) => {
            console.log(response);
            setTeams(response);
        });
        setUserCharacter(user.character);
    },[])

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
                                        {/*<p></p>*/}
                                    </div>
                                </div>
                            ))
                    ) : (
                        <p>loading...</p>
                    )}
                </div>

                <div className={"playedContainer"}>
                    <IonButton slot="start" shape="round" className={"round"}>
                        <div onClick={() => console.log("test")}>
                            <p>Spielplan erzeugen</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}
                                     onClick={() => console.log("test")}></IonIcon>
                        </div>
                    </IonButton>
                </div>
            </IonContent>
        </IonPage>
    )
        ;
};

export default MatchPlan;
