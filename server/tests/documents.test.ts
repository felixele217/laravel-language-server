import { describe, it, expect, beforeEach } from "vitest";
import { documents } from "../src/documents";

describe("documents", () => {
  beforeEach(() => {
    // Clear the documents Map before each test
    documents.clear();
  });

  it("should be able to set and get documents", () => {
    const uri = "file:///test.php";
    const content = "test content";

    documents.set(uri, content);
    expect(documents.get(uri)).toBe(content);
  });

  it("should return undefined for non-existent documents", () => {
    expect(documents.get("non-existent")).toBeUndefined();
  });

  it("should be able to delete documents", () => {
    const uri = "file:///test.php";
    const content = "test content";

    documents.set(uri, content);
    expect(documents.has(uri)).toBe(true);

    documents.delete(uri);
    expect(documents.has(uri)).toBe(false);
  });

  it("should track size correctly", () => {
    expect(documents.size).toBe(0);

    documents.set("file:///1.php", "content1");
    documents.set("file:///2.php", "content2");

    expect(documents.size).toBe(2);
  });

  it("should be able to clear all documents", () => {
    documents.set("file:///1.php", "content1");
    documents.set("file:///2.php", "content2");

    documents.clear();
    expect(documents.size).toBe(0);
  });
});
