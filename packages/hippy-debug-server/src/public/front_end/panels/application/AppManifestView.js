// Copyright (c) 2016 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/* eslint-disable rulesdir/no_underscored_properties */
import * as Common from '../../core/common/common.js';
import * as i18n from '../../core/i18n/i18n.js';
import * as SDK from '../../core/sdk/sdk.js';
import * as InlineEditor from '../../ui/legacy/components/inline_editor/inline_editor.js';
import * as Components from '../../ui/legacy/components/utils/utils.js';
import * as UI from '../../ui/legacy/legacy.js';
const UIStrings = {
    /**
    *@description Text in App Manifest View of the Application panel
    */
    noManifestDetected: 'No manifest detected',
    /**
    *@description Text in App Manifest View of the Application panel
    */
    appManifest: 'App Manifest',
    /**
    *@description Text in App Manifest View of the Application panel
    */
    errorsAndWarnings: 'Errors and warnings',
    /**
    *@description Text in App Manifest View of the Application panel
    */
    installability: 'Installability',
    /**
    *@description Text in App Manifest View of the Application panel
    */
    identity: 'Identity',
    /**
    *@description Text in App Manifest View of the Application panel
    */
    presentation: 'Presentation',
    /**
    *@description Text in App Manifest View of the Application panel
    */
    icons: 'Icons',
    /**
    *@description Text for the name of something
    */
    name: 'Name',
    /**
    *@description Text in App Manifest View of the Application panel
    */
    shortName: 'Short name',
    /**
    *@description Text for the description of something
    */
    description: 'Description',
    /**
    *@description Text in App Manifest View of the Application panel
    */
    startUrl: 'Start URL',
    /**
    *@description Text in App Manifest View of the Application panel
    */
    themeColor: 'Theme color',
    /**
    *@description Text in App Manifest View of the Application panel
    */
    backgroundColor: 'Background color',
    /**
    *@description Text for the orientation of something
    */
    orientation: 'Orientation',
    /**
    *@description Title of the display attribute in App Manifest View of the Application panel
    * The display attribute defines the preferred display mode for the app such fullscreen or
    * standalone.
    * For more details see https://www.w3.org/TR/appmanifest/#display-member.
    */
    display: 'Display',
    /**
    *@description Text in App Manifest View of the Application panel
    */
    descriptionMayBeTruncated: 'Description may be truncated.',
    /**
    *@description Text in App Manifest View of the Application panel
    */
    showOnlyTheMinimumSafeAreaFor: 'Show only the minimum safe area for maskable icons',
    /**
    *@description Link text for more information on maskable icons in App Manifest view of the Application panel
    */
    documentationOnMaskableIcons: 'documentation on maskable icons',
    /**
    *@description Text wrapping a link pointing to more information on maskable icons in App Manifest view of the Application panel
    *@example {https://web.dev/maskable-icon/} PH1
    */
    needHelpReadOurS: 'Need help? Read {PH1}.',
    /**
    *@description Label for the primary icon loaded from the manifest
    *@example {https://example.com/} PH1
    */
    primaryManifestIconFromS: 'Primary manifest icon from {PH1}',
    /**
    *@description Label for the primary icon loaded from the manifest
    */
    primaryIconasUsedByChrome: 'Primary icon as used by `Chrome`',
    /**
    *@description Text in App Manifest View of the Application panel
    *@example {1} PH1
    */
    shortcutS: 'Shortcut #{PH1}',
    /**
    *@description Text in App Manifest View of the Application panel
    *@example {1} PH1
    */
    shortcutSShouldIncludeAXPixel: 'Shortcut #{PH1} should include a 96x96 pixel icon',
    /**
    *@description Text in App Manifest View of the Application panel
    *@example {1} PH1
    */
    screenshotS: 'Screenshot #{PH1}',
    /**
    *@description Manifest installability error in the Application panel
    */
    pageIsNotLoadedInTheMainFrame: 'Page is not loaded in the main frame',
    /**
    *@description Manifest installability error in the Application panel
    */
    pageIsNotServedFromASecureOrigin: 'Page is not served from a secure origin',
    /**
    *@description Manifest installability error in the Application panel
    */
    pageHasNoManifestLinkUrl: 'Page has no manifest <link> `URL`',
    /**
    *@description Manifest installability error in the Application panel
    */
    manifestCouldNotBeFetchedIsEmpty: 'Manifest could not be fetched, is empty, or could not be parsed',
    /**
    *@description Manifest installability error in the Application panel
    */
    manifestStartUrlIsNotValid: 'Manifest start `URL` is not valid',
    /**
    *@description Manifest installability error in the Application panel
    */
    manifestDoesNotContainANameOr: 'Manifest does not contain a \'`name`\' or \'`short_name`\' field',
    /**
    *@description Manifest installability error in the Application panel
    */
    manifestDisplayPropertyMustBeOne: 'Manifest \'`display`\' property must be one of \'`standalone`\', \'`fullscreen`\', or \'`minimal-ui`\'',
    /**
    *@description Manifest installability error in the Application panel
    *@example {100} PH1
    */
    manifestDoesNotContainASuitable: 'Manifest does not contain a suitable icon - PNG, SVG or WebP format of at least {PH1}px is required, the `sizes` attribute must be set, and the `purpose` attribute, if set, must include `"any"` and should not include `"maskable"`.',
    /**
    *@description Manifest installability error in the Application panel
    */
    noMatchingServiceWorkerDetected: 'No matching `service worker` detected. You may need to reload the page, or check that the scope of the `service worker` for the current page encloses the scope and start URL from the manifest.',
    /**
    *@description Manifest installability error in the Application panel
    *@example {100} PH1
    */
    noSuppliedIconIsAtLeastSpxSquare: 'No supplied icon is at least {PH1} pixels square in `PNG`, `SVG` or `WebP` format, with the purpose attribute unset or set to `"any"`.',
    /**
    *@description Manifest installability error in the Application panel
    */
    couldNotDownloadARequiredIcon: 'Could not download a required icon from the manifest',
    /**
    *@description Manifest installability error in the Application panel
    */
    downloadedIconWasEmptyOr: 'Downloaded icon was empty or corrupted',
    /**
    *@description Manifest installability error in the Application panel
    */
    theSpecifiedApplicationPlatform: 'The specified application platform is not supported on `Android`',
    /**
    *@description Manifest installability error in the Application panel
    */
    noPlayStoreIdProvided: 'No Play store ID provided',
    /**
    *@description Manifest installability error in the Application panel
    */
    thePlayStoreAppUrlAndPlayStoreId: 'The Play Store app URL and Play Store ID do not match',
    /**
    *@description Manifest installability error in the Application panel
    */
    theAppIsAlreadyInstalled: 'The app is already installed',
    /**
    *@description Manifest installability error in the Application panel
    */
    aUrlInTheManifestContainsA: 'A URL in the manifest contains a username, password, or port',
    /**
    *@description Manifest installability error in the Application panel
    */
    pageIsLoadedInAnIncognitoWindow: 'Page is loaded in an incognito window',
    /**
    *@description Manifest installability error in the Application panel
    */
    pageDoesNotWorkOffline: 'Page does not work offline',
    /**
    *@description Manifest installability error in the Application panel
    */
    couldNotCheckServiceWorker: 'Could not check `service worker` without a \'`start_url`\' field in the manifest',
    /**
    *@description Manifest installability error in the Application panel
    */
    manifestSpecifies: 'Manifest specifies `prefer_related_applications`: true',
    /**
    *@description Manifest installability error in the Application panel
    */
    preferrelatedapplicationsIsOnly: '`prefer_related_applications` is only supported on `Chrome` Beta and Stable channels on `Android`.',
    /**
    *@description Manifest installability error in the Application panel
    */
    manifestContainsDisplayoverride: 'Manifest contains \'`display_override`\' field, and the first supported display mode must be one of \'`standalone`\', \'`fullscreen`\', or \'`minimal-ui`\'',
    /**
    *@description Warning message for offline capability check
    *@example {https://developer.chrome.com/blog/improved-pwa-offline-detection} PH1
    */
    pageDoesNotWorkOfflineThePage: 'Page does not work offline. Starting in Chrome 93, the installability criteria are changing, and this site will not be installable. See {PH1} for more information.',
    /**
    *@description Text to indicate the source of an image
    *@example {example.com} PH1
    */
    imageFromS: 'Image from {PH1}',
    /**
    *@description Text for one or a group of screenshots
    */
    screenshot: 'Screenshot',
    /**
    *@description Text in App Manifest View of the Application panel
    */
    icon: 'Icon',
    /**
    * @description This is a warning message telling the user about a problem where the src attribute
    * of an image has not be entered/provided correctly. 'src' is part of the DOM API and should not
    * be translated.
    * @example {ImageName} PH1
    */
    sSrcIsNotSet: '{PH1} `src` is not set',
    /**
    *@description Warning message for image resources from the manifest
    *@example {Image} PH1
    *@example {https://example.com/image.png} PH2
    */
    sUrlSFailedToParse: '{PH1} URL \'{PH2}\' failed to parse',
    /**
    *@description Warning message for image resources from the manifest
    *@example {Image} PH1
    *@example {https://example.com/image.png} PH2
    */
    sSFailedToLoad: '{PH1} {PH2} failed to load',
    /**
    *@description Warning message for image resources from the manifest
    *@example {Image} PH1
    *@example {https://example.com/image.png} PH2
    */
    sSDoesNotSpecifyItsSizeInThe: '{PH1} {PH2} does not specify its size in the manifest',
    /**
    *@description Warning message for image resources from the manifest
    *@example {Image} PH1
    *@example {https://example.com/image.png} PH2
    */
    sSShouldSpecifyItsSizeAs: '{PH1} {PH2} should specify its size as `{width}x{height}`',
    /**
    *@description Warning message for image resources from the manifest
    */
    sSShouldHaveSquareIcon: 'Most operating systems require square icons. Please include at least one square icon in the array.',
    /**
    *@description Warning message for image resources from the manifest
    *@example {100} PH1
    *@example {100} PH2
    *@example {Image} PH3
    *@example {https://example.com/image.png} PH4
    *@example {200} PH5
    *@example {200} PH6
    */
    actualSizeSspxOfSSDoesNotMatch: 'Actual size ({PH1}×{PH2})px of {PH3} {PH4} does not match specified size ({PH5}×{PH6}px)',
    /**
    *@description Warning message for image resources from the manifest
    *@example {100} PH1
    *@example {Image} PH2
    *@example {https://example.com/image.png} PH3
    *@example {200} PH4
    */
    actualWidthSpxOfSSDoesNotMatch: 'Actual width ({PH1}px) of {PH2} {PH3} does not match specified width ({PH4}px)',
    /**
    *@description Warning message for image resources from the manifest
    *@example {100} PH1
    *@example {Image} PH2
    *@example {https://example.com/image.png} PH3
    *@example {100} PH4
    */
    actualHeightSpxOfSSDoesNotMatch: 'Actual height ({PH1}px) of {PH2} {PH3} does not match specified height ({PH4}px)',
    /**
    *@description Warning message for image resources from the manifest
    *@example {Image} PH1
    *@example {https://example.com/image.png} PH2
    */
    sSSizeShouldBeAtLeast320: '{PH1} {PH2} size should be at least 320×320',
    /**
    *@description Warning message for image resources from the manifest
    *@example {Image} PH1
    *@example {https://example.com/image.png} PH2
    */
    sSSizeShouldBeAtMost3840: '{PH1} {PH2} size should be at most 3840×3840',
    /**
    *@description Warning message for image resources from the manifest
    *@example {Image} PH1
    *@example {https://example.com/image.png} PH2
    */
    sSWidthDoesNotComplyWithRatioRequirement: '{PH1} {PH2} width can\'t be more than 2.3 times as long as the height',
    /**
    *@description Warning message for image resources from the manifest
    *@example {Image} PH1
    *@example {https://example.com/image.png} PH2
    */
    sSHeightDoesNotComplyWithRatioRequirement: '{PH1} {PH2} height can\'t be more than 2.3 times as long as the width',
};
const str_ = i18n.i18n.registerUIStrings('panels/application/AppManifestView.ts', UIStrings);
const i18nString = i18n.i18n.getLocalizedString.bind(undefined, str_);
export class AppManifestView extends UI.Widget.VBox {
    _emptyView;
    _reportView;
    _errorsSection;
    _installabilitySection;
    _identitySection;
    _presentationSection;
    _iconsSection;
    _shortcutSections;
    _screenshotsSections;
    _nameField;
    _shortNameField;
    _descriptionField;
    _startURLField;
    _themeColorSwatch;
    _backgroundColorSwatch;
    _orientationField;
    _displayField;
    _throttler;
    _registeredListeners;
    _target;
    _resourceTreeModel;
    _serviceWorkerManager;
    constructor() {
        super(true);
        this.registerRequiredCSS('panels/application/appManifestView.css', { enableLegacyPatching: false });
        this.contentElement.classList.add('manifest-container');
        Common.Settings.Settings.instance()
            .moduleSetting('colorFormat')
            .addChangeListener(this._updateManifest.bind(this, true));
        this._emptyView = new UI.EmptyWidget.EmptyWidget(i18nString(UIStrings.noManifestDetected));
        this._emptyView.appendLink('https://web.dev/add-manifest/');
        this._emptyView.show(this.contentElement);
        this._emptyView.hideWidget();
        // TODO(crbug.com/1156978): Replace UI.ReportView.ReportView with ReportView.ts web component.
        this._reportView = new UI.ReportView.ReportView(i18nString(UIStrings.appManifest));
        this._reportView.registerRequiredCSS('panels/application/appManifestView.css', { enableLegacyPatching: false });
        this._reportView.element.classList.add('manifest-view-header');
        this._reportView.show(this.contentElement);
        this._reportView.hideWidget();
        this._errorsSection = this._reportView.appendSection(i18nString(UIStrings.errorsAndWarnings));
        this._installabilitySection = this._reportView.appendSection(i18nString(UIStrings.installability));
        this._identitySection = this._reportView.appendSection(i18nString(UIStrings.identity));
        this._presentationSection = this._reportView.appendSection(i18nString(UIStrings.presentation));
        this._iconsSection = this._reportView.appendSection(i18nString(UIStrings.icons), 'report-section-icons');
        this._shortcutSections = [];
        this._screenshotsSections = [];
        this._nameField = this._identitySection.appendField(i18nString(UIStrings.name));
        this._shortNameField = this._identitySection.appendField(i18nString(UIStrings.shortName));
        this._descriptionField = this._identitySection.appendFlexedField(i18nString(UIStrings.description));
        this._startURLField = this._presentationSection.appendField(i18nString(UIStrings.startUrl));
        const themeColorField = this._presentationSection.appendField(i18nString(UIStrings.themeColor));
        this._themeColorSwatch = new InlineEditor.ColorSwatch.ColorSwatch();
        themeColorField.appendChild(this._themeColorSwatch);
        const backgroundColorField = this._presentationSection.appendField(i18nString(UIStrings.backgroundColor));
        this._backgroundColorSwatch = new InlineEditor.ColorSwatch.ColorSwatch();
        backgroundColorField.appendChild(this._backgroundColorSwatch);
        this._orientationField = this._presentationSection.appendField(i18nString(UIStrings.orientation));
        this._displayField = this._presentationSection.appendField(i18nString(UIStrings.display));
        this._throttler = new Common.Throttler.Throttler(1000);
        SDK.TargetManager.TargetManager.instance().observeTargets(this);
        this._registeredListeners = [];
    }
    targetAdded(target) {
        if (this._target) {
            return;
        }
        this._target = target;
        this._resourceTreeModel = target.model(SDK.ResourceTreeModel.ResourceTreeModel);
        this._serviceWorkerManager = target.model(SDK.ServiceWorkerManager.ServiceWorkerManager);
        if (!this._resourceTreeModel || !this._serviceWorkerManager) {
            return;
        }
        this._updateManifest(true);
        this._registeredListeners = [
            this._resourceTreeModel.addEventListener(SDK.ResourceTreeModel.Events.DOMContentLoaded, _event => {
                this._updateManifest(true);
            }),
            this._serviceWorkerManager.addEventListener(SDK.ServiceWorkerManager.Events.RegistrationUpdated, _event => {
                this._updateManifest(false);
            }),
        ];
    }
    targetRemoved(target) {
        if (this._target !== target) {
            return;
        }
        if (!this._resourceTreeModel || !this._serviceWorkerManager) {
            return;
        }
        delete this._resourceTreeModel;
        delete this._serviceWorkerManager;
        Common.EventTarget.EventTarget.removeEventListeners(this._registeredListeners);
    }
    async _updateManifest(immediately) {
        if (!this._resourceTreeModel) {
            return;
        }
        const { url, data, errors } = await this._resourceTreeModel.fetchAppManifest();
        const installabilityErrors = await this._resourceTreeModel.getInstallabilityErrors();
        const manifestIcons = await this._resourceTreeModel.getManifestIcons();
        this._throttler.schedule(() => this._renderManifest(url, data, errors, installabilityErrors, manifestIcons), immediately);
    }
    async _renderManifest(url, data, errors, installabilityErrors, manifestIcons) {
        if (!data && !errors.length) {
            this._emptyView.showWidget();
            this._reportView.hideWidget();
            return;
        }
        this._emptyView.hideWidget();
        this._reportView.showWidget();
        const link = Components.Linkifier.Linkifier.linkifyURL(url);
        link.tabIndex = 0;
        this._reportView.setURL(link);
        this._errorsSection.clearContent();
        this._errorsSection.element.classList.toggle('hidden', !errors.length);
        for (const error of errors) {
            this._errorsSection.appendRow().appendChild(UI.UIUtils.createIconLabel(error.message, error.critical ? 'smallicon-error' : 'smallicon-warning'));
        }
        if (!data) {
            return;
        }
        if (data.charCodeAt(0) === 0xFEFF) {
            data = data.slice(1);
        } // Trim the BOM as per https://tools.ietf.org/html/rfc7159#section-8.1.
        const parsedManifest = JSON.parse(data);
        this._nameField.textContent = stringProperty('name');
        this._shortNameField.textContent = stringProperty('short_name');
        const warnings = [];
        const description = stringProperty('description');
        this._descriptionField.textContent = description;
        if (description.length > 324) {
            warnings.push(i18nString(UIStrings.descriptionMayBeTruncated));
        }
        this._startURLField.removeChildren();
        const startURL = stringProperty('start_url');
        if (startURL) {
            const completeURL = Common.ParsedURL.ParsedURL.completeURL(url, startURL);
            const link = Components.Linkifier.Linkifier.linkifyURL(completeURL, { text: startURL });
            link.tabIndex = 0;
            this._startURLField.appendChild(link);
        }
        this._themeColorSwatch.classList.toggle('hidden', !stringProperty('theme_color'));
        const themeColor = Common.Color.Color.parse(stringProperty('theme_color') || 'white') || Common.Color.Color.parse('white');
        if (themeColor) {
            this._themeColorSwatch.renderColor(themeColor, true);
        }
        this._backgroundColorSwatch.classList.toggle('hidden', !stringProperty('background_color'));
        const backgroundColor = Common.Color.Color.parse(stringProperty('background_color') || 'white') || Common.Color.Color.parse('white');
        if (backgroundColor) {
            this._backgroundColorSwatch.renderColor(backgroundColor, true);
        }
        this._orientationField.textContent = stringProperty('orientation');
        const displayType = stringProperty('display');
        this._displayField.textContent = displayType;
        const icons = parsedManifest['icons'] || [];
        this._iconsSection.clearContent();
        const shortcuts = parsedManifest['shortcuts'] || [];
        for (const shortcutsSection of this._shortcutSections) {
            shortcutsSection.detach(/** overrideHideOnDetach= */ true);
        }
        const screenshots = parsedManifest['screenshots'] || [];
        for (const screenshotSection of this._screenshotsSections) {
            screenshotSection.detach(/** overrideHideOnDetach= */ true);
        }
        const imageErrors = [];
        const setIconMaskedCheckbox = UI.UIUtils.CheckboxLabel.create(i18nString(UIStrings.showOnlyTheMinimumSafeAreaFor));
        setIconMaskedCheckbox.classList.add('mask-checkbox');
        setIconMaskedCheckbox.addEventListener('click', () => {
            this._iconsSection.setIconMasked(setIconMaskedCheckbox.checkboxElement.checked);
        });
        this._iconsSection.appendRow().appendChild(setIconMaskedCheckbox);
        const documentationLink = UI.XLink.XLink.create('https://web.dev/maskable-icon/', i18nString(UIStrings.documentationOnMaskableIcons));
        this._iconsSection.appendRow().appendChild(i18n.i18n.getFormatLocalizedString(str_, UIStrings.needHelpReadOurS, { PH1: documentationLink }));
        if (manifestIcons && manifestIcons.primaryIcon) {
            const wrapper = document.createElement('div');
            wrapper.classList.add('image-wrapper');
            const image = document.createElement('img');
            image.style.maxWidth = '200px';
            image.style.maxHeight = '200px';
            image.src = 'data:image/png;base64,' + manifestIcons.primaryIcon;
            image.alt = i18nString(UIStrings.primaryManifestIconFromS, { PH1: url });
            const title = i18nString(UIStrings.primaryIconasUsedByChrome);
            const field = this._iconsSection.appendFlexedField(title);
            wrapper.appendChild(image);
            field.appendChild(wrapper);
        }
        let hasSquareIcon = false;
        for (const icon of icons) {
            const iconErrors = await this._appendImageResourceToSection(url, icon, this._iconsSection, /** isScreenshot= */ false);
            imageErrors.push(...iconErrors);
            if (!hasSquareIcon) {
                const [width, height] = icon.sizes.split('x').map((x) => parseInt(x, 10));
                hasSquareIcon = width === height;
            }
        }
        if (!hasSquareIcon) {
            imageErrors.push(i18nString(UIStrings.sSShouldHaveSquareIcon));
        }
        let shortcutIndex = 1;
        for (const shortcut of shortcuts) {
            const shortcutSection = this._reportView.appendSection(i18nString(UIStrings.shortcutS, { PH1: shortcutIndex }));
            this._shortcutSections.push(shortcutSection);
            shortcutSection.appendFlexedField('Name', shortcut.name);
            if (shortcut.short_name) {
                shortcutSection.appendFlexedField('Short name', shortcut.short_name);
            }
            if (shortcut.description) {
                shortcutSection.appendFlexedField('Description', shortcut.description);
            }
            const urlField = shortcutSection.appendFlexedField('URL');
            const shortcutUrl = Common.ParsedURL.ParsedURL.completeURL(url, shortcut.url);
            const link = Components.Linkifier.Linkifier.linkifyURL(shortcutUrl, { text: shortcut.url });
            link.tabIndex = 0;
            urlField.appendChild(link);
            const shortcutIcons = shortcut.icons || [];
            let hasShorcutIconLargeEnough = false;
            for (const shortcutIcon of shortcutIcons) {
                const shortcutIconErrors = await this._appendImageResourceToSection(url, shortcutIcon, shortcutSection, /** isScreenshot= */ false);
                imageErrors.push(...shortcutIconErrors);
                if (!hasShorcutIconLargeEnough && shortcutIcon.sizes) {
                    const shortcutIconSize = shortcutIcon.sizes.match(/^(\d+)x(\d+)$/);
                    if (shortcutIconSize && shortcutIconSize[1] >= 96 && shortcutIconSize[2] >= 96) {
                        hasShorcutIconLargeEnough = true;
                    }
                }
            }
            if (!hasShorcutIconLargeEnough) {
                imageErrors.push(i18nString(UIStrings.shortcutSShouldIncludeAXPixel, { PH1: shortcutIndex }));
            }
            shortcutIndex++;
        }
        let screenshotIndex = 1;
        for (const screenshot of screenshots) {
            const screenshotSection = this._reportView.appendSection(i18nString(UIStrings.screenshotS, { PH1: screenshotIndex }));
            this._screenshotsSections.push(screenshotSection);
            const screenshotErrors = await this._appendImageResourceToSection(url, screenshot, screenshotSection, /** isScreenshot= */ true);
            imageErrors.push(...screenshotErrors);
            screenshotIndex++;
        }
        this._installabilitySection.clearContent();
        this._installabilitySection.element.classList.toggle('hidden', !installabilityErrors.length);
        const errorMessages = this.getInstallabilityErrorMessages(installabilityErrors);
        for (const error of errorMessages) {
            this._installabilitySection.appendRow().appendChild(UI.UIUtils.createIconLabel(error, 'smallicon-warning'));
        }
        this._errorsSection.element.classList.toggle('hidden', !errors.length && !imageErrors.length && !warnings.length);
        for (const warning of warnings) {
            this._errorsSection.appendRow().appendChild(UI.UIUtils.createIconLabel(warning, 'smallicon-warning'));
        }
        for (const error of imageErrors) {
            this._errorsSection.appendRow().appendChild(UI.UIUtils.createIconLabel(error, 'smallicon-warning'));
        }
        function stringProperty(name) {
            const value = parsedManifest[name];
            if (typeof value !== 'string') {
                return '';
            }
            return value;
        }
    }
    getInstallabilityErrorMessages(installabilityErrors) {
        const errorMessages = [];
        for (const installabilityError of installabilityErrors) {
            let errorMessage;
            switch (installabilityError.errorId) {
                case 'not-in-main-frame':
                    errorMessage = i18nString(UIStrings.pageIsNotLoadedInTheMainFrame);
                    break;
                case 'not-from-secure-origin':
                    errorMessage = i18nString(UIStrings.pageIsNotServedFromASecureOrigin);
                    break;
                case 'no-manifest':
                    errorMessage = i18nString(UIStrings.pageHasNoManifestLinkUrl);
                    break;
                case 'manifest-empty':
                    errorMessage = i18nString(UIStrings.manifestCouldNotBeFetchedIsEmpty);
                    break;
                case 'start-url-not-valid':
                    errorMessage = i18nString(UIStrings.manifestStartUrlIsNotValid);
                    break;
                case 'manifest-missing-name-or-short-name':
                    errorMessage = i18nString(UIStrings.manifestDoesNotContainANameOr);
                    break;
                case 'manifest-display-not-supported':
                    errorMessage = i18nString(UIStrings.manifestDisplayPropertyMustBeOne);
                    break;
                case 'manifest-missing-suitable-icon':
                    if (installabilityError.errorArguments.length !== 1 ||
                        installabilityError.errorArguments[0].name !== 'minimum-icon-size-in-pixels') {
                        console.error('Installability error does not have the correct errorArguments');
                        break;
                    }
                    errorMessage =
                        i18nString(UIStrings.manifestDoesNotContainASuitable, { PH1: installabilityError.errorArguments[0].value });
                    break;
                case 'no-matching-service-worker':
                    errorMessage = i18nString(UIStrings.noMatchingServiceWorkerDetected);
                    break;
                case 'no-acceptable-icon':
                    if (installabilityError.errorArguments.length !== 1 ||
                        installabilityError.errorArguments[0].name !== 'minimum-icon-size-in-pixels') {
                        console.error('Installability error does not have the correct errorArguments');
                        break;
                    }
                    errorMessage = i18nString(UIStrings.noSuppliedIconIsAtLeastSpxSquare, { PH1: installabilityError.errorArguments[0].value });
                    break;
                case 'cannot-download-icon':
                    errorMessage = i18nString(UIStrings.couldNotDownloadARequiredIcon);
                    break;
                case 'no-icon-available':
                    errorMessage = i18nString(UIStrings.downloadedIconWasEmptyOr);
                    break;
                case 'platform-not-supported-on-android':
                    errorMessage = i18nString(UIStrings.theSpecifiedApplicationPlatform);
                    break;
                case 'no-id-specified':
                    errorMessage = i18nString(UIStrings.noPlayStoreIdProvided);
                    break;
                case 'ids-do-not-match':
                    errorMessage = i18nString(UIStrings.thePlayStoreAppUrlAndPlayStoreId);
                    break;
                case 'already-installed':
                    errorMessage = i18nString(UIStrings.theAppIsAlreadyInstalled);
                    break;
                case 'url-not-supported-for-webapk':
                    errorMessage = i18nString(UIStrings.aUrlInTheManifestContainsA);
                    break;
                case 'in-incognito':
                    errorMessage = i18nString(UIStrings.pageIsLoadedInAnIncognitoWindow);
                    break;
                case 'not-offline-capable':
                    errorMessage = i18nString(UIStrings.pageDoesNotWorkOffline);
                    break;
                case 'no-url-for-service-worker':
                    errorMessage = i18nString(UIStrings.couldNotCheckServiceWorker);
                    break;
                case 'prefer-related-applications':
                    errorMessage = i18nString(UIStrings.manifestSpecifies);
                    break;
                case 'prefer-related-applications-only-beta-stable':
                    errorMessage = i18nString(UIStrings.preferrelatedapplicationsIsOnly);
                    break;
                case 'manifest-display-override-not-supported':
                    errorMessage = i18nString(UIStrings.manifestContainsDisplayoverride);
                    break;
                case 'warn-not-offline-capable':
                    errorMessage = i18nString(UIStrings.pageDoesNotWorkOfflineThePage, { PH1: 'https://developer.chrome.com/blog/improved-pwa-offline-detection/' });
                    break;
                default:
                    console.error(`Installability error id '${installabilityError.errorId}' is not recognized`);
                    break;
            }
            if (errorMessage) {
                errorMessages.push(errorMessage);
            }
        }
        return errorMessages;
    }
    async _loadImage(url) {
        const wrapper = document.createElement('div');
        wrapper.classList.add('image-wrapper');
        const image = document.createElement('img');
        const result = new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
        });
        image.src = url;
        image.alt = i18nString(UIStrings.imageFromS, { PH1: url });
        wrapper.appendChild(image);
        try {
            await result;
            return { wrapper, image };
        }
        catch (e) {
        }
        return null;
    }
    async _appendImageResourceToSection(
    // TODO(crbug.com/1172300) Ignored during the jsdoc to ts migration)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    baseUrl, imageResource, section, isScreenshot) {
        const imageResourceErrors = [];
        const resourceName = isScreenshot ? i18nString(UIStrings.screenshot) : i18nString(UIStrings.icon);
        if (!imageResource.src) {
            imageResourceErrors.push(i18nString(UIStrings.sSrcIsNotSet, { PH1: resourceName }));
            return imageResourceErrors;
        }
        const imageUrl = Common.ParsedURL.ParsedURL.completeURL(baseUrl, imageResource['src']);
        if (!imageUrl) {
            imageResourceErrors.push(i18nString(UIStrings.sUrlSFailedToParse, { PH1: resourceName, PH2: imageResource['src'] }));
            return imageResourceErrors;
        }
        const result = await this._loadImage(imageUrl);
        if (!result) {
            imageResourceErrors.push(i18nString(UIStrings.sSFailedToLoad, { PH1: resourceName, PH2: imageUrl }));
            return imageResourceErrors;
        }
        const { wrapper, image } = result;
        const sizes = imageResource['sizes'] ? imageResource['sizes'].replace('x', '×') + 'px' : '';
        const title = sizes + '\n' + (imageResource['type'] || '');
        const field = section.appendFlexedField(title);
        if (!imageResource.sizes) {
            imageResourceErrors.push(i18nString(UIStrings.sSDoesNotSpecifyItsSizeInThe, { PH1: resourceName, PH2: imageUrl }));
        }
        else if (!/^\d+x\d+$/.test(imageResource.sizes)) {
            imageResourceErrors.push(i18nString(UIStrings.sSShouldSpecifyItsSizeAs, { PH1: resourceName, PH2: imageUrl }));
        }
        else {
            const [width, height] = imageResource.sizes.split('x').map((x) => parseInt(x, 10));
            if (image.naturalWidth !== width && image.naturalHeight !== height) {
                imageResourceErrors.push(i18nString(UIStrings.actualSizeSspxOfSSDoesNotMatch, {
                    PH1: image.naturalWidth,
                    PH2: image.naturalHeight,
                    PH3: resourceName,
                    PH4: imageUrl,
                    PH5: width,
                    PH6: height,
                }));
            }
            else if (image.naturalWidth !== width) {
                imageResourceErrors.push(i18nString(UIStrings.actualWidthSpxOfSSDoesNotMatch, { PH1: image.naturalWidth, PH2: resourceName, PH3: imageUrl, PH4: width }));
            }
            else if (image.naturalHeight !== height) {
                imageResourceErrors.push(i18nString(UIStrings.actualHeightSpxOfSSDoesNotMatch, { PH1: image.naturalHeight, PH2: resourceName, PH3: imageUrl, PH4: height }));
            }
            else if (isScreenshot) {
                if (width < 320 || height < 320) {
                    imageResourceErrors.push(i18nString(UIStrings.sSSizeShouldBeAtLeast320, { PH1: resourceName, PH2: imageUrl }));
                }
                else if (width > 3840 || height > 3840) {
                    imageResourceErrors.push(i18nString(UIStrings.sSSizeShouldBeAtMost3840, { PH1: resourceName, PH2: imageUrl }));
                }
                else if (width > (height * 2.3)) {
                    imageResourceErrors.push(i18nString(UIStrings.sSWidthDoesNotComplyWithRatioRequirement, { PH1: resourceName, PH2: imageUrl }));
                }
                else if (height > (width * 2.3)) {
                    imageResourceErrors.push(i18nString(UIStrings.sSHeightDoesNotComplyWithRatioRequirement, { PH1: resourceName, PH2: imageUrl }));
                }
            }
        }
        field.appendChild(wrapper);
        return imageResourceErrors;
    }
}
//# sourceMappingURL=AppManifestView.js.map