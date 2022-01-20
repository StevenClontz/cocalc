/*
Remove item from signed in user's shopping cart.

Returns the number of items actually removed (0 or 1).
*/

import removeFromCart from "@cocalc/server/shopping/cart/remove";
import getAccountId from "lib/account/get-account";

export default async function handle(req, res) {
  try {
    res.json(await get(req));
  } catch (err) {
    res.json({ error: `${err.message}` });
    return;
  }
}

async function get(req): Promise<number> {
  const account_id = await getAccountId(req);
  if (account_id == null) {
    throw Error("must be signed in to get shopping cart information");
  }
  const { id } = req.body;
  return await removeFromCart(account_id, id);
}