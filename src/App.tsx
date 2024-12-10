import {useEffect, useState} from 'react';
import { Redirect, Route } from 'react-router-dom';
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
import { barChartOutline, homeOutline, informationCircleOutline } from 'ionicons/icons';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';
import RegisterTeam from './pages/RegisterTeam';
import Login from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminPoints from "./pages/admin/Points";
import Final from "./pages/admin/Final";
import AdminResults from "./pages/admin/Results";
import AdminSurvey from "./pages/admin/SurveyAdmin";
import Survey from "./pages/Survey";
import LoginToTeam from './pages/LoginTeam';
import './interface/interfaces';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

import './theme/main.css'
import MatchPlan from "./pages/admin/MatchPlan";
import Control from "./pages/admin/Control";
import {getUser} from "./util/service/loginService";
import {WebSocketProvider} from "./components/WebSocketContext";

setupIonicReact();

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const user = getUser();
        if (user) {
            setCurrentUser(user);
        }
    }, []);



    return (
        <IonApp>
            <WebSocketProvider>
                <IonReactRouter>
                    {currentUser?.loggedIn ? (
                        <IonTabs>
                            <IonRouterOutlet>
                                <Route exact path="/tab1" component={Tab1} />
                                <Route exact path="/tab2" component={Tab2} />
                                <Route exact path="/tab3" component={Tab3} />
                                <Route exact path="/survey" component={Survey} />

                                <Route exact path="/admin/login" component={Login} />
                                <Route exact path="/admin/dashboard" component={AdminDashboard} />
                                <Route exact path="/admin/points" component={AdminPoints} />
                                <Route exact path="/admin/final" component={Final} />
                                <Route exact path="/admin/results" component={AdminResults} />
                                <Route exact path="/admin/matchplan" component={MatchPlan} />
                                <Route exact path="/admin/control" component={Control} />
                                <Route exact path="/admin/survey" component={AdminSurvey} />
                                <Route exact path="/">
                                    <Redirect to="/tab1" />
                                </Route>
                                <Route exact path="/admin">
                                    <Redirect to="/admin/dashboard" />
                                </Route>
                            </IonRouterOutlet>
                            <IonTabBar slot="bottom">
                                <IonTabButton tab="tab1" href="/tab1">
                                    <IonIcon aria-hidden="true" icon={homeOutline} />
                                </IonTabButton>
                                <IonTabButton tab="tab2" href="/tab2">
                                    <IonIcon aria-hidden="true" icon={barChartOutline} />
                                </IonTabButton>
                                <IonTabButton tab="tab3" href="/tab3">
                                    <IonIcon aria-hidden="true" icon={informationCircleOutline} />
                                </IonTabButton>
                            </IonTabBar>
                        </IonTabs>
                    ) : (
                        <IonRouterOutlet>
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
