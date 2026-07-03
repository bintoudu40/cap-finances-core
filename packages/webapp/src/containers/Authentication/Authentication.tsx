// @ts-nocheck
import { Route, Switch, useLocation } from 'react-router-dom';
import BodyClassName from 'react-body-classname';
import styled from 'styled-components';
import { Suspense } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { Spinner } from '@blueprintjs/core';

import authenticationRoutes from '@/routes/authentication';
import { Box, Icon, FormattedMessage as T } from '@/components';
import { AuthMetaBootProvider } from './AuthMetaBoot';

import '@/style/pages/Authentication/Auth.scss';
import { useIsDarkMode } from '@/hooks/useDarkMode';
import { BigcapitalAlt } from '@/components/Icons/BigcapitalAlt';

export function Authentication() {
  const isDarkMode = useIsDarkMode();

  return (
    <BodyClassName className={'authentication'}>
      <AuthPage>
        <AuthInsider>
          <AuthLogo>
            <BigcapitalAlt
              color={isDarkMode ? 'rgba(255, 255, 255, 0.6)' : undefined}
              height={37}
              width={214}
            />
          </AuthLogo>

          <AuthMetaBootProvider>
            <Suspense
              fallback={
                <Box style={{ marginTop: '5rem' }}>
                  <Spinner size={30} />
                </Box>
              }
            >
              <AuthenticationRoutes />
            </Suspense>
          </AuthMetaBootProvider>
        </AuthInsider>
      </AuthPage>
    </BodyClassName>
  );
}

function AuthenticationRoutes() {
  const location = useLocation();
  const locationKey = location.pathname;

  return (
    <TransitionGroup>
      <CSSTransition
        timeout={500}
        key={locationKey}
        classNames="authTransition"
      >
        <Switch>
          {authenticationRoutes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              exact={route.exact}
              component={route.component}
            />
          ))}
        </Switch>
      </CSSTransition>
    </TransitionGroup>
  );
}

const AuthPage = styled.div`
  min-height: 100vh;
  padding: 0 16px;
  box-sizing: border-box;
`;
const AuthInsider = styled.div`
  width: 384px;
  max-width: 100%;
  margin: 0 auto;
  margin-bottom: 40px;
  padding-top: 60px;
  @media (max-width: 480px) {
    padding-top: 32px;
  }
`;

const AuthLogo = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;
