/*
 *  This file is part of CoCalc: Copyright © 2020 Sagemath, Inc.
 *  License: AGPLv3 s.t. "Commons Clause" – see LICENSE.md for details
 */

/*
Display of basic information about a user, with link to get more information about that user.
*/

import { Icon, Space, TimeAgo } from "@cocalc/frontend/components";
import { Component, Rendered } from "@cocalc/frontend/app-framework";
import { capitalize } from "@cocalc/util/misc";
import { Row, Col } from "@cocalc/frontend/antd-bootstrap";
import { User } from "@cocalc/frontend/frame-editors/generic/client";
import { Subscriptions } from "./subscriptions";
import { Projects } from "./projects";
import { Impersonate } from "./impersonate";
import { PasswordReset } from "./password-reset";
import { Ban } from "./ban";

interface State {
  projects: boolean;
  subscriptions: boolean;
  activity: boolean;
  impersonate: boolean;
  password: boolean;
  ban: boolean;
}

interface HeaderProps {
  header: true;
  first_name: string;
  last_name: string;
  email_address: string;
  created: string;
  last_active: string;
  account_id: string;
  banned?: undefined;
}

interface UserProps extends User {
  header?: false;
}

type Props = HeaderProps | UserProps;

type More =
  | "projects"
  | "subscriptions"
  | "activity"
  | "impersonate"
  | "password"
  | "ban";

const MORE: More[] = [
  "projects",
  "subscriptions",
  "activity",
  "impersonate",
  "password",
  "ban",
];

export class UserResult extends Component<Props, State> {
  constructor(props, state) {
    super(props, state);
    const x: any = {};
    for (const name of MORE) {
      x[name] = false;
    }
    this.state = x as State;
  }

  render_created(): Rendered {
    if (!this.props.created) {
      return <span>unknown</span>;
    }
    return <TimeAgo date={this.props.created} />;
  }

  render_last_active(): Rendered {
    if (!this.props.last_active) {
      return <span>unknown</span>;
    }
    return <TimeAgo date={this.props.last_active} />;
  }

  render_subscriptions(): Rendered {
    if (!this.state.subscriptions) {
      return;
    }
    return <Subscriptions account_id={this.props.account_id} />;
  }

  render_projects(): Rendered {
    if (!this.state.projects) {
      return;
    }
    return (
      <Projects
        account_id={this.props.account_id}
        title={`Recently active projects that ${this.props.first_name} ${this.props.last_name} collaborates on`}
      />
    );
  }

  render_impersonate(): Rendered {
    if (!this.state.impersonate) {
      return;
    }
    return (
      <Impersonate
        account_id={this.props.account_id}
        first_name={this.props.first_name ?? ""}
        last_name={this.props.last_name ?? ""}
      />
    );
  }

  render_password(): Rendered {
    if (!this.state.password) {
      return;
    }
    return <PasswordReset email_address={this.props.email_address} />;
  }

  render_ban(): Rendered {
    if (!this.state.ban) {
      return;
    }
    return (
      <Ban account_id={this.props.account_id} banned={this.props.banned} />
    );
  }

  render_caret(show: boolean): Rendered {
    if (show) {
      return <Icon name="caret-down" />;
    } else {
      return <Icon name="caret-right" />;
    }
  }

  render_more_link(name: More): Rendered {
    // sorry about the any below; I could NOT get typescript to work.
    return (
      <a
        style={{ cursor: "pointer" }}
        onClick={() => (this as any).setState({ [name]: !this.state[name] })}
      >
        {this.render_caret(this.state[name])} {capitalize(name)}
      </a>
    );
  }

  render_more_links(): Rendered {
    return (
      <div>
        {this.render_more_link("projects")}
        <Space />
        <Space />
        {this.render_more_link("subscriptions")}
        <Space />
        <Space />
        {this.render_more_link("impersonate")}
        <Space />
        <Space />
        {this.render_more_link("password")}
        <Space />
        <Space />
        {this.render_more_link("ban")}
      </div>
    );
  }

  render_banned(): Rendered {
    if (!this.props.banned) return;
    return (
      <div
        style={{
          fontSize: "10pt",
          color: "white",
          paddingLeft: "5px",
          background: "red",
        }}
      >
        BANNED
      </div>
    );
  }

  render_row(): Rendered {
    return (
      <div>
        <Row style={{ borderTop: "1px solid #ccc" }}>
          <Col md={1} style={{ overflow: "auto" }}>
            {this.props.first_name}
          </Col>
          <Col md={1} style={{ overflow: "auto" }}>
            {this.props.last_name}
          </Col>
          <Col md={2} style={{ overflow: "auto" }}>
            {this.props.email_address}
          </Col>
          <Col md={2}>
            {this.render_last_active()} ({this.render_created()})
          </Col>
          <Col md={4}>{this.render_more_links()}</Col>
          <Col md={2}>
            <span
              style={{
                fontSize: "9px",
                overflowX: "scroll",
                whiteSpace: "nowrap",
              }}
            >
              {this.props.account_id}
              {this.render_banned()}
            </span>
          </Col>
        </Row>
        {this.render_subscriptions()}
        {this.render_projects()}
        {this.render_impersonate()}
        {this.render_password()}
        {this.render_ban()}
      </div>
    );
  }

  render_row_header(): Rendered {
    return (
      <div style={{ color: "#666" }}>
        <Row>
          <Col md={1} style={{ overflow: "auto" }}>
            <b>{this.props.first_name}</b>
          </Col>
          <Col md={1} style={{ overflow: "auto" }}>
            <b>{this.props.last_name}</b>
          </Col>
          <Col md={2} style={{ overflow: "auto" }}>
            <b>{this.props.email_address}</b>
          </Col>
          <Col md={2}>
            <b>
              {this.props.last_active} ({this.props.created}){" "}
              <Icon name="caret-down" />{" "}
            </b>
          </Col>
          <Col md={4}>
            <b>More...</b>
          </Col>
          <Col md={2}>
            <b>{this.props.account_id}</b>
          </Col>
        </Row>
      </div>
    );
  }

  render(): Rendered {
    if (this.props.header) {
      return this.render_row_header();
    } else {
      return this.render_row();
    }
  }
}
