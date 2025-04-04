import { IonContent, IonIcon, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';
import {
    heart, medalOutline, megaphoneOutline, pizzaOutline,
    playOutline,
    playSkipForwardOutline
} from "ionicons/icons";
import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router";
import { LinearGradient } from "react-text-gradients";
import Header from "../components/Header";
import QRCodeComponent from "../components/QRCodeComponent";
import { ShowTab2Props } from '../util/api/config/interfaces';
import { PublicScheduleService, PublicSettingsService } from "../util/service";
import './Tab3.css';

const Tab3: React.FC<ShowTab2Props> = (props: ShowTab2Props) => {

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

    return (
        <IonPage>
            <Header></Header>
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
                <br /> Made with <IonIcon icon={heart} aria-hidden="true" style={{ color: "#e25555" }} /> by Fanny, Camillo
                & Laurin <br />

                {/*</div>*/}
                <br />

                <a
                    onClick={() => history.push('/admin')}
                    style={{ cursor: "pointer" }}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            history.push('/admin');
                        }
                    }}

                >
                    <u>Admin Login</u>
                </a>
                <br />
                <a href="https://github.com/einToast/MarioKart_Backend">Source Code Backend</a>
                <br />
                <a href="https://github.com/einToast/MarioKart_Frontend">Source Code Frontend</a>
            </IonContent>
        </IonPage>
    );
};

export default Tab3;
