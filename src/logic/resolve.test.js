import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  resolveCapabilities,
  buildAllRoles,
  formatRoleName,
} from "./resolve.js";

// --- formatRoleName ---

describe("formatRoleName", () => {
  it("capitalizes a single word", () => {
    assert.equal(formatRoleName("engineer"), "Engineer");
  });

  it("capitalizes hyphenated words", () => {
    assert.equal(formatRoleName("product-owner"), "Product Owner");
  });

  it("handles single character segments", () => {
    assert.equal(formatRoleName("a-b"), "A B");
  });

  it("handles already capitalized input", () => {
    assert.equal(formatRoleName("CEO"), "CEO");
  });
});

// --- buildAllRoles ---

describe("buildAllRoles", () => {
  it("returns a Set containing base roles", () => {
    const result = buildAllRoles(["ceo", "engineer"], []);
    assert.deepEqual(result, new Set(["ceo", "engineer"]));
  });

  it("adds extra roles to the set", () => {
    const result = buildAllRoles(["ceo", "engineer"], ["product-owner"]);
    assert.deepEqual(result, new Set(["ceo", "engineer", "product-owner"]));
  });

  it("deduplicates roles present in both base and extra", () => {
    const result = buildAllRoles(["ceo", "engineer"], ["ceo"]);
    assert.deepEqual(result, new Set(["ceo", "engineer"]));
    assert.equal(result.size, 2);
  });

  it("works with empty base and extra", () => {
    const result = buildAllRoles([], []);
    assert.deepEqual(result, new Set());
  });
});

// --- resolveCapabilities ---

describe("resolveCapabilities", () => {
  const modules = [
    {
      name: "auto-assign",
      capabilities: [
        { skill: "auto-assign", owners: ["product-owner", "ceo"] },
      ],
    },
    {
      name: "pr-review",
      capabilities: [
        { skill: "pr-review", owners: ["code-reviewer", "engineer"] },
      ],
    },
    {
      name: "roadmap-to-issues",
      capabilities: [
        { skill: "roadmap-to-issues", owners: ["product-owner", "ceo"] },
      ],
    },
    {
      name: "no-caps",
      // module with no capabilities field
    },
  ];

  it("resolves primary owner from first matching role", () => {
    const allRoles = new Set(["ceo", "engineer", "product-owner"]);
    const result = resolveCapabilities(
      modules,
      ["auto-assign"],
      allRoles
    );
    assert.equal(result.length, 1);
    assert.equal(result[0].primary, "product-owner");
    assert.equal(result[0].skill, "auto-assign");
    assert.equal(result[0].module, "auto-assign");
  });

  it("falls back to second owner when primary is absent", () => {
    const allRoles = new Set(["ceo", "engineer"]); // no product-owner
    const result = resolveCapabilities(
      modules,
      ["auto-assign"],
      allRoles
    );
    assert.equal(result.length, 1);
    assert.equal(result[0].primary, "ceo");
    assert.deepEqual(result[0].fallbacks, []);
  });

  it("includes fallback roles that are present but not primary", () => {
    const allRoles = new Set(["ceo", "engineer", "product-owner"]);
    const result = resolveCapabilities(
      modules,
      ["auto-assign"],
      allRoles
    );
    assert.equal(result[0].primary, "product-owner");
    assert.deepEqual(result[0].fallbacks, ["ceo"]);
  });

  it("skips modules not in selectedModules", () => {
    const allRoles = new Set(["ceo", "engineer"]);
    const result = resolveCapabilities(modules, ["pr-review"], allRoles);
    assert.equal(result.length, 1);
    assert.equal(result[0].module, "pr-review");
  });

  it("skips capabilities when no owner role is present", () => {
    const allRoles = new Set(["designer"]); // none of the owners
    const result = resolveCapabilities(
      modules,
      ["auto-assign"],
      allRoles
    );
    assert.equal(result.length, 0);
  });

  it("skips modules with no capabilities field", () => {
    const allRoles = new Set(["ceo", "engineer"]);
    const result = resolveCapabilities(modules, ["no-caps"], allRoles);
    assert.equal(result.length, 0);
  });

  it("skips modules with empty capabilities array", () => {
    const mods = [{ name: "empty", capabilities: [] }];
    const allRoles = new Set(["ceo"]);
    const result = resolveCapabilities(mods, ["empty"], allRoles);
    assert.equal(result.length, 0);
  });

  it("resolves multiple modules at once", () => {
    const allRoles = new Set(["ceo", "engineer"]);
    const result = resolveCapabilities(
      modules,
      ["auto-assign", "pr-review", "roadmap-to-issues"],
      allRoles
    );
    assert.equal(result.length, 3);
    const skills = result.map((r) => r.skill);
    assert.ok(skills.includes("auto-assign"));
    assert.ok(skills.includes("pr-review"));
    assert.ok(skills.includes("roadmap-to-issues"));
  });

  it("returns empty array when no modules selected", () => {
    const allRoles = new Set(["ceo", "engineer"]);
    const result = resolveCapabilities(modules, [], allRoles);
    assert.equal(result.length, 0);
  });
});
