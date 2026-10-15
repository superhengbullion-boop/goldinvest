import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { assetsHubEnabled, isAssetsHubPath } from "@/lib/feature-flags";

const original = process.env.ASSETS_HUB_ENABLED;

afterEach(() => {
  if (original == null) delete process.env.ASSETS_HUB_ENABLED;
  else process.env.ASSETS_HUB_ENABLED = original;
});

describe("assetsHubEnabled", () => {
  it("stays off unless the env var is turned on", () => {
    delete process.env.ASSETS_HUB_ENABLED;
    assert.equal(assetsHubEnabled(), false);
    process.env.ASSETS_HUB_ENABLED = "0";
    assert.equal(assetsHubEnabled(), false);
    process.env.ASSETS_HUB_ENABLED = "1";
    assert.equal(assetsHubEnabled(), true);
    process.env.ASSETS_HUB_ENABLED = "true";
    assert.equal(assetsHubEnabled(), true);
  });
});

describe("isAssetsHubPath", () => {
  it("matches the unreleased admin and mobile routes", () => {
    assert.equal(isAssetsHubPath("/admin/deposits"), true);
    assert.equal(isAssetsHubPath("/api/mobile/announcements/read"), true);
    assert.equal(isAssetsHubPath("/admin/members"), false);
    assert.equal(isAssetsHubPath("/api/mobile/me"), false);
  });
});
