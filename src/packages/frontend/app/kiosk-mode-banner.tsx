/*
 *  This file is part of CoCalc: Copyright © 2020 Sagemath, Inc.
 *  License: AGPLv3 s.t. "Commons Clause" – see LICENSE.md for details
 */

import { React } from "../app-framework";
import { SiteName } from "../customize";

const cocalc_logo_white = require("cocalc-icon-white-transparent.svg").default;

export const KioskModeBanner: React.FC = () => {
  return (
    <div id={"smc-startup-banner"}>
      <div>
        <img src={cocalc_logo_white} />
      </div>
      <div
        className={"message ready"}
        style={{
          margin: "auto",
          textAlign: "center",
          fontSize: "36px",
          color: "#888",
        }}
      >
        <SiteName />
      </div>
    </div>
  );
};
