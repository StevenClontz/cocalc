import getPool from "@cocalc/backend/database";
import { Profile } from "./types";

export default async function getProfile(
  account_id: string,
  cache = true
): Promise<Profile> {
  const pool = cache ? getPool("long") : getPool();
  const { rows } = await pool.query(
    "SELECT first_name, last_name, profile FROM accounts WHERE account_id=$1",
    [account_id]
  );
  if (rows.length == 0) {
    throw Error(`no account with id ${account_id}`);
  }
  return {
    account_id,
    first_name: rows[0].first_name ?? "Anonymous",
    last_name: rows[0].last_name ?? "User",
    image: rows[0].profile?.image,
    color: rows[0].profile?.color,
  };
}