/*
 *  This file is part of CoCalc: Copyright © 2020 Sagemath, Inc.
 *  License: AGPLv3 s.t. "Commons Clause" – see LICENSE.md for details
 */

/* Port to Typescript of what this does:
     nbgrader/nbgrader/preprocessors/clearsolutions.py

I tried to follow that code closely in order to best maintain
compatibility.  Of course, I couldn't help adding STUBS support
for more languages...
*/

import { Map } from "immutable";

const STUBS: { [language: string]: string[] } = {
  "c++": "// YOUR CODE HERE\nthrow NotImplementedError()".split("\n"),
  python: "# YOUR CODE HERE\nraise NotImplementedError()".split("\n"),
  sage: "# YOUR CODE HERE\nraise NotImplementedError()".split("\n"),
  r: `# YOUR CODE HERE\nstop("No Answer Given!")`.split("\n"),
  matlab: "% YOUR CODE HERE\nerror('No Answer Given!')".split("\n"),
  octave: "% YOUR CODE HERE\nerror('No Answer Given!')".split("\n"),
  java: ["// YOUR CODE HERE"],
  markdown: ["YOUR ANSWER HERE"],
};

// A friendlier more minimal alternative that some instructors prefer:
//.   https://github.com/sagemathinc/cocalc/issues/5577
const STUBS_MINIMAL: { [language: string]: string[] } = {
  "c++": ["// YOUR CODE HERE"],
  python: ["# YOUR CODE HERE"],
  sage: ["# YOUR CODE HERE"],
  r: ["# YOUR CODE HERE"],
  matlab: ["% YOUR CODE HERE"],
  octave: ["% YOUR CODE HERE"],
  java: ["// YOUR CODE HERE"],
  markdown: ["YOUR ANSWER HERE"],
};

const begin_solution_delimiter = "BEGIN SOLUTION";

const end_solution_delimiter = "END SOLUTION";

/*
replaceSolutionRegion --
Find a region in the cell's input that is delimeted by
`begin_solution_delimiter` and `end_solution_delimiter` (e.g.
### BEGIN SOLUTION and ### END SOLUTION). Replace that region either
with the code stub or text stub, depending the cell type.

If no solution delimiters at all, replace everything by a stub.

Returns undefined if nothing changed; otherwise, returns the new input.

If minimal_stubs is true, use a "friendly" stub that doesn't cause an error.
*/
function replaceSolutionRegion(
  input: string,
  language: string,
  minimal_stubs?: boolean
): string | undefined {
  const lines: string[] = input.split("\n");

  const stubs = minimal_stubs ? STUBS_MINIMAL : STUBS;

  if (stubs[language] == null) {
    // unknown -- default to markdown
    language = "markdown";
  }
  if (stubs[language] == null) throw Error("bug");
  const stub_lines: string[] = stubs[language];

  const new_lines: string[] = [];
  let in_solution: boolean = false;
  let replaced_solution: boolean = false;

  for (const line of lines) {
    // begin the solution area
    if (line.indexOf(begin_solution_delimiter) != -1) {
      // check to make sure this isn't a nested BEGIN SOLUTION region
      if (in_solution)
        throw Error("encountered nested begin solution statements");

      in_solution = true;
      replaced_solution = true;

      // replace it with the stub, preserving leading whitespace
      const v = line.match(/\s*/);
      const indent: string = v != null ? v[0] : "";
      for (const stub_line of stub_lines) new_lines.push(indent + stub_line);
    }

    // end the solution area
    else if (line.indexOf(end_solution_delimiter) != -1) {
      in_solution = false;
    }
    // add lines as long as it's not in the solution area
    else if (!in_solution) {
      new_lines.push(line);
    }
  }

  // we finished going through all the lines, but didn't find a
  // matching END SOLUTION statment
  if (in_solution) {
    throw Error("no end solution statement found");
  }

  // replace the cell source
  if (replaced_solution) {
    return new_lines.join("\n");
  } else {
    /* See https://github.com/sagemathinc/cocalc/issues/4764 --
    "If the solution delimeters aren’t present, nbgrader will
    replace the entire contents of all manually graded cells
    and autograded cells with a code stub (if it is a code cell)
    or a text stub "YOUR ANSWER HERE" (if it is a Markdown cell).
    */
    return (STUBS[language] ?? STUBS["python"]).join("\n");
  }
}

export default function clearSolution(
  cell: Map<string, any>,
  kernel_language: string,
  minimal_stubs?: boolean
): Map<string, any> {
  // Clear the solution region in the input part of the cell, and returns
  // a new modified cell object if necessary.  You can tell whether or not
  // the cell was changed by using === on the immutable Map.
  const input = cell.get("input");
  if (typeof input != "string") return cell;
  const cell_type = cell.get("cell_type", "code");
  const language: string = cell_type === "code" ? kernel_language : "markdown";
  const input2: string | undefined = replaceSolutionRegion(
    input,
    language,
    minimal_stubs
  );
  return input2 != null ? cell.set("input", input2) : cell;
}
