'use strict';

/**
 *
 */
const fs = require('fs');
const tot = JSON.parse(fs.readFileSync(`${__dirname}/pages/_data/tot.json`, 'utf8'));

const isNotExperimentalOrDeprecated = (item) => !item.experimental && !item.deprecated;

const stableProtocol = tot;

stableProtocol.domains = stableProtocol.domains.filter(isNotExperimentalOrDeprecated);
stableProtocol.domains.forEach((domain) => {
  if (domain.types) domain.types = domain.types.filter(isNotExperimentalOrDeprecated);

  if (domain.commands) domain.commands = domain.commands.filter(isNotExperimentalOrDeprecated);

  if (domain.events) domain.events = domain.events.filter(isNotExperimentalOrDeprecated);
});

// filter out command params, too?
fs.writeFileSync(`${__dirname}/pages/_data/1-3.json`, JSON.stringify(stableProtocol, null, 2));
