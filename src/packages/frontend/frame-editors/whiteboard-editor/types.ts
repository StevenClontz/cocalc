/*
 *  This file is part of CoCalc: Copyright © 2020 Sagemath, Inc.
 *  License: AGPLv3 s.t. "Commons Clause" – see LICENSE.md for details
 */

import { Map as iMap } from "immutable";
import { TypedMap } from "../../app-framework";
import { IconName } from "@cocalc/frontend/components/icon";
import { TimerState } from "@cocalc/frontend/editors/stopwatch/actions";
import { AspectRatio } from "./tools/frame";

export type ElementType =
  | "text"
  | "note"
  | "code"
  | "icon"
  | "pen"
  | "chat"
  | "terminal"
  | "stopwatch"
  | "timer"
  | "frame"
  | "edge"
  | "selection";

export type Point = { x: number; y: number };

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Data {
  fontSize?: number;
  radius?: number;
  fontFamily?: string;
  color?: string;
  opacity?: number;
  path?: number[]; // right now is encoded as [x,y,x2,y2,x3,y3] to be simpler to JSON.
  from?: string; // id of from node
  to?: string; // id of to node
  previewTo?: Point; // edge: instead of node, position of mouse -- used for preview edge.
  dir?: number[]; // dir path part of edge
  icon?: IconName; // icon
  countdown?: number; // used for countdown timer.
  state?: TimerState; // for timer
  time?: number; // used by timer
  total?: number; // used by timer
  aspectRatio?: AspectRatio;

  hideInput?: boolean; // used for code cells
  hideOutput?: boolean; // used for code cells
  output?: { [index: number]: object }; // code
  runState?: string;
  execCount?: number;
  kernel?: string;
  start?: number;
  end?: number;
}

/*
It will be better but more work to make all the following
instead of the big union above.

interface TextData {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

interface NoteData {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
}

interface PathData {
  radius?: number;
  color?: string;
  path?: number[]; // right now is encoded as [x,y,x2,y2,x3,y3] to be simpler to JSON.
}

interface IconData {
  color?: string;
  fontSize?: number;
  name?: string;
}

interface EdgeData extends PathData {
  from?: string; // id of from node
  to?: string; // id of to node
  dir?: number[]; // dir path part of edge
}
*/

export interface Element extends Rect {
  id: string;
  type: ElementType;
  z: number; // zIndex
  page?: number; // the page that this element is on; default value is 1
  data?: Data; // optional json-able object - patch/merge atomic
  str?: string; // optional str data patch/merge via diff string
  group?: string; // group id if object is part of a group
  rotate?: number; // angle in *radians*
  locked?: boolean;
  hide?: {
    w?: number; // width before hide
    h?: number; // height before hide
    frame?: string; // if hidden as part of a frame, this is the id of that frame
  }; // if set, hidden but had given width and height before hiding.
}

export type ElementMap = TypedMap<Element>;

// An immutable map from id to Element as a map.
export type ElementsMap = iMap<string, ElementMap>;

// Immutable map from page number to the ElementsMap that has all the elements on a given page.
export type PagesMap = iMap<number, ElementsMap>;

// Copied from what Antd does for tooltips: https://ant.design/components/tooltip/
export type Placement =
  | "top"
  | "left"
  | "right"
  | "bottom"
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight"
  | "leftTop"
  | "leftBottom"
  | "rightTop"
  | "rightBottom";
