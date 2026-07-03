// @ts-nocheck
import React, { useEffect, Suspense } from 'react';
import { CLASSES } from '@/constants/classes';
import { withDashboardActions } from '@/containers/Dashboard/withDashboardActions';
import { compose } from '@/utils';
import { Spinner } from '@blueprintjs/core';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import { withUniversalSearchActions } from '@/containers/UniversalSearch/withUniversalSearchActions';

/**
 * Dashboard pages wrapper.
 */
function DashboardPage({
  // #ownProps
  pageTitle,
  backLink,
  sidebarExpand = true,
  Component,
  name,
  hint,
  defaultSearchResource,

  // #withDashboardActions
  changePageTitle,
  setDashboardBackLink,
  changePageHint,
  toggleSidebarExpand,

  // #withUniversalSearch
  setResourceTypeUniversalSearch,
  resetResourceTypeUniversalSearch,
}) {
  // Hydrate the given page title.
  useEffect(() => {
    pageTitle && changePageTitle(pageTitle);

    return () => {
      pageTitle && changePageTitle('');
    };
  });

  // Hydrate the given page hint.
  useEffect(() => {
    hint && changePageHint(hint);

    return () => {
      hint && changePageHint('');
    };
  }, [hint, changePageHint]);

  // Hydrate the dashboard back link status.
  useEffect(() => {
    backLink && setDashboardBackLink(backLink);

    return () => {
      backLink && setDashboardBackLink(false);
    };
  }, [backLink, setDashboardBackLink]);

  useEffect(() => {
    const className = `page-${name}`;
    name && document.body.classList.add(className);

    return () => {
      name && document.body.classList.remove(className);
    };
  }, [name]);

  // Auto-collapse the sidebar on narrow viewports (phones/small tablets) to
  // free up content width, since nothing else in the layout adapts its width
  // — the sidebar is otherwise always shown at full expanded width regardless
  // of screen size. Pages that explicitly request a collapsed sidebar
  // (sidebarExpand={false}) keep that regardless of viewport.
  const isNarrowViewport = useMediaQuery('(max-width: 768px)');

  useEffect(() => {
    toggleSidebarExpand(sidebarExpand && !isNarrowViewport);
  }, [toggleSidebarExpand, sidebarExpand, isNarrowViewport]);

  useEffect(() => {
    if (defaultSearchResource) {
      setResourceTypeUniversalSearch(defaultSearchResource);
    }
    return () => {
      resetResourceTypeUniversalSearch();
    };
  }, [
    defaultSearchResource,
    resetResourceTypeUniversalSearch,
    setResourceTypeUniversalSearch,
  ]);

  return (
    <div className={CLASSES.DASHBOARD_PAGE}>
      <Suspense
        fallback={
          <div class="dashboard__fallback-loading">
            <Spinner size={40} value={null} />
          </div>
        }
      >
        <Component />
      </Suspense>
    </div>
  );
}

export default compose(
  withDashboardActions,
  // withUniversalSearch,
  withUniversalSearchActions,
)(DashboardPage);
