// Copyright 2017 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
// NOTE: need to be careful about adding release notes early otherwise it'll
// be shown in Canary (e.g. make sure the release notes are accurate).
// https://github.com/ChromeDevTools/devtools-frontend/wiki/Release-Notes
/* eslint-disable rulesdir/no_underscored_properties */
import * as Host from '../../core/host/host.js';
const continueToHereShortcut = Host.Platform.isMac() ? 'Command' : 'Control';
const networkSearchShortcut = Host.Platform.isMac() ? 'Command+F' : 'Control+F';
const commandMenuShortcut = Host.Platform.isMac() ? 'Command+Shift+P' : 'Control+Shift+P';
export const releaseNoteText = [
    {
        version: 34,
        header: 'Highlights from the Chrome 92 update',
        highlights: [
            {
                title: 'CSS Grid editor',
                subtitle: 'Preview and author CSS Grid with the CSS Grid editor.',
                link: 'https://developer.chrome.com/blog/new-in-devtools-92#grid-editor',
            },
            {
                title: 'Source order viewer',
                subtitle: 'Display the order of source elements on screen for better accessibility inspection.',
                link: 'https://developer.chrome.com/blog/new-in-devtools-92#source-order',
            },
            {
                title: 'Lighthouse 7.5',
                subtitle: 'Easily view all the JavaScript bundles on your page with the new Lighthouse Treemap, and more.',
                link: 'https://developer.chrome.com/blog/new-in-devtools-92#lighthouse',
            },
            {
                title: 'Improved CORS debugging',
                subtitle: 'CORS errors are now reported in the Issues tab.',
                link: 'https://developer.chrome.com/blog/new-in-devtools-92#cors',
            },
            {
                title: 'Network panel updates',
                subtitle: 'Add Wasm and web bundle to the resource types and rename XHR label to Fetch/XHR.',
                link: 'https://developer.chrome.com/blog/new-in-devtools-92#network',
            },
        ],
        link: 'https://developer.chrome.com/blog/new-in-devtools-92/',
    },
    {
        version: 33,
        header: 'Highlights from the Chrome 91 update',
        highlights: [
            {
                title: 'Web Vitals information pop up',
                subtitle: 'Hover on a Web Vitals marker in the Performance panel to understand what’s the indicator about.',
                link: 'https://developer.chrome.com/blog/new-in-devtools-91#web-vitals',
            },
            {
                title: 'Visualize CSS scroll-snap',
                subtitle: 'Toggle the "scroll-snap" badge in the Elements panel to inspect the CSS scroll-snap alignment.',
                link: 'https://developer.chrome.com/blog/new-in-devtools-91#css-scroll-snap',
            },
            {
                title: 'Network panel enhancements',
                subtitle: 'A new network conditions button with new options to configure `Content-Encoding`s.',
                link: 'https://developer.chrome.com/blog/new-in-devtools-91#network-panel',
            },
            {
                title: 'New badge settings pane',
                subtitle: 'Selectively enable or disable badges via the Elements panel context menu.',
                link: 'https://developer.chrome.com/blog/new-in-devtools-91#badge-settings',
            },
            {
                title: 'New Memory inspector tab',
                subtitle: 'Inspect the WebAssembly memory in hexadecimal and ASCII views, and more.',
                link: 'https://developer.chrome.com/blog/new-in-devtools-91#memory-inspector',
            },
            {
                title: 'Enhanced image preview with aspect ratio information',
                subtitle: 'Image previews in the Elements panel now display intrinsic/rendered file size and aspect ratio.',
                link: 'https://developer.chrome.com/blog/new-in-devtools-91#image-preview',
            },
            {
                title: 'Categorize issue types with colors and icons',
                subtitle: 'Categorize issues into errors, warnings, and possible improvements for better severity indication.',
                link: 'https://developer.chrome.com/blog/new-in-devtools-91#issue-category',
            },
        ],
        link: 'https://developer.chrome.com/blog/new-in-devtools-91/',
    },
    {
        version: 32,
        header: 'Highlights from the Chrome 90 update',
        highlights: [
            {
                title: 'New CSS Flexbox debugging tools',
                subtitle: 'Debug and inspect CSS Flexbox with the new CSS Flexbox debugging tools.',
                link: 'https://developers.google.com/web/updates/2021/02/devtools#flexbox',
            },
            {
                title: 'New Core Web Vitals overlay',
                subtitle: 'Visualize page performance with the new Core Web Vitals overlay.',
                link: 'https://developers.google.com/web/updates/2021/02/devtools#cwv',
            },
            {
                title: 'Report Trusted Web Activity issues',
                subtitle: 'Debug Trusted Web Activity issues in the Issues panel.',
                link: 'https://developers.google.com/web/updates/2021/02/devtools#twa',
            },
            {
                title: 'New Trust Token pane',
                subtitle: 'New Trust Token pane in the Application Panel.',
                link: 'https://developers.google.com/web/updates/2021/02/devtools#trust-token-pane',
            },
            {
                title: 'Emulate the CSS color-gamut media feature',
                subtitle: 'Emulate color-gamut to test different color standards.',
                link: 'https://developers.google.com/web/updates/2021/02/devtools#css-gamut',
            },
            {
                title: 'Format strings as (valid) JavaScript string literals in the Console',
                subtitle: 'Display string with escaped double quotes in the Console',
                link: 'https://developers.google.com/web/updates/2021/02/devtools#double-quotes',
            },
            {
                title: 'Improved PWA tooling',
                subtitle: 'Improved PWA installability warning message, new warnings for manifest screenshots, and more. ',
                link: 'https://developers.google.com/web/updates/2021/02/devtools#pwa',
            },
        ],
        link: 'https://developers.google.com/web/updates/2021/02/devtools',
    },
    {
        version: 31,
        header: 'Highlights from the Chrome 89 update',
        highlights: [
            {
                title: 'Debugging support for Trusted Type violations',
                subtitle: 'Breakpoint on Trusted Type violations and link to more information in the Issues tab.',
                link: 'https://developers.google.com/web/updates/2021/01/devtools#trusted-types',
            },
            {
                title: 'Capture node screenshot beyond viewport',
                subtitle: 'Capture node screenshot for a full node including content below the fold.',
                link: 'https://developers.google.com/web/updates/2021/01/devtools#node-screenshot',
            },
            {
                title: 'New Trust Token tab for network requests',
                subtitle: 'Display Trusted Token parameters and results of network requests.',
                link: 'https://developers.google.com/web/updates/2021/01/devtools#trust-token',
            },
            {
                title: 'Lighthouse 7',
                subtitle: 'New audits for PWA, accessibility, third-party embeds, and more.',
                link: 'https://developers.google.com/web/updates/2021/01/devtools#lighthouse',
            },
            {
                title: 'Elements panel updates',
                subtitle: 'Support forcing CSS :target state, color pickers for custom CSS properties, a new context menu to duplicate elements, and more.',
                link: 'https://developers.google.com/web/updates/2021/01/devtools#elements-panel',
            },
            {
                title: 'Cookies updates',
                subtitle: 'Option to show URL-decoded cookies, only clear visible cookies, and more.',
                link: 'https://developers.google.com/web/updates/2021/01/devtools#cookies',
            },
            {
                title: 'User-Agent Client Hints for custom devices',
                subtitle: 'Edit User-Agent Client Hints for custom devices.',
                link: 'https://developers.google.com/web/updates/2021/01/devtools#ua-ch',
            },
        ],
        link: 'https://developers.google.com/web/updates/2021/01/devtools',
    },
    {
        version: 30,
        header: 'Highlights from the Chrome 88 update',
        highlights: [
            {
                title: 'New CSS angle visualization tools',
                subtitle: 'Better visualize and edit CSS angle in the Styles pane.',
                link: 'https://developers.google.com/web/updates/2020/11/devtools#css-angle',
            },
            {
                title: 'Emulate unsupported image types',
                subtitle: '2 new emulations to disable AVIF and WebP image formats in the Rendering tab.',
                link: 'https://developers.google.com/web/updates/2020/11/devtools#emulate-image',
            },
            {
                title: 'Simulate storage quota size',
                subtitle: 'Override storage quota size in the Storage pane.',
                link: 'https://developers.google.com/web/updates/2020/11/devtools#simulate-storage',
            },
            {
                title: 'New Web Vitals lane',
                subtitle: 'New Web Vitals lane in the Performance panel recordings.',
                link: 'https://developers.google.com/web/updates/2020/11/devtools#web-vitals',
            },
            {
                title: 'Report CORS errors in the Network panel',
                subtitle: 'Show CORS errors label and error code for failed CORS requests.',
                link: 'https://developers.google.com/web/updates/2020/11/devtools#cors',
            },
            {
                title: 'Frame details view updates',
                subtitle: 'New cross-origin isolation status, API availability section, and more.',
                link: 'https://developers.google.com/web/updates/2020/11/devtools#frame-details',
            },
        ],
        link: 'https://developers.google.com/web/updates/2020/11/devtools',
    },
    {
        version: 29,
        header: 'Highlights from the Chrome 87 update',
        highlights: [
            {
                title: 'New CSS Grid debugging tools',
                subtitle: 'Debug and inspect CSS Grid with the new CSS Grid debugging tools.',
                link: 'https://developers.google.com/web/updates/2020/10/devtools#css-grid',
            },
            {
                title: 'New WebAuthn tab',
                subtitle: 'Emulate authenticators and debug the Web Authentication API with the new WebAuthn tab.',
                link: 'https://developers.google.com/web/updates/2020/10/devtools#webauthn',
            },
            {
                title: 'Move tools between top and bottom panel',
                subtitle: 'Move tools in DevTools between the top and bottom panel.',
                link: 'https://developers.google.com/web/updates/2020/10/devtools#moveable-tools',
            },
            {
                title: 'Elements panel updates',
                subtitle: 'View the Computed sidebar pane in the Styles pane, and more.',
                link: 'https://developers.google.com/web/updates/2020/10/devtools#elements-panel',
            },
            {
                title: 'Lighthouse 6.4',
                subtitle: 'New audits to validate preload fonts, valid sourcemaps, and more.',
                link: 'https://developers.google.com/web/updates/2020/10/devtools#lighthouse',
            },
            {
                title: '`performance.mark()` events in the Timings section',
                subtitle: 'Performance recording now marks `performance.mark()` events.',
                link: 'https://developers.google.com/web/updates/2020/10/devtools#perf-mark',
            },
            {
                title: 'New filters in the Network panel',
                subtitle: 'New `resource-type` and `url` keywords in the **Network panel** to filter network requests.',
                link: 'https://developers.google.com/web/updates/2020/10/devtools#network-filters',
            },
        ],
        link: 'https://developers.google.com/web/updates/2020/10/devtools',
    },
    {
        version: 28,
        header: 'Highlights from the Chrome 86 update',
        highlights: [
            {
                title: 'New Media panel',
                subtitle: 'View and download media information on a browser tab.',
                link: 'https://developers.google.com/web/updates/2020/08/devtools#media-panel',
            },
            {
                title: 'Issues tab updates',
                subtitle: 'The Issues warning bar is replaced with a regular message. Issues tab has a new checkbox to filter third-party cookie issues.',
                link: 'https://developers.google.com/web/updates/2020/08/devtools#issues-tab',
            },
            {
                title: 'Emulate missing local fonts',
                subtitle: 'Emulate missing `local()` sources in @font-face rules.',
                link: 'https://developers.google.com/web/updates/2020/08/devtools#emulate-local-fonts',
            },
            {
                title: 'Emulate inactive users',
                subtitle: 'Emulate idle state changes for both the user state and the screen state.',
                link: 'https://developers.google.com/web/updates/2020/08/devtools#emulate-inactive-users',
            },
            {
                title: 'Emulate prefers-reduced-data',
                subtitle: 'Emulate the user preference on using less data for the page to be rendered.',
                link: 'https://developers.google.com/web/updates/2020/08/devtools#emulate-prefers-reduced-data',
            },
            {
                title: 'Support for new JavaScript features',
                subtitle: 'Syntax support for logical assignment operators and numeric separators.',
                link: 'https://developers.google.com/web/updates/2020/08/devtools#javascript',
            },
            {
                title: 'Lighthouse 6.2',
                subtitle: 'Enhance the unused-javascript audit if a page has publicly-accessible JavaScript source maps, and more.',
                link: 'https://developers.google.com/web/updates/2020/08/devtools#lighthouse',
            },
            {
                title: 'Deprecation of service workers “other origins” listing',
                subtitle: 'View “other origins” listing in chrome://serviceworker-internals/?devtools instead.',
                link: 'https://developers.google.com/web/updates/2020/08/devtools#deprecate-sw-other-origins',
            },
            {
                title: 'New frame detailed view',
                subtitle: 'A new detailed view for each frame and window with security information.',
                link: 'https://developers.google.com/web/updates/2020/08/devtools#frame-detailed-view',
            },
            {
                title: 'Network and Elements panel updates',
                subtitle: 'Capture node screenshots shortcut, accessible color suggestion, human-readable `X-Client-Data`, and more',
                link: 'https://developers.google.com/web/updates/2020/08/devtools#elements-network',
            },
        ],
        link: 'https://developers.google.com/web/updates/2020/08/devtools',
    },
    {
        version: 27,
        header: 'Highlights from the Chrome 85 update',
        highlights: [
            {
                title: 'Style editing for CSS-in-JS',
                subtitle: 'Styles created with CSS Object Model APIs and Constructible Stylesheets are now editable.',
                link: 'https://developers.google.com/web/updates/2020/06/devtools#css-in-js',
            },
            {
                title: 'Lighthouse 6',
                subtitle: 'New metrics that align with Google’s Core Web Vitals, a new weighting of the Performance score, and more.',
                link: 'https://developers.google.com/web/updates/2020/06/devtools#lighthouse',
            },
            {
                title: 'First Meaningful Paint (FMP) deprecation',
                subtitle: 'FMP has been removed from the Performance panel and deprecated in Lighthouse 6.',
                link: 'https://developers.google.com/web/updates/2020/06/devtools#fmp-deprecation',
            },
            {
                title: 'Support for new JavaScript features',
                subtitle: 'Syntax and autocompletion support for optional chaining, private fields, and the nullish coalescing operator.',
                link: 'https://developers.google.com/web/updates/2020/06/devtools#javascript',
            },
            {
                title: 'New app shortcut warnings in the Manifest pane',
                subtitle: 'Warnings for when an app icon image is too small or not the correct shape.',
                link: 'https://developers.google.com/web/updates/2020/06/devtools#app-shortcut-warnings',
            },
            {
                title: 'Service worker respondWith events in the Timing tab',
                subtitle: 'More visibility into how long a service worker takes to respond to a fetch event.',
                link: 'https://developers.google.com/web/updates/2020/06/devtools#timing-tab',
            },
            {
                title: 'Consistent display of the Computed pane',
                subtitle: 'The pane now always displays as a separate pane, rather than collapsing into the Styles pane.',
                link: 'https://developers.google.com/web/updates/2020/06/devtools#computed-pane',
            },
            {
                title: 'Bytecode offsets for WebAssembly files',
                subtitle: 'Bytecode offsets are now displayed next to Wasm disassembly rather than line numbers.',
                link: 'https://developers.google.com/web/updates/2020/06/devtools#wasm',
            },
            {
                title: 'Line-wise copy and cut in the Sources Panel',
                subtitle: 'Cut or copy an entire line of code.',
                link: 'https://developers.google.com/web/updates/2020/06/devtools#sources-panel',
            },
            {
                title: 'Console Settings updates',
                subtitle: 'The “Group similar” option now applies to duplicate messages and the “Selected context only” option is now persisted.',
                link: 'https://developers.google.com/web/updates/2020/06/devtools#console-settings',
            },
            {
                title: 'Performance panel updates',
                subtitle: 'Display JavaScript compilation cache information and align navigation timing in the Performance panel.',
                link: 'https://developers.google.com/web/updates/2020/06/devtools#perf-panel',
            },
            {
                title: 'New icons for breakpoints, conditional breakpoints, and logpoints',
                subtitle: 'Breakpoints get a refreshed flag design with brighter and friendlier colors. Icons are added to differentiate conditional breakpoints and logpoints.',
                link: 'https://developers.google.com/web/updates/2020/06/devtools#breakpoints',
            },
        ],
        link: 'https://developers.google.com/web/updates/2020/06/devtools',
    },
    {
        version: 26,
        header: 'Highlights from the Chrome 84 update',
        highlights: [
            {
                title: 'The new Issues tab',
                subtitle: 'The Issues tab presents warnings from the browser in a structured, aggregated, and actionable way, links to affected resources within DevTools, and provides guidance on how to fix the issues.',
                link: 'https://developers.google.com/web/updates/2020/05/devtools#issues',
            },
            {
                title: 'New accessibility information in the Inspect Mode tooltip',
                subtitle: 'The tooltip now indicates whether an element has an accessible name and role and is keyboard-focusable.',
                link: 'https://developers.google.com/web/updates/2020/05/devtools#a11y',
            },
            {
                title: 'Performance panel updates',
                subtitle: 'New features related to Total Blocking Time (TBT) and Cumulative Layout Shift (CLS).',
                link: 'https://developers.google.com/web/updates/2020/05/devtools#performance',
            },
            {
                title: 'More accurate Promise terminology',
                subtitle: 'When logging Promises in the Console, the status now matches the Promise spec.',
                link: 'https://developers.google.com/web/updates/2020/05/devtools#performance',
            },
            {
                title: 'Styles pane updates',
                subtitle: 'Support for the revert keyword, image previews, and more usage of space-separated functional color notation by default.',
                link: 'https://developers.google.com/web/updates/2020/05/devtools#styles',
            },
            {
                title: 'Deprecation of the Properties pane',
                subtitle: 'Use console.dir($0) instead.',
                link: 'https://developers.google.com/web/updates/2020/05/devtools#properties',
            },
            {
                title: 'App shortcuts support in the Manifest pane',
                subtitle: 'Verify your app shortcuts are set up correctly for your PWA.',
                link: 'https://developers.google.com/web/updates/2020/05/devtools#app-shortcuts',
            },
        ],
        link: 'https://developers.google.com/web/updates/2020/05/devtools',
    },
    {
        version: 25,
        header: 'Highlights from the Chrome 83 update',
        highlights: [
            {
                title: 'Emulate vision deficiencies from the Rendering tab',
                subtitle: 'Get a visual approximation of how people with vision deficiencies might experience your site.',
                link: 'https://developers.google.com/web/updates/2020/03/devtools#vision-deficiences',
            },
            {
                title: 'Emulate locales from the Sensors tab or Console',
                subtitle: 'Emulating locales enables you to change JavaScript APIs such as `Intl.*`, DOM APIs such as `navigator.locale`, and the `Accept-Language` HTTP header that’s sent with network requests.',
                link: 'https://developers.google.com/web/updates/2020/03/devtools#locales',
            },
            {
                title: 'Cross-Origin Embedder Policy (COEP) debugging',
                subtitle: 'Use the Status column and Response Headers section in the Network panel to debug COEP issues.',
                link: 'https://developers.google.com/web/updates/2020/03/devtools#COEP',
            },
            {
                title: 'New icons for breakpoints, conditional breakpoints, and logpoints',
                subtitle: 'The new icons are more consistent with other GUI debugging tools and make it easier to distinguish between the 3 features at a glance.',
                link: 'https://developers.google.com/web/updates/2020/03/devtools#debugging-icons',
            },
            {
                title: 'View network requests that set a specific cookie path',
                subtitle: 'Use the new `cookie-path` filter keyword to focus on the network requests that set a specific cookie path.',
                link: 'https://developers.google.com/web/updates/2020/03/devtools#cookie-path',
            },
            {
                title: 'Dock to left from the Command Menu',
                subtitle: 'Run the “Dock to left” command to quickly move DevTools to the left of your viewport.',
                link: 'https://developers.google.com/web/updates/2020/03/devtools#dock-to-left',
            },
            {
                title: 'The Settings option in the Main Menu has moved',
                subtitle: 'The option for opening Settings can now be found under “More Tools”.',
                link: 'https://developers.google.com/web/updates/2020/03/devtools#settings',
            },
            {
                title: 'The Audits panel is now the Lighthouse panel',
                subtitle: 'Same features. New name.',
                link: 'https://developers.google.com/web/updates/2020/03/devtools#lighthouse',
            },
            {
                title: 'Delete all Local Overrides in a folder',
                subtitle: 'Right-click a folder from the Overrides tab and select “Delete all overrides”.',
                link: 'https://developers.google.com/web/updates/2020/03/devtools#overrides',
            },
            {
                title: 'Updated Long Tasks UI',
                subtitle: 'In the Performance panel Long Tasks now have a striped red background.',
                link: 'https://developers.google.com/web/updates/2020/03/devtools#long-tasks',
            },
            {
                title: 'Maskable icon support in the Manifest pane',
                subtitle: 'Enable the “Show only the minimum safe area for maskable icons” checkbox.',
                link: 'https://developers.google.com/web/updates/2020/03/devtools#maskable-icons',
            },
        ],
        link: 'https://developers.google.com/web/updates/2020/03/devtools',
    },
    {
        version: 24,
        header: 'Highlights from the Chrome 82 update',
        highlights: [
            {
                title: 'Emulate vision deficiencies from the Rendering tab',
                subtitle: 'Get a visual approximation of how people with vision deficiencies might experience your site.',
                link: 'https://developers.google.com/web/updates/2020/03/devtools#vision-deficiences',
            },
            {
                title: 'Cross-Origin Opener Policy (COOP) and Cross-Origin Embedder Policy (COEP) debugging',
                subtitle: 'Use the Status column and Response Headers section in the Network panel to debug COOP and COEP issues.',
                link: 'https://developers.google.com/web/updates/2020/03/devtools#COOP-COEP',
            },
            {
                title: 'Dock to left from the Command Menu',
                subtitle: 'Run the “Dock to left” command to quickly move DevTools to the left of your viewport.',
                link: 'https://developers.google.com/web/updates/2020/03/devtools#dock-to-left',
            },
            {
                title: 'The Audits panel is now the Lighthouse panel',
                subtitle: 'Same features. New name.',
                link: 'https://developers.google.com/web/updates/2020/03/devtools#lighthouse',
            },
            {
                title: 'Delete all Local Overrides in a folder',
                subtitle: 'Right-click a folder from the Overrides tab and select “Delete all overrides”.',
                link: 'https://developers.google.com/web/updates/2020/03/devtools#overrides',
            },
            {
                title: 'Updated Long Tasks UI',
                subtitle: 'In the Performance panel Long Tasks now have a striped red background.',
                link: 'https://developers.google.com/web/updates/2020/03/devtools#long-tasks',
            },
            {
                title: 'Maskable icon support in the Manifest pane',
                subtitle: 'Enable the “Show only the minimum safe area for maskable icons” checkbox.',
                link: 'https://developers.google.com/web/updates/2020/03/devtools#maskable-icons',
            },
        ],
        link: 'https://developers.google.com/web/updates/2020/03/devtools',
    },
    {
        version: 23,
        header: 'Highlights from the Chrome 81 update',
        highlights: [
            {
                title: 'Moto G4 support in Device Mode',
                subtitle: 'Simulate Moto G4 viewport dimensions and display its hardware around the viewport.',
                link: 'https://developers.google.com/web/updates/2020/01/devtools#motog4',
            },
            {
                title: 'Cookie-related updates',
                subtitle: 'Blocked cookies and cookie priority in the Cookies pane, editing all cookie values, and more.',
                link: 'https://developers.google.com/web/updates/2020/01/devtools#cookies',
            },
            {
                title: 'More accurate web app manifest icons',
                subtitle: 'DevTools now shows the exact icon that Chrome uses.',
                link: 'https://developers.google.com/web/updates/2020/01/devtools#manifesticons',
            },
            {
                title: 'Hover over CSS `content` properties to see unescaped values',
                subtitle: 'Hover over a `content` value to see the rendered version of the value in a tooltip.',
                link: 'https://developers.google.com/web/updates/2020/01/devtools#content',
            },
            {
                title: 'Source map errors in the Console',
                subtitle: 'The Console now tells you when a source map has failed to load or parse.',
                link: 'https://developers.google.com/web/updates/2020/01/devtools#sourcemaperrors',
            },
            {
                title: 'A setting for disabling scrolling past the end of a file',
                subtitle: 'Go to Settings and disable the “Allow scrolling past end of file” checkbox.',
                link: 'https://developers.google.com/web/updates/2020/01/devtools#scrolling',
            },
        ],
        link: 'https://developers.google.com/web/updates/2020/01/devtools',
    },
    {
        version: 22,
        header: 'Highlights from the Chrome 80 update',
        highlights: [
            {
                title: 'Support for let and class redeclarations',
                subtitle: 'When experimenting with new code in the Console, repeating `let` or `class` declarations no longer causes errors.',
                link: 'https://developers.google.com/web/updates/2019/12/devtools#redeclarations',
            },
            {
                title: 'Improved WebAssembly debugging',
                subtitle: 'The Sources panel has increased support for stepping over code, setting breakpoints, and resolving stack traces in source languages.',
                link: 'https://developers.google.com/web/updates/2019/12/devtools#webassembly',
            },
            {
                title: 'Network panel updates',
                subtitle: 'View request initiator chains, highlight requests in the Overview, and more.',
                link: 'https://developers.google.com/web/updates/2019/12/devtools#network',
            },
            {
                title: 'Audits panel updates',
                subtitle: 'The redesigned configuration UI has simplified throttling options.',
                link: 'https://developers.google.com/web/updates/2019/12/devtools#audits',
            },
            {
                title: 'Coverage tab updates',
                subtitle: 'Choose per-function or per-block coverage, and more.',
                link: 'https://developers.google.com/web/updates/2019/12/devtools#coverage',
            },
        ],
        link: 'https://developers.google.com/web/updates/2019/12/devtools',
    },
    {
        version: 21,
        header: 'Highlights from the Chrome 79 update',
        highlights: [
            {
                title: 'Debug why a cookie was blocked',
                subtitle: 'Click a resource in the Network panel and go to the updated Cookies tab.',
                link: 'https://developers.google.com/web/updates/2019/10/devtools#blockedcookies',
            },
            {
                title: 'View cookie values',
                subtitle: 'Click a row in the Cookies pane in the Application panel to see the cookie’s value.',
                link: 'https://developers.google.com/web/updates/2019/10/devtools#cookiepreviews',
            },
            {
                title: 'Simulate prefers-color-scheme and prefers-reduced-motion preferences',
                subtitle: 'Open the Rendering tab to force your site into dark or light mode or set motion preferences.',
                link: 'https://developers.google.com/web/updates/2019/10/devtools#userpreferences',
            },
            {
                title: 'Code coverage updates',
                subtitle: 'More accessible colors, a filter text box, and a new integration with the Sources panel.',
                link: 'https://developers.google.com/web/updates/2019/10/devtools#coverage',
            },
            {
                title: 'Debug why a network resource was requested',
                subtitle: 'Click a resource in the Network panel and go to the new Initiator tab.',
                link: 'https://developers.google.com/web/updates/2019/10/devtools#initiator',
            },
            {
                title: 'Console and Sources panels respect indentation preferences again',
                subtitle: 'Set your preference in Settings > Preferences > Sources > Default Indentation.',
                link: 'https://developers.google.com/web/updates/2019/10/devtools#indentation',
            },
            {
                title: 'New shortcuts for cursor navigation',
                subtitle: 'Press Control+P or Control+N to move your cursor to the line above or below.',
                link: 'https://developers.google.com/web/updates/2019/10/devtools#console',
            },
        ],
        link: 'https://developers.google.com/web/updates/2019/10/devtools',
    },
    {
        version: 20,
        header: 'Highlights from the Chrome 78 update',
        highlights: [
            {
                title: 'Multi-client support in the Audits panel',
                subtitle: 'Use the Audits panel in combination with other features, like Local Overrides or Request Blocking.',
                link: 'https://developers.google.com/web/updates/2019/09/devtools#multiclient',
            },
            {
                title: 'Payment Handler debugging',
                subtitle: 'Record Payment Handler events for 3 days, even when DevTools is closed.',
                link: 'https://developers.google.com/web/updates/2019/09/devtools#payments',
            },
            {
                title: 'Lighthouse 5.2 in the Audits panel',
                subtitle: 'Measure the impact of third-party code on your load performance with the new Third-Party Usage audit.',
                link: 'https://developers.google.com/web/updates/2019/09/devtools#audits',
            },
            {
                title: 'Largest Contentful Paint (LCP) in the Performance panel',
                subtitle: 'Click the new LCP marker in the Timing section to see the DOM node associated with your LCP.',
                link: 'https://developers.google.com/web/updates/2019/09/devtools#LCP',
            },
            {
                title: 'File issues and feature requests from the Main Menu',
                subtitle: 'Found a bug? Got an idea on how to improve DevTools? Go to Main Menu > Help > Report a DevTools issue.',
                link: 'https://developers.google.com/web/updates/2019/09/devtools#issues',
            },
        ],
        link: 'https://developers.google.com/web/updates/2019/09/devtools',
    },
    {
        version: 19,
        header: 'Highlights from the Chrome 77 update',
        highlights: [
            {
                title: 'Copy element styles',
                subtitle: 'Right-click an element in the DOM Tree and select Copy > Copy Styles.',
                link: 'https://developers.google.com/web/updates/2019/07/devtools#copystyles',
            },
            {
                title: 'Visualize layout shifts',
                subtitle: `Press ${commandMenuShortcut}, run Show Rendering, and enable Layout Shift Regions to visualize content shifts.`,
                link: 'https://developers.google.com/web/updates/2019/07/devtools#layoutshifts',
            },
            {
                title: 'Lighthouse 5.1 in the Audits panel',
                subtitle: 'New audits for checking for PWA installability on iOS, keeping resource counts low, and more.',
                link: 'https://developers.google.com/web/updates/2019/07/devtools#audits',
            },
            {
                title: 'OS theme syncing',
                subtitle: 'DevTools now automatically switches to its own dark theme when it detects an OS in dark mode.',
                link: 'https://developers.google.com/web/updates/2019/07/devtools#theming',
            },
            {
                title: 'Keyboard shortcut for opening the Breakpoint Editor',
                subtitle: `Press ${Host.Platform.isMac() ?
                    'Command+Option+B' :
                    'Control+Alt+B'} when focused in the Editor to create Logpoints and Conditional Breakpoints more quickly.`,
                link: 'https://developers.google.com/web/updates/2019/07/devtools#breakpointeditor',
            },
            {
                title: 'Prefetch cache in Network panel',
                subtitle: 'The Size column now indicates whether a resource came from the prefetch cache.',
                link: 'https://developers.google.com/web/updates/2019/07/devtools#prefetch',
            },
            {
                title: 'Private properties when viewing objects',
                subtitle: 'The Console now shows private class fields in its object previews.',
                link: 'https://developers.google.com/web/updates/2019/07/devtools#privateclassfields',
            },
            {
                title: 'Notification and push message logs',
                subtitle: 'Go to Application > Background Services > Notifications or Messages and click Record to log events for 3 days.',
                link: 'https://developers.google.com/web/updates/2019/07/devtools#backgroundservices',
            },
        ],
        link: 'https://developers.google.com/web/updates/2019/07/devtools',
    },
    {
        version: 18,
        header: 'Highlights from the Chrome 76 update',
        highlights: [
            {
                title: 'Autocomplete with CSS keyword values',
                subtitle: 'Typing a keyword value like `bold` in the Styles pane now autocompletes to `font-weight: bold`.',
                link: 'https://developers.google.com/web/updates/2019/05/devtools#values',
            },
            {
                title: 'A new UI for network settings',
                subtitle: 'The “Use large request rows”, “Group by frame”, “Show overview”, and “Capture screenshots” options have moved to the new Network Settings pane.',
                link: 'https://developers.google.com/web/updates/2019/05/devtools#settings',
            },
            {
                title: 'WebSocket messages in HAR exports',
                subtitle: 'Network logs downloaded from the Network panel now include WebSocket messages.',
                link: 'https://developers.google.com/web/updates/2019/05/devtools#websocket',
            },
        ],
        link: 'https://developers.google.com/web/updates/2019/05/devtools',
    },
    {
        version: 17,
        header: 'Highlights from the Chrome 75 update',
        highlights: [
            {
                title: 'Meaningful preset values when autocompleting CSS functions',
                subtitle: 'Properties like `filter` that take functions for values now autocomplete to previewable values in the Styles pane.',
                link: 'https://developers.google.com/web/updates/2019/04/devtools#presets',
            },
            {
                title: 'Clear site data from the Command Menu',
                subtitle: `Press ${commandMenuShortcut} and run the “Clear Site Data” command to clear cookies, storage, and more.`,
                link: 'https://developers.google.com/web/updates/2019/04/devtools#clear',
            },
            {
                title: 'View all IndexedDB databases',
                subtitle: 'The IndexedDB pane now shows databases for all origins rather than just the main origin.',
                link: 'https://developers.google.com/web/updates/2019/04/devtools#indexeddb',
            },
            {
                title: 'View a resource’s uncompressed size on hover',
                subtitle: 'Hover over the Size column in the Network panel to view a resource’s full size.',
                link: 'https://developers.google.com/web/updates/2019/04/devtools#uncompressed',
            },
            {
                title: 'Inline breakpoints in the Breakpoints pane',
                subtitle: 'When you’ve got multiple breakpoints on a single line of code, the Breakpoints pane now lets you manage each one independently.',
                link: 'https://developers.google.com/web/updates/2019/04/devtools#inline',
            },
        ],
        link: 'https://developers.google.com/web/updates/2019/04/devtools',
    },
    {
        version: 16,
        header: 'Highlights from the Chrome 74 update',
        highlights: [
            {
                title: 'Highlight all nodes affected by CSS property',
                subtitle: 'Hover over a CSS property like padding or margin in the Styles pane to highlight all nodes affected by that declaration.',
                link: 'https://developers.google.com/web/updates/2019/03/devtools#highlight',
            },
            {
                title: 'Lighthouse v4 in the Audits panel',
                subtitle: 'Featuring a new “tap targets” audit for checking that mobile links and buttons are properly sized, and a new UI for PWA reports.',
                link: 'https://developers.google.com/web/updates/2019/03/devtools#lighthouse',
            },
            {
                title: 'WebSocket binary message viewer',
                subtitle: 'Click a WebSocket connection in the Network Log, go to the Messages tab, then click a binary message to view its contents.',
                link: 'https://developers.google.com/web/updates/2019/03/devtools#binary',
            },
            {
                title: 'Capture area screenshot in the Command Menu',
                subtitle: 'Press ' + commandMenuShortcut +
                    ', run the “Capture area screenshot” command, and then drag your mouse to take a screenshot of part of the viewport.',
                link: 'https://developers.google.com/web/updates/2019/03/devtools#screenshot',
            },
            {
                title: 'Service worker filters in the Network panel',
                subtitle: 'Type `is:service-worker-initiated` or `is:service-worker-intercepted` to only show service worker activity.',
                link: 'https://developers.google.com/web/updates/2019/03/devtools#swfilters',
            },
        ],
        link: 'https://developers.google.com/web/updates/2019/03/devtools',
    },
    {
        version: 15,
        header: 'Highlights from the Chrome 73 update',
        highlights: [
            {
                title: 'Logpoints',
                subtitle: 'Log messages to the Console without cluttering up your code with `console.log()` calls.',
                link: 'https://developers.google.com/web/updates/2019/01/devtools#logpoints',
            },
            {
                title: 'Detailed tooltips in Inspect Mode',
                subtitle: 'When inspecting a node, DevTools now shows an expanded tooltip containing text, ' +
                    'color contrast, and box model information.',
                link: 'https://developers.google.com/web/updates/2019/01/devtools#inspect',
            },
            {
                title: 'Export code coverage data',
                subtitle: 'The Coverage tab now supports exporting coverage data as JSON.',
                link: 'https://developers.google.com/web/updates/2019/01/devtools#coverage',
            },
            {
                title: 'Navigate the Console with the keyboard',
                subtitle: 'Press Shift+Tab to focus the last message and then use the arrow keys to navigate.',
                link: 'https://developers.google.com/web/updates/2019/01/devtools#keyboard',
            },
            {
                title: 'Save custom location overrides',
                subtitle: 'Click Manage in the Sensors tab or open Settings > Locations.',
                link: 'https://developers.google.com/web/updates/2019/01/devtools#geolocation',
            },
            {
                title: 'Code folding',
                subtitle: 'Go to Settings > Preferences > Sources and enable Code Folding to fold ' +
                    'code in the Sources panel.',
                link: 'https://developers.google.com/web/updates/2019/01/devtools#folding',
            },
        ],
        link: 'https://developers.google.com/web/updates/2019/01/devtools',
    },
    {
        version: 14,
        header: 'Highlights from the Chrome 72 update',
        highlights: [
            {
                title: 'Visualize performance metrics',
                subtitle: 'Performance metrics like DOMContentLoaded and First Meaningful Paint are now marked in the Timings section of the Performance panel.',
                link: 'https://developers.google.com/web/updates/2018/11/devtools#metrics',
            },
            {
                title: 'Highlight text nodes',
                subtitle: 'Hover over a text node in the DOM Tree to highlight it in the viewport.',
                link: 'https://developers.google.com/web/updates/2018/11/devtools#highlight',
            },
            {
                title: 'Copy JS path',
                subtitle: 'Right-click a DOM node and select “Copy” > “Copy JS path” to quickly get a JavaScript expression that points to that node.',
                link: 'https://developers.google.com/web/updates/2018/11/devtools#copy',
            },
            {
                title: 'Audits panel updates',
                subtitle: 'A new audit that lists detected JS libraries and new keywords for accessing the Audits panel from the Command Menu.',
                link: 'https://developers.google.com/web/updates/2018/11/devtools#audits',
            },
        ],
        link: 'https://developers.google.com/web/updates/2018/11/devtools',
    },
    {
        version: 13,
        header: 'Highlights from the Chrome 71 update',
        highlights: [
            {
                title: 'Hover over a Live Expression to highlight a DOM node',
                subtitle: 'Hover over a result that evaluates to a node to highlight that node in the viewport.',
                link: 'https://developers.google.com/web/updates/2018/10/devtools#hover',
            },
            {
                title: 'Store DOM nodes as global variables',
                subtitle: 'Right-click a node in the Elements panel or Console and select “Store as global variable”.',
                link: 'https://developers.google.com/web/updates/2018/10/devtools#store',
            },
            {
                title: 'Initiator and priority information now in HAR imports and exports',
                subtitle: 'Get more context around what caused a resource to be requested and what priority the browser assigned to each resource when sharing network logs.',
                link: 'https://developers.google.com/web/updates/2018/10/devtools#HAR',
            },
            {
                title: 'Access the Command Menu from the Main Menu',
                subtitle: 'Open the Main Menu and select “Run command”.',
                link: 'https://developers.google.com/web/updates/2018/10/devtools#command-menu',
            },
        ],
        link: 'https://developers.google.com/web/updates/2018/10/devtools',
    },
    {
        version: 12,
        header: 'Highlights from the Chrome 70 update',
        highlights: [
            {
                title: 'Live Expressions in the Console',
                subtitle: 'Pin expressions to the top of the Console to monitor their values in real-time.',
                link: 'https://developers.google.com/web/updates/2018/08/devtools#watch',
            },
            {
                title: 'Highlight DOM nodes during Eager Evaluation',
                subtitle: 'Type an expression that evaluates to a node to highlight that node in the viewport.',
                link: 'https://developers.google.com/web/updates/2018/08/devtools#nodes',
            },
            {
                title: 'Autocomplete Conditional Breakpoints',
                subtitle: 'Type expressions quickly and accurately.',
                link: 'https://developers.google.com/web/updates/2018/08/devtools#autocomplete',
            },
            {
                title: 'Performance panel optimizations',
                subtitle: 'Faster loading and processing of Performance recordings.',
                link: 'https://developers.google.com/web/updates/2018/08/devtools#performance',
            },
            {
                title: 'More reliable debugging',
                subtitle: 'Bug fixes for sourcemaps and blackboxing.',
                link: 'https://developers.google.com/web/updates/2018/08/devtools#debugging',
            },
            {
                title: 'Debug Node.js apps with ndb',
                subtitle: 'Detect and attach to child processes, place breakpoints before modules are required, edit files within DevTools, and more.',
                link: 'https://developers.google.com/web/updates/2018/08/devtools#ndb',
            },
        ],
        link: 'https://developers.google.com/web/updates/2018/08/devtools',
    },
    {
        version: 11,
        header: 'Highlights from the Chrome 68 update',
        highlights: [
            {
                title: 'Eager evaluation',
                subtitle: 'Preview return values in the Console without explicitly executing expressions.',
                link: 'https://developers.google.com/web/updates/2018/05/devtools#eagerevaluation',
            },
            {
                title: 'Argument hints',
                subtitle: 'View a function’s expected arguments in the Console.',
                link: 'https://developers.google.com/web/updates/2018/05/devtools#hints',
            },
            {
                title: 'Function autocompletion',
                subtitle: 'View available properties and methods after calling a function in the Console.',
                link: 'https://developers.google.com/web/updates/2018/05/devtools#autocomplete',
            },
            {
                title: 'Audits panel updates',
                subtitle: 'Faster, more consisent audits, a new UI, and new audits, thanks to Lighthouse 3.0.',
                link: 'https://developers.google.com/web/updates/2018/05/devtools#lh3',
            },
        ],
        link: 'https://developers.google.com/web/updates/2018/05/devtools',
    },
    {
        version: 10,
        header: 'Highlights from the Chrome 67 update',
        highlights: [
            {
                title: 'Search across all network headers',
                subtitle: `Press ${networkSearchShortcut} in the Network panel to open the Network Search pane.`,
                link: 'https://developers.google.com/web/updates/2018/04/devtools#network-search',
            },
            {
                title: 'CSS variable value previews in the Styles pane',
                subtitle: 'When a property value is a CSS variable, DevTools now shows a color preview next to the variable.',
                link: 'https://developers.google.com/web/updates/2018/04/devtools#vars',
            },
            {
                title: 'Stop infinite loops',
                subtitle: 'Pause JavaScript execution then select the new Stop Current JavaScript Call button.',
                link: 'https://developers.google.com/web/updates/2018/04/devtools#stop',
            },
            {
                title: 'Copy as fetch',
                subtitle: 'Right-click a network request then select Copy > Copy as fetch.',
                link: 'https://developers.google.com/web/updates/2018/04/devtools#fetch',
            },
            {
                title: 'More audits',
                subtitle: 'Two new audits, desktop configuration options, and viewing traces.',
                link: 'https://developers.google.com/web/updates/2018/04/devtools#audits',
            },
            {
                title: 'User Timing in the Performance tabs',
                subtitle: 'Click the User Timing section to view measures in the Summary, Bottom-Up, and Call Tree tabs.',
                link: 'https://developers.google.com/web/updates/2018/04/devtools#tabs',
            },
        ],
        link: 'https://developers.google.com/web/updates/2018/04/devtools',
    },
    {
        version: 9,
        header: 'Highlights from the Chrome 66 update',
        highlights: [
            {
                title: 'Pretty-printing in the Preview and Response tabs',
                subtitle: 'The Preview tab now pretty-prints by default, and you can force ' +
                    'pretty-printing in the Response tab via the new Format button.',
                link: 'https://developers.google.com/web/updates/2018/02/devtools#pretty-printing',
            },
            {
                title: 'Previewing HTML content in the Preview tab',
                subtitle: 'The Preview tab now always does a basic rendering of HTML content.',
                link: 'https://developers.google.com/web/updates/2018/02/devtools#previews',
            },
            {
                title: 'Local Overrides with styles defined in HTML',
                subtitle: 'Local Overrides now works with styles defined in HTML, with one exception.',
                link: 'https://developers.google.com/web/updates/2018/02/devtools#overrides',
            },
            {
                title: 'Blackboxing in the Initiator column',
                subtitle: 'Hide framework scripts in order to see the app code that caused a request.',
                link: 'https://developers.google.com/web/updates/2018/02/devtools#blackboxing',
            },
        ],
        link: 'https://developers.google.com/web/updates/2018/02/devtools',
    },
    {
        version: 8,
        header: 'Highlights from the Chrome 65 update',
        highlights: [
            {
                title: 'Local overrides',
                subtitle: 'Override network requests and serve local resources instead.',
                link: 'https://developers.google.com/web/updates/2018/01/devtools#overrides',
            },
            {
                title: 'Changes tab',
                subtitle: 'Track changes that you make locally in DevTools via the Changes tab.',
                link: 'https://developers.google.com/web/updates/2018/01/devtools#changes',
            },
            {
                title: 'New accessibility tools',
                subtitle: 'Inspect the accessibility properties and contrast ratio of elements.',
                link: 'https://developers.google.com/web/updates/2018/01/devtools#a11y',
            },
            {
                title: 'New audits',
                subtitle: 'New performance audits, a whole new category of SEO audits, and more.',
                link: 'https://developers.google.com/web/updates/2018/01/devtools#audits',
            },
            {
                title: 'Code stepping updates',
                subtitle: 'Reliably step into web worker and asynchronous code.',
                link: 'https://developers.google.com/web/updates/2018/01/devtools#stepping',
            },
            {
                title: 'Multiple recordings in the Performance panel',
                subtitle: 'Temporarily save up to 5 recordings.',
                link: 'https://developers.google.com/web/updates/2018/01/devtools#recordings',
            },
        ],
        link: 'https://developers.google.com/web/updates/2018/01/devtools',
    },
    {
        version: 7,
        header: 'Highlights from the Chrome 64 update',
        highlights: [
            {
                title: 'Performance monitor',
                subtitle: 'Get a real-time view of various performance metrics.',
                link: 'https://developers.google.com/web/updates/2017/11/devtools-release-notes#perf-monitor',
            },
            {
                title: 'Console sidebar',
                subtitle: 'Reduce console noise and focus on the messages that are important to you.',
                link: 'https://developers.google.com/web/updates/2017/11/devtools-release-notes#console-sidebar',
            },
            {
                title: 'Group similar console messages',
                subtitle: 'The Console now groups similar messages by default.',
                link: 'https://developers.google.com/web/updates/2017/11/devtools-release-notes#group-similar',
            },
        ],
        link: 'https://developers.google.com/web/updates/2017/11/devtools-release-notes',
    },
    {
        version: 6,
        header: 'Highlights from the Chrome 63 update',
        highlights: [
            {
                title: 'Multi-client remote debugging',
                subtitle: 'Use DevTools while debugging your app from an IDE or testing framework.',
                link: 'https://developers.google.com/web/updates/2017/10/devtools-release-notes#multi-client',
            },
            {
                title: 'Workspaces 2.0',
                subtitle: 'Save changes made in DevTools to disk, now with more helpful UI and better auto-mapping.',
                link: 'https://developers.google.com/web/updates/2017/10/devtools-release-notes#workspaces',
            },
            {
                title: 'Four new audits',
                subtitle: 'Including “Appropriate aspect ratios for images”, “Avoid JS libraries with known vulnerabilities”, and more.',
                link: 'https://developers.google.com/web/updates/2017/10/devtools-release-notes#audits',
            },
            {
                title: 'Custom push notifications',
                subtitle: 'Simulate push notifications with custom data.',
                link: 'https://developers.google.com/web/updates/2017/10/devtools-release-notes#push',
            },
            {
                title: 'Custom background sync events',
                subtitle: 'Trigger background sync events with custom tags.',
                link: 'https://developers.google.com/web/updates/2017/10/devtools-release-notes#sync',
            },
        ],
        link: 'https://developers.google.com/web/updates/2017/10/devtools-release-notes',
    },
    {
        version: 5,
        header: 'Highlights from the Chrome 62 update',
        highlights: [
            {
                title: 'Top-level await operators in the Console',
                subtitle: 'Use await to conveniently experiment with asynchronous functions in the Console.',
                link: 'https://developers.google.com/web/updates/2017/08/devtools-release-notes#await',
            },
            {
                title: 'New screenshot workflows',
                subtitle: 'Take screenshots of a portion of the viewport, or of specific HTML nodes.',
                link: 'https://developers.google.com/web/updates/2017/08/devtools-release-notes#screenshots',
            },
            {
                title: 'CSS Grid highlighting',
                subtitle: 'Hover over an element to see the CSS Grid that’s affecting it.',
                link: 'https://developers.google.com/web/updates/2017/08/devtools-release-notes#css-grid-highlighting',
            },
            {
                title: 'A new Console API for querying objects',
                subtitle: 'Call `queryObjects(Constructor)` to get an array of objects instantiated with that constructor.',
                link: 'https://developers.google.com/web/updates/2017/08/devtools-release-notes#query-objects',
            },
            {
                title: 'New Console filters',
                subtitle: 'Filter out logging noise with the new negative and URL filters.',
                link: 'https://developers.google.com/web/updates/2017/08/devtools-release-notes#console-filters',
            },
            {
                title: 'HAR imports in the Network panel',
                subtitle: 'Drag-and-drop a HAR file to analyze a previous network recording.',
                link: 'https://developers.google.com/web/updates/2017/08/devtools-release-notes#har-imports',
            },
            {
                title: 'Previewable cache resources in the Application panel',
                subtitle: 'Click a row in a Cache Storage table to see a preview of that resource.',
                link: 'https://developers.google.com/web/updates/2017/08/devtools-release-notes#cache-preview',
            },
        ],
        link: 'https://developers.google.com/web/updates/2017/08/devtools-release-notes',
    },
    {
        version: 4,
        header: 'Highlights from the Chrome 61 update',
        highlights: [
            {
                title: 'Mobile device throttling',
                subtitle: 'Simulate a mobile device’s CPU and network throttling from Device Mode.',
                link: 'https://developers.google.com/web/updates/2017/07/devtools-release-notes#throttling',
            },
            {
                title: 'Storage usage',
                subtitle: 'See how much storage (IndexedDB, local, session, cache, etc.) an origin is using.',
                link: 'https://developers.google.com/web/updates/2017/07/devtools-release-notes#storage',
            },
            {
                title: 'Cache timestamps',
                subtitle: 'View when a service worker cached a response.',
                link: 'https://developers.google.com/web/updates/2017/07/devtools-release-notes#time-cached',
            },
            {
                title: 'ES6 Modules support',
                subtitle: 'Debug ES6 Modules natively from the Sources panel.',
                link: 'https://developers.google.com/web/updates/2017/07/devtools-release-notes#modules',
            },
        ],
        link: 'https://developers.google.com/web/updates/2017/07/devtools-release-notes',
    },
    {
        version: 3,
        header: 'Highlights from the Chrome 60 update',
        highlights: [
            {
                title: 'New Audits panel, powered by Lighthouse',
                subtitle: 'Find out whether your site qualifies as a Progressive Web App, measure the accessibility and performance of a page, and discover best practices.',
                link: 'https://developers.google.com/web/updates/2017/05/devtools-release-notes#lighthouse',
            },
            {
                title: 'Third-party badges',
                subtitle: 'See what third-party entities are logging to the Console, making network requests, and causing work during performance recordings.',
                link: 'https://developers.google.com/web/updates/2017/05/devtools-release-notes#badges',
            },
            {
                title: 'New "Continue to Here" gesture',
                subtitle: 'While paused on a line of code, hold ' + continueToHereShortcut +
                    ' and then click to continue to another line of code.',
                link: 'https://developers.google.com/web/updates/2017/05/devtools-release-notes#continue',
            },
            {
                title: 'Step into async',
                subtitle: 'Predictably step into a promise resolution or other asynchronous code with a single gesture.',
                link: 'https://developers.google.com/web/updates/2017/05/devtools-release-notes#step-into-async',
            },
            {
                title: 'More informative object previews',
                subtitle: 'Get a better idea of the contents of objects when logging them to the Console.',
                link: 'https://developers.google.com/web/updates/2017/05/devtools-release-notes#object-previews',
            },
            {
                title: 'Real-time Coverage tab updates',
                subtitle: 'See what code is being used in real-time.',
                link: 'https://developers.google.com/web/updates/2017/05/devtools-release-notes#coverage',
            },
        ],
        link: 'https://developers.google.com/web/updates/2017/05/devtools-release-notes',
    },
    {
        version: 2,
        header: 'Highlights from Chrome 59 update',
        highlights: [
            {
                title: 'CSS and JS code coverage',
                subtitle: 'Find unused CSS and JS with the new Coverage drawer.',
                link: 'https://developers.google.com/web/updates/2017/04/devtools-release-notes#coverage',
            },
            {
                title: 'Full-page screenshots',
                subtitle: 'Take a screenshot of the entire page, from the top of the viewport to the bottom.',
                link: 'https://developers.google.com/web/updates/2017/04/devtools-release-notes#screenshots',
            },
            {
                title: 'Block requests',
                subtitle: 'Manually disable individual requests in the Network panel.',
                link: 'https://developers.google.com/web/updates/2017/04/devtools-release-notes#block-requests',
            },
            {
                title: 'Step over async await',
                subtitle: 'Step through async functions predictably.',
                link: 'https://developers.google.com/web/updates/2017/04/devtools-release-notes#async',
            },
            {
                title: 'Unified Command Menu',
                subtitle: 'Execute commands and open files from the newly-unified Command Menu (' + commandMenuShortcut + ').',
                link: 'https://developers.google.com/web/updates/2017/04/devtools-release-notes#command-menu',
            },
        ],
        link: 'https://developers.google.com/web/updates/2017/04/devtools-release-notes',
    },
    {
        version: 1,
        header: 'Highlights from Chrome 58 update',
        highlights: [
            {
                title: 'New Performance and Memory panels',
                subtitle: 'Head to Performance for JavaScript profiling',
                link: 'https://developers.google.com/web/updates/2017/03/devtools-release-notes#performance-panel',
            },
            {
                title: 'Editable cookies',
                subtitle: 'You can edit any existing cookies and create new ones in the Application panel',
                link: 'https://developers.google.com/web/updates/2017/03/devtools-release-notes#cookies',
            },
            {
                title: 'Console filtering & settings',
                subtitle: 'Use the text filter or click the Console settings icon to touch up your preferences',
                link: 'https://developers.google.com/web/updates/2017/03/devtools-release-notes#console',
            },
            {
                title: 'Debugger catches out-of-memory errors',
                subtitle: 'See the stack or grab a heap snapshot to see why the app may crash',
                link: 'https://developers.google.com/web/updates/2017/03/devtools-release-notes#out-of-memory-breakpoints',
            },
        ],
        link: 'https://developers.google.com/web/updates/2017/03/devtools-release-notes',
    },
];
//# sourceMappingURL=ReleaseNoteText.js.map