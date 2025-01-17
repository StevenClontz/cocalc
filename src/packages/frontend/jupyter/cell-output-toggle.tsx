/*
 *  This file is part of CoCalc: Copyright © 2020 Sagemath, Inc.
 *  License: AGPLv3 s.t. "Commons Clause" – see LICENSE.md for details
 */

// Components related to toggling the way output is displayed.

import React from "react";
import { Icon } from "../components/icon";
import type { JupyterActions } from "./browser-actions";

const SCROLLED_STYLE: React.CSSProperties = {
  fontSize: "inherit",
  padding: 0,
  display: "flex", // flex used to move output prompt to bottom.
  flexDirection: "column",
  height: "auto",
} as const;

const NORMAL_STYLE: React.CSSProperties = {
  borderColor: "transparent",
  ...SCROLLED_STYLE,
} as const;

interface OutputToggleProps {
  actions?: JupyterActions;
  id: string;
  scrolled?: boolean;
  children: React.ReactNode;
}

export const OutputToggle: React.FC<OutputToggleProps> = React.memo(
  (props: OutputToggleProps) => {
    const { actions, id, scrolled, children } = props;

    function toggle_scrolled() {
      actions?.toggle_output(id, "scrolled");
    }

    function collapse_output() {
      actions?.toggle_output(id, "collapsed");
    }

    // We use an antd button for the output toggle area, but disable the padding
    // and border. This looks pretty good and consistent and clean.
    return (
      <div
        className="ant-btn ant-btn-default"
        style={scrolled ? SCROLLED_STYLE : NORMAL_STYLE}
        onClick={toggle_scrolled}
        onDoubleClick={collapse_output}
      >
        {children}
        <div style={{ flex: 1 }} /> {/* use up all space */}
      </div>
    );
  }
);

interface CollapsedOutputProps {
  actions?: JupyterActions;
  id: string;
}

export const CollapsedOutput: React.FC<CollapsedOutputProps> = React.memo(
  (props: CollapsedOutputProps) => {
    const { actions, id } = props;

    function show_output() {
      actions?.toggle_output(id, "collapsed");
    }

    // We use an antd button for the output toggle area, but disable the padding
    // and border. This looks pretty good and consistent and clean.
    return (
      <div
        className="ant-btn ant-btn-default"
        onClick={show_output}
        style={{
          textAlign: "center",
          width: "100%",
          color: "#777",
          padding: 0,
          height: "auto", // ant-btn makes height short.
        }}
      >
        <Icon name="ellipsis" />
      </div>
    );
  }
);
