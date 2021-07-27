// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as FrontendHelpers from '../../../../../test/unittests/front_end/helpers/EnvironmentHelpers.js';
import * as ComponentHelpers from '../../helpers/helpers.js';
import * as MarkdownView from '../../markdown_view/markdown_view.js';
await ComponentHelpers.ComponentServerSetup.setup();
await FrontendHelpers.initializeGlobalVars();
MarkdownView.MarkdownLinksMap.markdownLinks.set('textLink', 'https://example.com/');
const link = new MarkdownView.MarkdownLink.MarkdownLink();
document.getElementById('target')?.appendChild(link);
link.data = {
    key: 'textLink',
    title: 'Test link title',
};
//# sourceMappingURL=basic.js.map