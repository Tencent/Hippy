// Copyright 2021 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as FrontendHelpers from '../../../../../test/unittests/front_end/helpers/EnvironmentHelpers.js';
import * as ComponentHelpers from '../../helpers/helpers.js';
import * as MarkdownView from '../../markdown_view/markdown_view.js';
await ComponentHelpers.ComponentServerSetup.setup();
await FrontendHelpers.initializeGlobalVars();
// Adding a couple image keys to the image map.
MarkdownView.MarkdownImagesMap.markdownImages.set('test-icon', {
    src: '../../Images/issue-text-icon.svg',
    isIcon: true,
    width: '16px',
    height: '16px',
});
MarkdownView.MarkdownImagesMap.markdownImages.set('test-image', {
    src: '../../Images/lighthouse_logo.svg',
    width: '200px',
    height: '200px',
    isIcon: false,
});
const iconComponent = new MarkdownView.MarkdownImage.MarkdownImage();
document.getElementById('icon')?.appendChild(iconComponent);
iconComponent.data = {
    key: 'test-icon',
    title: 'Test icon title',
};
const imageComponent = new MarkdownView.MarkdownImage.MarkdownImage();
document.getElementById('image')?.appendChild(imageComponent);
imageComponent.data = {
    key: 'test-image',
    title: 'Test image title',
};
//# sourceMappingURL=basic.js.map