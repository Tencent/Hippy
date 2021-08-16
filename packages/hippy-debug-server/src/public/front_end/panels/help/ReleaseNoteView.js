// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Host from '../../core/host/host.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as UI from '../../ui/legacy/legacy.js';
import { latestReleaseNote, releaseNoteViewId } from './HelpImpl.js';
const UIStrings = {
    /**
    *@description Text that is usually a hyperlink to more documentation
    */
    learnMore: 'Learn more',
    /**
    *@description Text to close something
    */
    close: 'Close',
};
const str_ = i18n.i18n.registerUIStrings('panels/help/ReleaseNoteView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
let releaseNoteViewInstance;
export class ReleaseNoteView extends UI.Widget.VBox {
    _releaseNoteElement;
    constructor() {
        super(true);
        this.registerRequiredCSS('panels/help/releaseNote.css', { enableLegacyPatching: false });
        this._releaseNoteElement = this._createReleaseNoteElement(latestReleaseNote());
        const topSection = this.contentElement.createChild('div', 'release-note-top-section');
        topSection.textContent = latestReleaseNote().header;
        this.contentElement.appendChild(this._releaseNoteElement);
    }
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!releaseNoteViewInstance || forceNew) {
            releaseNoteViewInstance = new ReleaseNoteView();
        }
        return releaseNoteViewInstance;
    }
    elementsToRestoreScrollPositionsFor() {
        return [this._releaseNoteElement];
    }
    _createReleaseNoteElement(releaseNote) {
        const hbox = document.createElement('div');
        hbox.classList.add('hbox');
        const container = hbox.createChild('div', 'release-note-container');
        const contentContainer = container.createChild('ul');
        UI.ARIAUtils.setAccessibleName(contentContainer, latestReleaseNote().header);
        let linkNumber = 1;
        for (const highlight of releaseNote.highlights) {
            const listItem = contentContainer.createChild('li');
            const linkWrapper = UI.XLink.XLink.create(highlight.link, '', 'release-note-link');
            linkWrapper.textContent = '';
            UI.ARIAUtils.markAsLink(linkWrapper);
            UI.ARIAUtils.setAccessibleName(linkWrapper, `${highlight.title}: ${highlight.subtitle} ${linkNumber} of ${releaseNote.highlights.length}`);
            const title = linkWrapper.createChild('div', 'release-note-title');
            title.textContent = highlight.title;
            const subtitle = linkWrapper.createChild('div', 'release-note-subtitle');
            subtitle.textContent = highlight.subtitle;
            listItem.appendChild(linkWrapper);
            linkNumber++;
        }
        const actionContainer = container.createChild('div', 'release-note-action-container');
        const learnMore = UI.UIUtils.createTextButton(i18nString(UIStrings.learnMore), event => {
            event.consume(true);
            Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab(releaseNote.link);
        });
        UI.ARIAUtils.markAsLink(learnMore);
        actionContainer.appendChild(learnMore);
        actionContainer.appendChild(UI.UIUtils.createTextButton(i18nString(UIStrings.close), event => {
            event.consume(true);
            UI.InspectorView.InspectorView.instance().closeDrawerTab(releaseNoteViewId, true);
        }, 'close-release-note'));
        const imageLink = UI.XLink.XLink.create(releaseNote.link, ' ');
        imageLink.classList.add('release-note-image');
        UI.Tooltip.Tooltip.install(imageLink, latestReleaseNote().header);
        hbox.appendChild(imageLink);
        const image = imageLink.createChild('img');
        image.src = new URL('../../Images/whatsnew.avif', import.meta.url).toString();
        UI.Tooltip.Tooltip.install(image, UI.Tooltip.Tooltip.getContent(imageLink));
        image.alt = UI.Tooltip.Tooltip.getContent(image);
        return hbox;
    }
}
//# sourceMappingURL=ReleaseNoteView.js.map