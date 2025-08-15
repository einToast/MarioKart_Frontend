import { IonRouterOutlet } from '@ionic/react';
import React from 'react';
import { Redirect, Route } from 'react-router-dom';

// Import aller Admin-Komponenten
import Control from './Control';
import AdminDashboard from './Dashboard';
import Final from './Final';
import Schedule from './Schedule';
import AdminPoints from './Points';
import AdminResults from './Results';
import AdminSurvey from './SurveyAdmin';
import Teams from './Teams';

const AdminRouter: React.FC = () => {
  return (
    <IonRouterOutlet animated={false} mode="md">
      <Route exact path="/admin/dashboard" component={AdminDashboard} />
      <Route exact path="/admin/points" component={AdminPoints} />
      <Route exact path="/admin/final" component={Final} />
      <Route exact path="/admin/results" component={AdminResults} />
      <Route exact path="/admin/schedule" component={Schedule} />
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