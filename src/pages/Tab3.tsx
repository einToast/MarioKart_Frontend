import { IonButton, IonContent, IonIcon, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';
import {
    heart,
    helpCircleOutline,
    notificationsOutline,
    notificationsSharp
} from "ionicons/icons";
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Link } from "react-router-dom";
import { LinearGradient } from "react-text-gradients";
import FloorPlanView from "../components/floorplan/FloorPlanView";
import Header from "../components/Header";
import NotificationHelpModal from "../components/modals/NotificationHelpModal";
import QRCodeComponent from "../components/QRCodeComponent";
import Toast from '../components/Toast';
import { SETTINGS_TOPIC } from '../hooks/useSwitches';
import { useWebSocketConnection } from '../hooks/useWebSocketConnection';
import { SwitchDTO } from '../util/api/config/dto';
import { FloorPlan, ProgramRow, ShowTab2Props } from '../util/api/config/interfaces';
import { parseFloorPlan } from '../util/layout/floorPlan';
import { defaultProgram, PROGRAM_ICONS, resolveProgram, toProgramRow } from '../util/layout/program';
import { NotificationService, PublicCookiesService, PublicScheduleService, PublicSettingsService } from "../util/service";
import './Tab3.css';

const Tab3: React.FC<ShowTab2Props> = (props: ShowTab2Props) => {

    const [notificationEnabled, setNotificationEnabled] = useState<boolean>(PublicCookiesService.getNotificationsEnabled());
    const [showNotificationHelp, setShowNotificationHelp] = useState<boolean>(false);

    const [floorPlan, setFloorPlan] = useState<FloorPlan | null>(null);
    const [switches, setSwitches] = useState<SwitchDTO[]>([]);
    const [program, setProgram] = useState<ProgramRow[]>(() => defaultProgram().map(toProgramRow));

    const [error, setError] = useState<string>('Error');
    const [showToast, setShowToast] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(true);

    const navigate = useNavigate();
    const location = useLocation();

    const updateShowTab2 = () => {
        Promise.all([
            PublicScheduleService.isScheduleCreated(),
            PublicScheduleService.isFinalScheduleCreated(),
            PublicScheduleService.isNumberOfRoundsUnplayedLessThanTwo()
        ]).then(([scheduleValue, finalScheduleValue, roundsLessTwoValue]) => {
            props.setShowTab2(!scheduleValue || finalScheduleValue || !roundsLessTwoValue);
        }).catch(error => {
            console.error("Error fetching schedule data:", error);
        });
    }

    const loadSettings = async () => {
        const settings = await PublicSettingsService.getSettings();
        setSwitches(settings.switches ?? []);
        setFloorPlan(parseFloorPlan(settings.floorPlan));
        setProgram(resolveProgram(settings.program).map(toProgramRow));
        return settings;
    };

    useWebSocketConnection(SETTINGS_TOPIC, () => {
        loadSettings().catch(error => {
            console.error("Error fetching settings:", error);
        });
    });

    const handleRefresh = async (event: CustomEvent) => {
        updateShowTab2();
        loadSettings().catch(error => {
            console.error("Error fetching settings:", error);
        });
        setNotificationEnabled(PublicCookiesService.getNotificationsEnabled());
        await new Promise(resolve => setTimeout(resolve, 500));
        event.detail.complete();
    };

    useEffect(() => {

        updateShowTab2();
        setNotificationEnabled(PublicCookiesService.getNotificationsEnabled());

        loadSettings().then((response) => {
            if (!response.tournamentOpen) {
                navigate('/admin');
            }
        }).catch(error => {
            console.error("Error fetching tournament status:", error);
        });
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
                        PublicCookiesService.setNotificationsEnabled(true);
                        setNotificationEnabled(true);
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
            console.error("Error enabling notifications:", error);
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
                        refreshingSpinner="crescent"
                    />
                </IonRefresher>
                <h1>
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                        Details
                    </LinearGradient>
                </h1>
                {floorPlan && floorPlan.elements.length > 0 && (
                    <>
                        <h3>Raumplan</h3>
                        <div>
                            <FloorPlanView plan={floorPlan} switches={switches} />
                        </div>
                    </>
                )}
                {program.length > 0 && (
                    <>
                        <h3>Programm</h3>
                        <div className={"progressContainer"}>
                            {program.map(({ key, entry }) => (
                                <div key={key}>
                                    <IonIcon aria-hidden="true" icon={PROGRAM_ICONS[entry.icon].icon} />
                                    <p><span>{entry.time}</span> {entry.text}</p>
                                </div>
                            ))}
                        </div>
                        <br />
                    </>
                )}
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
                        disabled={notificationEnabled}
                    >
                        <IonIcon slot="start" icon={notificationEnabled ? notificationsSharp : notificationsOutline} />
                        {notificationEnabled ? 'Benachrichtigungen aktiviert' : 'Benachrichtigungen aktivieren'}
                    </IonButton>
                    <IonButton
                        expand="block"
                        className="notificationHelpButton"
                        onClick={() => setShowNotificationHelp(true)}
                        style={{ marginBottom: '16px' }}
                    >
                        <IonIcon slot="start" icon={helpCircleOutline} />
                        Hilfe zu Benachrichtigungen
                    </IonButton>
                </div>

                <br /> Made with <IonIcon icon={heart} aria-hidden="true" style={{ color: "#e25555" }} /> by Fanny, Camillo
                & Laurin <br />

                {/*</div>*/}
                <br />

                <Link to="/admin/login">
                    <u>Admin Login</u>
                </Link>
                <br />
                <a href="https://github.com/einToast/MarioKart_Tournament">Source Code</a>
            </IonContent>
            <NotificationHelpModal
                showModal={showNotificationHelp}
                closeModal={() => setShowNotificationHelp(false)}
            />
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
