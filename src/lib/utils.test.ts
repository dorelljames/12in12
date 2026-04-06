import { describe, it, expect } from "vitest";
import { generateSlug, makeSlugUnique, normalizeEmail } from "./utils";

describe("normalizeEmail", () => {
  it("removes + suffix from local part", () => {
    expect(normalizeEmail("user+tag@example.com")).toBe("user@example.com");
  });

  it("handles email without + suffix", () => {
    expect(normalizeEmail("user@example.com")).toBe("user@example.com");
  });

  it("handles multiple + signs", () => {
    expect(normalizeEmail("user+a+b@example.com")).toBe("user@example.com");
  });

  it("preserves domain as-is", () => {
    expect(normalizeEmail("me+test@gmail.com")).toBe("me@gmail.com");
  });
});

describe("generateSlug", () => {
  it("converts to lowercase and replaces spaces with hyphens", () => {
    expect(generateSlug("My Cool Project")).toBe("my-cool-project");
  });

  it("removes special characters", () => {
    expect(generateSlug("Hello, World!")).toBe("hello-world");
  });

  it("trims whitespace", () => {
    expect(generateSlug("  spaced out  ")).toBe("spaced-out");
  });

  it("collapses consecutive hyphens", () => {
    expect(generateSlug("a---b")).toBe("a-b");
  });

  it("handles empty string", () => {
    expect(generateSlug("")).toBe("");
  });

  it("handles special characters and spaces together", () => {
    expect(generateSlug("My App (v2.0) - Release!")).toBe("my-app-v20-release");
  });

  it("handles dots and spaces", () => {
    expect(generateSlug("Ugnay.ph Emergency")).toBe("ugnayph-emergency");
  });
});

describe("makeSlugUnique", () => {
  it("returns base slug when no conflicts", () => {
    expect(makeSlugUnique("my-project", [])).toBe("my-project");
  });

  it("appends -1 when base slug conflicts", () => {
    expect(makeSlugUnique("my-project", ["my-project"])).toBe("my-project-1");
  });

  it("increments counter for multiple conflicts", () => {
    expect(
      makeSlugUnique("my-project", ["my-project", "my-project-1", "my-project-2"])
    ).toBe("my-project-3");
  });

  it("handles empty existing slugs array", () => {
    expect(makeSlugUnique("test", [])).toBe("test");
  });

  it("does not conflict with similar but different slugs", () => {
    expect(makeSlugUnique("my-project", ["my-project-foo", "my-project-bar"])).toBe(
      "my-project"
    );
  });
});
