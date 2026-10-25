/*
 * SPDX-FileCopyrightText: 2026 Vitaliy Zarubin <keygenqt@yandex.ru>
 * SPDX-License-Identifier: AGPL-3.0-or-later
 * TAGS: ['components']
 */
import PropTypes from "prop-types";
import { Box } from "@mui/material";

import { HandleView } from "../views";
import { ScrollPanel } from "./ScrollPanel";

export function SidebarLayout(props) {
  const { collapsed, width, dragging, onHandlePointerDown } = props.sidebar;
  return (
    <>
      {/* stands still, fades out while the content column covers it */}
      <Box
        sx={(theme) => ({
          width: width,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          opacity: collapsed ? 0 : 1,
          boxSizing: "border-box",
          // fade leads the slide by 100ms and trails it by 100ms
          transition: dragging
            ? "none"
            : theme.transitions.create(["opacity"], {
                duration: theme.transitions.duration.standard + 100,
                easing: theme.transitions.easing.sharp,
              }),
        })}
      >
        <Box
          sx={{
            flexShrink: 0,
            minHeight: 45,
            display: "flex",
            alignItems: "center",
            borderRadius: 2,
            backgroundColor: "background.paper",
            boxSizing: "border-box",
            px: 2,
            py: 1,
          }}
        >
          {props.sidebarTitle}
        </Box>
        {props.scrollSidebar === false ? (
          props.sidebarView
        ) : (
          <ScrollPanel scrollKey={props.scrollSidebarKey}>
            {props.sidebarView}
          </ScrollPanel>
        )}
      </Box>
      <HandleView
        orientation="vertical"
        onPointerDown={onPointerDownGuard(props)}
      />
      <Box
        sx={(theme) => ({
          flexGrow: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          // slides over the standing sidebar: width + two gaps + handle
          marginLeft: collapsed
            ? `calc(-1 * (${width}px + ${theme.spacing(2)} + 2px))`
            : 0,
          position: "relative",
          zIndex: 1,
          backgroundColor: "background.default",
          transition: dragging
            ? "none"
            : theme.transitions.create(["margin"], {
                duration: theme.transitions.duration.standard,
                easing: theme.transitions.easing.easeInOut,
              }),
        })}
      >
        {props.scrollPage === false ? (
          props.children
        ) : (
          <ScrollPanel scrollKey={props.scrollPageKey}>
            {props.children}
          </ScrollPanel>
        )}
      </Box>
    </>
  );
}

function onPointerDownGuard(props) {
  return props.sidebar.collapsed
    ? undefined
    : props.sidebar.onHandlePointerDown;
}

SidebarLayout.propTypes = {
  sidebar: PropTypes.shape({
    collapsed: PropTypes.bool.isRequired,
    width: PropTypes.number.isRequired,
    dragging: PropTypes.bool.isRequired,
    onHandlePointerDown: PropTypes.func.isRequired,
  }).isRequired,
  scrollPage: PropTypes.bool,
  scrollPageKey: PropTypes.string,
  scrollSidebar: PropTypes.bool,
  scrollSidebarKey: PropTypes.string,
  sidebarView: PropTypes.element.isRequired,
  children: PropTypes.node,
};
