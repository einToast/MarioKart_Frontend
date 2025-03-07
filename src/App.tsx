import {
    IonApp,
    IonIcon,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonTabs,
    setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { barChartOutline, gameControllerOutline, homeOutline, informationCircleOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import AdminDashboard from "./pages/admin/Dashboard";
import Final from "./pages/admin/Final";
import Login from "./pages/admin/Login";
import AdminPoints from "./pages/admin/Points";
import AdminResults from "./pages/admin/Results";
import AdminSurvey from "./pages/admin/SurveyAdmin";
import LoginToTeam from './pages/LoginTeam';
import RegisterTeam from './pages/RegisterTeam';
import Survey from "./pages/Survey";
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';

import '@ionic/react/css/core.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/typography.css';
import './theme/variables.css';

import { WebSocketProvider } from "./components/WebSocketContext";
import Control from "./pages/admin/Control";
import MatchPlan from "./pages/admin/MatchPlan";
import Teams from './pages/admin/Teams';
import Tab4 from './pages/Tab4';
import './theme/main.css';
import { User } from "./util/api/config/interfaces";
import { checkFinal, checkMatch } from "./util/service/adminService";
import { getNumberOfUnplayedRounds } from "./util/service/dashboardService";
import { getUser } from "./util/service/loginService";

setupIonicReact();

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [gamesToPlay, setGamesToPlay] = useState<number>(0);
    const [matchPlanCreated, setMatchPlanCreated] = useState<boolean>(false);
    const [finalPlanCreated, setFinalPlanCreated] = useState<boolean>(false);

    useEffect(() => {
        const user = getUser();
        if (user?.name) {
            setCurrentUser(user);
        }
        const matchplan = checkMatch();
        const finalplan = checkFinal();
        const rounds = getNumberOfUnplayedRounds();
        matchplan.then(value => {
            setMatchPlanCreated(value);
        })

        finalplan.then(value => {
            setFinalPlanCreated(value);
        })

        rounds.then(value => {
            setGamesToPlay(value);
        })

    }, []);

    return (
        <IonApp>
            <WebSocketProvider>
                <IonReactRouter>
                    {/* TODO: update with standard routes */}
                    {currentUser?.name ? (
                        <IonTabs>
                            <IonRouterOutlet animated={true} mode="ios">
                                <Route exact path="/tab1" component={Tab1} />
                                <Route exact path="/tab2" component={Tab2} />
                                <Route exact path="/tab3" component={Tab3} />
                                <Route exact path="/tab4" component={Tab4} />
                                <Route exact path="/survey" component={Survey} />

                                <Route exact path="/admin/login" component={Login} />
                                <Route exact path="/admin/dashboard" component={AdminDashboard} />
                                <Route exact path="/admin/points" component={AdminPoints} />
                                <Route exact path="/admin/final" component={Final} />
                                <Route exact path="/admin/results" component={AdminResults} />
                                <Route exact path="/admin/matchplan" component={MatchPlan} />
                                <Route exact path="/admin/control" component={Control} />
                                <Route exact path="/admin/survey" component={AdminSurvey} />
                                <Route exact path="/admin/teams" component={Teams} />
                                <Route exact path={["/register", "/login"]} component={() => <Redirect to="/tab1" />} />
                                <Route exact path="/">
                                    <Redirect to="/tab1" />
                                </Route>
                                <Route exact path="/admin">
                                    <Redirect to="/admin/dashboard" />
                                </Route>
                            </IonRouterOutlet>
                            <IonTabBar slot="bottom">
                                <IonTabButton tab="tab1" href="/tab1">
                                    <IonIcon aria-hidden="true" icon={homeOutline} title="Spielplan" />
                                </IonTabButton>
                                {(!matchPlanCreated || finalPlanCreated || gamesToPlay >= 2) && (
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
                        <IonRouterOutlet animated={true} mode="ios">
                            <Route exact path="/register" component={() => <RegisterTeam setUser={setCurrentUser} />} />
                            <Route exact path="/login" component={() => <LoginToTeam setUser={setCurrentUser} />} />
                            <Route exact path="/admin/login" component={Login} />
                            <Route exact path="/admin/dashboard" component={AdminDashboard} />
                            <Route exact path="/admin/points" component={AdminPoints} />
                            <Route exact path="/admin/final" component={Final} />
                            <Route exact path="/admin/results" component={AdminResults} />
                            <Route exact path="/admin/matchplan" component={MatchPlan} />
                            <Route exact path="/admin/control" component={Control} />
                            <Route exact path="/admin/survey" component={AdminSurvey} />
                            <Route exact path="/admin/teams" component={Teams} />
                            <Route exact path="/admin">
                                <Redirect to="/admin/dashboard" />
                            </Route>
                            <Route exact path="/">
                                <Redirect to="/login" />
                            </Route>
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
