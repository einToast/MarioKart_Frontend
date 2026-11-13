import { IonButton, IonContent, IonIcon, IonModal } from '@ionic/react';
import { arrowForwardOutline } from "ionicons/icons";
import React, { useEffect, useState } from 'react';
import "../../pages/RegisterTeam.css";
import "../../pages/admin/SurveyAdmin.css";
import { AdminSettingsService, PublicSettingsService } from '../../util/service';
import { ChangeType } from "../../util/service/util";
import Toast from '../Toast';
import { useTranslation } from 'react-i18next';

type ChangeSubject = 'tournament' | 'registration' | 'surveys' | 'teams' | 'schedule' | 'finalSchedule' | 'notifications' | 'all';
type ChangeAction = 'open' | 'close' | 'delete' | 'reset';

const CHANGE_SUBJECTS: Record<ChangeType, ChangeSubject> = {
    [ChangeType.TOURNAMENT]: 'tournament',
    [ChangeType.REGISTRATION]: 'registration',
    [ChangeType.SURVEYS]: 'surveys',
    [ChangeType.TEAMS]: 'teams',
    [ChangeType.SCHEDULE]: 'schedule',
    [ChangeType.FINAL_SCHEDULE]: 'finalSchedule',
    [ChangeType.NOTIFICATIONS]: 'notifications',
    [ChangeType.ALL]: 'all',
};

const changeAction = (changeType: ChangeType, isTournamentOpen: boolean, isRegistrationOpen: boolean): ChangeAction => {
    switch (changeType) {
        case ChangeType.TOURNAMENT:
            return isTournamentOpen ? 'close' : 'open';
        case ChangeType.REGISTRATION:
            return isRegistrationOpen ? 'close' : 'open';
        case ChangeType.ALL:
            return 'reset';
        default:
            return 'delete';
    }
};

const TournamentModal: React.FC<{ showModal: boolean, closeModal: (changeT?: ChangeType) => void, changeType: ChangeType }> = ({ showModal, closeModal, changeType }) => {

    const { t } = useTranslation();
    const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean>(false);
    const [isTournamentOpen, setIsTournamentOpen] = useState<boolean>(false);


    const [error, setError] = useState<string>('');
    const [showToast, setShowToast] = useState<boolean>(false);

    const handleChange = () => {
        AdminSettingsService.changeService(changeType)
            .then(() => {
                return closeModal(changeType);
            })
            .catch(error => {
                setError(error.message);
                setShowToast(true);
            });
    };

    useEffect(() => {
        Promise.all([
            PublicSettingsService.getRegistrationOpen(),
            PublicSettingsService.getTournamentOpen()
        ])
            .then(([registrationOpen, tournamentOpen]) => {
                setIsRegistrationOpen(registrationOpen);
                setIsTournamentOpen(tournamentOpen);
            })
            .catch(error => {
                setError(error.message);
                setShowToast(true);
            });
    }, [showModal]);

    const subject = CHANGE_SUBJECTS[changeType];
    const action = changeAction(changeType, isTournamentOpen, isRegistrationOpen);
    const title = t(`admin.change.titles.${action}`, { subject: t(`admin.change.subjects.${subject}`) });
    const confirmation = t('admin.change.confirm', { target: t(`admin.change.targets.${subject}`), action: t(`admin.change.actions.${action}`) });

    return (
        <IonModal isOpen={showModal} onDidDismiss={() => closeModal()}>
            <IonContent>
                <h4>{title}</h4>
                <p dangerouslySetInnerHTML={{ __html: confirmation }}></p>
                {(changeType !== ChangeType.TOURNAMENT && changeType !== ChangeType.REGISTRATION) &&
                    <p> {t('common.irreversible')}</p>
                }

                <div className={"playedContainer"}>
                    <IonButton className={"secondary round"} onClick={() => closeModal()}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                closeModal();
                            }
                        }}
                    >
                        <div>
                            <p>{t('common.cancel')}</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                    <IonButton className={"round"} onClick={handleChange}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleChange();
                            }
                        }}
                    >

                        <div>
                            <p>{title}</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                </div>
            </IonContent>
            <Toast
                message={error}
                showToast={showToast}
                setShowToast={setShowToast}
                isError={true}
            />
        </IonModal>
    );
};

export default TournamentModal;
