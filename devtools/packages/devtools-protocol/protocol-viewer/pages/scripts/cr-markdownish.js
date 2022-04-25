class CRMarkdownish extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  static get observedAttributes() {
    return ['markdown'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.render();
  }

  render() {
    const markdown = this.getAttribute('markdown');

    if (!markdown) {
      this.innerHTML = '';
      return;
    }

    // skip the work if we don't have markdown in it.
    const hasMarkdown = /(\n-)|`/.test(markdown);
    if (!hasMarkdown) {
      this.innerHTML = markdown;
      return;
    }

    const text = this._escapeHtml(markdown);
    let html = this._convertMarkdownLists(text);
    html = this._convertMarkdownCodeBlocks(html);
    this.innerHTML = html;
  }

  /**
   * @param {string} text
   * @return {!string}
   */
  _convertMarkdownLists(text) {
    let inList = false;
    const html = [];

    for (const line of text.split(/\n/)) {
      if (inList && line === '') {
        inList = false;
        html.push('</ul>');
        continue;
      }
      if (line.startsWith('-')) {
        if (!inList) html.push('<ul>');
        inList = true;
        html.push(`  <li>${line.replace(/^- /, '')}`);
        continue;
      }
      html.push(line);
    }
    if (inList) html.push('</ul>');

    return html.join('\n');
  }

  /**
   * @param {!string} text
   * @return {!Element}
   */
  _convertMarkdownCodeBlocks(text) {
    const html = [];
    const parts = text.split(/`(.*?)`/g); // Split on markdown code slashes
    while (parts.length) {
      // Pop off the same number of elements as there are capture groups.
      const [preambleText, codeText] = parts.splice(0, 2);
      html.push(preambleText);
      if (codeText) {
        html.push(`<code>${codeText}</code>`);
      }
    }
    return html.join('');
  }

  /**
   * Escape special characters in the given string of html.
   *
   * @param  {string} string The string to escape for inserting into HTML
   * @return {string}
   * @see https://github.com/component/escape-html/
   */
  _escapeHtml(string) {
    const matchHtmlRegExp = /["'&<>]/;

    const str = `${string}`;
    const match = matchHtmlRegExp.exec(str);

    if (!match) {
      return str;
    }

    let escape;
    let html = '';
    let index = 0;
    let lastIndex = 0;

    for (index = match.index; index < str.length; index++) {
      switch (str.charCodeAt(index)) {
        case 34: // "
          escape = '"';
          break;
        case 38: // &
          escape = '&amp;';
          break;
        case 39: // '
          escape = '&#39;';
          break;
        case 60: // <
          escape = '&lt;';
          break;
        case 62: // >
          escape = '&gt;';
          break;
        default:
          continue;
      }

      if (lastIndex !== index) {
        html += str.substring(lastIndex, index);
      }

      lastIndex = index + 1;
      html += escape;
    }

    return lastIndex !== index ? html + str.substring(lastIndex, index) : html;
  }
}
customElements.define('cr-markdownish', CRMarkdownish);
