import '../../interface/interfaces'
import '../RegisterTeam.css'
import {LinearGradient} from "react-text-gradients";
import {
    IonButton,
    IonContent,
    IonPage,
    IonIcon,
    IonCheckbox, IonAccordion,
    IonAccordionGroup,
    IonItem, IonLabel
} from "@ionic/react";
import {arrowBackOutline, arrowForwardOutline} from 'ionicons/icons';
import {useEffect, useRef, useState} from "react";
import "./Points.css"

const points: React.FC<LoginProps> = (props: LoginProps) => {
    const accordionGroup = useRef<null | HTMLIonAccordionGroupElement>(null);

    //TODO: get all played & current Rounds
    //TODO: get current Teams & Games of selected Round
    //TODO: POST selected Points
    //TODO: POST all Points
    return (
        <IonPage>
            <IonContent fullscreen>
                <div className={"back"}>
                    <IonIcon slot="end" icon={arrowBackOutline}></IonIcon>
                    <a href={"/admin/dashboard"}>Zurück</a>
                </div>
                <div className={"flexStart"}>
                    <h2>
                        <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>
                            Punkte eintragen
                        </LinearGradient>
                    </h2>
                    <div>
                        <select>
                            <option key={1} value={1}>Runde 1</option>
                            <option key={2} value={2}>Runde 2</option>
                            <option key={3} value={3}>Runde 3</option>
                        </select>

                    </div>
                </div>
                <IonAccordionGroup ref={accordionGroup} multiple={true}>
                    <IonAccordion value="first">
                        <IonItem slot="header" color="light">
                            <h3 className={"gruen"}>Switch grün</h3>
                        </IonItem>

                        <div className="ion-padding" slot="content">
                            <div className={"inputContainer"}>
                                <div className={"characterInput"}>
                                    <input></input>
                                    <img src={"./resources/media/toadette.png"}/>
                                </div>
                                <div className={"characterInput"}>
                                    <input></input>
                                    <img src={"./resources/media/mario.png"}/>
                                </div>
                                <div className={"characterInput"}>
                                    <input></input>
                                    <img src={"./resources/media/waluigi.png"}/>
                                </div>
                                <div className={"characterInput"}>
                                    <input></input>
                                    <img src={"./resources/media/koopa.png"}/>
                                </div>
                            </div>
                            <IonButton slot="start" shape="round">
                                <div>
                                    <p>Spiel speichern</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                        </div>
                    </IonAccordion>
                    <IonAccordion value="second">
                        <IonItem slot="header" color="light">
                            <h3 className={"rot"}>Switch rot</h3>
                        </IonItem>
                        <div className="ion-padding" slot="content">
                            <div className={"inputContainer"}>
                                <div className={"characterInput"}>
                                    <input></input>
                                    <img src={"./resources/media/toad.png"}/>
                                </div>
                                <div className={"characterInput"}>
                                    <input></input>
                                    <img src={"./resources/media/daisy.png"}/>
                                </div>
                                <div className={"characterInput"}>
                                    <input></input>
                                    <img src={"./resources/media/lakitu.png"}/>
                                </div>
                                <div className={"characterInput"}>
                                    <input></input>
                                    <img src={"./resources/media/link.png"}/>
                                </div>
                            </div>
                            <IonButton slot="start" shape="round">
                                <div>
                                    <p>Spiel speichern</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                        </div>
                    </IonAccordion>
                    <IonAccordion value="third">
                        <IonItem slot="header" color="light">
                            <h3 className={"weiss"}>Switch weiß</h3>
                        </IonItem>
                        <div className="ion-padding" slot="content">
                            <div className={"inputContainer"}>
                                <div className={"characterInput"}>
                                    <input></input>
                                    <img src={"./resources/media/luigi.png"}/>
                                </div>
                                <div className={"characterInput"}>
                                    <input></input>
                                    <img src={"./resources/media/melinda.png"}/>
                                </div>
                                <div className={"characterInput"}>
                                    <input></input>
                                    <img src={"./resources/media/peach.png"}/>
                                </div>
                                <div className={"characterInput"}>
                                    <input></input>
                                    <img src={"./resources/media/wario.png"}/>
                                </div>
                            </div>
                            <IonButton slot="start" shape="round">
                                <div>
                                    <p>Spiel speichern</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                        </div>
                    </IonAccordion>
                    <IonAccordion value="fourth">
                        <IonItem slot="header" color="light">
                            <h3 className={"blau"}>Switch blau</h3>
                        </IonItem>
                        <div className="ion-padding" slot="content">
                            <div className={"inputContainer"}>
                                <div className={"characterInput"}>
                                    <input></input>
                                    <img src={"./resources/media/yoshi.png"}/>
                                </div>
                                <div className={"characterInput"}>
                                    <input></input>
                                    <img src={"./resources/media/rosalina.png"}/>
                                </div>
                                <div className={"characterInput"}>
                                    <input></input>
                                    <img src={"./resources/media/metall-mario.png"}/>
                                </div>
                                <div className={"characterInput"}>
                                    <input></input>
                                    <img src={"./resources/media/shy-guy.png"}/>
                                </div>
                            </div>
                            <IonButton slot="start" shape="round">
                                <div>
                                    <p>Spiel speichern</p>
                                    <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                                </div>
                            </IonButton>
                        </div>
                    </IonAccordion>
                </IonAccordionGroup>


                <div className={"playedContainer"}>

                    <IonCheckbox labelPlacement="end">Runde gespielt</IonCheckbox>

                    <IonButton slot="start" shape="round" className={"round"}>
                        <div>
                            <p>Punkte speichern</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>


                </div>
            </IonContent>
        </IonPage>
    )
        ;
};

export default points;
