//
// Copyright (C) Microsoft. All rights reserved.
//

import { ProtocolAdapter } from '../../protocol';
import { IosTarget } from '../target';
import { ScreencastSession } from './screencast';
import HeapAdapter from './heap-adapter';
import TraceAdapter from './trace-adapter';

declare let document: any;
declare let MouseEvent: any;

interface IRange {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

interface IDisabledStyle {
  content: string;
  range: IRange;
}

/**
 * 注册消息监听
 * 1. 对协议进行转换，若 resolve 值不为空，则发送至接收方
 * 2. 如resolve 为空，则消息被过滤
 * 3. 可在监听到事件后，直接 callTarget mock 数据到 app 端
 * 4. 也可以调用 fireResultToTools mock 数据到 devtool 端
 * 5. 可以通过 fireEventToTools 发送事件到 devtool 端
 * 6. 根据 messageFilter 的前缀判断监听事件来源，tools:: 表示来自 devtool，target:: 表示来自 app 端
 *
 * @param msg
 * @returns Promise.resolve<FilteredMsg> FilteredMsg不为空，则直接发送到发送方
 */
export abstract class IOSProtocol extends ProtocolAdapter {
  public static BEGIN_COMMENT = '/* ';
  public static END_COMMENT = ' */';
  public static SEPARATOR = ': ';
  /**
   * Converts a given index to line and column, offset from a given range otherwise from 0.
   * @returns Line column converted from the given index and offset start range.
   */
  private static getLineColumnFromIndex(
    text: string,
    index: number,
    startRange?: IRange,
  ): { line: number; column: number } {
    if (text === null || typeof text === 'undefined' || index < 0 || index > text.length) {
      return null;
    }

    let line = startRange ? startRange.startLine : 0;
    let column = startRange ? startRange.startColumn : 0;
    for (let i = 0, { length } = text; i < length && i < index; i += 1) {
      if (text[i] === '\r' && i + 1 < text.length && text[i + 1] === '\n') {
        i += 1;
        line += 1;
        column = 0;
      } else if (text[i] === '\n' || text[i] === '\r') {
        line += 1;
        column = 0;
      } else {
        column += 1;
      }
    }

    return { line, column };
  }

  /**
   * Extract a sequence of texts with ranges corresponding to block comments in the CSS.
   * The texts may or may not contain CSS properties.
   * @returns An array of the disabled styles
   */
  private static extractDisabledStyles(styleText: string, range: IRange): IDisabledStyle[] {
    const startIndices: number[] = [];
    const styles: IDisabledStyle[] = [];

    for (let index = 0, { length } = styleText; index < length; index += 1) {
      if (styleText.substr(index, IOSProtocol.BEGIN_COMMENT.length) === IOSProtocol.BEGIN_COMMENT) {
        startIndices.push(index);
        index = index + IOSProtocol.BEGIN_COMMENT.length - 1;
      } else if (styleText.substr(index, IOSProtocol.END_COMMENT.length) === IOSProtocol.END_COMMENT) {
        if (startIndices.length === 0) {
          // Invalid state
          return [];
        }

        const startIndex = startIndices.pop();
        const endIndex = index + IOSProtocol.END_COMMENT.length;
        const startRange = IOSProtocol.getLineColumnFromIndex(styleText, startIndex, range);
        const endRange = IOSProtocol.getLineColumnFromIndex(styleText, endIndex, range);

        const propertyItem: IDisabledStyle = {
          content: styleText.substring(startIndex, endIndex),
          range: {
            startLine: startRange.line,
            startColumn: startRange.column,
            endLine: endRange.line,
            endColumn: endRange.column,
          },
        };

        styles.push(propertyItem);
        index = endIndex - 1;
      }
    }

    if (startIndices.length !== 0) {
      // Invalid state
      return [];
    }

    return styles;
  }

  protected _styleMap: Map<string, any>;
  protected _isEvaluating: boolean;
  protected _lastScriptEval: string;
  protected _lastNodeId: number;
  protected _lastPageExecutionContextId: number;
  protected _screencastSession: ScreencastSession;

  constructor(target: IosTarget) {
    super(target);

    this._styleMap = new Map<string, any>();

    this.target.on('tools::DOM.getDocument', () => this.onDomGetDocument());

    this.target.addMessageFilter('tools::CSS.setStyleTexts', (msg) => this.onSetStyleTexts(msg));
    this.target.addMessageFilter('tools::CSS.getMatchedStylesForNode', (msg) => this.onGetMatchedStylesForNode(msg));
    this.target.addMessageFilter('tools::CSS.getBackgroundColors', (msg) => this.onGetBackgroundColors(msg));
    this.target.addMessageFilter('tools::CSS.addRule', (msg) => this.onAddRule(msg));
    this.target.addMessageFilter('tools::CSS.getPlatformFontsForNode', (msg) => this.onGetPlatformFontsForNode(msg));
    this.target.addMessageFilter('target::CSS.getMatchedStylesForNode', (msg) =>
      this.onGetMatchedStylesForNodeResult(msg),
    );

    this.target.addMessageFilter('tools::Page.startScreencast', (msg) => this.onStartScreencast(msg));
    this.target.addMessageFilter('tools::Page.stopScreencast', (msg) => this.onStopScreencast(msg));
    this.target.addMessageFilter('tools::Page.screencastFrameAck', (msg) => this.onScreencastFrameAck(msg));
    this.target.addMessageFilter('tools::Page.getNavigationHistory', (msg) => this.onGetNavigationHistory(msg));
    this.target.addMessageFilter('tools::Page.setOverlayMessage', (msg) => {
      msg.method = 'Debugger.setOverlayMessage';
      return Promise.resolve(msg);
    });
    this.target.addMessageFilter('tools::Page.configureOverlay', (msg) => {
      msg.method = 'Debugger.setOverlayMessage';
      return Promise.resolve(msg);
    });

    this.target.addMessageFilter('tools::DOM.enable', (msg) => this.onDomEnable(msg));
    this.target.addMessageFilter('tools::DOM.setInspectMode', (msg) => this.onSetInspectMode(msg));
    this.target.addMessageFilter('tools::DOM.setInspectedNode', (msg) => {
      msg.method = 'Console.addInspectedNode';
      return Promise.resolve(msg);
    });
    this.target.addMessageFilter('tools::DOM.pushNodesByBackendIdsToFrontend', (msg) =>
      this.onPushNodesByBackendIdsToFrontend(msg),
    );
    this.target.addMessageFilter('tools::DOM.getBoxModel', (msg) => this.onGetBoxModel(msg));
    this.target.addMessageFilter('tools::DOM.getNodeForLocation', (msg) => this.onGetNodeForLocation(msg));

    this.target.addMessageFilter('tools::DOMDebugger.getEventListeners', (msg) =>
      this.DOMDebuggerOnGetEventListeners(msg),
    );

    this.target.addMessageFilter('tools::Debugger.canSetScriptSource', (msg) => this.onCanSetScriptSource(msg));
    this.target.addMessageFilter('tools::Debugger.setBlackboxPatterns', (msg) => this.onSetBlackboxPatterns(msg));
    this.target.addMessageFilter('tools::Debugger.setAsyncCallStackDepth', (msg) => this.onSetAsyncCallStackDepth(msg));
    this.target.addMessageFilter('tools::Debugger.enable', (msg) => this.onDebuggerEnable(msg));
    this.target.addMessageFilter('target::Debugger.scriptParsed', (msg) => this.onScriptParsed(msg));

    this.target.addMessageFilter('tools::Emulation.canEmulate', (msg) => this.onCanEmulate(msg));
    this.target.addMessageFilter('tools::Emulation.setTouchEmulationEnabled', (msg) => {
      msg.method = 'Page.setTouchEmulationEnabled';
      return Promise.resolve(msg);
    });
    this.target.addMessageFilter('tools::Emulation.setScriptExecutionDisabled', (msg) => {
      msg.method = 'Page.setScriptExecutionDisabled';
      return Promise.resolve(msg);
    });
    this.target.addMessageFilter('tools::Emulation.setEmulatedMedia', (msg) => {
      msg.method = 'Page.setEmulatedMedia';
      return Promise.resolve(msg);
    });

    this.target.addMessageFilter('tools::Rendering.setShowPaintRects', (msg) => {
      msg.method = 'Page.setShowPaintRects';
      return Promise.resolve(msg);
    });

    this.target.addMessageFilter('tools::Input.emulateTouchFromMouseEvent', (msg) =>
      this.onEmulateTouchFromMouseEvent(msg),
    );

    this.target.addMessageFilter('tools::Log.clear', (msg) => {
      msg.method = 'Console.clearMessages';
      return Promise.resolve(msg);
    });
    this.target.addMessageFilter('tools::Log.disable', (msg) => {
      msg.method = 'Console.disable';
      return Promise.resolve(msg);
    });
    this.target.addMessageFilter('tools::Log.enable', (msg) => {
      msg.method = 'Console.enable';
      return Promise.resolve(msg);
    });
    this.target.addMessageFilter('target::Console.messageAdded', (msg) => this.onConsoleMessageAdded(msg));

    this.target.addMessageFilter('tools::Network.getCookies', (msg) => {
      msg.method = 'Page.getCookies';
      return Promise.resolve(msg);
    });
    this.target.addMessageFilter('tools::Network.deleteCookie', (msg) => {
      msg.method = 'Page.deleteCookie';
      return Promise.resolve(msg);
    });
    this.target.addMessageFilter('tools::Network.setMonitoringXHREnabled', (msg) => {
      msg.method = 'Console.setMonitoringXHREnabled';
      return Promise.resolve(msg);
    });
    this.target.addMessageFilter('tools::Network.canEmulateNetworkConditions', (msg) =>
      this.onCanEmulateNetworkConditions(msg),
    );

    this.target.addMessageFilter('tools::Runtime.compileScript', (msg) => this.onRuntimeOnCompileScript(msg));
    this.target.addMessageFilter('target::Runtime.executionContextCreated', (msg) =>
      this.onExecutionContextCreated(msg),
    );
    this.target.addMessageFilter('target::Runtime.evaluate', (msg) => this.onEvaluate(msg));
    this.target.addMessageFilter('target::Runtime.getProperties', (msg) => this.onRuntimeGetProperties(msg));

    this.target.addMessageFilter('target::Inspector.inspect', (msg) => this.onInspect(msg));

    // 内存相关协议
    this.target.addMessageFilter('tools::HeapProfiler.enable', (msg) => this.onHeapEnable(msg));
    this.target.addMessageFilter('tools::HeapProfiler.disable', (msg) => this.onHeapDisable(msg));
    this.target.addMessageFilter('tools::HeapProfiler.takeHeapSnapshot', (msg) => this.onTakeHeapSnapshot(msg));
    this.target.addMessageFilter('tools::HeapProfiler.collectGarbage', (msg) => this.onGc(msg));

    // performance
    this.target.addMessageFilter('tools::Tracing.start', (msg) => this.onPerformanceProfileStartTracking(msg));
    this.target.addMessageFilter('tools::Tracing.end', (msg) => this.onPerformanceProfileStopTracking(msg));
    this.target.addMessageFilter('target::ScriptProfiler.trackingStart', (msg) =>
      this.onPerformanceProfileStartEvent(msg),
    );
    this.target.addMessageFilter('target::ScriptProfiler.trackingUpdate', (msg) =>
      this.onPerformanceProfileUpdateEvent(msg),
    );
    this.target.addMessageFilter('target::ScriptProfiler.trackingComplete', (msg) =>
      this.onPerformanceProfileCompleteEvent(msg),
    );
  }

  protected enumerateStyleSheets(): void {
    this.target.callTarget('CSS.getAllStyleSheets', {}).then((msg) => {
      if (msg.headers) {
        for (const header of msg.headers) {
          header.isInline = false;
          header.startLine = 0;
          header.startColumn = 0;
          this.target.fireEventToTools('CSS.styleSheetAdded', { header });
        }
      }
    });
  }

  /* eslint-disable @typescript-eslint/no-unused-vars */
  protected mapSelectorList(selectorList): void {
    // Each iOS version needs to map this differently
  }

  protected mapRule(cssRule): void {
    if ('ruleId' in cssRule) {
      cssRule.styleSheetId = cssRule.ruleId.styleSheetId;
      delete cssRule.ruleId;
    }

    this.mapSelectorList(cssRule.selectorList);
    this.mapStyle(cssRule.style, cssRule.origin);

    delete cssRule.sourceLine;
  }

  protected mapStyle(cssStyle, ruleOrigin): void {
    if (cssStyle.cssText) {
      const disabled = IOSProtocol.extractDisabledStyles(cssStyle.cssText, cssStyle.range);
      for (let i = 0; i < disabled.length; i += 1) {
        const text = disabled[i].content
          .trim()
          .replace(/^\/\*\s*/, '')
          .replace(/;\s*\*\/$/, '');
        const parts = text.split(':');

        if (cssStyle.cssProperties) {
          let index = cssStyle.cssProperties.length;
          for (let j = 0; j < cssStyle.cssProperties.length; j += 1) {
            if (
              cssStyle.cssProperties[j].range &&
              (cssStyle.cssProperties[j].range.startLine > disabled[i].range.startLine ||
                (cssStyle.cssProperties[j].range.startLine === disabled[i].range.startLine &&
                  cssStyle.cssProperties[j].range.startColumn > disabled[i].range.startColumn))
            ) {
              index = j;
              break;
            }
          }

          cssStyle.cssProperties.splice(index, 0, {
            implicit: false,
            name: parts[0],
            range: disabled[i].range,
            status: 'disabled',
            text: disabled[i].content,
            value: parts[1],
          });
        }
      }
    }

    for (const cssProperty of cssStyle.cssProperties) {
      this.mapCssProperty(cssProperty);
    }

    if (ruleOrigin !== 'user-agent') {
      cssStyle.styleSheetId = cssStyle.styleId.styleSheetId;
      const styleKey = `${cssStyle.styleSheetId}_${JSON.stringify(cssStyle.range)}`;
      this._styleMap.set(styleKey, cssStyle.styleId);
    }

    delete cssStyle.styleId;
    delete cssStyle.sourceLine;
    delete cssStyle.sourceURL;
    delete cssStyle.width;
    delete cssStyle.height;
  }

  protected mapCssProperty(cssProperty): void {
    if (cssProperty.status === 'disabled') {
      cssProperty.disabled = true;
    } else if (cssProperty.status === 'active') {
      cssProperty.disabled = false;
    }

    delete cssProperty.status;

    cssProperty.important = !!cssProperty.priority;
    delete cssProperty.priority;
  }

  private onDomGetDocument(): void {
    // Rundown the stylesheets when the page navigates
    this.enumerateStyleSheets();
  }

  private onSetStyleTexts(msg: any): Promise<any> {
    const resultId = msg.id;
    const promises: Promise<any>[] = [];

    // Convert all the requests into individual calls to setStyleText
    for (let i = 0; i < msg.params.edits.length; i += 1) {
      const edit = msg.params.edits[i];
      const paramsGetStyleSheet = {
        styleSheetId: edit.styleSheetId,
      };

      // iOS uses ordinals to map CSSRules to a location in the document. Chromium uses ranges.
      // Fortunately, if we get the style sheet, we can with minimal effort find the existing range that matches the Chromium edit range and return that ordinal in the rules listen
      // We make the assumption that a rule location can only match once and return the first instance.
      const setStyleText = this.target.callTarget('CSS.getStyleSheet', paramsGetStyleSheet).then((result) => {
        if (!result.styleSheet || !result.styleSheet.rules) {
          console.error('iOS returned a value we were not expecting for getStyleSheet');
          return Promise.resolve(null);
        }

        const { length } = result.styleSheet.rules;
        for (let ordinal = 0; ordinal < length; ordinal += 1) {
          const rule = result.styleSheet.rules[ordinal];
          if (this.compareRanges(rule.style.range, edit.range)) {
            const params = {
              styleId: {
                styleSheetId: edit.styleSheetId,
                ordinal,
              },
              text: edit.text,
            };

            return this.target.callTarget('CSS.setStyleText', params).then((setStyleResult) => {
              this.mapStyle(setStyleResult.style, '');
              return setStyleResult.style;
            });
          }
        }
      });

      promises.push(setStyleText);
    }

    // Combine all the setStyleText calls into a single result
    Promise.all(promises).then((allResults) => {
      const result = {
        styles: allResults,
      };

      this.target.fireResultToTools(resultId, result);
    });

    // Resolve the original promise with null to prevent 'setStyleTexts' from going to the target
    return Promise.resolve(null);
  }

  // Called on a Chrome range and an iOS range
  private compareRanges(rangeLeft: any, rangeRight: any) {
    return (
      rangeLeft.startLine === rangeRight.startLine &&
      rangeLeft.endLine === rangeRight.endLine &&
      rangeLeft.startColumn === rangeRight.startColumn &&
      rangeLeft.endColumn === rangeRight.endColumn
    );
  }

  private onGetMatchedStylesForNode(msg: any): Promise<any> {
    // Store the last selected nodeId so we can add new rules to this node
    this._lastNodeId = msg.params.nodeId;
    return Promise.resolve(msg);
  }

  private onCanEmulate(msg: any): Promise<any> {
    const result = {
      result: true,
    };
    this.target.fireResultToTools(msg.id, result);
    return Promise.resolve(null);
  }

  private onGetPlatformFontsForNode(msg: any): Promise<any> {
    const result = {
      fonts: [],
    };

    this.target.fireResultToTools(msg.id, result);
    return Promise.resolve(null);
  }

  private onGetBackgroundColors(msg: any): Promise<any> {
    const result = {
      backgroundColors: [],
    };

    this.target.fireResultToTools(msg.id, result);
    return Promise.resolve(null);
  }

  private onAddRule(msg: any): Promise<any> {
    // Convert the chrome new rule into an ios rule on the current node
    const selector = msg.params.ruleText.trim().replace('{}', '');
    const params = {
      contextNodeId: this._lastNodeId,
      selector,
    };

    this.target.callTarget('CSS.addRule', params).then((result) => {
      this.mapRule(result.rule);
      this.target.fireResultToTools(msg.id, result);
    });

    return Promise.resolve(null);
  }

  private onCanSetScriptSource(msg: any): Promise<any> {
    const result = {
      result: false,
    };

    this.target.fireResultToTools(msg.id, result);
    return Promise.resolve(null);
  }

  private onSetBlackboxPatterns(msg: any): Promise<any> {
    const result = {};

    this.target.fireResultToTools(msg.id, result);
    return Promise.resolve(null);
  }

  private onSetAsyncCallStackDepth(msg: any): Promise<any> {
    const result = {
      result: true,
    };

    this.target.fireResultToTools(msg.id, result);
    return Promise.resolve(null);
  }

  private onDebuggerEnable(msg: any): Promise<any> {
    this.target.callTarget('Debugger.setBreakpointsActive', { active: true });
    return Promise.resolve(msg);
  }

  private onGetMatchedStylesForNodeResult(msg: any): Promise<any> {
    const { result } = msg;

    if (result) {
      // Convert all the rules into the chrome format
      for (const i in result.matchedCSSRules) {
        if (result.matchedCSSRules[i].rule) {
          this.mapRule(result.matchedCSSRules[i].rule);
        }
      }

      for (const i in result.inherited) {
        if (result.inherited[i].matchedCSSRules) {
          for (const j in result.inherited[i].matchedCSSRules) {
            if (result.inherited[i].matchedCSSRules[j].rule) {
              this.mapRule(result.inherited[i].matchedCSSRules[j].rule);
            }
          }
        }
      }
    }

    return Promise.resolve(msg);
  }

  private onExecutionContextCreated(msg: any): Promise<any> {
    if (msg.params?.context) {
      if (!msg.params.context.origin) {
        msg.params.context.origin = msg.params.context.name;
      }

      if (msg.params.context.isPageContext) {
        this._lastPageExecutionContextId = msg.params.context.id;
      }

      if (msg.params.context.frameId) {
        msg.params.context.auxData = {
          frameId: msg.params.context.frameId,
          isDefault: true,
        };
        delete msg.params.context.frameId;
      }
    }

    return Promise.resolve(msg);
  }

  private onEvaluate(msg: any): Promise<any> {
    if (msg.result?.wasThrown) {
      msg.result.result.subtype = 'error';
      msg.result.exceptionDetails = {
        text: msg.result.result.description,
        url: '',
        scriptId: this._lastScriptEval,
        line: 1,
        column: 0,
        stack: {
          callFrames: [
            {
              functionName: '',
              scriptId: this._lastScriptEval,
              url: '',
              lineNumber: 1,
              columnNumber: 1,
            },
          ],
        },
      };
    } else if (msg.result?.result?.preview) {
      msg.result.result.preview.description = msg.result.result.description;
      msg.result.result.preview.type = 'object';
    }

    return Promise.resolve(msg);
  }

  private onRuntimeOnCompileScript(msg: any): Promise<any> {
    const params = {
      expression: msg.params.expression,
      contextId: msg.params.executionContextId,
    };

    this.target.callTarget('Runtime.evaluate', params).then(() => {
      const results = {
        scriptId: null,
        exceptionDetails: null,
      };
      this.target.fireResultToTools(msg.id, results);
    });

    return Promise.resolve(null);
  }

  private onRuntimeGetProperties(msg: any): Promise<any> {
    const newPropertyDescriptors = [];

    for (let i = 0; i < msg.result.result.length; i += 1) {
      if (msg.result.result[i].isOwn || msg.result.result[i].nativeGetter) {
        msg.result.result[i].isOwn = true;
        newPropertyDescriptors.push(msg.result.result[i]);
      }
    }
    msg.result.result = null;
    msg.result.result = newPropertyDescriptors;

    return Promise.resolve(msg);
  }

  private onScriptParsed(msg: any): Promise<any> {
    this._lastScriptEval = msg.params.scriptId;
    return Promise.resolve(msg);
  }

  private onDomEnable(msg: any): Promise<any> {
    this.target.fireResultToTools(msg.id, {});
    return Promise.resolve(null);
  }

  private onSetInspectMode(msg: any): Promise<any> {
    msg.method = 'DOM.setInspectModeEnabled';
    msg.params.enabled = msg.params.mode === 'searchForNode';
    delete msg.params.mode;
    return Promise.resolve(msg);
  }

  private onInspect(msg: any): Promise<any> {
    msg.method = 'DOM.inspectNodeRequested';
    msg.params.backendNodeId = msg.params.object.objectId;
    delete msg.params.object;
    delete msg.params.hints;
    return Promise.resolve(msg);
  }

  private DOMDebuggerOnGetEventListeners(msg: any): Promise<any> {
    const requestNodeParams = {
      objectId: msg.params.objectId,
    };

    this.target
      .callTarget('DOM.requestNode', requestNodeParams)
      .then((result) => {
        const getEventListenersForNodeParams = {
          nodeId: result.nodeId,
          objectGroup: 'event-listeners-panel',
        };

        return this.target.callTarget('DOM.getEventListenersForNode', getEventListenersForNodeParams);
      })
      .then((result) => {
        const mappedListeners = result.listeners.map((listener) => ({
          type: listener.type,
          useCapture: listener.useCapture,
          passive: false, // iOS doesn't support this property, http://compatibility.remotedebug.org/DOM/Safari%20iOS%209.3/types/EventListener,
          location: listener.location,
          hander: listener.hander,
        }));

        const mappedResult = {
          listeners: mappedListeners,
        };

        this.target.fireResultToTools(msg.id, mappedResult);
      });

    return Promise.resolve(null);
  }

  private onPushNodesByBackendIdsToFrontend(msg: any): Promise<any> {
    const resultId = msg.id;
    const promises: Promise<any>[] = [];

    // Convert all the requests into individual calls to pushNodeByBackendIdToFrontend
    for (let i = 0; i < msg.params.backendNodeIds.length; i += 1) {
      const params = {
        backendNodeId: msg.params.backendNodeIds[i],
      };

      const pushNode = this.target
        .callTarget('DOM.pushNodeByBackendIdToFrontend', params)
        .then((result) => result.nodeId);

      promises.push(pushNode);
    }

    // Combine all the pushNodeByBackendIdToFrontend calls into a single result
    Promise.all(promises).then((allResults) => {
      const result = {
        nodeIds: allResults,
      };

      this.target.fireResultToTools(resultId, result);
    });

    // Resolve the original promise with null to prevent 'setStyleTexts' from going to the target
    return Promise.resolve(null);
  }

  private onGetBoxModel(msg: any): Promise<any> {
    const params = {
      highlightConfig: {
        showInfo: true,
        showRulers: false,
        showExtensionLines: false,
        contentColor: { r: 111, g: 168, b: 220, a: 0.66 },
        paddingColor: { r: 147, g: 196, b: 125, a: 0.55 },
        borderColor: { r: 255, g: 229, b: 153, a: 0.66 },
        marginColor: { r: 246, g: 178, b: 107, a: 0.66 },
        eventTargetColor: { r: 255, g: 196, b: 196, a: 0.66 },
        shapeColor: { r: 96, g: 82, b: 177, a: 0.8 },
        shapeMarginColor: { r: 96, g: 82, b: 127, a: 0.6 },
        displayAsMaterial: true,
      },
      nodeId: msg.params.nodeId,
    };

    this.target.callTarget('DOM.highlightNode', params);

    return Promise.resolve(null);
  }

  private onGetNodeForLocation(msg: any): Promise<any> {
    this.target
      .callTarget('Runtime.evaluate', { expression: `document.elementFromPoint(${msg.params.x},${msg.params.y})` })
      .then((obj) => {
        this.target.callTarget('DOM.requestNode', { objectId: obj.result.objectId }).then((result) => {
          this.target.fireResultToTools(msg.id, { nodeId: result.nodeId });
        });
      });

    return Promise.resolve(null);
  }

  private onStartScreencast(msg: any): Promise<any> {
    const { format } = msg.params;
    const { quality } = msg.params;
    const { maxWidth } = msg.params;
    const { maxHeight } = msg.params;

    if (this._screencastSession) {
      // Session has already started so dispose of the current one
      this._screencastSession.dispose();
    }

    this._screencastSession = new ScreencastSession(this.target, format, quality, maxWidth, maxHeight);
    this._screencastSession.start();

    this.target.fireResultToTools(msg.id, {});
    return Promise.resolve(null);
  }

  private onStopScreencast(msg: any): Promise<any> {
    if (this._screencastSession) {
      this._screencastSession.stop();
      this._screencastSession = null;
    }

    this.target.fireResultToTools(msg.id, {});
    return Promise.resolve(null);
  }

  private onScreencastFrameAck(msg: any): Promise<any> {
    if (this._screencastSession) {
      const frameNumber: number = msg.params.sessionId;
      this._screencastSession.ackFrame(frameNumber);
    }

    this.target.fireResultToTools(msg.id, {});
    return Promise.resolve(null);
  }

  private onGetNavigationHistory(msg: any): Promise<any> {
    let href = '';
    this.target
      .callTarget('Runtime.evaluate', { expression: 'window.location.href' })
      .then((result) => {
        href = result.result.value;
        return this.target.callTarget('Runtime.evaluate', { expression: 'window.title' });
      })
      .then((result) => {
        const title = result.result.value;
        this.target.fireResultToTools(msg.id, { currentIndex: 0, entries: [{ id: 0, url: href, title }] });
      });

    return Promise.resolve(null);
  }

  private onEmulateTouchFromMouseEvent(msg: any): Promise<any> {
    /* tslint:disable */
    function simulate(params: any) {
      const element = document.elementFromPoint(params.x, params.y);
      const e = new MouseEvent(params.type, {
        screenX: params.x,
        screenY: params.y,
        clientX: 0,
        clientY: 0,
        ctrlKey: (params.modifiers & 2) === 2,
        shiftKey: (params.modifiers & 8) === 8,
        altKey: (params.modifiers & 1) === 1,
        metaKey: (params.modifiers & 4) === 4,
        button: params.button,
        bubbles: true,
        cancelable: false,
      });
      element.dispatchEvent(e);
      return element;
    }
    /* tslint:enable */

    switch (msg.params.type) {
      case 'mousePressed':
        msg.params.type = 'mousedown';
        break;
      case 'mouseReleased':
        msg.params.type = 'click';
        break;
      case 'mouseMoved':
        msg.params.type = 'mousemove';
        break;
      default:
        console.error(`Unknown emulate mouse event name '${msg.params.type}'`);
        break;
    }

    const exp = `(${simulate.toString()})(${JSON.stringify(msg.params)})`;
    this.target.callTarget('Runtime.evaluate', { expression: exp }).then(() => {
      if (msg.params.type === 'click') {
        msg.params.type = 'mouseup';
        this.target.callTarget('Runtime.evaluate', { expression: exp });
      }
    });

    return this.target.replyWithEmpty(msg);
  }

  private onCanEmulateNetworkConditions(msg: any): Promise<any> {
    const result = {
      result: false,
    };
    this.target.fireResultToTools(msg.id, result);
    return Promise.resolve(null);
  }

  private onConsoleMessageAdded(msg: any): Promise<any> {
    const { message } = msg.params;
    let type;
    if (message.type === 'log') {
      switch (message.level) {
        case 'log':
          type = 'log';
          break;
        case 'info':
          type = 'info';
          break;
        case 'error':
          type = 'error';
          break;
        default:
          type = 'log';
      }
    } else {
      type = message.type;
    }

    const consoleMessage = {
      source: message.source,
      level: type,
      text: message.text,
      lineNumber: message.line,
      timestamp: new Date().getTime(),
      url: message.url,
      stackTrace: message.stackTrace
        ? {
            callFrames: message.stackTrace,
          }
        : undefined,
      networkRequestId: message.networkRequestId,
    };

    this.target.fireEventToTools('Log.entryAdded', {
      entry: consoleMessage,
    });

    return Promise.resolve(null);
  }

  private onHeapEnable(msg) {
    this.target.callTarget('Heap.enable').then((res) => {
      console.log('Heap.enable res', msg);
      this.target.fireResultToTools(msg.id, res);
    });
    return Promise.resolve(null);
  }
  private onHeapDisable(msg) {
    console.log('onHeapDisable', msg);
    this.target.callTarget('Heap.disable');
    return Promise.resolve(null);
  }
  private onTakeHeapSnapshot(msg) {
    console.log('onTakeHeapSnapshot', msg);
    const { reportProgress } = msg.params;
    this.target.callTarget('Heap.snapshot').then((res) => {
      // console.log(res);
      const { snapshotData, timestamp } = res;
      const snapshot = JSON.parse(snapshotData);
      const v8snapshot = new HeapAdapter().jsc2v8(snapshot);
      const wholeChunk = JSON.stringify(v8snapshot);
      if (reportProgress)
        this.target.fireEventToTools('HeapProfiler.reportHeapSnapshotProgress', {
          finished: true,
          done: wholeChunk.length,
          total: wholeChunk.length,
        });
      this.target.fireEventToTools('HeapProfiler.addHeapSnapshotChunk', {
        chunk: wholeChunk,
      });
      this.target.fireResultToTools(msg.id, {});
    });
    return Promise.resolve(null);
  }
  private onGc(msg) {
    console.log('onGc', msg);
    this.target.callTarget('Heap.gc');
    return Promise.resolve(null);
  }

  private onPerformanceProfileStartTracking(msg: any): Promise<any> {
    this.target.callTarget('ScriptProfiler.startTracking', { includeSamples: true });
    return Promise.resolve(null);
  }

  private onPerformanceProfileStopTracking(msg: any): Promise<any> {
    this.target.callTarget('ScriptProfiler.stopTracking', {});
    return Promise.resolve(null);
  }

  private onPerformanceProfileStartEvent(msg: any) {
    console.log(`onPerformanceProfileStartEvent, msg = ${msg}`);
    return Promise.resolve(null);
  }

  private onPerformanceProfileUpdateEvent(msg: any) {
    console.log(`onPerformanceProfileUpdateEvent, msg = ${msg}`);
    return Promise.resolve(null);
  }

  private onPerformanceProfileCompleteEvent(msg: any) {
    console.log(`onPerformanceProfileCompleteEvent, msg = ${msg}`);
    const traceAdapter = new TraceAdapter();
    const v8json = traceAdapter.jsc2v8(msg.params);
    this.target.fireEventToTools('Tracing.dataCollected', {
      value: v8json,
    });
    return Promise.resolve(null);
  }
}
