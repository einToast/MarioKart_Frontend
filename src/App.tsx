import { IonApp, IonIcon, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import '@ionic/react/css/core.css';
import { barChartOutline, gameControllerOutline, homeOutline, informationCircleOutline } from 'ionicons/icons';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Navigate, Route } from 'react-router-dom';

// Normale Imports für Hauptkomponenten
import '@ionic/react/css/display.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/typography.css';
import LoginToTeam from './pages/LoginTeam';
import RegisterTeam from './pages/RegisterTeam';
import Survey from "./pages/Survey";
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';
import Tab4 from './pages/Tab4';
import './theme/variables.css';

import { WebSocketProvider } from "./components/WebSocketContext";
import './theme/main.css';
import { ShowTab2Props, User } from "./util/api/config/interfaces";
import { PublicCookiesService, PublicScheduleService } from './util/service';

// Lazy-Import nur für die Login-Komponente und den Admin-Router
const Login = lazy(() => import('./pages/admin/Login'));
const AdminRouter = lazy(() => import('./pages/admin/AdminRouter'));

setupIonicReact();

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [showTab2, setShowTab2] = useState<boolean>(true);

    const showTab2Props: ShowTab2Props = {
        showTab2: showTab2,
        setShowTab2: setShowTab2,
    };

    useEffect(() => {
        const user = PublicCookiesService.getUser();
        if (user?.teamId) {
            setCurrentUser(user);
        }

        Promise.all([
            PublicScheduleService.isScheduleCreated(),
            PublicScheduleService.isFinalScheduleCreated(),
            PublicScheduleService.isNumberOfRoundsUnplayedLessThanTwo()
        ]).then(([scheduleValue, finalScheduleValue, roundsLessTwoValue]) => {
            setShowTab2(!scheduleValue || finalScheduleValue || !roundsLessTwoValue);
        }).catch(error => {
            console.error("Error fetching schedule data:", error);
        });

    }, []);

    return (
        <IonApp>
            <WebSocketProvider>
                <IonReactRouter>
                    {currentUser?.teamId ? (
                        <IonTabs>
                            <IonRouterOutlet animated={false} mode="md">
                                <Route path="/tab1" element={<Tab1 {...showTab2Props} />} />
                                <Route path="/tab2" element={<Tab2 {...showTab2Props} />} />
                                <Route path="/tab3" element={<Tab3 {...showTab2Props} />} />
                                <Route path="/tab4" element={<Tab4 {...showTab2Props} />} />
                                <Route path="/survey" element={<Survey {...showTab2Props} />} />

                                <Suspense fallback={<div className="loading-container">Admin-Bereich wird geladen...</div>}>
                                    <Route path="/admin/login" element={<Login />} />
                                    <Route path="/admin" element={<AdminRouter />} />
                                </Suspense>
                                <Route path="/register" element={<Navigate to="/tab1" />} />
                                <Route path="/login" element={<Navigate to="/tab1" />} />
                                <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
                                <Route path="/" element={<Navigate to="/tab1" />} />
                            </IonRouterOutlet>
                            <IonTabBar slot="bottom">
                                <IonTabButton tab="tab1" href="/tab1">
                                    <IonIcon aria-hidden="true" icon={homeOutline} title="Spielplan" />
                                </IonTabButton>
                                {showTab2 && (
                                    <IonTabButton tab="tab2" href="/tab2">
                                        <IonIcon aria-hidden="true" icon={barChartOutline} title="Rangliste" />
                                    </IonTabButton>
                                )}
                                <IonTabButton tab="tab3" href="/tab3">
                                    <IonIcon aria-hidden="true" icon={informationCircleOutline} title="Details" />
                                </IonTabButton>
                                <IonTabButton tab="tab4" href="/tab4">
                                    <IonIcon aria-hidden="true" icon={gameControllerOutline} title="How to play" />
                                </IonTabButton>
                            </IonTabBar>
                        </IonTabs>
                    ) : (
                        <IonRouterOutlet animated={false} mode="md">
                            <Route path="/register" element={<RegisterTeam setUser={setCurrentUser} />} />
                            <Route path="/login" element={<LoginToTeam setUser={setCurrentUser} />} />
                            <Suspense fallback={<div className="loading-container">Admin-Bereich wird geladen...</div>}>
                                <Route path="/admin/login" element={<Login />} />
                                <Route path="/admin" element={<AdminRouter />} />
                            </Suspense>
                            <Route path="/tab4" element={<Tab4 {...showTab2Props} />} />
                            <Route path="/" element={<Navigate to="/login" />} />

                            {/* <Route exact path={["/tab1", "/tab2", "/tab3", "/tab4", "/survey"]} element={<Navigate to="/login" />} /> */}
                            <Route path="/healthcheck" element={<div>OK</div>} />
                        </IonRouterOutlet>
                    )}
                </IonReactRouter>
            </WebSocketProvider>
        </IonApp>
    );
};

export default App;
