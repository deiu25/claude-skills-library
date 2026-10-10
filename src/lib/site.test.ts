import { describe, expect, it } from "vitest";
import { ariaCurrent } from "@/lib/site";

describe("ariaCurrent", () => {
  it("marks the link to the page you are on as the current page", () => {
    // Arrange
    const pathname = "/skills";

    // Act
    const current = ariaCurrent(pathname, "/skills");

    // Assert
    expect(current).toBe("page");
  });

  it("marks the section link as current on pages nested under it", () => {
    expect(ariaCurrent("/skills/superpowers", "/skills")).toBe("true");
  });

  it("ignores a route that only shares a prefix", () => {
    expect(ariaCurrent("/skills-archive", "/skills")).toBeUndefined();
  });

  it("ignores another section", () => {
    expect(ariaCurrent("/report", "/skills")).toBeUndefined();
  });
});
