import { IonToast } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { errorToastColor, successToastColor } from '../util/api/config/constants';
import { ToastProps, User } from '../util/api/config/interfaces';
import { PublicCookiesService } from '../util/service';

const Toast: React.FC<ToastProps> = ({ message, showToast, setShowToast, isError = true }) => {
    const [user, setUser] = useState<User | null>(PublicCookiesService.getUser());

    useEffect(() => {
        setUser(PublicCookiesService.getUser());
    }, []);



    return (
        <IonToast
            isOpen={showToast}
            onDidDismiss={() => setShowToast(false)}
            message={message}
            duration={isError ? 2000 : 500}
            className={user ? 'tab-toast' : ''}
            cssClass="toast"
            style={{
                '--toast-background': isError ? errorToastColor : successToastColor
            }}
        />
    );
};

export default Toast;