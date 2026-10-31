import { IonButton, IonContent, IonIcon, IonLabel, IonModal, IonSegment, IonSegmentButton } from '@ionic/react';
import { arrowForwardOutline } from 'ionicons/icons';
import React, { useState } from 'react';
import './NotificationHelpModal.css';

interface HelpStep {
    text: string;
    image?: string;
    imageDescription?: string;
}

interface HelpSection {
    title: string;
    note?: string;
    steps: HelpStep[];
}

type Platform = 'android' | 'ios';

// TODO: Add images for the steps
const PLATFORM_SECTIONS: Record<Platform, HelpSection> = {
    android: {
        title: 'Android',
        steps: [
            {
                text: 'Öffne die Seite im Browser.',
            },
            {
                text: 'Tippe unter Einstellungen auf "Benachrichtigungen aktivieren" und bestätige die Abfrage mit "Zulassen".',
                imageDescription: 'Berechtigungsabfrage des Browsers mit hervorgehobenem "Zulassen"-Button',
            },
            {
                text: 'Erscheint keine Abfrage, sind Benachrichtigungen blockiert: Tippe auf das Symbol links neben der Adresse → Berechtigungen → Benachrichtigungen → Zulassen.',
                imageDescription: 'Seiteneinstellungen hinter dem Symbol neben der Adressleiste, Benachrichtigungen auf "Zulassen"',
            },
            {
                text: 'Prüfe in den Android-Einstellungen unter Apps → dein Browser → Benachrichtigungen, dass sie für den Browser eingeschaltet sind.',
                imageDescription: 'Android-Einstellungen, App-Info des Browsers mit eingeschalteten Benachrichtigungen',
            },
        ],
    },
    ios: {
        title: 'iPhone & iPad',
        steps: [
            {
                text: 'Öffne die Seite in Safari und tippe auf das Teilen-Symbol.',
                imageDescription: 'Safari mit hervorgehobenem Teilen-Symbol',
            },
            {
                text: 'Wähle "Zum Home-Bildschirm" (ggf. unter "Mehr") und tippe auf "Hinzufügen".',
                imageDescription: 'Teilen-Menü mit hervorgehobenem Eintrag "Zum Home-Bildschirm"',
            },
            {
                text: 'Öffne die Seite über das neue Symbol "MK Turnier" auf dem Home-Bildschirm, nicht über Safari.',
                imageDescription: 'Home-Bildschirm mit dem Symbol "MK Turnier"',
            },
            {
                text: 'Tippe unter Details auf "Benachrichtigungen aktivieren" und bestätige mit "Erlauben".',
                imageDescription: 'iOS-Abfrage "Mitteilungen senden" mit hervorgehobenem "Erlauben"',
            },
            {
                text: 'Hast du die Abfrage abgelehnt? Unter Einstellungen → Mitteilungen → MK Turnier kannst du Mitteilungen wieder erlauben.',
                imageDescription: 'iOS-Einstellungen → Mitteilungen mit eingeschaltetem Schalter für "MK Turnier"',
            },
        ],
    },
};

const TROUBLESHOOTING: HelpSection = {
    title: 'Es klappt nicht?',
    steps: [
        {
            text: 'Lade die Seite komplett neu und versuche es noch einmal.',
        },
        {
            text: 'In privaten bzw. Inkognito-Fenstern funktionieren Benachrichtigungen nicht.',
        },
        {
            text: 'Auf Geräten ohne Google-Dienste (z. B. neuere Huawei-Smartphones) funktionieren Benachrichtigungen leider nicht.',
        },
        {
            text: 'Benachrichtigungen funktionieren erst ab iOS 16.4 und nur, wenn die Seite zum Home-Bildschirm hinzugefügt wurde. In einem normalen Browser-Tab ist das nicht möglich.',
        },
    ],
};

const detectPlatform = (): Platform => {
    const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent)
        || (navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1);
    return isIos ? 'ios' : 'android';
};

const HelpImage: React.FC<{ image?: string, description: string }> = ({ image, description }) => (
    image
        ? <img className="helpImage" src={image} alt={description} />
        : (
            <div className="helpImagePlaceholder" role="img" aria-label={description}>
                <p>Bild folgt: {description}</p>
            </div>
        )
);

const HelpSectionSteps: React.FC<{ section: HelpSection }> = ({ section }) => (
    <>
        {section.note && <p className="helpNote">{section.note}</p>}
        <ol>
            {section.steps.map((step) => (
                <li key={step.text}>
                    <p>{step.text}</p>
                    {step.imageDescription && (
                        <HelpImage image={step.image} description={step.imageDescription} />
                    )}
                </li>
            ))}
        </ol>
    </>
);

const NotificationHelpModal: React.FC<{ showModal: boolean, closeModal: () => void }> = ({ showModal, closeModal }) => {
    const [platform, setPlatform] = useState<Platform>(detectPlatform);

    return (
        <IonModal isOpen={showModal} onDidDismiss={closeModal}>
            <IonContent>
                <div className="notificationHelp">
                    <h4>Benachrichtigungen</h4>
                    <p>
                        Aktiviere Benachrichtigung, um über deine nächste Runden, Pausen und Umfragen informiert zu werden. 
                        Wenn alles funktioniert hat, erhältst du eine Testbenachrichtigung.        
                    </p>
                    <IonSegment value={platform} onIonChange={(e) => setPlatform(e.detail.value as Platform)}>
                        {(Object.keys(PLATFORM_SECTIONS) as Platform[]).map((key) => (
                            <IonSegmentButton key={key} value={key}>
                                <IonLabel>{PLATFORM_SECTIONS[key].title}</IonLabel>
                            </IonSegmentButton>
                        ))}
                    </IonSegment>
                    <section className="helpPlatform">
                        <HelpSectionSteps section={PLATFORM_SECTIONS[platform]} />
                    </section>
                    <section>
                        <h3>{TROUBLESHOOTING.title}</h3>
                        <HelpSectionSteps section={TROUBLESHOOTING} />
                    </section>
                    <IonButton className={"round"} onClick={closeModal}
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                closeModal();
                            }
                        }}
                    >
                        <div>
                            <p>Schließen</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                </div>
            </IonContent>
        </IonModal>
    );
}

export default NotificationHelpModal;
