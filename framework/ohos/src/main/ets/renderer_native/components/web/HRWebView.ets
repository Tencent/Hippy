/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  HippyAny,
  HippyMap,
  HippyRenderCallback,
  HippyValue
} from '../../../support/common/HippyTypes';
import { NativeRenderContext } from '../../NativeRenderContext';
import HippyRenderBaseView, { HippyObservedArray,
  HIPPY_COMPONENT_KEY_PREFIX } from '../base/HippyRenderBaseView';
import web_webview from '@ohos.web.webview';
import { LogUtils } from '../../../support/utils/LogUtils';
import { HREventUtils } from '../../utils/HREventUtils';
import { HRValueUtils } from '../../utils/HRValueUtils';
import { HRPadding, HRRect } from '../../utils/HRTypes';

class HRWebViewBridge {
  private renderView: HRWebView

  constructor(renderView: HRWebView) {
    this.renderView = renderView
  }

  postMessage(msg: string): void {
    let params = new Map<string, HippyValue>() as HippyMap;
    params.set("data", msg);
    HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, "onMessage", params);
  }
}

@Observed
export class HRWebView extends HippyRenderBaseView {
  public url : string | null = null
  public source: HippyMap | null = null
  public update: boolean = false
  public controller: web_webview.WebviewController = new web_webview.WebviewController()
  public bridge: HRWebViewBridge = new HRWebViewBridge(this)

  constructor(ctx: NativeRenderContext) {
    super(ctx)
  }

  setProp(propKey: string, propValue: HippyAny): boolean {
    if (propKey === 'url') {
      this.url = HRValueUtils.getString(propValue)
      this.source = null
      if (this.update) {
        this.updateController()
      }
      return true
    } else if (propKey === 'source') {
      this.source = HRValueUtils.getMap(propValue)
      this.url = null

      if (this.source) {
        let map = this.source
        let src = map.get('uri') as string
        LogUtils.d('HRWeb', `setProp source:${src}, update:${this.update}`)
        if (this.update) {
          this.updateController()
        }
      }
      return true
    }

    return super.setProp(propKey, propValue)
  }

  updateController() {
    let source = this.source ?? new Map<string, HippyValue>()
    let controller = this.controller

    if (this.url && this.url != '') {
      controller.loadUrl(this.url)
    } else if (source.has('uri')) {
      if (source.has('userAgent')) {
        controller.setCustomUserAgent(source.get('userAgent') as string)
      }

      let uri = source.get('uri') as string
      let method = 'get'
      if (source.has('method')) {
        method = source.get('method') as string
        method = method.toLowerCase();
      }
      LogUtils.d("HRWeb", "init Controller: uri" + uri + ", method:" + method)
      if (method === 'post') {
        let data = source.get("body") as string
        let buf = new ArrayBuffer(data.length);
        let buff = new Uint8Array(buf);
        for (let i = 0; i < data.length; i++) {
          buff[i] = data.charCodeAt(i);
        }

        controller.postUrl(uri, buf);
      } else {
        controller.loadUrl(uri)
      }
    } else if (source.has('html')) {
      let html = source.get('html') as string
      if (source.has("baseUrl")) {
        let baseUrl = source.get("baseUrl") as string
        controller.loadData(html, "text/html; charset=utf-8", "UTF-8", baseUrl);
      } else {
        controller.loadData(html, "text/html; charset=utf-8", "UTF-8");
      }
    }
  }

  protected updateRenderViewFrame(frame: HRRect, padding: HRPadding | null): void {
    // For c api, web view is a custom ts view, the position is used by container node.
    if (this.ctx.getNativeRender().isEnableArkCApi()) {
      this.cssPositionX = 0
      this.cssPositionY = 0
    } else {
      this.cssPositionX = frame.x
      this.cssPositionY = frame.y
    }
    this.cssWidth = frame.width
    this.cssHeight = frame.height
  }

  call(method: string, params: Array<HippyAny>, callback: HippyRenderCallback | null): void {
    switch (method) {
      case "loadUrl":
        this.controller.loadUrl(HRValueUtils.getString(params[0]))
        break
      default:
        break
    }
  }
}

@Component
export struct HRWeb {
  private readonly TAG = "HRWeb";
  @ObjectLink renderView: HRWebView
  @ObjectLink children: HippyObservedArray<HippyRenderBaseView>

  notifyLoadEnd(url: string, success: boolean, msg: string) {
    LogUtils.d(this.TAG, "notifyLoadEnd: url:" + url + ",success:" + success + ",msg:" + msg)

    let params = new Map<string, HippyValue>() as HippyMap;
    params.set("url", url);
    params.set("success", success);
    params.set("error", msg);

    HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, "onLoadEnd", params);
  }

  build() {
    Web({
      src: '',
      controller: this.renderView.controller
    })
      .onControllerAttached(() => {
        this.renderView.updateController()
        this.renderView.update = true
      })
      .applyRenderViewBaseAttr(this.renderView)
      .domStorageAccess(true)
      .javaScriptAccess(true)
      .javaScriptProxy({
        object: this.renderView.bridge,
        name: "hippy",
        methodList: ["postMessage"],
        controller: this.renderView.controller,
      })
      .onPageBegin((event) => {
        if (event) {
          LogUtils.d(this.TAG, "onPageBegin: " + event.url)
          let params = new Map<string, HippyValue>() as HippyMap;
          params.set("url", event.url);
          HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, "onLoadStart", params);
        }
      })
      .onPageEnd((event) => {
        if (event) {
          LogUtils.d(this.TAG, "onPageEnd: " + event.url)
          let params = new Map<string, HippyValue>() as HippyMap;
          params.set("url", event.url);
          HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, "onLoad", params);
          this.notifyLoadEnd(event.url, true, "");
        }
      })
      .onErrorReceive((event) => {
        if (event) {
          LogUtils.d(this.TAG, "onErrorReceive: " + event.error)
          let params = new Map<string, HippyValue>() as HippyMap;
          params.set("error", event.error.getErrorInfo());
          params.set("errorCode", event.error.getErrorCode());
          HREventUtils.sendComponentEvent(this.renderView.ctx, this.renderView.tag, "onError", params);

          if (event.request.isMainFrame()) {
            let msg = event.error.getErrorCode() + "," + event.error.getErrorInfo();
            this.notifyLoadEnd(event.request.getRequestUrl(), false, msg);
          }
        }
      })
  }
}

// base props for all components
@Extend(Web)
function applyRenderViewBaseAttr($$: HippyRenderBaseView) {
  .key(HIPPY_COMPONENT_KEY_PREFIX + $$.tag)
  .backgroundColor($$.cssBackgroundColor)
  .position({x: $$.cssPositionX, y: $$.cssPositionY})
  .size({width:$$.cssWidth, height: $$.cssHeight})
  .opacity($$.cssOpacity)
  .clip($$.cssOverflow)
  .visibility(($$ as HippyRenderBaseView).cssVisibility) // must add as, otherwise the compiler has error
  .zIndex($$.cssZIndex)
  .accessibilityText($$.cssAccessibilityLabel)
  .focusable($$.cssFocusable)
  .border($$.cssBorder)
  .shadow($$.cssShadow)
  .linearGradient($$.cssLinearGradient)
  .backgroundImage($$.cssBackgroundImage)
  .backgroundImageSize($$.cssBackgroundImageSize)
  .backgroundImagePosition($$.cssBackgroundImagePosition)
  .transform($$.cssMatrix)
  .rotate($$.cssRotate)
  .scale($$.cssScale)
  .translate($$.cssTranslate)
  .hitTestBehavior($$.hitTestBehavior)
  .onClick($$.eventClick)
}
