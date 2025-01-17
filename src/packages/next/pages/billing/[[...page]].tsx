/*
 *  This file is part of CoCalc: Copyright © 2021 Sagemath, Inc.
 *  License: AGPLv3 s.t. "Commons Clause" – see LICENSE.md for details
 */

import { capitalize } from "@cocalc/util/misc";
import { Layout } from "antd";
import { MainPages, MainPagesType } from "components/billing/consts";
import Billing from "components/billing/layout";
import Footer from "components/landing/footer";
import Head from "components/landing/head";
import Header from "components/landing/header";
import { Customize, CustomizeType } from "lib/customize";
import withCustomize from "lib/with-customize";
import Error from "next/error";

interface Props {
  customize: CustomizeType;
  pageNotFound: boolean;
  page: [MainPagesType | undefined];
}

export default function Preferences(props: Props) {
  const { customize, pageNotFound, page } = props;
  if (pageNotFound) {
    return <Error statusCode={404} />;
  }

  const subpage = page[0] != null ? ` - ${capitalize(page[0])}` : "";

  return (
    <Customize value={customize}>
      <Head title={`Billing${subpage}`} />
      <Layout>
        <Header />
        <Billing page={page} />
        <Footer />
      </Layout>
    </Customize>
  );
}

export async function getServerSideProps(context) {
  const { params, res } = context;
  const { page = [] } = params;

  // deprecated – https://github.com/sagemathinc/cocalc/issues/5739
  // see billing/layout.tsx for possible pages
  const [main] = page;
  switch (main) {
    // 307: temp redirect
    case "payment-methods":
      return res.redirect(307, "./cards");
    case "invoices-and-receipts":
      return res.redirect(307, "./receipts");
  }

  if (main != null && !MainPages.includes(main)) {
    return withCustomize({ context, props: { pageNotFound: true } });
  }

  return await withCustomize({
    context,
    props: { page },
  });
}
