import { IonToast } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { errorToastColor, successToastColor } from '../util/api/config/constants';
import { PublicUserService } from '../util/service';
import { User } from '../util/api/config/interfaces';

interface ToastProps {
    message: string;
    showToast: boolean;
    setShowToast: (show: boolean) => void;
    isError?: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, showToast, setShowToast, isError = true }) => {
    const [user, setUser] = useState<User|null>(PublicUserService.getUser());

    useEffect(() => {
        setUser(PublicUserService.getUser());
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