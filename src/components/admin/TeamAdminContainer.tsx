import { IonToast } from '@ionic/react';
import React, { useState } from 'react';
import { errorToastColor, successToastColor } from '../../util/api/config/constants';
import { TeamReturnDTO } from "../../util/api/config/dto";
import { TeamModalResult } from "../../util/api/config/interfaces";
import { changeTeam } from '../../util/service/adminService';
import { getUser } from '../../util/service/loginService';
import TeamChangeModal from '../modals/TeamChangeModal';
import TeamDeleteModal from '../modals/TeamDeleteModal';
import TeamAdminListItem from './TeamAdminListItem';

interface TeamAdminContainerProps {
    teams: TeamReturnDTO[];
    matchplanCreated: boolean;
    setModalClosed: (modalClosed: boolean) => void;
    getTeams: () => void;
    modalClosed: boolean;
}

const TeamAdminContainer: React.FC<TeamAdminContainerProps> = ({
    teams,
    matchplanCreated,
    setModalClosed,
    getTeams,
    modalClosed
}) => {
    const [selectedTeam, setSelectedTeam] = useState<TeamReturnDTO>({
        id: -1,
        teamName: '',
        character: { id: -1, characterName: '' },
        groupPoints: 0,
        finalPoints: 0,
        active: false,
        finalReady: false
    });
    const [showChangeModal, setShowChangeModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [toastColor, setToastColor] = useState<string>(errorToastColor);
    const [showToast, setShowToast] = useState<boolean>(false);
    const user = getUser();

    const handleToggleFinalParticipation = async (team: TeamReturnDTO) => {
        try {
            team.finalReady = !team.finalReady;
            const removedTeam = await changeTeam(team);
            if (removedTeam) {
                await getTeams();
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
                await getTeams();
            } else {
                throw new TypeError('Aktivität konnte nicht geändert werden');
            }
        } catch (error) {
            setError(error.message);
            setToastColor(errorToastColor);
            setShowToast(true);
        }
    }

    const handleOpenChangeModal = (team: TeamReturnDTO) => {
        setSelectedTeam(team);
        setShowChangeModal(true);
    };

    const handleOpenDeleteModal = (team: TeamReturnDTO) => {
        setSelectedTeam(team);
        setShowDeleteModal(true);
    };

    const handleModalClose = (result: TeamModalResult) => {
        setModalClosed(!modalClosed);
        if (result.teamChanged) {
            setError('Team wurde geändert');
            setToastColor(successToastColor);
            setShowToast(true);
        } else if (result.teamDeleted) {
            setError('Team wurde entfernt');
            setToastColor(successToastColor);
            setShowToast(true);
        }
    };

    return (
        <>
            <div className="teamFinalContainer">
                {teams ? (
                    teams.map((team) => (
                        <TeamAdminListItem
                            key={team.id}
                            team={team}
                            matchplanCreated={matchplanCreated}
                            onToggleFinalParticipation={handleToggleFinalParticipation}
                            onToggleActive={handleToggleActive}
                            onOpenChangeModal={handleOpenChangeModal}
                            onOpenDeleteModal={handleOpenDeleteModal}
                        />
                    ))
                ) : (
                    <p>loading...</p>
                )}

                <TeamChangeModal
                    showModal={showChangeModal}
                    closeModal={(result) => {
                        setShowChangeModal(false);
                        handleModalClose(result);
                    }}
                    team={selectedTeam}
                />
                <TeamDeleteModal
                    showModal={showDeleteModal}
                    closeModal={(result) => {
                        setShowDeleteModal(false);
                        handleModalClose(result);
                    }}
                    team={selectedTeam}
                />
            </div>
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
        </>
    );
};

export default TeamAdminContainer; 