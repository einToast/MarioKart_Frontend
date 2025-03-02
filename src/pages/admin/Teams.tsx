import {
    IonContent,
    IonIcon,
    IonPage,
    IonToast
} from "@ionic/react";
import {
    addCircleOutline,
    arrowBackOutline,
    createOutline,
    eyeOffOutline,
    eyeOutline,
    removeCircleOutline,
    trashOutline
} from 'ionicons/icons';
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import TeamChangeModal from "../../components/modals/TeamChangeModal";
import TeamDeleteModal from "../../components/modals/TeamDeleteModal";
import { errorToastColor, successToastColor } from "../../util/api/config/constants";
import { TeamReturnDTO } from "../../util/api/config/dto";
import { TeamModalResult } from "../../util/api/config/interfaces";
import {
    changeTeam, checkMatch,
    getTeamFinalRanked,
} from "../../util/service/adminService";
import { checkToken, getUser } from "../../util/service/loginService";
import "./Final.css";

const Teams: React.FC = () => {

    const [selectedTeam, setSelectedTeam] = useState<TeamReturnDTO>({ id: -1, teamName: '', character: { id: -1, characterName: '' }, groupPoints: 0, finalPoints: 0, active: false, finalReady: false });
    const [teams, setTeams] = useState<TeamReturnDTO[]>([]);
    const [showChangeModal, setShowChangeModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [matchplanCreated, setMatchplanCreated] = useState<boolean>(false);
    const [error, setError] = useState<string>('Error');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState(false);
    const [modalClosed, setModalClosed] = useState<boolean>(false);

    const user = getUser();
    const history = useHistory();
    const location = useLocation();

    const handleToggleFinalParticipation = async (team: TeamReturnDTO) => {
        try {
            team.finalReady = !team.finalReady;
            const removedTeam = await changeTeam(team);
            if (removedTeam) {
                await getFinalTeams();
            } else {
                throw new TypeError('Finalteilnahme konnte nicht geändert werden');
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    const handleToggleActive = async (team: TeamReturnDTO) => {
        try {
            team.active = !team.active;
            if (!team.active) {
                team.finalReady = false;
            }
            const removedTeam = await changeTeam(team);
            if (removedTeam) {
                await getFinalTeams();
            } else {
                throw new TypeError('Aktivität konnte nicht geändert werden');
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    const getFinalTeams = async () => {
        const teamNames = getTeamFinalRanked();
        teamNames.then((response) => {
            setTeams(response);
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        });
    }

    const handleOpenChangeModal = (team: TeamReturnDTO) => {
        setSelectedTeam(team);
        setShowChangeModal(true);
    }

    const handleOpenDeleteModal = (team: TeamReturnDTO) => {
        setSelectedTeam(team);
        setShowDeleteModal(true);
    }

    const closeModal = (teams: TeamModalResult) => {
        setModalClosed(prev => !prev);
        if (teams.teamChanged) {
            setError('Team wurde geändert');
            setToastColor(successToastColor);
            setShowToast(true);
        } else if (teams.teamDeleted) {
            setError('Team wurde entfernt');
            setToastColor(successToastColor);
            setShowToast(true);
        }
    };

    useEffect(() => {
        if (!checkToken()) {
            window.location.assign('/admin/login');
        }
        const matchplan = checkMatch();

        getFinalTeams();

        matchplan.then((response) => {
            setMatchplanCreated(response);
        }).catch((error) => {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        });

    }, [modalClosed, location]);

    return (
        <IonPage>
            <IonContent fullscreen>
                <div className={"back"} onClick={() => history.push('/admin/dashboard')}>
                    <IonIcon slot="end" icon={arrowBackOutline}></IonIcon>
                    <a>Zurück</a>
                </div>
                <h2>
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>Teams</LinearGradient>
                </h2>

                <div className={"teamFinalContainer"}>
                    {teams ? (
                        teams
                            .map((team) => (
                                <div key={team.id} className={`teamContainer`}>
                                    <div className={"imageContainer"}>
                                        <img src={`/characters/${team.character?.characterName}.png`} alt={team.character?.characterName}
                                            className={"iconTeam"} />
                                    </div>
                                    <div className={"stats"}>
                                        <p>{team.teamName}</p>
                                        <p className={"punkte"}>{team.groupPoints} Punkte</p>
                                        <p className={"punkte"}>{team.finalPoints} Finalpunkte</p>
                                    </div>
                                    <div style={{ marginLeft: 'auto' }}>

                                        <IonIcon slot="end"
                                            icon={createOutline}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => handleOpenChangeModal(team)}
                                        ></IonIcon>
                                        <IonIcon slot="end"
                                            icon={team.finalReady ? removeCircleOutline : addCircleOutline}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => handleToggleFinalParticipation(team)}
                                        ></IonIcon>
                                        <IonIcon slot="end"
                                            icon={team.active ? eyeOutline : eyeOffOutline}
                                            style={{ cursor: "pointer" }}
                                            onClick={() => handleToggleActive(team)}
                                        ></IonIcon>
                                        {(!matchplanCreated) && (
                                            <IonIcon slot="end"
                                                icon={trashOutline}
                                                style={{ cursor: "pointer" }}
                                                onClick={() => handleOpenDeleteModal(team)}
                                            ></IonIcon>
                                        )}
                                    </div>
                                </div>
                            ))
                    ) : (
                        <p>loading...</p>
                    )
                    }
                </div>
                <TeamChangeModal
                    showModal={showChangeModal}
                    closeModal={(teams) => {
                        setShowChangeModal(false);
                        closeModal(teams);
                    }}
                    team={selectedTeam}
                />
                <TeamDeleteModal
                    showModal={showDeleteModal}
                    closeModal={(teams) => {
                        setShowDeleteModal(false);
                        closeModal(teams);
                    }}
                    team={selectedTeam}
                />
            </IonContent>
            <IonToast
                isOpen={showToast}
                onDidDismiss={() => setShowToast(false)}
                message={error}
                duration={3000}
                className={user ? 'tab-toast' : ''}
                cssClass="toast"
                style={{
                    '--toast-background': toastColor
                }}
            />
        </IonPage>
    );
};

export default Teams;