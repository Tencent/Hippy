// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as LitHtml from '../../../lit-html/lit-html.js';
import * as ComponentHelpers from '../../helpers/helpers.js';
import * as ReportView from '../../report_view/report_view.js';
await ComponentHelpers.ComponentServerSetup.setup();
const exampleRenderHelper = (key, value) => LitHtml.html `
          <${ReportView.ReportView.ReportKey.litTagName}>${key}</${ReportView.ReportView.ReportKey.litTagName}>
          <${ReportView.ReportView.ReportValue.litTagName}>${value}</${ReportView.ReportView.ReportValue.litTagName}>
        `;
const container = document.querySelector('#container');
if (!container) {
    throw new Error('Could not find container');
}
LitHtml.render(LitHtml.html `
        <style>
          .source-code {
            font-family: monospace;
          }
        </style>

        <${ReportView.ReportView.Report.litTagName} .data=${{
    reportTitle: 'Optional Title',
}}>
          <${ReportView.ReportView.ReportSectionHeader.litTagName}>Section 1</${ReportView.ReportView.ReportSectionHeader.litTagName}>
          <${ReportView.ReportView.ReportKey.litTagName}>Basic plain text field</${ReportView.ReportView.ReportKey.litTagName}>
          <${ReportView.ReportView.ReportValue.litTagName}>And this is the value</${ReportView.ReportView.ReportValue.litTagName}>
          <${ReportView.ReportView.ReportKey.litTagName}>A field with a code value</${ReportView.ReportView.ReportKey.litTagName}>
          <${ReportView.ReportView.ReportValue.litTagName} class="source-code">SomeCodeValue</${ReportView.ReportView.ReportValue.litTagName}>
          <${ReportView.ReportView.ReportSectionDivider.litTagName}></${ReportView.ReportView.ReportSectionDivider.litTagName}>
          <${ReportView.ReportView.ReportSectionHeader.litTagName}>Section 2</${ReportView.ReportView.ReportSectionHeader.litTagName}>
          ${exampleRenderHelper('Using a small helper', 'to render report rows')}
          ${exampleRenderHelper('This wide column defines the column width', 'for all rows')}
          <${ReportView.ReportView.ReportSectionDivider.litTagName}></${ReportView.ReportView.ReportSectionDivider.litTagName}>
        </${ReportView.ReportView.Report.litTagName}>
      `, container);
//# sourceMappingURL=basic.js.map