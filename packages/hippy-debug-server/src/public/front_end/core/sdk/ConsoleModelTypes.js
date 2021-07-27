// Copyright 2020 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// We need these enums here as enum values of enums defined in closure land
// are typed as string, and hence provide for weaker type-checking.
// eslint-disable-next-line rulesdir/const_enum
export var FrontendMessageType;
(function (FrontendMessageType) {
    FrontendMessageType["Result"] = "result";
    FrontendMessageType["Command"] = "command";
    FrontendMessageType["System"] = "system";
    FrontendMessageType["QueryObjectResult"] = "queryObjectResult";
})(FrontendMessageType || (FrontendMessageType = {}));
// eslint-disable-next-line rulesdir/const_enum
export var FrontendMessageSource;
(function (FrontendMessageSource) {
    FrontendMessageSource["CSS"] = "css";
    FrontendMessageSource["ConsoleAPI"] = "console-api";
})(FrontendMessageSource || (FrontendMessageSource = {}));
//# sourceMappingURL=ConsoleModelTypes.js.map