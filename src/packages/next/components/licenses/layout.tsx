/*
 *  This file is part of CoCalc: Copyright © 2022 Sagemath, Inc.
 *  License: AGPLv3 s.t. "Commons Clause" – see LICENSE.md for details
 */

import { unreachable } from "@cocalc/util/misc";
import { COLORS } from "@cocalc/util/theme";
import { Alert, Layout } from "antd";
import InPlaceSignInOrUp from "components/auth/in-place-sign-in-or-up";
import Anonymous from "components/misc/anonymous";
import Loading from "components/share/loading";
import useProfile from "lib/hooks/profile";
import { useRouter } from "next/router";
import HowUsed from "./how-used";
import LicensedProjects from "./licensed-projects";
import ManagedLicenses from "./managed";
import Menu from "./menu";
import Overview from "./overview";
import { MAX_WIDTH } from "lib/config";

const { Content } = Layout;

interface Props {
  page: ("projects" | "how-used" | "managed" | undefined)[];
}

export default function LicensesLayout({ page }: Props) {
  const router = useRouter();
  const profile = useProfile({ noCache: true });
  if (!profile) {
    return <Loading large center />;
  }
  const { account_id, is_anonymous } = profile;

  if (!account_id) {
    return (
      <Alert
        style={{ margin: "15px auto" }}
        type="warning"
        message={
          <InPlaceSignInOrUp
            title="Account Configuration"
            why="to see information about your licenses"
            onSuccess={() => {
              router.reload();
            }}
          />
        }
      />
    );
  }

  if (is_anonymous) {
    return <Anonymous />;
  }

  const [main] = page;

  function body() {
    if (main == null) return <Overview />;
    switch (main) {
      case "projects":
        return <LicensedProjects />;
      case "managed":
        return <ManagedLicenses />;
      case "how-used":
        return <HowUsed account_id={account_id} />;
      default:
        unreachable(main);
    }
  }

  // this is layout the same way as ../store/index.tsx
  return (
    <Layout
      style={{
        padding: "0 24px 24px",
        backgroundColor: "white",
        color: COLORS.GRAY_D,
      }}
    >
      <Content
        style={{
          padding: 24,
          margin: 0,
          minHeight: 280,
        }}
      >
        <div style={{ maxWidth: MAX_WIDTH, margin: "auto" }}>
          <Menu main={main} />
          {body()}
        </div>
      </Content>
    </Layout>
  );
}
