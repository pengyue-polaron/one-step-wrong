import { describe, expect, it } from "vitest";

// @ts-expect-error -- The production CLI is intentionally plain ESM and is tested directly.
import { PILOT_COLUMNS, parsePilotCsv, renderPilotSummary, summarizePilotRows } from "../../scripts/analyze-pilot.mjs";

const baseRow = {
  session_code: "S001",
  scenario_version: "voice-you-know-v1",
  delivery_mode: "facilitated-group",
  participants_started: 10,
  participants_completed: 9,
  first_safe: 4,
  first_caution: 2,
  first_contained: 2,
  first_expanded: 1,
  transfer_demonstrated: 5,
  transfer_developing: 2,
  transfer_not_yet: 1,
  explanation_clear: 4,
  explanation_partial: 3,
  explanation_unclear: 1,
  participants_with_technical_blocker: 1,
};

function csvFor(rows: Array<Record<string, string | number>>, columns = PILOT_COLUMNS) {
  return [
    columns.join(","),
    ...rows.map((row) => columns.map((column: string) => row[column]).join(",")),
  ].join("\n");
}

describe("anonymous pilot analysis", () => {
  it("accepts the header-only template without inventing evidence", () => {
    const rows = parsePilotCsv(PILOT_COLUMNS.join(","));
    const summary = summarizePilotRows(rows);

    expect(rows).toEqual([]);
    expect(summary.sessionCount).toBe(0);
    expect(renderPilotSummary(summary)).toContain("not participant evidence");
  });

  it("aggregates valid session rows without exposing session codes", () => {
    const secondRow = {
      ...baseRow,
      session_code: "S002",
      participants_started: 8,
      participants_completed: 8,
      first_safe: 3,
      first_caution: 1,
      first_contained: 3,
      first_expanded: 1,
      transfer_demonstrated: 4,
      transfer_developing: 3,
      transfer_not_yet: 1,
      explanation_clear: 5,
      explanation_partial: 2,
      explanation_unclear: 1,
      participants_with_technical_blocker: 0,
    };
    const summary = summarizePilotRows(parsePilotCsv(csvFor([baseRow, secondRow])));
    const report = renderPilotSummary(summary);

    expect(summary).toMatchObject({
      sessionCount: 2,
      participantsStarted: 18,
      participantsCompleted: 17,
      participantsWithTechnicalBlocker: 1,
      firstOutcomes: { safe: 7, caution: 3, contained: 5, expanded: 2 },
      transfer: { recorded: 16, demonstrated: 9, developing: 5, notYet: 2 },
      explanations: { recorded: 16, clear: 9, partial: 5, unclear: 2 },
    });
    expect(report).not.toContain("S001");
    expect(report).not.toContain("S002");
    expect(report).toContain("94.4%");
  });

  it("rejects unknown columns", () => {
    const columns = [...PILOT_COLUMNS, "notes"];
    expect(() => parsePilotCsv(csvFor([{ ...baseRow, notes: "none" }], columns)))
      .toThrow(/Unknown columns/);
  });

  it("rejects missing columns", () => {
    const columns = PILOT_COLUMNS.filter((column: string) => column !== "explanation_unclear");
    expect(() => parsePilotCsv(csvFor([baseRow], columns)))
      .toThrow(/Required columns are missing/);
  });

  it("rejects quoted or free-text cells", () => {
    const source = csvFor([{ ...baseRow, session_code: "\"S001\"" }]);
    expect(() => parsePilotCsv(source)).toThrow(/free-text/);
    expect(() => parsePilotCsv(csvFor([{ ...baseRow, scenario_version: "alice" }])))
      .toThrow(/scenario_version/);
  });

  it("rejects PII-like values without echoing them", () => {
    const source = csvFor([{ ...baseRow, scenario_version: "person@example.com" }]);
    expect(() => parsePilotCsv(source)).toThrow(/PII-like/);
  });

  it("rejects negative and decimal counts", () => {
    expect(() => parsePilotCsv(csvFor([{ ...baseRow, participants_started: -1 }])))
      .toThrow(/non-negative integer/);
    expect(() => parsePilotCsv(csvFor([{ ...baseRow, participants_started: 10.5 }])))
      .toThrow(/non-negative integer/);
  });

  it("rejects completion totals above the number started", () => {
    expect(() => parsePilotCsv(csvFor([{
      ...baseRow,
      participants_completed: 11,
      first_safe: 6,
    }]))).toThrow(/participants_completed cannot exceed/);
  });

  it("requires first-outcome counts to equal completions", () => {
    expect(() => parsePilotCsv(csvFor([{ ...baseRow, first_safe: 3 }])))
      .toThrow(/first-outcome counts must equal/);
  });

  it("rejects transfer and explanation totals above completions", () => {
    expect(() => parsePilotCsv(csvFor([{ ...baseRow, transfer_demonstrated: 7 }])))
      .toThrow(/transfer counts cannot exceed/);
    expect(() => parsePilotCsv(csvFor([{ ...baseRow, explanation_clear: 7 }])))
      .toThrow(/explanation counts cannot exceed/);
  });

  it("rejects technical blockers above participants started", () => {
    expect(() => parsePilotCsv(csvFor([{
      ...baseRow,
      participants_with_technical_blocker: 11,
    }]))).toThrow(/technical blockers cannot exceed/);
  });

  it("rejects duplicate session codes", () => {
    expect(() => parsePilotCsv(csvFor([baseRow, baseRow])))
      .toThrow(/duplicate session_code/);
  });
});
