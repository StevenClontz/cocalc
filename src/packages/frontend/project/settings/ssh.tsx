/*
 *  This file is part of CoCalc: Copyright © 2020 Sagemath, Inc.
 *  License: AGPLv3 s.t. "Commons Clause" – see LICENSE.md for details
 */

import { SSHKeyAdder } from "@cocalc/frontend/account/ssh-keys/ssh-key-adder";
import { SSHKeyList } from "@cocalc/frontend/account/ssh-keys/ssh-key-list";
import { React, redux } from "@cocalc/frontend/app-framework";
import { Icon } from "@cocalc/frontend/components";
import { webapp_client } from "@cocalc/frontend/webapp-client";
import { replace } from "lodash";
import { Project } from "./types";

interface Props {
  project: Project;
  account_id?: string;
}

export const SSHPanel: React.FC<Props> = React.memo((props: Props) => {
  const { project } = props;

  const project_id = project.get("project_id");

  function add_ssh_key(opts) {
    opts.project_id = project_id;
    redux.getActions("projects").add_ssh_key_to_project(opts);
  }

  function render_ssh_notice() {
    const user = replace(project_id, /-/g, "");
    const addr = `${user}@ssh.cocalc.com`;
    return (
      <div>
        <span>Use the following username@host to connect to this project:</span>
        <pre>{addr}</pre>
        <a
          href="https://github.com/sagemathinc/cocalc/wiki/AllAboutProjects#create-ssh-key"
          target="_blank"
          rel="noopener"
        >
          <Icon name="life-ring" /> How to create SSH keys
        </a>
      </div>
    );
  }

  const ssh_keys = project.getIn([
    "users",
    webapp_client.account_id as string,
    "ssh_keys",
  ]);

  return (
      <SSHKeyList ssh_keys={ssh_keys} project_id={project.get("project_id")}>
        <div>
          <p>
            Easily access this project directly via ssh by adding an ssh public
            key here.
          </p>
          <p>
            It takes <b>about 30 seconds</b> for any changes to take effect.
          </p>
          <p>
            If you want to use the same ssh key for all your projects, add a key
            using the "SSH keys" tab under Account Settings. If you have done
            that, there is no need to also configure an ssh key here.
          </p>
        </div>
        <SSHKeyAdder
          add_ssh_key={add_ssh_key}
          toggleable={true}
          style={{ marginBottom: "10px" }}
        />
        {render_ssh_notice()}
      </SSHKeyList>
  );
});
