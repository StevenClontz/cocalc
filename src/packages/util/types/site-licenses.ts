/*
 *  This file is part of CoCalc: Copyright © 2022 Sagemath, Inc.
 *  License: AGPLv3 s.t. "Commons Clause" – see LICENSE.md for details
 */

import { User } from "../licenses/purchase/types";
import { Upgrades } from "../upgrades/types";
import { DedicatedDisk, DedicatedVM } from "./dedicated";

export interface SiteLicenseQuota {
  ram?: number;
  dedicated_ram?: number;
  cpu?: number;
  dedicated_cpu?: number;
  disk?: number;
  always_running?: boolean;
  member?: boolean;
  user?: User;
  dedicated_vm?: DedicatedVM | false;
  dedicated_disk?: DedicatedDisk;
  // idle_timeouts came later:
  // 1. they don't mix, just like member/free and always_running does not mix
  // 2. we define the timeout spans indirectly, gives us a bit of room to modify this later on.
  idle_timeout?: "short" | "medium" | "day";
  boost?: boolean; // default false
  ext_rw?: boolean; // on-prem: make the /ext mountpoint read/writable
}

// For typescript use of these from user side, we make this available:
export interface SiteLicense {
  id: string;
  title?: string;
  description?: string;
  info?: { [key: string]: any };
  expires?: Date;
  activates?: Date;
  created?: Date;
  last_used?: Date;
  managers?: string[];
  restricted?: boolean;
  upgrades?: Upgrades;
  quota?: SiteLicenseQuota;
  run_limit?: number;
  apply_limit?: number;
}

export type SiteLicenses = { [uuid: string]: SiteLicense };
