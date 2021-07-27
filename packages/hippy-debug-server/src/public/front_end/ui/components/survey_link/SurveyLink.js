// Copyright (c) 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as Common from '../../../core/common/common.js';
import * as LitHtml from '../../lit-html/lit-html.js';
import * as i18n from '../../../core/i18n/i18n.js';
import * as ComponentHelpers from '../../components/helpers/helpers.js';
import * as IconButton from '../icon_button/icon_button.js';
const UIStrings = {
    /**
    *@description Text shown when the link to open a survey is clicked but the survey has not yet appeared
    */
    openingSurvey: 'Opening survey …',
    /**
    *@description Text displayed instead of the survey link after the survey link is clicked, if the survey was shown successfully
    */
    thankYouForYourFeedback: 'Thank you for your feedback',
    /**
    *@description Text displayed instead of the survey link after the survey link is clicked, if the survey was not shown successfully
    */
    anErrorOccurredWithTheSurvey: 'An error occurred with the survey',
};
const str_ = i18n.i18n.registerUIStrings('ui/components/survey_link/SurveyLink.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
// A link to a survey. The link is rendered aysnchronously because we need to first check if
// canShowSurvey succeeds.
export class SurveyLink extends HTMLElement {
    static litTagName = LitHtml.literal `devtools-survey-link`;
    shadow = this.attachShadow({ mode: 'open' });
    trigger = '';
    promptText = Common.UIString.LocalizedEmptyString;
    canShowSurvey = () => { };
    showSurvey = () => { };
    state = "Checking" /* Checking */;
    // Re-setting data will cause the state to go back to 'Checking' which hides the link.
    set data(data) {
        this.trigger = data.trigger;
        this.promptText = data.promptText;
        this.canShowSurvey = data.canShowSurvey;
        this.showSurvey = data.showSurvey;
        this.checkSurvey();
    }
    checkSurvey() {
        this.state = "Checking" /* Checking */;
        this.canShowSurvey(this.trigger, ({ canShowSurvey }) => {
            if (!canShowSurvey) {
                this.state = "DontShowLink" /* DontShowLink */;
            }
            else {
                this.state = "ShowLink" /* ShowLink */;
            }
            this.render();
        });
    }
    sendSurvey() {
        this.state = "Sending" /* Sending */;
        this.render();
        this.showSurvey(this.trigger, ({ surveyShown }) => {
            if (!surveyShown) {
                this.state = "Failed" /* Failed */;
            }
            else {
                this.state = "SurveyShown" /* SurveyShown */;
            }
            this.render();
        });
    }
    render() {
        if (this.state === "Checking" /* Checking */ || this.state === "DontShowLink" /* DontShowLink */) {
            return;
        }
        let linkText = this.promptText;
        if (this.state === "Sending" /* Sending */) {
            linkText = i18nString(UIStrings.openingSurvey);
        }
        else if (this.state === "SurveyShown" /* SurveyShown */) {
            linkText = i18nString(UIStrings.thankYouForYourFeedback);
        }
        else if (this.state === "Failed" /* Failed */) {
            linkText = i18nString(UIStrings.anErrorOccurredWithTheSurvey);
        }
        let linkState = '';
        if (this.state === "Sending" /* Sending */) {
            linkState = 'pending-link';
        }
        else if (this.state === "Failed" /* Failed */ || this.state === "SurveyShown" /* SurveyShown */) {
            linkState = 'disabled-link';
        }
        const ariaDisabled = this.state !== "ShowLink" /* ShowLink */;
        // clang-format off
        const output = LitHtml.html `
      <style>
        .link-icon {
          vertical-align: sub;
          margin-right: 0.5ch;
        }

        .link {
          padding: var(--issue-link-padding, 4px 0 0 0);
          text-decoration: var(--issue-link-text-decoration, underline);
          cursor: pointer;
          font-size: var(--issue-link-font-size, 14px);
          color: var(--color-link);
          border: none;
          background: none;
          font-family: inherit;
        }

        .link:focus:not(:focus-visible) {
          outline: none;
        }

        .pending-link {
          opacity: 75%;
          pointer-events: none;
          cursor: default;
          text-decoration: none;
        }

        .disabled-link {
          pointer-events: none;
          cursor: default;
          text-decoration: none;
        }
      </style>
      <button class="link ${linkState}" tabindex=${ariaDisabled ? '-1' : '0'} .disabled=${ariaDisabled} aria-disabled=${ariaDisabled} @click=${this.sendSurvey}>
        <${IconButton.Icon.Icon.litTagName} class="link-icon" .data=${{ iconName: 'feedback_thin_16x16_icon', color: 'var(--color-link)', width: 'var(--issue-link-icon-size, 16px)', height: 'var(--issue-link-icon-size, 16px)' }}></${IconButton.Icon.Icon.litTagName}><!--
      -->${linkText}
      </button>
    `;
        // clang-format on
        LitHtml.render(output, this.shadow, { host: this });
    }
}
ComponentHelpers.CustomElements.defineComponent('devtools-survey-link', SurveyLink);
//# sourceMappingURL=SurveyLink.js.map