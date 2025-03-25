import React, { useState } from 'react';
import { TeamReturnDTO } from "../../util/api/config/dto";
import { TeamAdminContainerProps, TeamModalResult } from "../../util/api/config/interfaces";
import { AdminRegistrationService, PublicUserService } from '../../util/service';
import Toast from '../Toast';
import TeamChangeModal from '../modals/TeamChangeModal';
import TeamDeleteModal from '../modals/TeamDeleteModal';
import TeamAdminListItem from './TeamAdminListItem';

const TeamAdminContainer: React.FC<TeamAdminContainerProps> = ({
    teams,
    matchPlanCreated,
    finalPlanCreated,
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
        numberOfGamesPlayed: 0,
        active: false,
        finalReady: false
    });
    const [showChangeModal, setShowChangeModal] = useState<boolean>(false);
    const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

    const [error, setError] = useState<string>('');
    const [isError, setIsError] = useState<boolean>(true);
    const [showToast, setShowToast] = useState<boolean>(false);

    const user = PublicUserService.getUser();

    const handleToggleFinalParticipation = (team: TeamReturnDTO) => {
        team.finalReady = !team.finalReady;

        AdminRegistrationService.updateTeam(team)
            .then(updatedTeam => {
                if (updatedTeam) {
                    return getTeams();
                } else {
                    setError('Finalteilnahme konnte nicht geändert werden');
                    setIsError(true);
                    setShowToast(true);
                }
            })
            .catch(error => {
                setError(error.message);
                setIsError(true);
                setShowToast(true);
            });
    }

    const handleToggleActive = (team: TeamReturnDTO) => {
        team.active = !team.active;
        if (!team.active) {
            team.finalReady = false;
        }

        AdminRegistrationService.updateTeam(team)
            .then(updatedTeam => {
                if (updatedTeam) {
                    return getTeams();
                } else {
                    setError('Aktivität konnte nicht geändert werden');
                    setIsError(true);
                    setShowToast(true);
                }
            })
            .catch(error => {
                setError(error.message);
                setIsError(true);
                setShowToast(true);
            });
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
            setIsError(false);
            setShowToast(true);
        } else if (result.teamDeleted) {
            setError('Team wurde entfernt');
            setIsError(false);
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
                            matchPlanCreated={matchPlanCreated}
                            finalPlanCreated={finalPlanCreated}
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
            <Toast
                message={error}
                showToast={showToast}
                setShowToast={setShowToast}
                isError={isError}
            />
        </>
    );
};

export default TeamAdminContainer;