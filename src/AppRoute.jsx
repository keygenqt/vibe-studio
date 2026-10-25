/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import * as React from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
} from "react-router";
import { Box } from "@mui/material";

import { AppRoutes } from "./constants/AppRoutes";
import {
  ErrorPage,
  GeneralPage,
  MainPage,
  ModelPage,
  ModelsPage,
  ProviderPage,
  ProvidersPage,
  SettingsPage,
} from "./pages";

const router = createBrowserRouter([
  {
    element: (
      <PageFade>
        <Outlet />
      </PageFade>
    ),
    children: [
      { index: true, element: <MainPage /> },
      {
        path: AppRoutes.settings(),
        element: <SettingsPage />,
        children: [
          {
            index: true,
            element: <Navigate replace to={AppRoutes.settingsGeneral()} />,
          },
          { path: AppRoutes.settingsGeneral(), element: <GeneralPage /> },
          { path: AppRoutes.settingsProviders(), element: <ProvidersPage /> },
          { path: AppRoutes.providerAdd(), element: <ProviderPage /> },
          { path: AppRoutes.provider(), element: <ProviderPage /> },
          { path: AppRoutes.model(), element: <ModelPage /> },
          { path: AppRoutes.models(), element: <ModelsPage /> },
        ],
      },
      { path: "*", element: <ErrorPage /> },
    ],
  },
]);

export function AppRoute() {
  return <RouterProvider router={router} />;
}

// remounts on section change; the fade-in is the fallback for
// webviews without view transitions
// the first mount (app start) renders without the fade
function PageFade(props) {
  const location = useLocation();
  const mounted = React.useRef(false);
  React.useEffect(() => {
    mounted.current = true;
  }, []);
  const fade = typeof document.startViewTransition !== "function";
  // one key per top-level section: internal settings navigation
  // keeps the shell mounted — no flicker on back
  const key = location.pathname.startsWith(AppRoutes.settings())
    ? AppRoutes.settings()
    : location.pathname;
  return (
    <Box
      key={key}
      className={fade && mounted.current ? "PageFade" : undefined}
      sx={{ height: 1 }}
    >
      {props.children}
    </Box>
  );
}
