import { IonButton, IonContent, IonIcon, IonModal } from '@ionic/react';
import { arrowForwardOutline } from 'ionicons/icons';
import React, { useState } from 'react';
import { TeamReturnDTO } from '../../util/api/config/dto';
import { NotificationModalResult } from '../../util/api/config/interfaces';
import Toast from '../Toast';
import { AdminNotificationService } from '../../util/service';

const NotificationModal: React.FC<{ showModal: boolean, closeModal: (notify: NotificationModalResult) => void, teams: TeamReturnDTO[] }> = ({ showModal, closeModal, teams }) => {
    const [teamId, setTeamId] = useState<string>("-1");
    const [title, setTitle] = React.useState<string>('');
    const [message, setMessage] = React.useState<string>('');

    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState<boolean>(false);


    const handleNotification = () => {
        const sendNotification = teamId === "-1" 
            ? AdminNotificationService.sendNotificationToAll(title, message)
            : AdminNotificationService.sendNotificationToTeam(Number(teamId), title, message);
        
        sendNotification
            .then(() => {
                setTitle('');
                setMessage('');
                closeModal({ notificationSent: true });
            })
            .catch((error) => {
                setError(error.message);
                setShowToast(true);
            });
    }


    return (
        <IonModal isOpen={showModal} onDidDismiss={() => closeModal({ notificationSent: false })}>
            <IonContent>
                <h4>Benachrichtigung senden</h4>
                <form onSubmit={handleNotification}>
                    <div className="loginContainer">
                        <div className="borderContainer selectCharacter">
                            <select value={teamId} onChange={(e) => setTeamId(e.target.value)} style={{ cursor: "pointer" }}>
                                <option value={-1}>Alle</option>
                                {teams && teams.map((team) => (
                                    <option key={team.id}
                                        value={team.id}
                                        style={{ backgroundImage: `url(/characters/${team.character.characterName}.png)` }}
                                    >
                                        {team.teamName}
                                    </option>
                                ))}
                            </select>
                            {teamId && teamId !== "-1" && (
                                <div className="selected-character">
                                    {[teams.find(team => team.id === Number(teamId))?.character.characterName].map((character) => (
                                        <img
                                            src={`/characters/${character}.png`}
                                            alt={`${character} character`}
                                            key={character}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="borderContainer">
                        <p>Titel</p>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={"Titel eingeben"}
                            required
                        />
                    </div>
                    <div className={"borderContainer"}>
                        <p>Nachricht</p>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={"Nachricht eingeben"}
                            required
                        />
                    </div>
                </form>
                <div className={"playedContainer"}>

                    <IonButton className={"secondary round"} onClick={() => closeModal({ notificationSent: false })}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                closeModal({ notificationSent: false });
                            }
                        }}
                    >
                        <div>
                            <p>Abbrechen</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                    <IonButton className={"round"} onClick={handleNotification}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                handleNotification();
                            }
                        }}
                    >

                        <div>
                            <p>Benachrichtigung senden</p>
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


}

export default NotificationModal;
