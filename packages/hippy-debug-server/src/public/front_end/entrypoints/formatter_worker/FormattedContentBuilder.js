// Copyright 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
export class FormattedContentBuilder {
    indentString;
    lastOriginalPosition = 0;
    formattedContent = [];
    formattedContentLength = 0;
    lastFormattedPosition = 0;
    nestingLevel = 0;
    newLines = 0;
    enforceSpaceBetweenWords = true;
    softSpace = false;
    hardSpaces = 0;
    cachedIndents = new Map();
    mapping = { original: [0], formatted: [0] };
    constructor(indentString) {
        this.indentString = indentString;
    }
    setEnforceSpaceBetweenWords(value) {
        const oldValue = this.enforceSpaceBetweenWords;
        this.enforceSpaceBetweenWords = value;
        return oldValue;
    }
    addToken(token, offset) {
        const last = this.formattedContent[this.formattedContent.length - 1];
        if (this.enforceSpaceBetweenWords && last && /\w/.test(last[last.length - 1]) && /\w/.test(token)) {
            this.addSoftSpace();
        }
        this.appendFormatting();
        // Insert token.
        this.addMappingIfNeeded(offset);
        this.addText(token);
    }
    addSoftSpace() {
        if (!this.hardSpaces) {
            this.softSpace = true;
        }
    }
    addHardSpace() {
        this.softSpace = false;
        ++this.hardSpaces;
    }
    addNewLine(noSquash) {
        // Avoid leading newlines.
        if (!this.formattedContentLength) {
            return;
        }
        if (noSquash) {
            ++this.newLines;
        }
        else {
            this.newLines = this.newLines || 1;
        }
    }
    increaseNestingLevel() {
        this.nestingLevel += 1;
    }
    decreaseNestingLevel() {
        if (this.nestingLevel > 0) {
            this.nestingLevel -= 1;
        }
    }
    content() {
        return this.formattedContent.join('') + (this.newLines ? '\n' : '');
    }
    appendFormatting() {
        if (this.newLines) {
            for (let i = 0; i < this.newLines; ++i) {
                this.addText('\n');
            }
            this.addText(this.indent());
        }
        else if (this.softSpace) {
            this.addText(' ');
        }
        if (this.hardSpaces) {
            for (let i = 0; i < this.hardSpaces; ++i) {
                this.addText(' ');
            }
        }
        this.newLines = 0;
        this.softSpace = false;
        this.hardSpaces = 0;
    }
    indent() {
        const cachedValue = this.cachedIndents.get(this.nestingLevel);
        if (cachedValue) {
            return cachedValue;
        }
        let fullIndent = '';
        for (let i = 0; i < this.nestingLevel; ++i) {
            fullIndent += this.indentString;
        }
        // Cache a maximum of 20 nesting level indents.
        if (this.nestingLevel <= 20) {
            this.cachedIndents.set(this.nestingLevel, fullIndent);
        }
        return fullIndent;
    }
    addText(text) {
        this.formattedContent.push(text);
        this.formattedContentLength += text.length;
    }
    addMappingIfNeeded(originalPosition) {
        if (originalPosition - this.lastOriginalPosition === this.formattedContentLength - this.lastFormattedPosition) {
            return;
        }
        this.mapping.original.push(originalPosition);
        this.lastOriginalPosition = originalPosition;
        this.mapping.formatted.push(this.formattedContentLength);
        this.lastFormattedPosition = this.formattedContentLength;
    }
}
//# sourceMappingURL=FormattedContentBuilder.js.map