import { IonButton, IonContent, IonIcon, IonModal } from '@ionic/react';
import { differenceInMinutes } from "date-fns";
import { arrowForwardOutline } from "ionicons/icons";
import React, { useEffect, useId, useState } from 'react';
import "../../pages/RegisterTeam.css";
import "../../pages/admin/SurveyAdmin.css";
import { BreakReturnDTO, RoundReturnDTO } from "../../util/api/config/dto";
import { BreakModalResult } from "../../util/api/config/interfaces";
import { AdminScheduleService } from '../../util/service';
import SegmentedToggle from '../SegmentedToggle';
import Toast from '../Toast';
import { useTranslation } from 'react-i18next';

const BreakChangeModal: React.FC<{ showModal: boolean, closeModal: (team: BreakModalResult) => void, aBreak: BreakReturnDTO }> = ({ showModal, closeModal, aBreak }) => {
    const { t } = useTranslation();
    const durationLabelId = useId();

    const [breakDuration, setBreakDuration] = useState<number>(0);
    const [breakEnded, setBreakEnded] = useState<boolean>(false);
    const [beforeRound, setBeforeRound] = useState<number>(0);
    const [rounds, setRounds] = useState<RoundReturnDTO[]>([]);
    const [error, setError] = useState<string>('');
    const [showToast, setShowToast] = useState<boolean>(false);

    const resetBreak = () => {
        setBreakDuration(0);
        setBeforeRound(0);
    }

    const handleChange = () => {
        AdminScheduleService.updateBreak(beforeRound, breakDuration, breakEnded)
            .then(newBreak => {
                if (newBreak) {
                    resetBreak();
                    return closeModal({ breakChanged: true });
                } else {
                    setError(t('admin.break.notChanged'));
                    setShowToast(true);
                }
            })
            .catch(error => {
                setError(error.message);
                setShowToast(true);
            });
    };

    const enterBreak = () => {
        setBreakDuration(differenceInMinutes(new Date(aBreak.endTime), new Date(aBreak.startTime)));
        setBreakEnded(aBreak.breakEnded);
        setBeforeRound(aBreak.round?.id || -1);
    };

    const getRounds = () => {
        AdminScheduleService.getRounds()
            .then(rounds => {
                setRounds(rounds);
            })
            .catch(error => {
                setError(error.message);
                setShowToast(true);
            });
    }


    useEffect(() => {
        enterBreak()
        if (showModal) getRounds();
    }, [showModal]);

    return (
        <IonModal isOpen={showModal} onDidDismiss={() => closeModal({ breakChanged: false })}>
            <IonContent>
                <h4>{t('admin.break.title')}</h4>
                <form onSubmit={handleChange}>

                    <div className="borderContainer">
                        <p id={durationLabelId}>{t('admin.break.duration')}</p>
                        <input
                            type="number"
                            value={breakDuration}
                            onChange={(e) => setBreakDuration(Number.parseInt(e.target.value))}
                            placeholder={t('admin.break.duration')}
                            aria-labelledby={durationLabelId}
                            required
                        />
                    </div>
                    <div className={"borderContainer"}>
                        <p>{t('admin.break.beforeRound')}</p>
                        <select value={beforeRound} onChange={(e) => setBeforeRound(Number.parseInt(e.target.value))}
                            style={{ cursor: "pointer" }}
                        >
                            {rounds.map((round) => (
                                <option value={round.id}
                                    key={round.id}
                                >
                                    {round.roundNumber}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={"borderContainer"}>
                        <p>{t('admin.break.ended')}</p>
                        <SegmentedToggle
                            label={t('admin.break.ended')}
                            options={[
                                { value: false, label: t('common.no') },
                                { value: true, label: t('common.yes') },
                            ]}
                            value={breakEnded}
                            onChange={setBreakEnded}
                        />
                    </div>
                </form>
                <div className={"playedContainer"}>

                    <IonButton className={"secondary round"} onClick={() => closeModal({ breakChanged: false })}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                closeModal({ breakChanged: false });
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
                            <p>{t('admin.break.change')}</p>
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

export default BreakChangeModal;
