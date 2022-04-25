'use strict';

/**
 * Utility command that merges two protocol files together
 */

const fs = require('fs');

const args = process.argv.slice(2);

const protocol1Text = fs.readFileSync(args[0]);
const protocol1 = JSON.parse(protocol1Text);

const protocol2Text = fs.readFileSync(args[1]);
const protocol2 = JSON.parse(protocol2Text);

const mergedDomains = [];
mergedDomains.push(...protocol1.domains);
mergedDomains.push(...protocol2.domains);

const protocolMerged = {
  domains: mergedDomains,
};

console.log(JSON.stringify(protocolMerged, null, '    '));
