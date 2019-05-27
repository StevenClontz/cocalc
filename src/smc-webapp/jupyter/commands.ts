/*
Comprehensive list of Jupyter notebook (version 5) commands
we support and how they work.
*/

// still in coffeescript...
const ASSISTANT_ICON_NAME = require("smc-webapp/assistant/common").ICON_NAME;

import { FORMAT_SOURCE_ICON } from "smc-webapp/frame-editors/frame-tree/config";
import { JupyterActions } from "./browser-actions";
import { NotebookFrameActions } from "../frame-editors/jupyter-editor/cell-notebook/actions";
import { NotebookMode } from "./types";

export interface KeyboardCommand {
  mode?: NotebookMode;
  which: number;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  twice?: boolean;
}

export interface CommandDescription {
  i?: string; // icon name
  k?: KeyboardCommand[]; // keyboard commands
  m?: string; // fuller description for use in menus
  d?: string; // even more extensive description (e.g., for a tooltip).
  f: Function; // function that implements command.
}

export function commands(
  jupyter_actions: JupyterActions,
  frame_actions: NotebookFrameActions
): { [name: string]: CommandDescription } {
  if (jupyter_actions == null || frame_actions == null) {
    throw Error("both actions must be defined");
  }
  function id(): string {
    return frame_actions.store.get("cur_id");
  }

  const actions = jupyter_actions; // TODO
  const store = actions.store; // todo

  return {
    "cell toolbar none": {
      m: "No cell toolbar",
      f: () => jupyter_actions.cell_toolbar()
    },

    "cell toolbar attachments": {
      m: "Delete attachments",
      f: () => jupyter_actions.cell_toolbar("attachments")
    },

    "cell toolbar tags": {
      m: "Edit cell tags",
      f: () => jupyter_actions.cell_toolbar("tags")
    },

    "cell toolbar metadata": {
      m: "Edit custom metadata",
      f: () => jupyter_actions.cell_toolbar("metadata")
    },

    "cell toolbar slideshow": {
      m: "Slideshow toolbar",
      f: () => jupyter_actions.cell_toolbar("slideshow")
    },

    "change cell to code": {
      m: "Change to code",
      k: [{ which: 89, mode: "escape" }],
      f: () => frame_actions.set_selected_cell_type("code")
    },

    "change cell to heading 1": {
      m: "Heading 1",
      k: [{ which: 49, mode: "escape" }],
      f: () => jupyter_actions.change_cell_to_heading(id(), 1)
    },
    "change cell to heading 2": {
      m: "Heading 2",
      k: [{ which: 50, mode: "escape" }],
      f: () => jupyter_actions.change_cell_to_heading(id(), 2)
    },
    "change cell to heading 3": {
      m: "Heading 3",
      k: [{ which: 51, mode: "escape" }],
      f: () => jupyter_actions.change_cell_to_heading(id(), 3)
    },
    "change cell to heading 4": {
      m: "Heading 4",
      k: [{ which: 52, mode: "escape" }],
      f: () => jupyter_actions.change_cell_to_heading(id(), 4)
    },
    "change cell to heading 5": {
      m: "Heading 5",
      k: [{ which: 53, mode: "escape" }],
      f: () => jupyter_actions.change_cell_to_heading(id(), 5)
    },
    "change cell to heading 6": {
      m: "Heading 6",
      k: [{ which: 54, mode: "escape" }],
      f: () => jupyter_actions.change_cell_to_heading(id(), 6)
    },

    "change cell to markdown": {
      m: "Change to markdown",
      k: [{ which: 77, mode: "escape" }],
      f: () => frame_actions.set_selected_cell_type("markdown")
    },

    "change cell to raw": {
      m: "Change to raw",
      k: [{ which: 82, mode: "escape" }],
      f: () => frame_actions.set_selected_cell_type("raw")
    },

    "clear all cells output": {
      m: "Clear all output",
      f: () => jupyter_actions.clear_all_outputs()
    },

    "clear cell output": {
      m: "Clear output",
      f: () => frame_actions.clear_selected_outputs()
    },

    "close and halt": {
      i: "hand-stop-o",
      m: "Close and halt",
      f: () => jupyter_actions.close_and_halt()
    },

    "close pager": {
      m: "Close pager",
      k: [{ which: 27, mode: "escape" }],
      f: () =>
        store.get("introspect") != null
          ? jupyter_actions.clear_introspect()
          : undefined
    },

    "confirm restart kernel": {
      m: "Restart kernel...",
      i: "refresh",
      k: [{ mode: "escape", which: 48, twice: true }],
      async f(): Promise<void> {
        const choice = await jupyter_actions.confirm_dialog({
          title: "Restart kernel?",
          body:
            "Do you want to restart the current kernel?  All variables will be lost.",
          choices: [
            { title: "Continue running" },
            { title: "Restart", style: "danger", default: true }
          ]
        });
        if (choice === "Restart") {
          jupyter_actions.restart();
        }
      }
    },

    "confirm restart kernel and clear output": {
      m: "Restart and clear output...",
      async f(): Promise<void> {
        const choice = await jupyter_actions.confirm_dialog({
          title: "Restart kernel and clear all output?",
          body:
            "Do you want to restart the current kernel and clear all output?  All variables and outputs will be lost, though most past output is always available in TimeTravel.",
          choices: [
            { title: "Continue running" },
            {
              title: "Restart and clear all outputs",
              style: "danger",
              default: true
            }
          ]
        });
        if (choice === "Restart and clear all outputs") {
          jupyter_actions.restart();
          jupyter_actions.clear_all_outputs();
        }
      }
    },

    "confirm restart kernel and run all cells": {
      m: "Restart and run all...",
      i: "forward",
      async f(): Promise<void> {
        const choice = await jupyter_actions.confirm_dialog({
          title: "Restart kernel and re-run the whole notebook?",
          body:
            "Are you sure you want to restart the current kernel and re-execute the whole notebook?  All variables and output will be lost, though most past output is always available in TimeTravel.",
          choices: [
            { title: "Continue running" },
            {
              title: "Restart and run all cells",
              style: "danger",
              default: true
            }
          ]
        });
        if (choice === "Restart and run all cells") {
          await jupyter_actions.restart();
          jupyter_actions.run_all_cells();
        }
      }
    },

    "confirm shutdown kernel": {
      m: "Shutdown kernel...",
      async f(): Promise<void> {
        const choice = await jupyter_actions.confirm_dialog({
          title: "Shutdown kernel?",
          body:
            "Do you want to shutdown the current kernel?  All variables will be lost.",
          choices: [
            { title: "Continue running" },
            { title: "Shutdown", style: "danger", default: true }
          ]
        });
        if (choice === "Shutdown") {
          jupyter_actions.shutdown();
        }
      }
    },

    "copy cell": {
      i: "files-o",
      m: "Copy cells",
      k: [{ mode: "escape", which: 67 }],
      f: () => frame_actions.copy_selected_cells()
    },

    //"copy cell attachments": undefined, // no clue what this means or is for... but I can guess...

    "cut cell": {
      i: "scissors",
      m: "Cut cells",
      k: [{ mode: "escape", which: 88 }],
      f: () => frame_actions.cut_selected_cells()
    },

    //"cut cell attachments": undefined, // no clue

    "delete cell": {
      // jupyter has this but with d,d as shortcut, since they have no undo.
      m: "Delete cells",
      k: [{ mode: "escape", which: 68, twice: true }],
      f: () => frame_actions.delete_selected_cells()
    },

    "duplicate notebook": {
      m: "Make a copy...",
      f: () => jupyter_actions.file_action("duplicate")
    },

    "edit keyboard shortcuts": {
      m: "Keyboard shortcuts and commands...",
      f: () => jupyter_actions.show_keyboard_shortcuts()
    },

    "enter command mode": {
      k: [
        { which: 27, mode: "edit" },
        { ctrl: true, mode: "edit", which: 77 },
        { alt: true, mode: "edit", which: 77 }
      ],
      f() {
        if (store.get("mode") === "escape" && store.get("introspect") != null) {
          jupyter_actions.clear_introspect();
        }

        if (jupyter_actions.store.getIn(["cm_options", "options", "keyMap"]) === "vim") {
          // Vim mode is trickier...
          if (frame_actions.store.get("cur_cell_vim_mode", "escape") !== "escape") {
            return;
          }
        }
        frame_actions.set_mode("escape");
      }
    },

    "enter edit mode": {
      k: [{ which: 13, mode: "escape" }],
      f: () => {
        frame_actions.unhide_current_input();
        frame_actions.set_mode("edit");
      }
    },

    "extend selection above": {
      k: [
        { mode: "escape", shift: true, which: 75 },
        { mode: "escape", shift: true, which: 38 }
      ],
      f: () => frame_actions.extend_selection(-1)
    },

    "extend selection below": {
      k: [
        { mode: "escape", shift: true, which: 74 },
        { mode: "escape", shift: true, which: 40 }
      ],
      f: () => frame_actions.extend_selection(1)
    },

    "find and replace": {
      m: "Find and replace",
      k: [
        { mode: "escape", which: 70 },
        { alt: true, mode: "escape", which: 70 }
      ],
      f: () => jupyter_actions.show_find_and_replace()
    },

    "global undo": {
      m: "Undo",
      i: "undo",
      d:
        "Global user-aware undo.  Undo the last change *you* made to the notebook.",
      k: [
        { alt: true, mode: "escape", which: 90 },
        { ctrl: true, mode: "escape", which: 90 }
      ],
      f: () => jupyter_actions.undo()
    },

    "global redo": {
      m: "Redo",
      i: "repeat",
      d:
        "Global user-aware redo.  Redo the last change *you* made to the notebook.",
      k: [
        { alt: true, mode: "escape", which: 90, shift: true },
        { ctrl: true, mode: "escape", which: 90, shift: true },
        { alt: true, mode: "escape", which: 89 },
        { ctrl: true, mode: "escape", which: 89 }
      ],
      f: () => jupyter_actions.redo()
    },

    "hide all line numbers": {
      m: "Hide all line numbers",
      f: () => jupyter_actions.set_line_numbers(false)
    },

    "hide header": {
      m: "Hide header",
      f: () => jupyter_actions.set_header_state(true)
    },

    "hide toolbar": {
      m: "Hide toolbar",
      f: () => jupyter_actions.set_toolbar_state(false)
    },

    //ignore: undefined, // no clue what this means

    "insert cell above": {
      m: "Insert cell above",
      k: [{ mode: "escape", which: 65 }],
      f: () => frame_actions.insert_cell(-1)
    },

    "insert cell below": {
      i: "plus",
      m: "Insert cell below",
      k: [{ mode: "escape", which: 66 }],
      f: () => frame_actions.insert_cell(1)
    },

    "insert image": {
      m: "Insert images in markdown cell...",
      f: () => actions.insert_image()
    },

    "interrupt kernel": {
      i: "stop",
      m: "Interrupt kernel",
      k: [{ mode: "escape", which: 73, twice: true }],
      f: () => actions.signal("SIGINT")
    },

    "merge cell with next cell": {
      m: "Merge cell below",
      f: () => frame_actions.merge_cell_below()
    },

    "merge cell with previous cell": {
      m: "Merge cell above",
      f: () => frame_actions.merge_cell_above()
    },

    "merge cells": {
      m: "Merge selected cells",
      k: [{ mode: "escape", shift: true, which: 77 }],
      f: () => frame_actions.merge_selected_cells()
    },

    "merge selected cells": {
      // why is this in jupyter; it's the same as the above?
      m: "Merge selected cells",
      f: () => frame_actions.merge_selected_cells()
    },

    "move cell down": {
      i: "arrow-down",
      m: "Move cells down",
      k: [{ alt: true, mode: "escape", which: 40 }],
      f: () => frame_actions.move_selected_cells(1)
    },

    "move cell up": {
      i: "arrow-up",
      m: "Move cells up",
      k: [{ alt: true, mode: "escape", which: 38 }],
      f: () => frame_actions.move_selected_cells(-1)
    },

    "move cursor down": {
      m: "Move cursor down",
      f: () => frame_actions.move_edit_cursor(1)
    },

    "move cursor up": {
      m: "Move cursor up",
      f: () => frame_actions.move_edit_cursor(-1)
    },

    "new notebook": {
      m: "New...",
      f: () => jupyter_actions.file_new()
    },

    "nbconvert ipynb": {
      m: "Notebook (.ipynb)...",
      f() {
        jupyter_actions.save();
        jupyter_actions.file_action("download");
      }
    },

    "nbconvert asciidoc": {
      m: "AsciiDoc (.asciidoc)...",
      f: () => jupyter_actions.show_nbconvert_dialog("asciidoc")
    },

    "nbconvert python": {
      m: "Python (.py)...",
      f: () => jupyter_actions.show_nbconvert_dialog("python")
    },

    "nbconvert html": {
      m: "HTML (.html)...",
      f: () => jupyter_actions.show_nbconvert_dialog("html")
    },

    "nbconvert markdown": {
      m: "Markdown (.md)...",
      f: () => jupyter_actions.show_nbconvert_dialog("markdown")
    },

    "nbconvert rst": {
      m: "reST (.rst)...",
      f: () => jupyter_actions.show_nbconvert_dialog("rst")
    },

    "nbconvert slides": {
      m: "Slideshow...",
      f: () => jupyter_actions.show_nbconvert_dialog("slides")
    },

    "nbconvert tex": {
      m: "LaTeX (.tex)...",
      f: () => jupyter_actions.show_nbconvert_dialog("latex")
    },

    "nbconvert pdf": {
      m: "PDF via LaTeX (.pdf)...",
      f: () => jupyter_actions.show_nbconvert_dialog("pdf")
    },

    "nbconvert script": {
      m: "Executable script (.txt)...",
      f: () => jupyter_actions.show_nbconvert_dialog("script")
    },

    "nbconvert sagews": {
      m: "Sage worksheet (.sagews)...",
      f: () => jupyter_actions.show_nbconvert_dialog("sagews")
    },

    "open file": {
      m: "Open...",
      f: () => jupyter_actions.file_open()
    },

    "paste cell above": {
      m: "Paste cells above",
      k: [
        { mode: "escape", shift: true, which: 86 },
        { mode: "escape", shift: true, ctrl: true, which: 86 },
        { mode: "escape", shift: true, alt: true, which: 86 }
      ],
      f: () => frame_actions.paste_cells(-1)
    },

    //"paste cell attachments": undefined, // TODO ? not sure what the motivation is...

    "paste cell below": {
      // jupyter has this with the keyboard shortcut for paste; clearly because they have no undo
      m: "Paste cells below",
      f: () => frame_actions.paste_cells(1)
    },

    "paste cell and replace": {
      // jupyter doesn't have this but it's supposed to be normal paste behavior
      i: "clipboard",
      m: "Paste cells & replace",
      k: [
        { mode: "escape", alt: true, which: 86 },
        { mode: "escape", which: 86 },
        { mode: "escape", ctrl: true, which: 86 }
      ],
      f() {
        if (frame_actions.store.get("sel_ids", { size: 0 }).size > 0) {
          frame_actions.paste_cells(0);
        } else {
          frame_actions.paste_cells(1);
        }
      }
    },

    "print preview": {
      m: "Print preview...",
      f: () => jupyter_actions.show_nbconvert_dialog("html")
    },

    "refresh kernels": {
      m: "Refresh kernel list",
      f: () => jupyter_actions.fetch_jupyter_kernels()
    },

    "rename notebook": {
      m: "Rename...",
      f: () => jupyter_actions.file_action("rename")
    },

    "restart kernel": {
      m: "Restart kernel",
      f: () => jupyter_actions.restart()
    },

    "restart kernel and clear output": {
      m: "Restart kernel and clear output",
      f() {
        jupyter_actions.restart();
        jupyter_actions.clear_all_outputs();
      }
    },

    "restart kernel and run all cells": {
      m: "Restart and run all",
      async f() {
        await jupyter_actions.restart();
        jupyter_actions.run_all_cells();
      }
    },

    "run all cells": {
      m: "Run all",
      f: () => jupyter_actions.run_all_cells()
    },

    "run all cells above": {
      m: "Run all above",
      f: () => frame_actions.run_all_above()
    },

    "run all cells below": {
      m: "Run all below",
      f: () => frame_actions.run_all_below()
    },

    "run cell": {
      m: "Run cells",
      k: [{ which: 13, ctrl: true }],
      f() {
        frame_actions.run_selected_cells();
        frame_actions.set_mode("escape");
        frame_actions.scroll("cell visible");
      }
    },

    "run cell and insert below": {
      m: "Run cells and insert new cell below",
      k: [{ which: 13, alt: true }],
      f: () => frame_actions.run_selected_cells_and_insert_new_cell_below()
    },

    "run cell and select next": {
      i: "step-forward",
      m: "Run cells and select below",
      k: [{ which: 13, shift: true }],
      f() {
        frame_actions.shift_enter_run_selected_cells();
        frame_actions.scroll("cell visible");
      }
    },

    "save notebook": {
      m: "Save",
      k: [{ which: 83, alt: true }, { which: 83, ctrl: true }],
      f: () => jupyter_actions.save()
    },

    "scroll cell center": {
      f: () => frame_actions.scroll("cell center")
    },

    "scroll cell top": {
      f: () => frame_actions.scroll("cell top")
    },

    "scroll cell bottom": {
      f: () => frame_actions.scroll("cell bottom")
    },

    "scroll cell visible": {
      f: () => frame_actions.scroll("cell visible")
    },

    "scroll notebook down": {
      k: [{ mode: "escape", which: 32 }],
      f: () => frame_actions.scroll("list down")
    },

    "scroll notebook up": {
      k: [{ mode: "escape", shift: true, which: 32 }],
      f: () => frame_actions.scroll("list up")
    },

    "select all cells": {
      m: "Select all cells",
      k: [
        { alt: true, mode: "escape", which: 65 },
        { ctrl: true, mode: "escape", which: 65 }
      ],
      f: () => frame_actions.select_all_cells()
    },

    "select next cell": {
      k: [{ which: 40, mode: "escape" }, { which: 74, mode: "escape" }],
      f() {
        frame_actions.move_cursor(1);
        frame_actions.unselect_all_cells();
        frame_actions.scroll("cell visible");
      }
    },

    "select previous cell": {
      k: [{ which: 38, mode: "escape" }, { which: 75, mode: "escape" }],
      f() {
        frame_actions.move_cursor(-1);
        frame_actions.unselect_all_cells();
        frame_actions.scroll("cell visible");
      }
    },

    "show all line numbers": {
      m: "Show all line numbers",
      f: () => jupyter_actions.set_line_numbers(true)
    },

    "show command palette": {
      m: "Show command palette...",
      k: [{ alt: true, mode: "escape", shift: true, which: 80 }],
      f: () => jupyter_actions.show_keyboard_shortcuts()
    },

    "show header": {
      m: "Show header",
      f: () => actions.set_header_state(false)
    },

    "show keyboard shortcuts": {
      i: "keyboard-o",
      m: "Show keyboard shortcuts...",
      k: [{ mode: "escape", which: 72 }],
      f: () => actions.show_keyboard_shortcuts()
    },

    "show code assistant": {
      i: ASSISTANT_ICON_NAME,
      m: "Show code assistant",
      f: () => actions.show_code_assistant()
    },

    "show toolbar": {
      m: "Show toolbar",
      f: () => actions.set_toolbar_state(true)
    },

    "shutdown kernel": {
      m: "Shutdown kernel",
      f: () => actions.shutdown()
    },

    "split cell at cursor": {
      m: "Split cell",
      k: [{ ctrl: true, shift: true, which: 189 }],
      f() {
        frame_actions.set_mode("escape");
        frame_actions.split_current_cell();
      }
    },

    "switch to classical notebook": {
      m: "Switch to classical notebook...",
      f: () => jupyter_actions.switch_to_classical_notebook()
    },

    "tab key": {
      m: "Tab key (completion)",
      f: () => actions.tab_key()
    },

    "shift+tab key": {
      m: "Shift+Tab introspection (show function docstring)",
      f: () => actions.shift_tab_key()
    },

    "time travel": {
      m: "TimeTravel...",
      f: () => actions.show_history_viewer()
    },

    "toggle all cells output collapsed": {
      m: "Toggle all collapsed",
      f: () => actions.toggle_all_outputs("collapsed")
    },

    "toggle all cells output scrolled": {
      m: "Toggle all scrolled",
      f: () => actions.toggle_all_outputs("scrolled")
    },

    "toggle all line numbers": {
      m: "Toggle all line numbers",
      k: [{ mode: "escape", shift: true, which: 76 }],
      f: () => actions.toggle_line_numbers()
    },

    "toggle cell line numbers": {
      m: "Toggle cell line numbers",
      k: [{ mode: "escape", which: 76 }],
      f: () => actions.toggle_cell_line_numbers(id())
    },

    "toggle cell output collapsed": {
      m: "Toggle collapsed",
      k: [{ mode: "escape", which: 79 }],
      f: () => actions.toggle_selected_outputs("collapsed")
    },

    "toggle cell output scrolled": {
      m: "Toggle scrolled",
      k: [{ mode: "escape", which: 79, shift: true }],
      f: () => actions.toggle_selected_outputs("scrolled")
    },

    "toggle header": {
      m: "Toggle header",
      f: () => actions.toggle_header()
    },

    /* "toggle rtl layout": {
      // TODO
      m: "Toggle RTL layout"
    }, */

    "toggle toolbar": {
      m: "Toggle toolbar",
      f: () => actions.toggle_toolbar()
    },

    "trust notebook": {
      m: "Trust notebook",
      f: () => actions.trust_notebook()
    },

    "undo cell deletion": {
      m: "Undo cell deletion",
      k: [{ mode: "escape", which: 90 }],
      f: () => actions.undo()
    },

    /*
    "user interface tour": {
      // TODO
      m: "User interface tour"
    },*/

    "view notebook normal": {
      m: "Cells (normal)",
      f: () => actions.set_view_mode("normal")
    },

    "view notebook json": {
      m: "Object browser",
      f: () => actions.set_view_mode("json")
    },

    "view notebook raw": {
      m: "Raw .ipynb (file)",
      f: () => actions.set_view_mode("raw")
    },

    "zoom in": {
      m: "Zoom in",
      k: [{ ctrl: true, shift: true, which: 190 }],
      f: () => actions.zoom(1)
    },

    "zoom out": {
      m: "Zoom out",
      k: [{ ctrl: true, shift: true, which: 188 }],
      f: () => actions.zoom(-1)
    },

    "write protect": {
      m: "Toggle whether cells are editable",
      f: () => frame_actions.toggle_write_protection_on_selected_cells()
    },

    "delete protect": {
      m: "Toggle whether cells are deletable",
      f: () => frame_actions.toggle_delete_protection_on_selected_cells()
    },

    /* NOTE:  JupyterLab sticks fricking 9 lines related to this
    functionality in the View menu.  I tried to implement this, but
    it is such bad UX, I couldn't bring myself to do it.  It's bad
    because: (1) the view menu should just show different ways of viewing
    the doc, not change it, (2) the edit menu is for editing, (3) having
    9 lines just for this means way more scrolling/searching in the menu.
    */
    "toggle hide input": {
      m: "Toggle hide input of cells",
      f: () => frame_actions.toggle_source_hidden()
    },

    "toggle hide output": {
      m: "Toggle hide output of cells",
      f: () => frame_actions.toggle_outputs_hidden()
    },

    "format cells": {
      i: FORMAT_SOURCE_ICON,
      m: "Format selected cells",
      f: () => actions.format_selected_cells()
    },

    "format all cells": {
      i: FORMAT_SOURCE_ICON,
      m: "Format all cells",
      f: () => actions.format_all_cells()
    }
  };
}
