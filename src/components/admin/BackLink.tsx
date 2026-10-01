import { IonIcon } from "@ionic/react";
import { arrowBackOutline } from "ionicons/icons";
import React from "react";
import { Link } from "react-router-dom";
import "../../pages/admin/Points.css";

const BackLink: React.FC<{ to?: string }> = ({ to = '/admin/dashboard' }) => {
    return (
        <Link className={"back"} to={to}>
            <IonIcon aria-hidden="true" icon={arrowBackOutline}></IonIcon>
            <span>Zurück</span>
        </Link>
    );
};

export default BackLink;
