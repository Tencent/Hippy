// Copyright (c) 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as LitHtml from '../../../ui/lit-html/lit-html.js';
import * as ComponentHelpers from '../../../ui/components/helpers/helpers.js';
export class RecordingToggledEvent extends Event {
    data;
    constructor(isRecording) {
        super('recordingtoggled', {});
        this.data = isRecording;
    }
}
export class RecordingView extends HTMLElement {
    shadow = this.attachShadow({ mode: 'open' });
    userFlow = null;
    isRecording = false;
    set data(data) {
        this.userFlow = data.recording;
        this.isRecording = data.isRecording;
        this.render();
    }
    connectedCallback() {
        this.render();
    }
    scrollToBottom() {
        const wrapper = this.shadowRoot?.querySelector('.sections');
        if (!wrapper) {
            return;
        }
        wrapper.scrollTop = wrapper.scrollHeight;
    }
    handleToggleRecording() {
        this.dispatchEvent(new RecordingToggledEvent(!this.isRecording));
    }
    render() {
        if (!this.userFlow) {
            return;
        }
        const { title, sections } = this.userFlow;
        // clang-format off
        LitHtml.render(LitHtml.html `
      <style>
        .wrapper {
          height: 100%;
          overflow: scroll;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }

        .sections {
          flex: 1;
          min-height: 0;
          overflow: scroll;
        }

        .section {
          display: flex;
          border-bottom: 1px solid var(--color-details-hairline);
          padding: 16px 32px;
        }

        .section:last-child {
          border-bottom: none;
        }

        .screenshot-wrapper {
          max-width: 80px;
          margin-right: 16px;
        }

        .screenshot {
          object-fit: cover;
          object-position: top center;
          max-width: 100%;
          height: auto;
        }

        .steps {
          flex: 1;
          position: relative;
          align-self: flex-start;
        }

        .steps::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          width: 16px;
          background: var(--color-background-elevation-1);
          border-radius: 8px;
        }

        .steps::after {
          content: '';
          position: absolute;
          top: 0;
          left: 8px;
          width: 2px;
          background: var(--color-primary);
          bottom: 0;
          display: block;
          transform: translateX(-50%);
        }

        .section:not(:first-child) .steps::before {
          top: -64px;
        }

        .section:not(:first-child) .steps::after {
          top: -64px;
        }

        .step {
          position: relative;
          padding-left: 32px;
          margin: 16px 0;
        }

        .step .action {
          font-size: 13px;
          line-height: 16px;
          letter-spacing: 0.03em;
        }

        .step::before {
          content: '';
          width: 8px;
          height: 8px;
          border: 2px solid var(--color-background);
          border-radius: 50%;
          display: block;
          position: absolute;
          top: 50%;
          left: 8px;
          background: var(--color-primary);
          transform: translate(-50%, -50%);
          z-index: 1;
        }

        .title {
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: var(--color-text-primary);
          letter-spacing: 0.03em;
          font-weight: bold;
          margin-top: 0;
        }

        .title .fallback {
          color: var(--color-text-secondary);
        }

        .title::before {
          width: 12px;
          height: 12px;
          border: 2px solid var(--color-primary);
          background: var(--color-background);
          top: 0;
          transform: translate(-50%, 0);
        }

        .recording {
          color: var(--color-primary);
          font-style: italic;
          margin-bottom: 0;
        }

        .recording::before {
          width: 12px;
          height: 12px;
          border: 2px solid var(--color-background);
          background: var(--color-background);
          bottom: 0;
          top: unset;
          transform: translate(-50%, 0);
        }

        .recording::after {
          content: '';
          border-radius: 50%;
          display: block;
          position: absolute;
          left: 8px;
          z-index: 1;
          width: 8px;
          height: 8px;
          background: var(--color-background);
          border: 2px solid var(--color-primary);
          border-top-color: transparent;
          bottom: 0;
          transform: translate(-50%, -2px);
          animation: rotate 1s infinite;
        }

        @keyframes rotate {
          from { transform: translate(-50%, -2px) rotate(0deg); }
          to { transform: translate(-50%, -2px) rotate(360deg); }
        }

        .details {
          max-width: 240px;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .url {
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: var(--color-text-secondary);
          max-width: 100%;
        }

        .header {
          padding: 16px 32px;
        }

        .header-title {
          font-size: 18px;
          line-height: 16px;
          letter-spacing: 0.02em;
        }

        .is-recording .header-title::before {
          content: '';
          width: 12px;
          height: 12px;
          display: inline-block;
          background: var(--color-red);
          border-radius: 50%;
          margin-right: 7px;
        }

        .footer {
          display: flex;
          justify-content: center;
          border-top: 1px solid var(--color-details-hairline);
          padding: 16px 32px;
          background: var(--color-background);
        }

        .control {
          background: none;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        }

        .icon {
          display: block;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--color-red);
          margin-bottom: 8px;
          position: relative;
          transition: background 200ms;
        }

        .icon::before {
          content: '';
          display: block;
          width: 14px;
          height: 14px;
          border: 1px solid var(--color-background);
          border-radius: 3px;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .icon:hover {
          background: var(--color-accent-red);
        }

        .icon:active {
          background: var(--color-red);
        }

        .label {
          font-size: 12px;
          line-height: 16px;
          text-align: center;
          letter-spacing: 0.02em;
          color: var(--color-text-primary);
        }

        .shortcut {
          font-size: 12px;
          line-height: 16px;
          text-align: center;
          letter-spacing: 0.02em;
          color: var(--color-text-secondary);
        }
      </style>
      <div class="wrapper ${this.isRecording ? 'is-recording' : null}">
        <div class="header">
          <div class="header-title">${title}</div>
        </div>
        <div class="sections">
        ${sections.map((section, i) => LitHtml.html `
        <div class="section">
          <div class="screenshot-wrapper">
            <img class="screenshot" width="200" height="120" src="${section.screenshot}" />
          </div>
          <div class="steps">
            <div class="step title">${section.title
            ? section.title
            : LitHtml.html `<span class="fallback">(No Title)</span>`}
            </div>
            ${section.steps.map(step => LitHtml.html `
              <div class="step">
                <div class="action">${step.type}</div>
                ${'selector' in step ? LitHtml.html `<div class="selector">${step.selector}</div>` : null}
              </div>
            `)}
            ${this.isRecording && i === sections.length - 1 ? LitHtml.html `<div class="step recording">Recording ...</div>` : null}
          </div>
          <div class="details">
            <div class="url">${section.url}</div>
          </div>
        </div>
        `)}
        </div>
        <div class="footer">
          <div class="controls">
            <button class="control" @click=${this.handleToggleRecording.bind(this)}>
              <div class="icon"></div>
              <div class="label">${this.isRecording ? 'End recording' : 'Start recording'}</div>
              <!-- <div class="shortcut">Ctrl + E</div> -->
            </button>
          </div>
        </div>
      </div>
    `, this.shadow);
        // clang-format off
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-recording-view', RecordingView);
//# sourceMappingURL=RecordingView.js.map