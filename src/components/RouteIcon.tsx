import { IonIcon } from '@ionic/react';
import React from 'react';
import { useLocation } from 'react-router-dom';

interface RouteIconProps {
    path: string;
    icon: string;
    selectedIcon: string;
    title?: string;
}

export const RouteIcon: React.FC<RouteIconProps> = ({ path, icon, selectedIcon, title }) => {
    const { pathname } = useLocation();
    const selected = pathname === path || pathname.startsWith(`${path}/`);

    return <IonIcon aria-hidden="true" icon={selected ? selectedIcon : icon} title={title} />;
};
