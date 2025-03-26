import { QRCodeCanvas } from "qrcode.react";
import React from "react";

const QRCodeComponent: React.FC = () => {
    const currentDomain = window.location.origin;

    return (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
            <QRCodeCanvas value={currentDomain} size={200} />
        </div>
    );
};

export default QRCodeComponent;
