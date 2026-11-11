import { IonButton, IonContent, IonIcon, IonLabel, IonModal, IonSegment, IonSegmentButton } from '@ionic/react';
import { arrowForwardOutline } from 'ionicons/icons';
import React, { useState } from 'react';
import './NotificationHelpModal.css';
import { useTranslation } from 'react-i18next';

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
const PLATFORMS: Platform[] = ['android', 'ios'];

const detectPlatform = (): Platform => {
    const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent)
        || (navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1);
    return isIos ? 'ios' : 'android';
};

const HelpImage: React.FC<{ image?: string, description: string }> = ({ image, description }) => {
    const { t } = useTranslation();
    return image
        ? <img className="helpImage" src={image} alt={description} />
        : (
            <div className="helpImagePlaceholder" role="img" aria-label={description}>
                <p>{t('notificationHelp.imagePending', { description })}</p>
            </div>
        );
};

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
    const { t } = useTranslation();
    const [platform, setPlatform] = useState<Platform>(detectPlatform);
    const section = (key: Platform | 'troubleshooting') => t(`notificationHelp.${key}`, { returnObjects: true }) as HelpSection;
    const troubleshooting = section('troubleshooting');

    return (
        <IonModal isOpen={showModal} onDidDismiss={closeModal}>
            <IonContent>
                <div className="notificationHelp">
                    <h4>{t('notificationHelp.title')}</h4>
                    <p>{t('notificationHelp.intro')}</p>
                    <IonSegment value={platform} onIonChange={(e) => setPlatform(e.detail.value as Platform)}>
                        {PLATFORMS.map((key) => (
                            <IonSegmentButton key={key} value={key}>
                                <IonLabel>{section(key).title}</IonLabel>
                            </IonSegmentButton>
                        ))}
                    </IonSegment>
                    <section className="helpPlatform">
                        <HelpSectionSteps section={section(platform)} />
                    </section>
                    <section>
                        <h3>{troubleshooting.title}</h3>
                        <HelpSectionSteps section={troubleshooting} />
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
                            <p>{t('common.close')}</p>
                            <IonIcon slot="end" icon={arrowForwardOutline}></IonIcon>
                        </div>
                    </IonButton>
                </div>
            </IonContent>
        </IonModal>
    );
}

export default NotificationHelpModal;
