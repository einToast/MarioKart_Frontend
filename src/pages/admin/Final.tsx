import '../../interface/interfaces'
import {LinearGradient} from "react-text-gradients";
import {
    IonButton,
    IonContent,
    IonPage,
    IonIcon, IonCheckbox
} from "@ionic/react";
import {arrowBackOutline, arrowForwardOutline, trashOutline} from 'ionicons/icons';
import "./Final.css"

const Final: React.FC<LoginProps> = (props: LoginProps) => {
    //TODO: get current best 4 teamnames
    //TODO: delete confirmation of teams
    //TODO: after delete of a team -> the next (5.) team is in the table
    //TODO: POST Finale
    return (
        <IonPage>
            <IonContent fullscreen>
                <div className={"back"}>
                    <IonIcon slot="end" icon={arrowBackOutline}></IonIcon>
                    <a href={"/admin/dashboard"}>Zurück</a>
                </div>
                <h2>
                    <LinearGradient gradient={['to right', '#BFB5F2 ,#8752F9']}>ACHTUNG!</LinearGradient>
                </h2>
                <p>Bist du dir sicher, dass du das Finalspiel erzeugen willst? Du hast danach nicht mehr die Möglichkeit Rundenpunkte einzutragen.</p>
                <p className={"bold"}>Folgende Teams sind im Finale:</p>

                <div className={"teamFinalContainer"}>
                    <div className={"teamFinal"}>
                        <h3>Ninja Turtles</h3>
                        <IonIcon slot="end" icon={trashOutline}></IonIcon>
                    </div>
                    <div className={"teamFinal"}>
                        <h3>FSR</h3>
                        <IonIcon slot="end" icon={trashOutline}></IonIcon>
                    </div>
                    <div className={"teamFinal"}>
                        <h3>Mitarbeiter</h3>
                        <IonIcon slot="end" icon={trashOutline}></IonIcon>
                    </div>
                    <div className={"teamFinal"}>
                        <h3>Toadesser</h3>
                        <IonIcon slot="end" icon={trashOutline}></IonIcon>
                    </div>
                </div>

                <div className={"playedContainer"}>
                    <IonButton slot="start" shape="round" className={"round secondary"}>
                        <div>
                            <p>Abbrechen</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                    <IonButton slot="start" shape="round" className={"round"}>
                        <div>
                            <p>Finale erzeugen</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>


                </div>
            </IonContent>
        </IonPage>
    );
};

export default Final;