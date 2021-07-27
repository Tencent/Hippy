// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// @ts-nocheck
import * as FormatterModule from './formatter.js';
self.Formatter = self.Formatter || {};
Formatter = Formatter || {};
/** @constructor */
Formatter.FormatterWorkerPool = FormatterModule.FormatterWorkerPool.FormatterWorkerPool;
Formatter.formatterWorkerPool = FormatterModule.FormatterWorkerPool.formatterWorkerPool;
/** @interface */
Formatter.Formatter = FormatterModule.ScriptFormatter.FormatterInterface;
/** @constructor */
Formatter.ScriptFormatter = FormatterModule.ScriptFormatter.ScriptFormatter;
/** @interface */
Formatter.FormatterSourceMapping = FormatterModule.ScriptFormatter.FormatterSourceMapping;
/** @constructor */
Formatter.SourceFormatter = FormatterModule.SourceFormatter.SourceFormatter;
//# sourceMappingURL=formatter-legacy.js.map