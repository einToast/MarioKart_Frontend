import { IonIcon } from "@ionic/react";
import { arrowBackOutline } from "ionicons/icons";
import React from "react";
import { Link } from "react-router-dom";
import "../../pages/admin/Points.css";
import { useTranslation } from 'react-i18next';

const BackLink: React.FC<{ to?: string }> = ({ to = '/admin/dashboard' }) => {
    const { t } = useTranslation();
    return (
        <Link className={"back"} to={to}>
            <IonIcon aria-hidden="true" icon={arrowBackOutline}></IonIcon>
            <span>{t('common.back')}</span>
        </Link>
    );
};

export default BackLink;
