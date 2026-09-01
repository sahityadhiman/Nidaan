import React from 'react';
import { AppDataProvider } from './app/AppDataContext.jsx';
import { RoleProvider, useRole } from './app/RoleContext.jsx';
import { TourProvider } from './tour/TourContext.jsx';
import TourOverlay from './tour/TourOverlay.jsx';
import RoleSelect from './screens/RoleSelect.jsx';
import Workspace from './screens/Workspace.jsx';

/*
  Nidaan front door. `role === null` → Role Select landing; otherwise the chosen
  role's workspace. The Guided Tour overlay sits above everything. All demo data
  lives in AppDataProvider so switching roles never resets the story.
*/
function Router() {
  const { role } = useRole();
  return (
    <>
      {role ? <Workspace /> : <RoleSelect />}
      <TourOverlay />
    </>
  );
}

export default function App() {
  return (
    <AppDataProvider>
      <RoleProvider>
        <TourProvider>
          <Router />
        </TourProvider>
      </RoleProvider>
    </AppDataProvider>
  );
}
