/*
 *  This file is part of CoCalc: Copyright © 2020 Sagemath, Inc.
 *  License: AGPLv3 s.t. "Commons Clause" – see LICENSE.md for details
 */

/*
Indicator about whether or not file or path is publicly shared.
*/

import { containing_public_path } from "@cocalc/util/misc";
import { COLORS } from "@cocalc/util/theme";
import { React, redux, useMemo, useTypedRedux } from "@cocalc/frontend/app-framework";
import { Icon, Loading } from "@cocalc/frontend/components";
import { useStudentProjectFunctionality } from "@cocalc/frontend/course";

const SHARE_INDICATOR_STYLE = {
  fontSize: "14pt",
  borderRadius: "3px",
  marginTop: "3px",
  display: "flex",
  top: "-30px",
  right: "3px",
} as const;

interface Props {
  project_id: string;
  path: string;
  shrink_fixed_tabs: boolean;
}

export const ShareIndicator: React.FC<Props> = React.memo(
  ({ project_id, path, shrink_fixed_tabs }) => {
    const public_paths = useTypedRedux({ project_id }, "public_paths");

    const student_project_functionality = useStudentProjectFunctionality(
      project_id
    );

    const is_public = useMemo(() => {
      if (public_paths == null) return false;
      const paths: string[] = [];
      public_paths.forEach(function (info) {
        if (!info.get("disabled")) {
          paths.push(info.get("path"));
        }
      });
      return containing_public_path(path, paths) != null;
    }, [public_paths, path, project_id]);

    if (student_project_functionality.disableActions) {
      return <></>;
    }

    if (public_paths == null) {
      return <Loading />;
    }

    return (
      <div style={SHARE_INDICATOR_STYLE}>
        <div
          style={{
            cursor: "pointer",
            color: COLORS.FG_BLUE,
            marginLeft: "5px",
            marginRight: "5px",
          }}
        >
          <span
            onClick={() => {
              redux.getProjectActions(project_id).show_file_action_panel({
                path,
                action: "share",
              });
            }}
          >
            <Icon name={is_public ? "bullhorn" : "lock"} />
            {!shrink_fixed_tabs && (
              <span style={{ fontSize: "10.5pt", marginLeft: "5px" }}>
                {is_public ? "Public" : "Private"}
              </span>
            )}
          </span>
        </div>
      </div>
    );
  }
);
