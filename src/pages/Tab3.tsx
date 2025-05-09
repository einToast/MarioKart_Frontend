import { IonButton, IonContent, IonIcon, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';
import {
    heart, medalOutline, megaphoneOutline,
    notificationsOutline,
    pizzaOutline,
    playOutline,
    playSkipForwardOutline
} from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import Header from "../components/Header";
import QRCodeComponent from "../components/QRCodeComponent";
import Toast from '../components/Toast';
import { ShowTab2Props } from '../util/api/config/interfaces';
import { NotificationService, PublicScheduleService, PublicSettingsService } from "../util/service";
import './Tab3.css';

const Tab3: React.FC<ShowTab2Props> = (props: ShowTab2Props) => {

    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(true);
    const history = useHistory();
    const location = useLocation();

    const updateShowTab2 = () => {
        Promise.all([
            PublicScheduleService.isMatchPlanCreated(),
            PublicScheduleService.isFinalPlanCreated(),
            PublicScheduleService.isNumberOfRoundsUnplayedLessThanTwo()
        ]).then(([matchPlanValue, finalPlanValue, roundsLessTwoValue]) => {
            props.setShowTab2(!matchPlanValue || finalPlanValue || !roundsLessTwoValue);
        }).catch(error => {
            console.error("Error fetching schedule data:", error);
        });
    }

    const handleRefresh = (event: CustomEvent) => {
        setTimeout(() => {
            updateShowTab2();
            event.detail.complete();
        }, 500);
    };

    useEffect(() => {

        updateShowTab2();

        const tournamentOpen = PublicSettingsService.getTournamentOpen();

        tournamentOpen.then((response) => {
            if (!response) {
                history.push('/admin');
            }
        })
    }, [location])

    const enableNotifications = async () => {
        try {
            const permissionGranted = await NotificationService.requestPermission();

            if (permissionGranted) {
                const registration = await NotificationService.registerServiceWorker();

                if (registration) {
                    const subscription = await NotificationService.subscribeToPushNotifications(registration);

                    if (subscription) {
                        // alert('Benachrichtigungen wurden erfolgreich aktiviert!');
                        setIsError(false);
                        setError('Benachrichtigungen erfolgreich aktiviert!');
                        setShowToast(true);
                    } else {
                        // alert('Fehler beim Aktivieren der Benachrichtigungen. Bitte lade die Seite komplett neu.');
                        setIsError(true);
                        setError('Fehler beim Aktivieren der Benachrichtigungen. Bitte lade die Seite komplett neu.');
                        setShowToast(true);
                    }
                }
            } else {
                // alert('Bitte erlaube Benachrichtigungen in deinen Browsereinstellungen.');
                setIsError(true);
                setError('Bitte erlaube Benachrichtigungen in deinen Browsereinstellungen.');
                setShowToast(true);
            }
        } catch (error) {
            alert('Es ist ein Fehler aufgetreten. Bitte lade die Seite komplett neu.');
            setIsError(true);
            setError('Es ist ein Fehler aufgetreten. Bitte lade die Seite komplett neu.');
            setShowToast(true);
        }
    };

    return (
        <IonPage>
            <Header />
            <IonContent fullscreen>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent
                        refreshingSpinner="circles"
                    />
                </IonRefresher>
                <h1>
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                        Details
                    </LinearGradient>
                </h1>
                <h3>Raumplan</h3>
                <div>
                    <img src={"/media/Raumplan.png"} alt="raumplan" />
                </div>
                <h3>Programm</h3>
                <div className={"progressContainer"}>
                    <div>
                        <IonIcon aria-hidden="true" icon={megaphoneOutline} />
                        <p><span>16:00 - 16:45</span> Arne labert</p>
                    </div>
                    <div>
                        <IonIcon aria-hidden="true" icon={playOutline} />
                        <p><span>16:45 - 18:30</span> Runde 1 - 5</p>
                    </div>
                    <div>
                        <IonIcon aria-hidden="true" icon={pizzaOutline} />
                        <p><span>18:30 - 19:00</span> Pause</p>
                    </div>
                    <div>
                        <IonIcon aria-hidden="true" icon={playOutline} />
                        <p><span>19:00 - 20:00</span> Runde 6 - 8</p>
                    </div>
                    <div>
                        <IonIcon aria-hidden="true" icon={playSkipForwardOutline} />
                        <p><span>20:00 - 20:45</span> Finale</p>
                    </div>
                    <div>
                        <IonIcon aria-hidden="true" icon={medalOutline} />
                        <p><span>21:00</span> Siegerehrung</p>
                    </div>
                </div>
                <br />
                <h3>QR-Code für die Webseite</h3>
                <div className={"progressContainer"}>
                    {/* <div>
                        <p>Gebt diesen QR-Code gerne an Leute weiter, die noch nicht den Link zu dieser Seite haben.</p>
                    </div> */}
                    <div>
                        <QRCodeComponent />
                    </div>
                </div>
                {/*<h3>Organisatoren</h3>*/}
                {/*<div className={"organisatorenSingle"}>*/}
                {/*    <div className={"img-wrapper"}>*/}
                {/*        <img src={"/media/camillo.jpeg"} alt="camillo"/>*/}
                {/*    </div>*/}
                {/*    <div>*/}
                {/*        <p>Camillo Dobrovsky</p>*/}
                {/*        <p>Main Character</p>*/}
                {/*    </div>*/}
                {/*</div>*/}
                {/*<div className={"organisatorenSingle"}>*/}
                {/*    <div className={"img-wrapper"}>*/}
                {/*        <img src={"/media/fanny.jpeg"} alt="fanny"/>*/}
                {/*    </div>*/}
                {/*    <div>*/}
                {/*        <p>Fanny Wolff</p>*/}
                {/*        <p>Medienbeauftragte</p>*/}
                {/*    </div>*/}
                {/*</div>*/}
                {/*<div className={"organisatorenSingle"}>*/}
                {/*    <div className={"img-wrapper"}>*/}
                {/*        <img src={"/media/arne.jpeg"} alt="arne"/>*/}
                {/*    </div>*/}
                {/*    <div>*/}
                {/*        <p>Arne Allwardt</p>*/}
                {/*        <p>Moderator</p>*/}
                {/*    </div>*/}
                {/*</div>*/}
                {/*<div style={{textAlign: "center"}}>*/}

                <h3>Einstellungen</h3>

                <div className="settings-container" style={{ padding: '0 16px' }}>
                    <IonButton
                        expand="block"
                        onClick={enableNotifications}
                        style={{ marginBottom: '16px' }}
                    >
                        <IonIcon slot="start" icon={notificationsOutline} />
                        Benachrichtigungen aktivieren
                    </IonButton>
                </div>
                <div>
                    Hinweise
                    <p style={{ margin: 5, fontSize: 'inherit' }}>Aktiviere Benachrichtigung, um über deine nächste Runden, Pausen und Umfragen informiert zu werden.</p>
                    <p style={{ margin: 5, fontSize: 'inherit' }}>Wenn die Registierung fehlschlägt, lade die Seite bitte komplett neu.</p>
                    <p style={{ margin: 5, fontSize: 'inherit' }}><strong style={{ fontWeight: 'bold' }}>ACHTUNG:</strong> Benachrichtigungen funktionieren momementan nur mit Android problemlos. Unter iOS muss die Webseite als PWA hinzugefügt werden. (Share --{'>'} Add to Home Screen --{'>'} Add)</p>
                    <p style={{ margin: 5, fontSize: 'inherit' }}>Wenn alles funktioniert hat, erhälst du eine Testbenachrichtigung</p>
                </div>

                <br /> Made with <IonIcon icon={heart} aria-hidden="true" style={{ color: "#e25555" }} /> by Fanny, Camillo
                & Laurin <br />

                {/*</div>*/}
                <br />

                <a
                    onClick={() => history.push('/admin/login')}
                    style={{ cursor: "pointer" }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            history.push('/admin/login');
                        }
                    }}

                >
                    <u>Admin Login</u>
                </a>
                <br />
                <a href="https://github.com/einToast/MarioKart_Deployment">Source Code</a>
            </IonContent>
            <Toast
                message={error}
                showToast={showToast}
                setShowToast={setShowToast}
                isError={isError}
            />
        </IonPage>
    );
};

export default Tab3;
