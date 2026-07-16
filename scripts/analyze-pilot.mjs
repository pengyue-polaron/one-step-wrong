#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export const PILOT_COLUMNS = Object.freeze([
  "session_code",
  "scenario_version",
  "delivery_mode",
  "participants_started",
  "participants_completed",
  "first_safe",
  "first_caution",
  "first_contained",
  "first_expanded",
  "transfer_demonstrated",
  "transfer_developing",
  "transfer_not_yet",
  "explanation_clear",
  "explanation_partial",
  "explanation_unclear",
  "participants_with_technical_blocker",
]);

const COUNT_COLUMNS = PILOT_COLUMNS.slice(3);
const FIRST_OUTCOME_COLUMNS = ["first_safe", "first_caution", "first_contained", "first_expanded"];
const TRANSFER_COLUMNS = ["transfer_demonstrated", "transfer_developing", "transfer_not_yet"];
const EXPLANATION_COLUMNS = ["explanation_clear", "explanation_partial", "explanation_unclear"];
const DELIVERY_MODES = new Set(["individual", "pair", "facilitated-group", "projected-group"]);
const SESSION_CODE_PATTERN = /^S\d{3,6}$/;
const SCENARIO_VERSION_PATTERN = /^(?:[a-f0-9]{7,40}|[a-z0-9]+(?:-[a-z0-9]+)*-v\d{1,3})$/;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const URL_PATTERN = /\b(?:https?:\/\/|www\.)/i;
const PHONE_PATTERN = /(?:\+\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?){2,}\d{3,4}/;

export class PilotDataError extends Error {
  constructor(message) {
    super(message);
    this.name = "PilotDataError";
  }
}

function sum(row, columns) {
  return columns.reduce((total, column) => total + row[column], 0);
}

function parseCount(raw, lineNumber, column) {
  if (!/^\d+$/.test(raw)) {
    throw new PilotDataError(`Line ${lineNumber}: ${column} must be a non-negative integer.`);
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value)) {
    throw new PilotDataError(`Line ${lineNumber}: ${column} exceeds the supported integer range.`);
  }
  return value;
}

function rejectUnsafeCell(raw, lineNumber) {
  if (raw.includes('"')) {
    throw new PilotDataError(`Line ${lineNumber}: quoted or free-text cells are not accepted.`);
  }
  if (EMAIL_PATTERN.test(raw) || URL_PATTERN.test(raw) || PHONE_PATTERN.test(raw)) {
    throw new PilotDataError(`Line ${lineNumber}: a PII-like value was rejected.`);
  }
}

function validateHeaders(headers) {
  const duplicates = headers.filter((header, index) => headers.indexOf(header) !== index);
  if (duplicates.length > 0) {
    throw new PilotDataError(`Duplicate columns are not accepted: ${[...new Set(duplicates)].join(", ")}.`);
  }

  const allowed = new Set(PILOT_COLUMNS);
  const unknown = headers.filter((header) => !allowed.has(header));
  const missing = PILOT_COLUMNS.filter((header) => !headers.includes(header));
  if (unknown.length > 0) {
    throw new PilotDataError(`Unknown columns are not accepted: ${unknown.join(", ")}.`);
  }
  if (missing.length > 0) {
    throw new PilotDataError(`Required columns are missing: ${missing.join(", ")}.`);
  }
}

function validateRow(row, lineNumber) {
  if (!SESSION_CODE_PATTERN.test(row.session_code)) {
    throw new PilotDataError(`Line ${lineNumber}: session_code must use S plus 3-6 digits.`);
  }
  if (!SCENARIO_VERSION_PATTERN.test(row.scenario_version)) {
    throw new PilotDataError(`Line ${lineNumber}: scenario_version must be a versioned slug or 7-40 character commit hash.`);
  }
  if (!DELIVERY_MODES.has(row.delivery_mode)) {
    throw new PilotDataError(`Line ${lineNumber}: delivery_mode is not an accepted value.`);
  }
  if (row.participants_started < 1) {
    throw new PilotDataError(`Line ${lineNumber}: participants_started must be at least 1.`);
  }
  if (row.participants_completed > row.participants_started) {
    throw new PilotDataError(`Line ${lineNumber}: participants_completed cannot exceed participants_started.`);
  }
  if (row.participants_with_technical_blocker > row.participants_started) {
    throw new PilotDataError(`Line ${lineNumber}: technical blockers cannot exceed participants_started.`);
  }
  if (sum(row, FIRST_OUTCOME_COLUMNS) !== row.participants_completed) {
    throw new PilotDataError(`Line ${lineNumber}: first-outcome counts must equal participants_completed.`);
  }
  if (sum(row, TRANSFER_COLUMNS) > row.participants_completed) {
    throw new PilotDataError(`Line ${lineNumber}: transfer counts cannot exceed participants_completed.`);
  }
  if (sum(row, EXPLANATION_COLUMNS) > row.participants_completed) {
    throw new PilotDataError(`Line ${lineNumber}: explanation counts cannot exceed participants_completed.`);
  }
}

export function parsePilotCsv(source) {
  const normalized = source.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const lines = normalized.split("\n");
  while (lines.at(-1) === "") lines.pop();

  if (lines.length === 0 || lines[0].trim() === "") {
    throw new PilotDataError("The pilot file must contain the approved header.");
  }

  rejectUnsafeCell(lines[0], 1);
  const headers = lines[0].split(",").map((header) => header.trim());
  validateHeaders(headers);

  const rows = [];
  const seenSessionCodes = new Set();
  for (let index = 1; index < lines.length; index += 1) {
    const lineNumber = index + 1;
    const line = lines[index];
    if (line.trim() === "") {
      throw new PilotDataError(`Line ${lineNumber}: blank rows are not accepted.`);
    }
    rejectUnsafeCell(line, lineNumber);
    const cells = line.split(",").map((cell) => cell.trim());
    if (cells.length !== headers.length) {
      throw new PilotDataError(`Line ${lineNumber}: expected ${headers.length} cells, received ${cells.length}.`);
    }
    if (cells.some((cell) => cell === "")) {
      throw new PilotDataError(`Line ${lineNumber}: empty cells are not accepted; enter an explicit zero for counts.`);
    }

    const rawRow = Object.fromEntries(headers.map((header, cellIndex) => [header, cells[cellIndex]]));
    const row = {
      session_code: rawRow.session_code,
      scenario_version: rawRow.scenario_version,
      delivery_mode: rawRow.delivery_mode,
    };
    for (const column of COUNT_COLUMNS) {
      row[column] = parseCount(rawRow[column], lineNumber, column);
    }

    validateRow(row, lineNumber);
    if (seenSessionCodes.has(row.session_code)) {
      throw new PilotDataError(`Line ${lineNumber}: duplicate session_code values are not accepted.`);
    }
    seenSessionCodes.add(row.session_code);
    rows.push(row);
  }

  return rows;
}

function percentage(numerator, denominator) {
  return denominator === 0 ? null : (numerator / denominator) * 100;
}

export function summarizePilotRows(rows) {
  const totals = Object.fromEntries(COUNT_COLUMNS.map((column) => [column, 0]));
  for (const row of rows) {
    for (const column of COUNT_COLUMNS) totals[column] += row[column];
  }

  const transferRecorded = sum(totals, TRANSFER_COLUMNS);
  const explanationsRecorded = sum(totals, EXPLANATION_COLUMNS);
  return {
    sessionCount: rows.length,
    participantsStarted: totals.participants_started,
    participantsCompleted: totals.participants_completed,
    completionRate: percentage(totals.participants_completed, totals.participants_started),
    firstOutcomes: {
      safe: totals.first_safe,
      caution: totals.first_caution,
      contained: totals.first_contained,
      expanded: totals.first_expanded,
    },
    transfer: {
      recorded: transferRecorded,
      coverageRate: percentage(transferRecorded, totals.participants_completed),
      demonstrated: totals.transfer_demonstrated,
      developing: totals.transfer_developing,
      notYet: totals.transfer_not_yet,
    },
    explanations: {
      recorded: explanationsRecorded,
      coverageRate: percentage(explanationsRecorded, totals.participants_completed),
      clear: totals.explanation_clear,
      partial: totals.explanation_partial,
      unclear: totals.explanation_unclear,
    },
    participantsWithTechnicalBlocker: totals.participants_with_technical_blocker,
  };
}

function formatRate(value) {
  return value === null ? "n/a" : `${value.toFixed(1)}%`;
}

export function renderPilotSummary(summary) {
  if (summary.sessionCount === 0) {
    return [
      "# Anonymous Pilot Summary",
      "",
      "No pilot sessions were recorded. The header-only template is not participant evidence.",
      "",
      "## Limitations",
      "",
      "- No real session data was analyzed.",
      "- The template and analyzer do not demonstrate learning impact.",
    ].join("\n");
  }

  return [
    "# Anonymous Pilot Summary",
    "",
    `Generated from ${summary.sessionCount} session-level aggregate row${summary.sessionCount === 1 ? "" : "s"}. No participant-level records, session codes, or free text are included.`,
    "",
    "## Participation",
    "",
    `- Started: ${summary.participantsStarted}`,
    `- Completed first rehearsal: ${summary.participantsCompleted} (${formatRate(summary.completionRate)})`,
    `- Experienced a material technical blocker: ${summary.participantsWithTechnicalBlocker}`,
    "",
    "## First Rehearsal Outcomes",
    "",
    "| Outcome | Count |",
    "| --- | ---: |",
    `| Safe | ${summary.firstOutcomes.safe} |`,
    `| Caution | ${summary.firstOutcomes.caution} |`,
    `| Contained | ${summary.firstOutcomes.contained} |`,
    `| Expanded | ${summary.firstOutcomes.expanded} |`,
    "",
    "## New-Situation Transfer",
    "",
    `Transfer result recorded for ${summary.transfer.recorded} completed learner${summary.transfer.recorded === 1 ? "" : "s"} (${formatRate(summary.transfer.coverageRate)} coverage).`,
    "",
    "| Result | Count |",
    "| --- | ---: |",
    `| Demonstrated | ${summary.transfer.demonstrated} |`,
    `| Developing | ${summary.transfer.developing} |`,
    `| Not yet | ${summary.transfer.notYet} |`,
    "",
    "## Explanation Rubric",
    "",
    `Explanation categorized for ${summary.explanations.recorded} completed learner${summary.explanations.recorded === 1 ? "" : "s"} (${formatRate(summary.explanations.coverageRate)} coverage).`,
    "",
    "| Category | Count |",
    "| --- | ---: |",
    `| Clear | ${summary.explanations.clear} |`,
    `| Partial | ${summary.explanations.partial} |`,
    `| Unclear | ${summary.explanations.unclear} |`,
    "",
    "## Limitations",
    "",
    "- Session aggregates cannot connect a specific learner's first outcome, transfer choice, and explanation.",
    "- There is no pre-test or control group, so these counts do not establish causal learning improvement.",
    "- A small or self-selected sample may not generalize to other learners or institutions.",
    "- Facilitator-coded explanations are descriptive judgments, not standardized assessment scores.",
    "- The summary is evidence only for real sessions represented by a reviewed input file.",
  ].join("\n");
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath || process.argv.length > 3) {
    throw new PilotDataError("Usage: npm run pilot:analyze -- <session-aggregate.csv>");
  }
  const source = await readFile(inputPath, "utf8");
  const rows = parsePilotCsv(source);
  process.stdout.write(`${renderPilotSummary(summarizePilotRows(rows))}\n`);
}

const entryPath = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entryPath) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : "Pilot analysis failed.";
    process.stderr.write(`Pilot analysis failed: ${message}\n`);
    process.exitCode = 1;
  });
}
