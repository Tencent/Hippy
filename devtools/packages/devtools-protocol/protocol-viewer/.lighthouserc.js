"use strict";

module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3, // ignored due to https://github.com/treosh/lighthouse-ci-action/issues/48
      startServerCommand: "npm run serve",
      startServerReadyPattern: "Served by",
    },
    assert: {
      preset: "lighthouse:no-pwa",
      "assertions": {
        // TODO(paulirish): fix these
        "color-contrast": "warn",
        "unsized-images": "warn",
        "cumulative-layout-shift": "warn",
        "render-blocking-resources": "warn",
        "uses-long-cache-ttl": "warn",
        "tap-targets": "warn",
        "dom-size": "warn",
        "csp-xss": "warn",
      }
    }
  },
};
