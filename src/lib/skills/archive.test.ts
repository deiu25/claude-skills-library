import { unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { zipResponse, zipVersion } from "./archive";

const text = (value: string) => new TextEncoder().encode(value);

const VERSION = {
  name: "pdf-tools",
  createdAt: new Date("2026-10-22T10:00:00Z"),
  skillMd: "---\nname: pdf-tools\ndescription: Fill PDF forms.\n---\n# PDF tools\n",
  files: [
    { path: "scripts/fill.sh", content: text("#!/bin/sh\necho fill\n"), executable: true },
    { path: "references/api/v1.md", content: text("# API v1\n"), executable: false },
    { path: "assets/form.pdf", content: new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x00, 0xff, 0xfe]), executable: false },
  ],
};

/** Each entry's Unix mode, read from the zip's central directory, where unzip tools find it. */
function unixModes(zip: Uint8Array): Record<string, string> {
  const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
  const modes: Record<string, string> = {};
  for (let at = 0; at + 46 <= zip.length; at++) {
    if (view.getUint32(at, true) !== 0x02014b50) continue;
    const madeByUnix = view.getUint8(at + 5) === 3;
    const name = new TextDecoder().decode(zip.subarray(at + 46, at + 46 + view.getUint16(at + 28, true)));
    modes[name] = madeByUnix ? (view.getUint32(at + 38, true) >>> 16).toString(8) : "not unix";
  }
  return modes;
}

describe("zipVersion", () => {
  it("unpacks to one folder named after the skill, every file unchanged", () => {
    const entries = unzipSync(zipVersion(VERSION));
    expect(Object.keys(entries).sort()).toEqual([
      "pdf-tools/SKILL.md",
      "pdf-tools/assets/form.pdf",
      "pdf-tools/references/api/v1.md",
      "pdf-tools/scripts/fill.sh",
    ]);
    expect(new TextDecoder().decode(entries["pdf-tools/SKILL.md"])).toBe(VERSION.skillMd);
    for (const file of VERSION.files) expect(entries[`pdf-tools/${file.path}`]).toEqual(file.content);
  });

  it("keeps scripts executable and every other file readable on Unix", () => {
    expect(unixModes(zipVersion(VERSION))).toEqual({
      "pdf-tools/SKILL.md": "100644",
      "pdf-tools/scripts/fill.sh": "100755",
      "pdf-tools/references/api/v1.md": "100644",
      "pdf-tools/assets/form.pdf": "100644",
    });
  });

  it("zips one version to the same bytes every time", () => {
    expect(zipVersion(VERSION)).toEqual(zipVersion(VERSION));
  });

  it("never lets a name that was not checked choose a path in the archive", () => {
    expect(Object.keys(unzipSync(zipVersion({ ...VERSION, name: "../evil", files: [] })))).toEqual(["skill/SKILL.md"]);
  });
});

describe("zipResponse", () => {
  it("serves the zip as a download named after the skill and its version, never cached", async () => {
    const response = zipResponse({ ...VERSION, version: 3 });
    expect(response.headers.get("Content-Type")).toBe("application/zip");
    expect(response.headers.get("Content-Disposition")).toBe('attachment; filename="pdf-tools-v3.zip"');
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(Object.keys(unzipSync(new Uint8Array(await response.arrayBuffer())))).toContain("pdf-tools/SKILL.md");
  });
});
