import { IonRouterOutlet } from '@ionic/react';
import React from 'react';
import { Navigate, Route } from 'react-router-dom';

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
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/points" element={<AdminPoints />} />
      <Route path="/admin/final" element={<Final />} />
      <Route path="/admin/results" element={<AdminResults />} />
      <Route path="/admin/schedule" element={<Schedule />} />
      <Route path="/admin/control" element={<Control />} />
      <Route path="/admin/survey" element={<AdminSurvey />} />
      <Route path="/admin/teams" element={<Teams />} />
      <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
    </IonRouterOutlet>
  );
};

export default AdminRouter;