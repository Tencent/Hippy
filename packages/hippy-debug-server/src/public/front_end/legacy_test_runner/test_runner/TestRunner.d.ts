/**
 * @return {boolean}
 */
export function isDebugTest(): boolean;
/**
 * This monkey patches console functions in DevTools context so the console
 * messages are shown in the right places, instead of having all of the console
 * messages printed at the top of the test expectation file (default behavior).
 */
export function _printDevToolsConsole(): void;
export function setInnerResult(updatedInnerResult: any): void;
/**
 * @param {*} text
 */
export function addResult(text: any): void;
export function setInnerCompleteTest(updatedInnerCompleteTest: any): void;
export function completeTest(): void;
/**
 * @param {!Array<string>} textArray
 */
export function addResults(textArray: Array<string>): void;
/**
 * @param {!Array<function()>} tests
 */
export function runTests(tests: Array<() => any>): void;
/**
 * @param {!Object} receiver
 * @param {string} methodName
 * @param {!Function} override
 * @param {boolean=} opt_sticky
 */
export function addSniffer(receiver: Object, methodName: string, override: Function, opt_sticky?: boolean | undefined): void;
/**
 * @param {!Object} receiver
 * @param {string} methodName
 * @return {!Promise<*>}
 */
export function addSnifferPromise(receiver: Object, methodName: string): Promise<any>;
/**
 * @param {string} module
 * @return {!Promise<undefined>}
 */
export function loadModule(module: string): Promise<undefined>;
/**
 * @param {string} module
 * @return {!Promise<void>}
 */
export function loadLegacyModule(module: string): Promise<void>;
/**
 * @param {string} module
 * @return {!Promise<void>}
 */
export function loadTestModule(module: string): Promise<void>;
/**
 * @param {string} panel
 * @return {!Promise.<?UI.Panel.Panel>}
 */
export function showPanel(panel: string): Promise<UI.Panel.Panel | null>;
/**
 * @param {string} key
 * @param {boolean=} ctrlKey
 * @param {boolean=} altKey
 * @param {boolean=} shiftKey
 * @param {boolean=} metaKey
 * @return {!KeyboardEvent}
 */
export function createKeyEvent(key: string, ctrlKey?: boolean | undefined, altKey?: boolean | undefined, shiftKey?: boolean | undefined, metaKey?: boolean | undefined): KeyboardEvent;
/**
 * Wraps a test function with an exception filter. Does not work
 * correctly for async functions; use safeAsyncWrap instead.
 * @param {!Function|undefined} func
 * @param {!Function=} onexception
 * @return {!Function}
 */
export function safeWrap(func: Function | undefined, onexception?: Function | undefined): Function;
/**
 * @param {!Node} node
 * @return {string}
 */
export function textContentWithLineBreaks(node: Node): string;
/**
 * @param {!Node} node
 * @return {string}
 */
export function textContentWithoutStyles(node: Node): string;
/**
 * @param {string} code
 * @return {!Promise<*>}
 */
export function evaluateInPageRemoteObject(code: string): Promise<any>;
/**
 * @param {string} code
 * @param {function(*, !Protocol.Runtime.ExceptionDetails=):void} callback
 */
export function evaluateInPage(code: string, callback: (arg0: any, arg1: any | undefined) => void): Promise<void>;
/**
 * @param {string} code
 * @return {!Promise<undefined|{response: (!SDK.RemoteObject|undefined),
 *   exceptionDetails: (!Protocol.Runtime.ExceptionDetails|undefined)}>}
 */
export function _evaluateInPage(code: string): Promise<{
    response: (any | undefined);
    exceptionDetails: (any | undefined);
} | undefined>;
/**
 * Doesn't append sourceURL to snippets evaluated in inspected page
 * to avoid churning test expectations
 * @param {string} code
 * @param {boolean=} userGesture
 * @return {!Promise<*>}
 */
export function evaluateInPageAnonymously(code: string, userGesture?: boolean | undefined): Promise<any>;
/**
 * @param {string} code
 * @return {!Promise<*>}
 */
export function evaluateInPagePromise(code: string): Promise<any>;
/**
 * @param {string} code
 * @return {!Promise<*>}
 */
export function evaluateInPageAsync(code: string): Promise<any>;
/**
 * @param {string} name
 * @param {!Array<*>} args
 * @return {!Promise<*>}
 */
export function callFunctionInPageAsync(name: string, args: Array<any>): Promise<any>;
/**
 * @param {string} code
 * @param {boolean=} userGesture
 */
export function evaluateInPageWithTimeout(code: string, userGesture?: boolean | undefined): void;
/**
 * @param {function():*} func
 * @param {function(*):void} callback
 */
export function evaluateFunctionInOverlay(func: () => any, callback: (arg0: any) => void): void;
/**
 * @param {boolean} passCondition
 * @param {string} failureText
 */
export function check(passCondition: boolean, failureText: string): void;
/**
 * @param {!Function} callback
 */
export function deprecatedRunAfterPendingDispatches(callback: Function): void;
/**
 * This ensures a base tag is set so all DOM references
 * are relative to the test file and not the inspected page
 * (i.e. http/tests/devtools/resources/inspected-page.html).
 * @param {string} html
 * @return {!Promise<*>}
 */
export function loadHTML(html: string): Promise<any>;
/**
 * @param {string} path
 * @return {!Promise<*>}
 */
export function addScriptTag(path: string): Promise<any>;
/**
 * @param {string} path
 * @return {!Promise<*>}
 */
export function addStylesheetTag(path: string): Promise<any>;
/**
 * NOTE you should manually ensure the path is correct. There
 * is no error event triggered if it is incorrect, and this is
 * in line with the standard (crbug 365457).
 * @param {string} path
 * @param {!Object|undefined} options
 * @return {!Promise<*>}
 */
export function addIframe(path: string, options?: Object | undefined): Promise<any>;
/**
 * The old test framework executed certain snippets in the inspected page
 * context as part of loading a test helper file.
 *
 * This is deprecated because:
 * 1) it makes the testing API less intuitive (need to read the various *TestRunner.js
 * files to know which helper functions are available in the inspected page).
 * 2) it complicates the test framework's module loading process.
 *
 * In most cases, this is used to set up inspected page functions (e.g. makeSimpleXHR)
 * which should become a *TestRunner method (e.g. NetworkTestRunner.makeSimpleXHR)
 * that calls evaluateInPageAnonymously(...).
 * @param {string} code
 */
export function deprecatedInitAsync(code: string): Promise<void>;
/**
 * @param {string} title
 */
export function markStep(title: string): void;
export function startDumpingProtocolMessages(): void;
/**
 * @param {string} url
 * @param {string} content
 * @param {!SDK.ResourceTreeFrame} frame
 */
export function addScriptForFrame(url: string, content: string, frame: any): void;
/**
 * @param {!Object} object
 * @param {!TestRunner.CustomFormatters=} customFormatters
 * @param {string=} prefix
 * @param {string=} firstLinePrefix
 */
export function addObject(object: Object, customFormatters?: any | undefined, prefix?: string | undefined, firstLinePrefix?: string | undefined): void;
/**
 * @param {!Array} array
 * @param {!TestRunner.CustomFormatters=} customFormatters
 * @param {string=} prefix
 * @param {string=} firstLinePrefix
 */
export function addArray(array: any[], customFormatters?: any | undefined, prefix?: string | undefined, firstLinePrefix?: string | undefined): void;
/**
 * @param {!Node} node
 */
export function dumpDeepInnerHTML(node: Node): void;
/**
 * @param {!Node} node
 * @return {string}
 */
export function deepTextContent(node: Node): string;
/**
 * @param {*} value
 * @param {!TestRunner.CustomFormatters=} customFormatters
 * @param {string=} prefix
 * @param {string=} prefixWithName
 */
export function dump(value: any, customFormatters?: any | undefined, prefix?: string | undefined, prefixWithName?: string | undefined): void;
/**
 * @param {symbol} eventName
 * @param {!Common.ObjectWrapper.ObjectWrapper} obj
 * @param {function(?):boolean=} condition
 * @return {!Promise}
 */
export function waitForEvent(eventName: symbol, obj: Common.ObjectWrapper.ObjectWrapper, condition?: ((arg0: unknown) => boolean) | undefined): Promise<any>;
/**
 * @param {function(!SDK.Target):boolean} filter
 * @return {!Promise<!SDK.Target>}
 */
export function waitForTarget(filter: (arg0: any) => boolean): Promise<any>;
/**
 * @param {!SDK.Target} targetToRemove
 * @return {!Promise<!SDK.Target>}
 */
export function waitForTargetRemoved(targetToRemove: any): Promise<any>;
/**
 * @param {!SDK.RuntimeModel} runtimeModel
 * @return {!Promise}
 */
export function waitForExecutionContext(runtimeModel: any): Promise<any>;
/**
 * @param {!SDK.ExecutionContext} context
 * @return {!Promise}
 */
export function waitForExecutionContextDestroyed(context: any): Promise<any>;
/**
 * @param {number} a
 * @param {number} b
 * @param {string=} message
 */
export function assertGreaterOrEqual(a: number, b: number, message?: string | undefined): void;
/**
 * @param {string} url
 * @param {function():void} callback
 */
export function navigate(url: string, callback: () => void): void;
/**
 * @return {!Promise}
 */
export function navigatePromise(url: any): Promise<any>;
export function _pageNavigated(): void;
/**
 * @param {function():void} callback
 */
export function hardReloadPage(callback: () => void): void;
/**
 * @param {function():void} callback
 */
export function reloadPage(callback: () => void): void;
/**
 * @param {(string|undefined)} injectedScript
 * @param {function():void} callback
 */
export function reloadPageWithInjectedScript(injectedScript: (string | undefined), callback: () => void): void;
/**
 * @return {!Promise}
 */
export function reloadPagePromise(): Promise<any>;
/**
 * @param {boolean} hardReload
 * @param {(string|undefined)} injectedScript
 * @param {function():void} callback
 */
export function _innerReloadPage(hardReload: boolean, injectedScript: (string | undefined), callback: () => void): void;
export function pageLoaded(): void;
export function _handlePageLoaded(): Promise<void>;
/**
 * @param {function():void} callback
 */
export function waitForPageLoad(callback: () => void): void;
/**
 * @param {function():void} callback
 */
export function runWhenPageLoads(callback: () => void): void;
/**
 * @param {!Array<function(function():void)>} testSuite
 */
export function runTestSuite(testSuite: Array<(arg0: () => void) => any>): void;
/**
 * @param {!Array<function():Promise<*>>} testSuite
 */
export function runAsyncTestSuite(testSuite: Array<() => Promise<any>>): Promise<void>;
/**
 * @param {*} expected
 * @param {*} found
 * @param {string} message
 */
export function assertEquals(expected: any, found: any, message: string): void;
/**
 * @param {*} found
 * @param {string} message
 */
export function assertTrue(found: any, message: string): void;
/**
 * @param {!Object} receiver
 * @param {string} methodName
 * @param {!Function} override
 * @param {boolean=} opt_sticky
 * @return {!Function}
 */
export function override(receiver: Object, methodName: string, override: Function, opt_sticky?: boolean | undefined): Function;
/**
 * @param {string} text
 * @return {string}
 */
export function clearSpecificInfoFromStackFrames(text: string): string;
export function hideInspectorView(): void;
/**
 * @return {?SDK.ResourceTreeFrame}
 */
export function mainFrame(): any | null;
/**
 * @return {!Array<!Root.Runtime.Module>}
 */
export function loadedModules(): Array<Root.Runtime.Module>;
/**
 * @param {!Array<!Root.Runtime.Module>} relativeTo
 * @return {!Array<!Root.Runtime.Module>}
 */
export function dumpLoadedModules(relativeTo: Array<Root.Runtime.Module>): Array<Root.Runtime.Module>;
/**
 * @param {string} urlSuffix
 * @param {!Workspace.Workspace.projectTypes=} projectType
 * @return {!Promise}
 */
export function waitForUISourceCode(urlSuffix: string, projectType?: Workspace.Workspace.projectTypes | undefined): Promise<any>;
/**
 * @param {!Function} callback
 */
export function waitForUISourceCodeRemoved(callback: Function): void;
/**
 * @param {string=} url
 * @return {string}
 */
export function url(url?: string | undefined): string;
/**
 * @param {string} str
 * @param {string} mimeType
 * @return {!Promise.<undefined>}
 */
export function dumpSyntaxHighlight(str: string, mimeType: string): Promise<undefined>;
/**
 * @param {string} querySelector
 */
export function dumpInspectedPageElementText(querySelector: string): Promise<void>;
/**
 * This method blocks until all currently queued live location update handlers are done.
 *
 * Creating and updating live locations causes the update handler of each live location
 * to run. These update handlers are potentially asynchronous and usually cause re-rendering or
 * UI updates. Web tests then check for these updates.
 * To give tests more control, waitForPendingLiveLocationUpdates returns a promise that resolves
 * once all currently-pending updates (at call time) are completed.
 */
export function waitForPendingLiveLocationUpdates(): Promise<void>;
export namespace formatters {
    /**
   * @param {*} value
   * @return {string}
   */
    function formatAsTypeName(value: any): string;
    /**
   * @param {*} value
   * @return {string}
   */
    function formatAsTypeName(value: any): string;
    /**
   * @param {*} value
   * @return {string}
   */
    function formatAsTypeNameOrNull(value: any): string;
    /**
   * @param {*} value
   * @return {string}
   */
    function formatAsTypeNameOrNull(value: any): string;
    /**
   * @param {*} value
   * @return {string|!Date}
   */
    function formatAsRecentTime(value: any): string | Date;
    /**
   * @param {*} value
   * @return {string|!Date}
   */
    function formatAsRecentTime(value: any): string | Date;
    /**
   * @param {string} value
   * @return {string}
   */
    function formatAsURL(value: string): string;
    /**
   * @param {string} value
   * @return {string}
   */
    function formatAsURL(value: string): string;
    /**
   * @param {string} value
   * @return {string}
   */
    function formatAsDescription(value: string): string;
    /**
   * @param {string} value
   * @return {string}
   */
    function formatAsDescription(value: string): string;
}
export class StringOutputStream {
    /**
     * @param {function(string):void} callback
     */
    constructor(callback: (arg0: string) => void);
    _callback: (arg0: string) => void;
    _buffer: string;
    /**
     * @param {string} fileName
     * @return {!Promise<boolean>}
     */
    open(fileName: string): Promise<boolean>;
    /**
     * @param {string} chunk
     */
    write(chunk: string): Promise<void>;
    close(): Promise<void>;
}
/**
 * @template V
 */
export class MockSetting<V> {
    /**
     * @param {V} value
     */
    constructor(value: V);
    _value: V;
    /**
     * @return {V}
     */
    get(): V;
    /**
     * @param {V} value
     */
    set(value: V): void;
}
export function findLineEndingIndexes(inputString: string): Array<number>;
import * as UI from "../../ui/legacy/legacy.js";
import * as Common from "../../core/common/common.js";
import * as Root from "../../core/root/root.js";
import * as Workspace from "../../models/workspace/workspace.js";
