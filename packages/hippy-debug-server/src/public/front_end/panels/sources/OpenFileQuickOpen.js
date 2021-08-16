// Copyright 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as Host from '../../core/host/host.js';
import { FilteredUISourceCodeListProvider } from './FilteredUISourceCodeListProvider.js';
import { SourcesView } from './SourcesView.js';
let openFileQuickOpenInstance;
export class OpenFileQuickOpen extends FilteredUISourceCodeListProvider {
    static instance(opts = { forceNew: null }) {
        const { forceNew } = opts;
        if (!openFileQuickOpenInstance || forceNew) {
            openFileQuickOpenInstance = new OpenFileQuickOpen();
        }
        return openFileQuickOpenInstance;
    }
    attach() {
        this.setDefaultScores(SourcesView.defaultUISourceCodeScores());
        super.attach();
    }
    uiSourceCodeSelected(uiSourceCode, lineNumber, columnNumber) {
        Host.userMetrics.actionTaken(Host.UserMetrics.Action.SelectFileFromFilePicker);
        if (!uiSourceCode) {
            return;
        }
        if (typeof lineNumber === 'number') {
            Common.Revealer.reveal(uiSourceCode.uiLocation(lineNumber, columnNumber));
        }
        else {
            Common.Revealer.reveal(uiSourceCode);
        }
    }
    filterProject(project) {
        return !project.isServiceProject();
    }
    renderAsTwoRows() {
        return true;
    }
}
//# sourceMappingURL=OpenFileQuickOpen.js.map