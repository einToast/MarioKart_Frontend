import '../../interface/interfaces'
import {LinearGradient} from "react-text-gradients";
import {
    IonButton,
    IonContent,
    IonPage,
    IonIcon, IonCheckbox
} from "@ionic/react";
import {arrowBackOutline, arrowForwardOutline, trashOutline} from 'ionicons/icons';
import "./Final.css"
import {useEffect, useState} from "react";
import {TeamReturnDTO} from "../../util/api/config/dto";
import {
    checkToken,
    createTeamFinalPlan,
    getTeamFinalRanked,
    removeTeamFinalParticipation, resetAllTeamFinalParticipation,
} from "../../util/service/adminService";
import {useHistory} from "react-router";

const Final: React.FC<LoginProps> = (props: LoginProps) => {
    //TODO: get current best 4 teamnames
    //TODO: delete confirmation of teams
    //TODO: after delete of a team -> the next (5.) team is in the table
    //TODO: POST Finale
    const [teams, setTeams] = useState<TeamReturnDTO[]>(null);

    const history = useHistory();

    const removeTeam = async (team: TeamReturnDTO) => {
        console.log("remove team: " + team.teamName);
        const removedTeam = await removeTeamFinalParticipation(team);
        if (removedTeam) {
            await getFinalTeams();
        }
    }

    const resetAllTeams = async () => {
        const teams = await resetAllTeamFinalParticipation();
        if (teams) {
            await getFinalTeams();
        }
    }

    const getFinalTeams = async () => {
        const teamNames = getTeamFinalRanked();
        teamNames.then((response) => {
            console.log(response);
            setTeams(response);
        });
    }

    const createFinal = async () => {
        const final = await createTeamFinalPlan();
        if (final) {
            console.log("final created");
        }
    }

    useEffect(() => {
        if (!checkToken()) {
            window.location.assign('/admin/login');
        }
        getFinalTeams();
    }, [])

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className={"back"} onClick={() => history.push('/admin/dashboard')}>
                    <IonIcon slot="end" icon={arrowBackOutline}></IonIcon>
                    <a>Zurück</a>
                </div>
                <h2>
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>ACHTUNG!</LinearGradient>
                </h2>
                <p>Bist du dir sicher, dass du das Finalspiel erzeugen willst? Du hast danach nicht mehr die Möglichkeit
                    Rundenpunkte einzutragen.</p>
                <p className={"bold"}>Folgende Teams sind im Finale:</p>

                <div className={"teamFinalContainer"}>
                    {teams ? (
                        teams
                            .map(team => (
                                // TODO: add image and points
                                <div key={team.id} className={"teamFinal"}>
                                    <h3>{team.teamName}</h3>
                                    <IonIcon slot="end"
                                             icon={trashOutline}
                                             style={{cursor: "pointer"}}
                                             onClick={() => removeTeam(team)}
                                    ></IonIcon>
                                </div>
                            ))
                    ) : (
                        <p>loading...</p>
                    )
                    }
                </div>

                <div className={"playedContainer"}>
                    <IonButton slot="start" shape="round" className={"round secondary"}>
                        <div onClick={resetAllTeams}>
                            <p>Teams zurücksetzen</p>
                            <IonIcon slot="end" icon={arrowForwardOutline} onClick={resetAllTeams}></IonIcon>
                        </div>
                    </IonButton>
                    <IonButton slot="start" shape="round" className={"round"}>
                        <div onClick={createFinal}>
                            <p>Finale erzeugen</p>
                            <IonIcon slot="end" icon={arrowForwardOutline} onClick={createFinal}></IonIcon>
                        </div>
                    </IonButton>


                </div>
            </IonContent>
        </IonPage>
    );
};

export default Final;