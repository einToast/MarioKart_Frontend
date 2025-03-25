import { IonApp, IonIcon, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import '@ionic/react/css/core.css';
import { barChartOutline, gameControllerOutline, homeOutline, informationCircleOutline } from 'ionicons/icons';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';

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
    // TODO: Props in Tabs to tell it App.tsx
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
            PublicScheduleService.isMatchPlanCreated(),
            PublicScheduleService.isFinalPlanCreated(),
            PublicScheduleService.isNumberOfRoundsUnplayedLessThanTwo()
        ]).then(([matchPlanValue, finalPlanValue, roundsLessTwoValue]) => {
            setShowTab2(!matchPlanValue || finalPlanValue || !roundsLessTwoValue);
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
                                <Route exact path="/tab1" component={() => <Tab1 {...showTab2Props}/>} />
                                <Route exact path="/tab2" component={() => <Tab2 {...showTab2Props}/>} />
                                <Route exact path="/tab3" component={() => <Tab3 {...showTab2Props}/>} />
                                <Route exact path="/tab4" component={() => <Tab4 {...showTab2Props}/>} />
                                <Route exact path="/survey" component={() => <Survey {...showTab2Props}/>} />

                                <Suspense fallback={<div className="loading-container">Admin-Bereich wird geladen...</div>}>
                                    <Route exact path="/admin/login" component={Login} />
                                    <Route path="/admin" component={AdminRouter} />
                                </Suspense>
                                <Route exact path={["/register", "/login"]} component={() => <Redirect to="/tab1" />} />
                                <Route exact path="/admin">
                                    <Redirect to="/admin/dashboard" />
                                </Route>
                                <Route exact path="/">
                                    <Redirect to="/tab1" />
                                </Route>
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
                            <Route exact path="/register" component={() => <RegisterTeam setUser={setCurrentUser} />} />
                            <Route exact path="/login" component={() => <LoginToTeam setUser={setCurrentUser} />} />
                            <Suspense fallback={<div className="loading-container">Admin-Bereich wird geladen...</div>}>
                                <Route exact path="/admin/login" component={Login} />
                                <Route path="/admin" component={AdminRouter} />
                            </Suspense>
                            <Route exact path="/">
                                <Redirect to="/login" />
                            </Route>
                            {/* <Route exact path={["/tab1", "/tab2", "/tab3", "/tab4", "/survey"]} component={() => <Redirect to="/login" />} /> */}
                            <Route exact path="/healthcheck">
                                <div>OK</div>
                            </Route>
                        </IonRouterOutlet>
                    )}
                </IonReactRouter>
            </WebSocketProvider>
        </IonApp>
    );
};

export default App;
