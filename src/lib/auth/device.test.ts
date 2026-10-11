import { describe, expect, it } from "vitest";
import { describeDevice } from "./device";

describe("describeDevice", () => {
  it("names the browser and the system", () => {
    expect(
      describeDevice(
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
      ),
    ).toBe("Chrome on Linux");
    expect(
      describeDevice(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1",
      ),
    ).toBe("Mobile Safari on iOS");
  });

  it("falls back when the user agent is missing or unknown", () => {
    expect(describeDevice(null)).toBe("Unknown device");
    expect(describeDevice("curl/8.5.0")).toBe("Unknown device");
  });
});
