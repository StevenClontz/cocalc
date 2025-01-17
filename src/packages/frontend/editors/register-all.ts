/*
 *  This file is part of CoCalc: Copyright © 2020 Sagemath, Inc.
 *  License: AGPLv3 s.t. "Commons Clause" – see LICENSE.md for details
 */

/*
Register all the editors.

One you add a new built in editor, it should go here.
*/

// Import each module, which loads a file editor.  These call register_file_editor.
// This should be a comprehensive list of all React editors

import "../chat/register";
import "./archive/actions";
import "./stopwatch/register";

import "./media-viewer/register";

// Raw data editors
import "./data-editor/generic";

import "./task-editor/register";

// All the frame-tree editors
import "../frame-editors/register";

// Unknown files
import "./unknown/register";

import { init as init_jupyter } from "@cocalc/frontend/frame-editors/jupyter-editor/register";

// All the non-react editors.
const { register_nonreact_editors } = require("../editor");
register_nonreact_editors();

// And configure jupyter and jupyter classic.
init_jupyter(); // must run after register_nonreact_editors

// Ensure that we load all the codemirror plugins, modes, etc.
import "@cocalc/frontend/codemirror/init";
