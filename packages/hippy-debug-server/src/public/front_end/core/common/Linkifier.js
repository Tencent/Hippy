// Copyright 2019 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
export class Linkifier {
    static linkify(object, options) {
        if (!object) {
            return Promise.reject(new Error('Can\'t linkify ' + object));
        }
        const linkifierRegistration = getApplicableRegisteredlinkifiers(object)[0];
        if (!linkifierRegistration) {
            return Promise.reject(new Error('No linkifiers registered for object ' + object));
        }
        return linkifierRegistration.loadLinkifier().then(linkifier => /** @type {!Linkifier} */ (linkifier).linkify(/** @type {!Object} */ (object), options));
    }
}
const registeredLinkifiers = [];
export function registerLinkifier(registration) {
    registeredLinkifiers.push(registration);
}
export function getApplicableRegisteredlinkifiers(object) {
    return registeredLinkifiers.filter(isLinkifierApplicableToContextTypes);
    function isLinkifierApplicableToContextTypes(linkifierRegistration) {
        if (!linkifierRegistration.contextTypes) {
            return true;
        }
        for (const contextType of linkifierRegistration.contextTypes()) {
            // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration
            // @ts-expect-error
            if (object instanceof contextType) {
                return true;
            }
        }
        return false;
    }
}
//# sourceMappingURL=Linkifier.js.map