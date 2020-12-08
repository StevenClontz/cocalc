/*
 *  This file is part of CoCalc: Copyright © 2020 Sagemath, Inc.
 *  License: AGPLv3 s.t. "Commons Clause" – see LICENSE.md for details
 */

/*
Top-level react component, which ties everything together
*/

import {
  CSS,
  React,
  useRedux,
  useTypedRedux,
  Rendered,
} from "../app-framework";
import * as immutable from "immutable";

import { ErrorDisplay } from "../r_misc/error-display";
import { Loading } from "../r_misc/loading";

// React components that implement parts of the Jupyter notebook.
import { TopMenubar } from "./top-menubar";
import { TopButtonbar } from "./top-buttonbar";
import { CellList } from "./cell-list";
import { Kernel } from "./status";
import { Mode } from "./mode";
import { About } from "./about";
import { NBConvert } from "./nbconvert";
import { InsertImage } from "./insert-image";
import { EditAttachments } from "./edit-attachments";
import { EditCellMetadata } from "./edit-cell-metadata";
import { FindAndReplace } from "./find-and-replace";
import { ConfirmDialog } from "./confirm-dialog";
import { KernelSelector } from "./select-kernel";
import { KeyboardShortcuts } from "./keyboard-shortcuts";
import { JSONView } from "./json-view";
import { RawEditor } from "./raw-editor";
// import { SnippetsDialog } from "smc-webapp/assistant/dialog";
const { SnippetsDialog } = require("smc-webapp/assistant/dialog");
import { Kernel as KernelType, Kernels as KernelsType } from "./util";
import { Scroll } from "./types";

const KERNEL_STYLE: React.CSSProperties = {
  float: "right",
  paddingLeft: "5px",
  backgroundColor: "#eee",
  display: "block",
  overflow: "hidden",
  borderLeft: "1px solid rgb(231,231,231)",
  borderBottom: "1px solid rgb(231,231,231)",
  whiteSpace: "nowrap",
};

import { JupyterActions } from "./browser-actions";
import { NotebookFrameActions } from "../frame-editors/jupyter-editor/cell-notebook/actions";
import { JupyterEditorActions } from "../frame-editors/jupyter-editor/actions";

const ERROR_STYLE = {
  margin: "1ex",
  whiteSpace: "pre" as "pre",
  fontSize: "12px",
  fontFamily: "monospace" as "monospace",
  maxHeight: "30vh",
  overflow: "auto",
} as CSS;

interface Props {
  error?: string;
  actions: JupyterActions;
  frame_actions: NotebookFrameActions;
  editor_actions: JupyterEditorActions;
  name: string; // name of the redux store

  // Comes explicitly from frontend Jupyter state stored in
  // the frame tree, hence it can be different between
  // each view of the notebook, and survives closing and
  // opening the file (or refreshing browser), which is nice!
  is_focused?: boolean;
  is_fullscreen?: boolean; // this means fullscreened frame inside the editor!
  mode: "edit" | "escape";
  font_size?: number;

  cur_id?: string;
  sel_ids?: immutable.Set<any>; // set of selected cells
  md_edit_ids?: immutable.Set<any>; // ids of markdown cells in edit mode

  scroll?: Scroll; // Causes a scroll when it *changes*
  scrollTop?: number;
  hook_offset?: number;
  view_mode?: "normal" | "json" | "raw";
}

export const JupyterEditor: React.FC<Props> = React.memo((props: Props) => {
  const {
    actions,
    editor_actions,
    frame_actions,
    name,
    is_focused,
    is_fullscreen,
    font_size,
    mode,
    cur_id,
    sel_ids,
    md_edit_ids,
    scroll,
    scrollTop,
    hook_offset,
    view_mode,
  } = props;

  const site_name = useTypedRedux("customize", "site_name");
  // const account = useTypedRedux("account", "editor_settings");

  // status of tab completion
  const complete: undefined | immutable.Map<any, any> = useRedux([
    name,
    "complete",
  ]);
  const more_output: undefined | immutable.Map<any, any> = useRedux([
    name,
    "more_output",
  ]);
  const find_and_replace: undefined | boolean = useRedux([
    name,
    "find_and_replace",
  ]);
  const show_kernel_selector: undefined | boolean = useRedux([
    name,
    "show_kernel_selector",
  ]);
  // string name of the kernel
  const kernel: undefined | string = useRedux([name, "kernel"]);
  const kernels: undefined | KernelsType = useRedux([name, "kernels"]);
  const error: undefined | KernelsType = useRedux([name, "error"]);
  // settings for all the codemirror editors
  const cm_options: undefined | immutable.Map<any, any> = useRedux([
    name,
    "cm_options",
  ]);
  // *FATAL* error; user must edit file to fix.
  const fatal: undefined | string = useRedux([name, "fatal"]);
  const toolbar: undefined | boolean = useRedux([name, "toolbar"]);
  // const has_unsaved_changes: undefined | boolean = useRedux([
  //   name,
  //   "has_unsaved_changes",
  // ]);
  // list of ids of cells in order
  const cell_list: undefined | immutable.List<string> = useRedux([
    name,
    "cell_list",
  ]);
  // map from ids to cells
  const cells: undefined | immutable.Map<string, any> = useRedux([
    name,
    "cells",
  ]);
  const project_id: undefined | string = useRedux([name, "project_id"]);
  const directory: undefined | string = useRedux([name, "directory"]);
  // const version: undefined | any = useRedux([name, "version"]);
  const about: undefined | boolean = useRedux([name, "about"]);
  const backend_kernel_info: undefined | immutable.Map<any, any> = useRedux([
    name,
    "backend_kernel_info",
  ]);
  const confirm_dialog: undefined | immutable.Map<any, any> = useRedux([
    name,
    "confirm_dialog",
  ]);
  const keyboard_shortcuts: undefined | immutable.Map<any, any> = useRedux([
    name,
    "keyboard_shortcuts",
  ]);
  // backend convert state
  const nbconvert: undefined | immutable.Map<any, any> = useRedux([
    name,
    "nbconvert",
  ]);
  // frontend modal dialog state
  const nbconvert_dialog: undefined | immutable.Map<any, any> = useRedux([
    name,
    "nbconvert_dialog",
  ]);
  const path: undefined | string = useRedux([name, "path"]);
  const cell_toolbar: undefined | string = useRedux([name, "cell_toolbar"]);
  // show insert image dialog
  const insert_image: undefined | string = useRedux([name, "insert_image"]);
  const edit_attachments: undefined | string = useRedux([
    name,
    "edit_attachments",
  ]);
  const edit_cell_metadata: undefined | immutable.Map<any, any> = useRedux([
    name,
    "edit_cell_metadata",
  ]);
  const editor_settings: undefined | immutable.Map<any, any> = useRedux([
    name,
    "editor_settings",
  ]);
  // const metadata: undefined | immutable.Map<any, any> = useRedux([
  //   name,
  //   "metadata",
  // ]);
  const trust: undefined | boolean = useRedux([name, "trust"]);
  const kernel_info: undefined | immutable.Map<any, any> = useRedux([
    name,
    "kernel_info",
  ]);
  const check_select_kernel_init: undefined | boolean = useRedux([
    name,
    "check_select_kernel_init",
  ]);
  const kernel_selection: undefined | immutable.Map<string, any> = useRedux([
    name,
    "kernel_selection",
  ]);
  const kernels_by_name:
    | undefined
    | immutable.OrderedMap<string, immutable.Map<string, string>> = useRedux([
    name,
    "kernels_by_name",
  ]);
  const kernels_by_language:
    | undefined
    | immutable.OrderedMap<string, immutable.List<string>> = useRedux([
    name,
    "kernels_by_language",
  ]);
  const default_kernel: undefined | string = useRedux([name, "default_kernel"]);
  const closestKernel: undefined | KernelType = useRedux([
    name,
    "closestKernel",
  ]);
  // const kernel_streams: undefined | immutable.Map<string, string> = useRedux([
  //   name,
  //   "kernel_streams",
  // ]);
  const kernel_error: undefined | string = useRedux([name, "kernel_error"]);

  function render_kernel_error() {
    if (!kernel_error) return;
    // We use "warning" since this isn't necessarily an error.  It really is just
    // explaining why the kernel stopped.
    return (
      <ErrorDisplay
        bsStyle="warning"
        error={kernel_error}
        style={ERROR_STYLE}
        onClose={() => actions.setState({ kernel_error: "" })}
      />
    );
  }

  function render_error() {
    if (error) {
      return (
        <ErrorDisplay
          error={error}
          style={ERROR_STYLE}
          onClose={() => actions.set_error(undefined)}
        />
      );
    }
  }

  function render_fatal() {
    return (
      <div>
        <h2 style={{ marginLeft: "10px" }}>Fatal Error loading ipynb file</h2>

        <ErrorDisplay error={fatal} style={{ margin: "1ex" }} />
      </div>
    );
  }

  function render_kernel() {
    return (
      <span style={KERNEL_STYLE}>
        <Kernel
          is_fullscreen={is_fullscreen}
          name={name}
          actions={actions}
          cells={cells}
        />
        <Mode name={name} />
      </span>
    );
  }

  function render_menubar() {
    if (
      actions == null ||
      frame_actions == null ||
      cells == null ||
      sel_ids == null ||
      cur_id == null
    ) {
      return;
    } else {
      return (
        <TopMenubar
          actions={actions}
          name={name}
          frame_actions={frame_actions}
          cells={cells}
          cur_id={cur_id}
          view_mode={view_mode}
        />
      );
    }
  }

  function render_buttonbar() {
    if (
      actions == null ||
      frame_actions == null ||
      cells == null ||
      sel_ids == null ||
      cur_id == null ||
      name == null
    ) {
      return;
    } else {
      return (
        <TopButtonbar
          frame_actions={frame_actions}
          name={name}
          cells={cells}
          cur_id={cur_id}
          sel_ids={sel_ids}
          cell_toolbar={cell_toolbar}
        />
      );
    }
  }

  function render_heading() {
    //if (!is_focused) return;
    return (
      <div style={{ border: "1px solid rgb(231, 231, 231)" }}>
        {render_kernel()}
        {render_menubar()}
        {toolbar ? render_buttonbar() : undefined}
      </div>
    );
  }

  function render_loading(): Rendered {
    return (
      <Loading
        style={{
          fontSize: "24pt",
          textAlign: "center",
          marginTop: "15px",
          color: "#888",
        }}
      />
    );
  }

  function use_windowed_list(): boolean {
    // IMPORTANT: We are not using react-windowed at all
    // for Jupyter, due to situations like this
    //   https://github.com/sagemathinc/cocalc/issues/4727
    // I'm going to leave all the code in for now though,
    // since there is no harm and maybe some surprise
    // will pop up.  Also, we could have a non-default
    // option for huge notebooks that people might want to use.

    return false;

    /*
    if (
      frame_actions == null ||
      editor_settings == null ||
      cell_list == null ||
      editor_settings.get("disable_jupyter_windowing")
    ) {
      // very obvious reasons to disable windowing...
      return false;
    }
    // OK, we have a big notebook.  Let's window if we're not on Safari/Firefox,
    // where I don't know what is going on -- maybe some polyfill doesn't really
    // work... (see #4320).
    if (is_safari() || is_firefox()) {
      return false;
    }
    // OK, let's do it.
    return true;
    */
  }

  function render_cells() {
    if (
      cell_list == null ||
      font_size == null ||
      cm_options == null ||
      kernels == null ||
      cells == null
    ) {
      return (
        <Loading
          style={{
            fontSize: "24pt",
            textAlign: "center",
            marginTop: "15px",
            color: "#888",
          }}
        />
      );
    }

    return (
      <CellList
        actions={actions}
        frame_actions={frame_actions}
        name={name}
        cell_list={cell_list}
        cells={cells}
        font_size={font_size}
        sel_ids={sel_ids}
        md_edit_ids={md_edit_ids}
        cur_id={cur_id}
        mode={mode}
        hook_offset={hook_offset}
        cm_options={cm_options}
        project_id={project_id}
        directory={directory}
        scrollTop={scrollTop}
        complete={is_focused ? complete : undefined}
        is_focused={is_focused}
        more_output={more_output}
        scroll={scroll}
        cell_toolbar={cell_toolbar}
        trust={trust}
        use_windowed_list={use_windowed_list()}
      />
    );
  }

  function render_about() {
    return (
      <About
        actions={actions}
        about={about}
        backend_kernel_info={backend_kernel_info}
      />
    );
  }

  function render_nbconvert() {
    if (path == null || project_id == null) return;
    return (
      <NBConvert
        actions={actions}
        path={path}
        project_id={project_id}
        nbconvert={nbconvert}
        nbconvert_dialog={nbconvert_dialog}
        backend_kernel_info={backend_kernel_info}
      />
    );
  }

  function render_insert_image() {
    if (insert_image == null || project_id == null) {
      return;
    }
    return (
      <InsertImage
        actions={actions}
        project_id={project_id}
        insert_image={insert_image}
      />
    );
  }

  function render_edit_attachments() {
    if (edit_attachments == null || cells == null) {
      return;
    }
    const cell = cells.get(edit_attachments);
    if (cell == null) {
      return;
    }
    return <EditAttachments actions={actions} cell={cell} />;
  }

  function render_edit_cell_metadata() {
    if (edit_cell_metadata == null) {
      return;
    }
    return (
      <EditCellMetadata
        actions={actions}
        id={edit_cell_metadata.get("id")}
        metadata={edit_cell_metadata.get("metadata")}
        font_size={font_size}
        cm_options={cm_options != null ? cm_options.get("options") : undefined}
      />
    );
  }

  function render_find_and_replace() {
    if (cells == null || cur_id == null) {
      return;
    }
    return (
      <FindAndReplace
        actions={actions}
        find_and_replace={find_and_replace}
        sel_ids={sel_ids}
        cur_id={cur_id}
        cells={cells}
        cell_list={cell_list}
      />
    );
  }

  function render_confirm_dialog() {
    if (confirm_dialog == null || actions == null) return;
    return <ConfirmDialog actions={actions} confirm_dialog={confirm_dialog} />;
  }

  function render_select_kernel() {
    if (editor_settings == null || site_name == null) return;

    const ask_jupyter_kernel = editor_settings.get("ask_jupyter_kernel");
    return (
      <KernelSelector
        actions={actions}
        kernel={kernel}
        kernel_info={kernel_info}
        kernel_selection={kernel_selection}
        kernels_by_name={kernels_by_name}
        kernels_by_language={kernels_by_language}
        default_kernel={default_kernel}
        closestKernel={closestKernel}
        site_name={site_name}
        ask_jupyter_kernel={
          ask_jupyter_kernel == null ? true : ask_jupyter_kernel
        }
      />
    );
  }

  function render_keyboard_shortcuts() {
    if (actions == null || frame_actions == null) return;
    return (
      <KeyboardShortcuts
        actions={actions}
        frame_actions={frame_actions}
        editor_actions={editor_actions}
        keyboard_shortcuts={keyboard_shortcuts}
      />
    );
  }

  function render_snippets_dialog() {
    return (
      <SnippetsDialog
        name={actions.snippet_actions.name}
        actions={actions.snippet_actions}
      />
    );
  }

  function render_json_viewer() {
    if (cells == null) return <Loading />;
    return <JSONView actions={actions} cells={cells} font_size={font_size} />;
  }

  function render_raw_editor() {
    if (cm_options == null || font_size == null) {
      return <Loading />;
    }
    return (
      <RawEditor
        name={name}
        actions={actions}
        font_size={font_size}
        cm_options={cm_options.get("options")}
      />
    );
  }

  function render_main_view() {
    switch (view_mode) {
      case "json":
        return render_json_viewer();
      case "raw":
        return render_raw_editor();
      case "normal":
        return render_cells();
      default:
        return render_cells();
    }
  }

  function render_main() {
    if (!check_select_kernel_init) {
      return render_loading();
    } else if (show_kernel_selector) {
      return render_select_kernel();
    } else {
      return render_main_view();
    }
  }

  function render_modals() {
    if (!is_focused) return;
    return (
      <>
        {render_about()}
        {render_nbconvert()}
        {render_insert_image()}
        {render_edit_attachments()}
        {render_edit_cell_metadata()}
        {render_find_and_replace()}
        {render_keyboard_shortcuts()}
        {render_snippets_dialog()}
        {render_confirm_dialog()}
      </>
    );
  }

  if (fatal) {
    return render_fatal();
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflowY: "hidden",
      }}
    >
      {render_kernel_error()}
      {render_error()}
      {render_modals()}
      {render_heading()}
      {render_main()}
    </div>
  );
});
