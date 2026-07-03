// @ts-nocheck
import React from 'react';
import { Switch, Route, Redirect } from 'react-router';

import '@/style/pages/Dashboard/Dashboard.scss';

import { Sidebar } from '@/containers/Dashboard/Sidebar/Sidebar';
import DashboardContent from '@/components/Dashboard/DashboardContent';
import DialogsContainer from '@/components/DialogsContainer';
import PreferencesPage from '@/components/Preferences/PreferencesPage';
import { DashboardUniversalSearch } from '@/containers/UniversalSearch/DashboardUniversalSearch';
import DashboardSplitPane from '@/components/Dashboard/DashboardSplitePane';
import GlobalHotkeys from './GlobalHotkeys';
import DashboardProvider from './DashboardProvider';
import DrawersContainer from '@/components/DrawersContainer';
import { AlertsContainer } from '@/containers/AlertsContainer';
import { DashboardSockets } from './DashboardSockets';
import { useAbilityContext } from '@/hooks/utils/useAbilityContext';
import { AbilitySubject, PreferencesAbility } from '@/constants/abilityOption';
import { useDashboardMetaBoot } from './DashboardBoot';

/**
 * Dashboard preferences — only accessible to users with Preferences.Mutate ability.
 * We gate on isSuccess to avoid redirecting during the initial boot request when
 * the ability has no rules yet (abilities populate after the boot API responds).
 */
function DashboardPreferences() {
  const ability = useAbilityContext();
  const { isSuccess } = useDashboardMetaBoot();
  if (isSuccess && !ability?.can(PreferencesAbility.Mutate, AbilitySubject.Preferences)) {
    return <Redirect to="/" />;
  }
  return (
    <div className="dashboard-layout">
      <div className="dashboard-layout__main">
        <DashboardSplitPane>
          <Sidebar />
          <PreferencesPage />
        </DashboardSplitPane>
      </div>
    </div>
  );
}

/**
 * Dashboard other routes.
 */
function DashboardAnyPage() {
  return (
    <div className="dashboard-layout">
      <div className="dashboard-layout__main">
        <DashboardSplitPane>
          <Sidebar />
          <DashboardContent />
        </DashboardSplitPane>
      </div>
    </div>
  );
}

/**
 * Dashboard page.
 */
export default function Dashboard() {
  return (
    <DashboardProvider>
      <Switch>
        <Route path="/preferences" component={DashboardPreferences} />
        <Route path="/" component={DashboardAnyPage} />
      </Switch>

      <DashboardSockets />
      <DashboardUniversalSearch />
      <GlobalHotkeys />
      <DialogsContainer />
      <DrawersContainer />
      <AlertsContainer />
    </DashboardProvider>
  );
}
