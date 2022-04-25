import { default as marked } from 'marked';

const html = String.raw;

const computeHash = (typeName, name, id) => {
  const typeReference = typeName.toLowerCase().substr(0, typeName.length - 1);
  return `${typeReference}-${name || id}`;
};

// Thx aslushnikov!
const itemSort = (a, b) => {
  if (a.experimental !== b.experimental) return a.experimental ? 1 : -1;
  if (a.deprecated !== b.deprecated) return a.deprecated ? 1 : -1;
  if (a.optional !== b.optional) return a.optional ? 1 : -1;
  return (a.name || a.id).localeCompare(b.name || b.id);
};

export class DomainGenerator {
  constructor(version) {
    this.version = version;
  }

  data() {
    const { version } = this;
    const versionPart = version === 'tot' ? '' : ` - version ${version}`;
    const title = `Chrome DevTools Protocol${versionPart}`;
    return {
      layout: 'shell.hbs',
      title,
      version,
      shadow: 'domain',
      pagination: {
        data: `${version}.domains`,
        size: 1,
        alias: 'domain',
      },
      permalink(data) {
        return `${version}/${data.domain.domain}/index.html`;
      },
    };
  }
  render(data) {
    return this.domainTemplate(data.pagination.items[0]);
  }

  descriptionTemplate(description, item) {
    // Some descriptions use markdown. eg. Page.printToPDF
    // Some params have an emum: e.g. Debugger.continueToLocation
    return html`
      <div class="details-description">
        ${description ? marked(description) : ''} ${item ? this.enumDetails(item) : ''}
      </div>
    `;
  }

  statusTemplate(experimental, deprecated) {
    let output = '';
    if (experimental) {
      output += html`<span class="experimental" title="This may be changed, moved or removed">Experimental</span>`;
    }
    if (deprecated) {
      output += html`<span class="deprecated" title="Deprecated, please adopt alternative">Deprecated</span>`;
    }
    return output;
  }

  nameIncludingDomainTemplate(domain, name) {
    return html`<span class="domain-dot">${domain}.</span>${name}`;
  }

  domainTocTemplate(typeName, domain, items) {
    if (!items) {
      return '';
    }

    let output = html`<h3>${typeName}</h3>`;
    for (const { experimental, deprecated, name, id } of items) {
      output += html`
        <div class="toc-link">
          <a class="monospace" href="#${computeHash(typeName, name, id)}"
            >${this.nameIncludingDomainTemplate(domain, name || id)}</a
          >
          ${this.statusTemplate(experimental, deprecated)}
        </div>
      `;
    }
    return output;
  }

  computeReferral(item) {
    if (item.type) {
      return (item.items && item.items.$ref) || '';
    }
    return item.$ref;
  }

  computeReferralUrl(domain, referral) {
    // Referral points to a different domain
    if (referral.indexOf('.') !== -1) {
      return this.url(`/${this.version}/${referral.replace('.', '/#type-')}`);
    }
    return this.url(`/${this.version}/${domain}/#type-${referral}`);
  }

  propertiesType(domain, item) {
    const { type } = item;
    const referral = this.computeReferral(item);

    if (type) {
      const arrayDetails = (_) => {
        if (type !== 'array') return '';
        return html`<span class="param-type__array">[ ${this.propertiesType(domain, item.items)} ]</span>`;
      };
      return html`<span class="param-type">${type}${arrayDetails()}</span>`;
    }
    if (referral) {
      return html`<a href=${this.computeReferralUrl(domain, referral)} class="param-type">${referral}</a>`;
    }
    return '';
  }

  propertyTemplate(domain, items) {
    let properties = '';

    for (const item of items) {
      const { name, description, experimental, deprecated, optional } = item;
      properties += html`
        <dt class="param-name monospace ${optional ? 'optional' : ''}">${name}</dt>
        <dd>
          ${this.propertiesType(domain, item)} ${this.descriptionTemplate(description, item)}
          ${this.statusTemplate(experimental, deprecated)}
        </dd>
      `;
    }

    return properties;
  }

  propertiesDetailsTemplate(domain, details) {
    let name = '';
    let items = undefined;
    if (details.parameters) {
      name = 'parameters';
      items = details.parameters;
    }
    if (details.properties) {
      name = 'properties';
      items = details.properties;
    }
    if (!name) {
      return '';
    }

    return html`
      <h5 class="properties-name">${name}</h5>
      <dl class="properties-container">${this.propertyTemplate(domain, items)}</dl>
    `;
  }

  returnDetailsTemplate(domain, details) {
    const { returns, name } = details;
    if (!returns || !returns.length) {
      return '';
    }

    return html`
      <h5 class="properties-name">Return Object</h5>
      <dl class="properties-container">${this.propertyTemplate(domain, returns)}</dl>
    `;
  }

  enumDetails(details) {
    const { enum: enumValues } = details;
    if (!enumValues || !enumValues.length) {
      return '';
    }

    const enumItems = enumValues.map((e) => html`<code>${e}</code>`);
    return html` <div class="enum-container">Allowed Values: ${enumItems.join(', ')}</div> `;
  }

  detailsTemplate(typeName, domain, details) {
    const { name, description, id, type, experimental, deprecated } = details;
    const computedId = computeHash(typeName, name, id);
    const actualName = name || id;

    return html`
      <div class="details">
        <h4 class="details-name monospace" id="${computedId}">
          ${this.nameIncludingDomainTemplate(domain, actualName)} ${this.statusTemplate(experimental, deprecated)}
          <a
            href="#${computedId}"
            class="permalink"
            data-slug="${domain}.${actualName}"
            title="Double click to copy markdown-formatted URL"
            >#</a
          >
        </h4>
        ${this.descriptionTemplate(description, details)}
        ${type ? html`<p class="type-type">Type: <strong>${type}</strong></p>` : ''}
        ${this.propertiesDetailsTemplate(domain, details)} ${this.returnDetailsTemplate(domain, details)}
      </div>
    `;
  }

  detailsSection(name, domain, items) {
    if (!items || items.length === 0) {
      return '';
    }

    let details = '';
    for (const item of items) {
      details += this.detailsTemplate(name, domain, item);
    }

    return html`
      <h3 id="${name.toLowerCase()}">${name}</h3>
      <div>${details}</div>
    `;
  }

  domainTemplate({ domain, description, experimental, deprecated, commands, events, types }) {
    commands && commands.sort(itemSort);
    events && events.sort(itemSort);
    types && types.sort(itemSort);

    return html`
      <div class="domain-section">
        <div id="header">
          <h2 class="heading">${domain} Domain</h2>
          ${this.descriptionTemplate(description)} ${this.statusTemplate(experimental, deprecated)}
          ${this.domainTocTemplate('Methods', domain, commands)} ${this.domainTocTemplate('Events', domain, events)}
          ${this.domainTocTemplate('Types', domain, types)}
        </div>

        ${this.detailsSection('Methods', domain, commands)} ${this.detailsSection('Events', domain, events)}
        ${this.detailsSection('Types', domain, types)}
      </div>
    `;
  }
}
