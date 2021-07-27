// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
import * as FrontendHelpers from '../../../../../test/unittests/front_end/helpers/EnvironmentHelpers.js';
import * as Common from '../../../../core/common/common.js';
import * as ComponentHelpers from '../../helpers/helpers.js';
import * as SurveyLink from '../../survey_link/survey_link.js';
await ComponentHelpers.ComponentServerSetup.setup();
await FrontendHelpers.initializeGlobalVars();
const link = new SurveyLink.SurveyLink.SurveyLink();
document.getElementById('container')?.appendChild(link);
// TODO(petermarshall): The icon doesn't render because importing sub-components cross-module
// is tricky. Add some more interesting examples once it does.
link.data = {
    trigger: 'test trigger',
    promptText: Common.UIString.LocalizedEmptyString,
    canShowSurvey: (trigger, callback) => {
        setTimeout(callback.bind(undefined, { canShowSurvey: true }), 500);
    },
    showSurvey: (trigger, callback) => {
        setTimeout(callback.bind(undefined, { surveyShown: true }), 1500);
    },
};
//# sourceMappingURL=basic.js.map