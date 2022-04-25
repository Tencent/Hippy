'use strict';

/**
 * Utility command that creates the search index for pages/_data/?.json.
 */

const fs = require('fs');
const path = require('path');

try {
  fs.mkdirSync(path.join(__dirname, 'search_index'));
} catch (e) {
  if (e.code !== 'EEXIST') throw e;
}
const VERSIONS_FILE = path.join(__dirname, `pages/_data/versions.json`);

const versionsText = fs.readFileSync(VERSIONS_FILE);
const versions = JSON.parse(versionsText);

versions.forEach(generateSearchIndex);

function generateSearchIndex(version) {
  const protocolText = fs.readFileSync(
    path.join(__dirname, 'pages/_data', `${version.protocolFile ? version.protocolFile : version.slug}.json`),
  );
  const protocol = JSON.parse(protocolText);

  // Set up Keyword bank
  // Split up search keywords into primary and secondary matches.
  // Primary kewords - event, domain, command names; plus type ids.
  // Secondary keywords - command parameter names, event parameter names, type
  // properties.
  // Reasoning: Primary keyword matches will appear at the top of the search
  // result list, while secondary matches, which are likely to have duplicates,
  // will appear at the bottom.

  const PageRefType = {
    DOMAIN: '0',
    EVENT: '1',
    PARAM: '2',
    TYPE_ID: '3',
    COMMAND: '4',
  };
  // Optional root path to be prepended to page reference URLs.
  const SITE_ROOT = '';
  const MAX_DESCRIPTION_LENGTH = 200;

  function getShortDescription(description) {
    return description && description.length > MAX_DESCRIPTION_LENGTH
      ? `${description.substr(0, MAX_DESCRIPTION_LENGTH)}...`
      : description;
  }

  // Represents a page reference.
  var PageReference = {
    init(domain, type, description) {
      this.domain = domain;
      this.type = type;
      this.description = description;
    },
    createPageReference(title, type, description) {
      const ref = Object.create(PageReference);
      ref.init(title, type, getShortDescription(description));
      return ref;
    },
    setHrefs(href, domainHref) {
      this.domainHref = domainHref;
      if (href) {
        this.href = href;
      }
    },
  };

  // Represents a keyword match, which may have many page references.
  var KeyRecord = {
    init(keyword) {
      this.keyword = keyword;
      this.pageReferences = [];
    },
    addReference(pageRef) {
      this.pageReferences.push(pageRef);
    },
    createKeyRecord(keyword, opt_pageRef) {
      const keyRecord = Object.create(KeyRecord);
      keyRecord.init(keyword);
      if (opt_pageRef) {
        keyRecord.addReference(opt_pageRef);
      }
      return keyRecord;
    },
  };

  // Used to store our key records.
  const keywordMap = {
    // Lazily creates a KeyRecord.
    addReferenceForKey(keyword, pageRef) {
      const key = keyword.toLowerCase();
      const record = this[key];
      if (record) {
        record.addReference(pageRef);
      } else {
        this[key] = KeyRecord.createKeyRecord(keyword, pageRef);
      }
    },
  };

  protocol.domains.forEach((domain, idx) => {
    const domainName = domain.domain;
    const domainPath = `${SITE_ROOT + version.slug}/${domainName}/`;
    // Reminder: You may have multiple pages per keyword.
    // Store domain name as a page reference under itself as a keyword.
    const ref = PageReference.createPageReference(domainName, PageRefType.DOMAIN, domain.description);
    ref.setHrefs('', domainPath);
    keywordMap.addReferenceForKey(domainName, ref);

    if (domain.commands) {
      domain.commands.forEach((command) => {
        const commandName = command.name;
        const commandNameHref = `#method-${commandName}`;
        const ref = PageReference.createPageReference(domainName, PageRefType.COMMAND, command.description);
        ref.setHrefs(commandNameHref, domainPath);
        keywordMap.addReferenceForKey(`${domainName}.${commandName}`, ref);
      });
    }
    if (domain.events) {
      domain.events.forEach((event) => {
        const eventName = event.name;
        const eventNameHref = `#event-${eventName}`;
        const ref = PageReference.createPageReference(domainName, PageRefType.EVENT, event.description);
        ref.setHrefs(eventNameHref, domainPath);
        keywordMap.addReferenceForKey(`${domainName}.${eventName}`, ref);
      });
    }
    if (domain.types) {
      domain.types.forEach((type) => {
        const typeName = type.id;
        const typeNameHref = `#type-${typeName}`;
        const ref = PageReference.createPageReference(domainName, PageRefType.TYPE_ID, type.description);
        ref.setHrefs(typeNameHref, domainPath);
        keywordMap.addReferenceForKey(`${domainName}.${typeName}`, ref);
      });
    }
    // TODO(ericguzman): Index other keyword types.
  });

  const fileName = path.join(__dirname, `search_index/${version.slug}.json`);
  const content = JSON.stringify(keywordMap);
  fs.writeFileSync(fileName, content);
}
