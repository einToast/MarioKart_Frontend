import {IonContent, IonIcon, IonPage} from '@ionic/react';
import './Tab3.css';
import Header from "../components/Header";
import {LinearGradient} from "react-text-gradients";
import {
    heart, medalOutline, megaphoneOutline, pizzaOutline,
    playOutline,
    playSkipForwardOutline
} from "ionicons/icons";
import {useHistory, useLocation} from "react-router";
import React, {useEffect} from "react";
import {getTournamentOpen} from "../util/service/teamRegisterService";
import ErrorCard from "../components/cards/ErrorCard";

const Tab3: React.FC = () => {

    const history = useHistory();
    const location = useLocation();

    useEffect(() => {
        const tournamentOpen = getTournamentOpen();

        tournamentOpen.then((response) => {
            if (!response) {
                history.push('/admin');
            }
        })
    },[location])



    return (
        <IonPage>
          <Header></Header>
            <IonContent fullscreen>
                <h1>
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                        Details
                    </LinearGradient>
                </h1>
                <h3>Raumplan</h3>
                <div>
                    <img src={"../resources/raumplan.png"} alt="raumplan"/>
                </div>
                <h3>Programm</h3>
                <div className={"progressContainer"}>
                    <div>
                        <IonIcon aria-hidden="true" icon={megaphoneOutline}/>
                        <p><span>16:00 - 16:45</span> Arne labert</p>
                    </div>
                    <div>
                        <IonIcon aria-hidden="true" icon={playOutline}/>
                        <p><span>16:45 - 18:30</span> Runde 1 - 5</p>
                    </div>
                    <div>
                        <IonIcon aria-hidden="true" icon={pizzaOutline}/>
                        <p><span>18:30 - 19:00</span> Pause</p>
                    </div>
                    <div>
                        <IonIcon aria-hidden="true" icon={playOutline}/>
                        <p><span>19:00 - 20:00</span> Runde 6 - 8</p>
                    </div>
                    <div>
                        <IonIcon aria-hidden="true" icon={playSkipForwardOutline}/>
                        <p><span>20:00 - 20:45</span> Finale</p>
                    </div>
                    <div>
                        <IonIcon aria-hidden="true" icon={medalOutline}/>
                        <p><span>21:00</span> Siegerehrung</p>
                    </div>
                </div>
                {/*<h3>Organisatoren</h3>*/}
                {/*<div className={"organisatorenSingle"}>*/}
                {/*    <div className={"img-wrapper"}>*/}
                {/*        <img src={"../resources/camillo.jpeg"} alt="camillo"/>*/}
                {/*    </div>*/}
                {/*    <div>*/}
                {/*        <p>Camillo Dobrovsky</p>*/}
                {/*        <p>Main Character</p>*/}
                {/*    </div>*/}
                {/*</div>*/}
                {/*<div className={"organisatorenSingle"}>*/}
                {/*    <div className={"img-wrapper"}>*/}
                {/*        <img src={"../resources/fanny.jpeg"} alt="fanny"/>*/}
                {/*    </div>*/}
                {/*    <div>*/}
                {/*        <p>Fanny Wolff</p>*/}
                {/*        <p>Medienbeauftragte</p>*/}
                {/*    </div>*/}
                {/*</div>*/}
                {/*<div className={"organisatorenSingle"}>*/}
                {/*    <div className={"img-wrapper"}>*/}
                {/*        <img src={"../resources/arne.jpeg"} alt="arne"/>*/}
                {/*    </div>*/}
                {/*    <div>*/}
                {/*        <p>Arne Allwardt</p>*/}
                {/*        <p>Moderator</p>*/}
                {/*    </div>*/}
                {/*</div>*/}
                {/*<div style={{textAlign: "center"}}>*/}
                <br/> Made with <IonIcon icon={heart} aria-hidden="true" style={{color: "#e25555"}}/> by Fanny, Camillo
                & Laurin <br/>

                {/*</div>*/}
                <br/>

                <a
                    onClick={() => history.push('/admin')}
                    style={{cursor: "pointer"}}
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            history.push('/admin');
                        }
                    }}

                >
                    <u>Admin Login</u>
                </a>
                <br/>
                <a href="https://github.com/einToast/MarioKart">Source Code</a>
            </IonContent>
        </IonPage>
    );
};

export default Tab3;
