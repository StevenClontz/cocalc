/*
 *  This file is part of CoCalc: Copyright © 2020 Sagemath, Inc.
 *  License: AGPLv3 s.t. "Commons Clause" – see LICENSE.md for details
 */

/*

Editing a quota

 - shows user rows for cpu, ram, disk, member, and always_running: optional
 - they can edit all the rows.
 - optional: also shows rows for support and network that can't be edited

*/

import {
  CSS,
  React,
  useMemo,
  useState,
  useTypedRedux,
} from "@cocalc/frontend/app-framework";
import { Space } from "@cocalc/frontend/components";
import {
  LicenseIdleTimeouts,
  requiresMemberhosting,
  untangleUptime,
  Uptime,
} from "@cocalc/util/consts/site-license";
import { KUCALC_ON_PREMISES } from "@cocalc/util/db-schema/site-defaults";
import { COSTS, GCE_COSTS } from "@cocalc/util/licenses/purchase/consts";
import { User } from "@cocalc/util/licenses/purchase/types";
import { money } from "@cocalc/util/licenses/purchase/utils";
import { plural, round1 } from "@cocalc/util/misc";
import { SiteLicenseQuota } from "@cocalc/util/types/site-licenses";
import {
  Button,
  Checkbox,
  Col,
  InputNumber,
  Row,
  Select,
  Typography,
} from "antd";

const ROW_STYLE: CSS = {
  border: "1px solid #eee",
  padding: "5px",
  margin: "5px",
  borderRadius: "3px",
} as const;

const UNIT_STYLE: CSS = {
  padding: "0 5px",
  fontWeight: 400,
} as const;

function render_explanation(s): JSX.Element {
  return (
    <span style={{ color: "#888" }}>
      <Space /> - {s}
    </span>
  );
}

interface Props {
  quota: SiteLicenseQuota;
  onChange: (change: SiteLicenseQuota) => void;
  hideExtra?: boolean; // hide extra boxes, etc. -- this is used for admin editing, where they know what is up.
  disabled?: boolean;
  show_advanced_default?: boolean; // if the "advanced" part should pop up by default
  adminMode?: boolean; // admins are allowed to e.g. set quota limit to 0 (i.e. for boost licenses)
}

export const QuotaEditor: React.FC<Props> = (props: Props) => {
  const {
    quota,
    onChange,
    hideExtra,
    disabled,
    show_advanced_default,
    adminMode = false,
  } = props;
  const customize_kucalc = useTypedRedux("customize", "kucalc");
  const isOnPrem = customize_kucalc === KUCALC_ON_PREMISES;

  const [show_advanced, set_show_advanced] = useState<boolean>(
    show_advanced_default ?? false
  );
  const hosting_multiplier = useMemo(() => {
    return (
      (quota.member ? COSTS.custom_cost.member : 1) *
      (quota.always_running ? COSTS.custom_cost.always_running : 1) *
      (quota.member && quota.always_running ? GCE_COSTS.non_pre_factor : 1)
    );
  }, [quota]);

  const col = hideExtra
    ? { control: 18, max: 6 }
    : { control: 8, max: 3, desc: 16 };

  function user(): User {
    if (quota.user == null) {
      throw Error("quota.user must be set");
    }
    return quota.user;
  }

  const isDedicated =
    quota.dedicated_vm != null || quota.dedicated_disk != null;

  function render_cpu(): JSX.Element {
    return (
      <Row style={ROW_STYLE}>
        <Col md={col.control - col.max}>
          <InputNumber
            disabled={disabled}
            min={adminMode ? 0 : COSTS.basic.cpu}
            max={COSTS.custom_max.cpu}
            value={quota.cpu}
            onChange={(x) => {
              if (typeof x != "number") return;
              onChange({ cpu: Math.round(x) });
            }}
          />
          <Space />
          <span style={UNIT_STYLE}>shared CPU {plural(quota.cpu, "core")}</span>
        </Col>
        <Col md={col.max}>
          <Button
            disabled={quota.cpu == COSTS.custom_max.cpu}
            onClick={() => onChange({ cpu: COSTS.custom_max.cpu })}
          >
            Max
          </Button>
        </Col>
        {!hideExtra && (
          <Col md={col.desc}>
            <b>
              shared CPU cores (
              {`${money(
                COSTS.user_discount[user()] *
                  COSTS.custom_cost.cpu *
                  hosting_multiplier
              )}/CPU cores per month per project`}
              )
            </b>
            {render_explanation(
              "Google cloud vCPU's shared with other projects (member hosting significantly reduces sharing)"
            )}
          </Col>
        )}
      </Row>
    );
  }

  function render_ram(): JSX.Element {
    return (
      <Row style={ROW_STYLE}>
        <Col md={col.control - col.max}>
          <InputNumber
            disabled={disabled}
            min={adminMode ? 0 : COSTS.basic.ram}
            max={COSTS.custom_max.ram}
            value={quota.ram}
            onChange={(x) => {
              if (typeof x != "number") return;
              onChange({ ram: Math.round(x) });
            }}
          />
          <Space />
          <span style={UNIT_STYLE}>shared G RAM</span>
        </Col>
        <Col md={col.max}>
          <Button
            disabled={quota.ram == COSTS.custom_max.ram}
            onClick={() => onChange({ ram: COSTS.custom_max.ram })}
          >
            Max
          </Button>
        </Col>
        {!hideExtra && (
          <Col md={col.desc}>
            <b>
              G RAM (
              {`${money(
                COSTS.user_discount[user()] *
                  COSTS.custom_cost.ram *
                  hosting_multiplier
              )}/G RAM per month per project`}
              )
            </b>
            {render_explanation("RAM may be shared with other users")}
          </Col>
        )}
      </Row>
    );
  }

  function render_dedicated_cpu(): JSX.Element {
    return (
      <Row style={ROW_STYLE}>
        <Col md={col.control - col.max}>
          <InputNumber
            disabled={disabled}
            min={adminMode ? 0 : COSTS.basic.dedicated_cpu}
            max={COSTS.custom_max.dedicated_cpu}
            value={quota.dedicated_cpu}
            onChange={(x) => {
              if (typeof x != "number") return;
              onChange({ dedicated_cpu: round1(x) });
            }}
          />
          <Space />
          <span style={UNIT_STYLE}>
            dedicated CPU {plural(quota.dedicated_cpu, "core")}
          </span>
        </Col>
        <Col md={col.max}>
          <Button
            disabled={quota.dedicated_cpu == COSTS.custom_max.dedicated_cpu}
            onClick={() =>
              onChange({ dedicated_cpu: COSTS.custom_max.dedicated_cpu })
            }
          >
            Max
          </Button>
        </Col>
        {!hideExtra && (
          <Col md={col.desc}>
            <b>
              dedicated CPU cores (
              {`${money(
                COSTS.user_discount[user()] *
                  COSTS.custom_cost.dedicated_cpu *
                  hosting_multiplier
              )}/CPU cores per month per project`}
              )
            </b>
            {render_explanation(
              "Google cloud vCPU's NOT shared with other projects.  You can enter a fractional value, e.g., 0.5 for a half dedicated core."
            )}
          </Col>
        )}
      </Row>
    );
  }

  function render_dedicated_ram(): JSX.Element {
    return (
      <Row style={ROW_STYLE}>
        <Col md={col.control - col.max}>
          <InputNumber
            disabled={disabled}
            min={adminMode ? 0 : COSTS.basic.dedicated_ram}
            max={COSTS.custom_max.dedicated_ram}
            value={quota.dedicated_ram}
            onChange={(x) => {
              if (typeof x != "number") return;
              onChange({ dedicated_ram: Math.round(x) });
            }}
          />
          <Space />
          <span style={UNIT_STYLE}>dedicated G RAM</span>
        </Col>
        <Col md={col.max}>
          <Button
            disabled={quota.dedicated_ram == COSTS.custom_max.dedicated_ram}
            onClick={() =>
              onChange({ dedicated_ram: COSTS.custom_max.dedicated_ram })
            }
          >
            Max
          </Button>
        </Col>
        {!hideExtra && (
          <Col md={col.desc}>
            <b>
              dedicated G RAM (
              {`${money(
                COSTS.user_discount[user()] *
                  COSTS.custom_cost.dedicated_ram *
                  hosting_multiplier
              )}/GB RAM per month per project`}
              )
            </b>
            {render_explanation("RAM is not shared with other users")}
          </Col>
        )}
      </Row>
    );
  }

  function render_disk(): JSX.Element | null {
    if (isOnPrem) return null;
    return (
      <Row style={ROW_STYLE}>
        <Col md={col.control - col.max}>
          <InputNumber
            disabled={disabled}
            min={adminMode ? 0 : COSTS.basic.disk}
            max={COSTS.custom_max.disk}
            value={quota.disk}
            onChange={(x) => {
              if (typeof x != "number") return;
              onChange({ disk: Math.round(x) });
            }}
          />
          <Space />
          <span style={UNIT_STYLE}>G disk space</span>
        </Col>
        <Col md={col.max}>
          <Button
            disabled={quota.disk == COSTS.custom_max.disk}
            onClick={() => onChange({ disk: COSTS.custom_max.disk })}
          >
            Max
          </Button>
        </Col>
        {!hideExtra && (
          <Col md={col.desc}>
            <b>
              G Disk Space (
              {`${money(
                COSTS.user_discount[user()] * COSTS.custom_cost.disk
              )}/G disk per month per project`}
              )
            </b>
            {render_explanation(
              "store a larger number of files. Snapshots and file edit history is included at no additional charge."
            )}
          </Col>
        )}
      </Row>
    );
  }

  function render_member(): JSX.Element | null {
    if (isOnPrem) return null;
    return (
      <Row style={ROW_STYLE}>
        <Col md={col.control}>
          <Checkbox
            checked={quota.member}
            onChange={(e) => onChange({ member: e.target.checked })}
            disabled={
              disabled ||
              requiresMemberhosting(quota.idle_timeout) ||
              quota.always_running
            }
          >
            Member hosting
          </Checkbox>
        </Col>
        {!hideExtra && (
          <Col md={col.desc}>
            member hosting{" "}
            <b>(multiplies RAM/CPU price by {COSTS.custom_cost.member})</b>
            {render_explanation(
              "project runs on computers with far fewer other projects.  If not selected your project runs on very, very heavily loaded trial servers, which might be OK depending on your application."
            )}
          </Col>
        )}
      </Row>
    );
  }

  function render_ext_rw(): JSX.Element {
    return (
      <Row style={ROW_STYLE}>
        <Col md={col.control}>
          <Checkbox
            checked={quota.ext_rw}
            disabled={disabled}
            onChange={(e) => onChange({ ext_rw: e.target.checked })}
          >
            on-premises: mount <code>/ext</code> read/writeable
          </Checkbox>
        </Col>
      </Row>
    );
  }

  function idleTimeoutUptimeOptions(): JSX.Element[] {
    const ret: JSX.Element[] = [];
    for (const [key, it] of Object.entries(LicenseIdleTimeouts)) {
      ret.push(
        <Select.Option key={key} value={key}>
          {it.label}
        </Select.Option>
      );
    }
    ret.push(
      <Select.Option key={"always_running"} value={"always_running"}>
        Always running
      </Select.Option>
    );
    return ret;
  }

  function onIdleTimeoutChange(val: Uptime) {
    const { always_running, idle_timeout } = untangleUptime(val);
    const next: Partial<SiteLicenseQuota> = { always_running, idle_timeout };
    if (requiresMemberhosting(val)) {
      next.member = true;
    }
    onChange(next);
  }

  function idleTimeoutExtra(): JSX.Element | undefined {
    if (hideExtra) return;
    return (
      <Col md={col.desc}>
        {
          <>
            <b>
              longer idle time increases price by up to{" "}
              {COSTS.custom_cost.always_running * GCE_COSTS.non_pre_factor}{" "}
              times
            </b>{" "}
            {render_explanation(`If you leave your project alone, it will be shut down the latest
            after the selected interval.
            This is not 100% guaranteed, because
            projects may still restart due to maintenance or security reasons.
            Always running essentially disables this,
            because if the project stops for any reason, it will be automatically restarted.
            `)}
          </>
        }
      </Col>
    );
  }

  function render_idle_timeout(): JSX.Element {
    return (
      <Row style={ROW_STYLE}>
        <Col md={col.control} style={{ whiteSpace: "nowrap" }}>
          <Select
            defaultValue={quota.idle_timeout ?? "short"}
            onChange={onIdleTimeoutChange}
          >
            {idleTimeoutUptimeOptions()}
          </Select>{" "}
          idle timeout
        </Col>
        {idleTimeoutExtra()}
      </Row>
    );
  }

  function render_support(): JSX.Element {
    return (
      <Row style={ROW_STYLE}>
        <Col md={col.control}>
          <Checkbox checked={true} disabled={true}>
            <span style={disabled ? undefined : { color: "rgba(0,0,0,.65)" }}>
              Priority support
            </span>
          </Checkbox>
        </Col>
        {!hideExtra && (
          <Col md={col.desc}>
            priority support
            {render_explanation(
              "we prioritize your support requests much higher (included with all licensed projects)"
            )}
          </Col>
        )}
      </Row>
    );
  }

  function render_network(): JSX.Element {
    return (
      <Row style={ROW_STYLE}>
        <Col md={col.control}>
          <Checkbox checked={true} disabled={true}>
            <span style={disabled ? undefined : { color: "rgba(0,0,0,.65)" }}>
              Network access
            </span>
          </Checkbox>
        </Col>
        {!hideExtra && (
          <Col md={col.desc}>
            network access
            {render_explanation(
              "project can connect to the Internet to clone git repositories, download files, send emails, etc.  (included with all licensed projects)"
            )}
          </Col>
        )}
      </Row>
    );
  }

  function render_show_advanced_link(): JSX.Element {
    if (show_advanced) {
      return (
        <a
          style={{ marginLeft: "5px", fontSize: "12pt" }}
          onClick={() => set_show_advanced(false)}
        >
          Hide advanced options
        </a>
      );
    } else
      return (
        <a
          style={{ marginLeft: "5px", fontSize: "12pt" }}
          onClick={() => set_show_advanced(true)}
        >
          Show advanced options...
        </a>
      );
  }

  function render_dedicated(): JSX.Element {
    return (
      <div style={ROW_STYLE}>
        We also offer <b>dedicated virtual machines</b>, which are usually a
        much better value than always running dedicated cpu's. Request a quote
        below and explain that you're interested in a dedicated VM.
      </div>
    );
  }

  if (isDedicated) {
    return (
      <Typography.Text strong type="danger">
        Dear Admin: editing a dedicated VM or Disk is not yet implemented.
      </Typography.Text>
    );
  }

  return (
    <div>
      {render_cpu()}
      {render_ram()}
      {render_disk()}
      {!hideExtra && render_support()}
      {!hideExtra && render_network()}
      {render_show_advanced_link()}
      {show_advanced && render_member()}
      {show_advanced && render_idle_timeout()}
      {show_advanced && render_dedicated_cpu()}
      {show_advanced && render_dedicated_ram()}
      {show_advanced && !hideExtra && render_dedicated()}
      {isOnPrem && render_ext_rw()}
    </div>
  );
};
