import React from 'react';
import { IonRouterOutlet, IonRoute } from '@ionic/react';
import { Route, Redirect } from 'react-router-dom';

// Import aller Admin-Komponenten
import AdminDashboard from './Dashboard';
import AdminPoints from './Points';
import Final from './Final';
import AdminResults from './Results';
import MatchPlan from './MatchPlan';
import Control from './Control';
import AdminSurvey from './SurveyAdmin';
import Teams from './Teams';

const AdminRouter: React.FC = () => {
  return (
    <IonRouterOutlet animated={false} mode="md">
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
    </IonRouterOutlet>
  );
};

export default AdminRouter;