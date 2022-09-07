/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29  Limited, a Tencent company.
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
import {  NodeProps, HippyBaseView, InnerNodeTag  } from '../types';
import { HippyWebView } from './hippy-web-view';

export class WebView extends HippyWebView<HTMLIFrameElement> {
  private isMounted = false;
  public constructor(context, id, pId) {
    super(context, id, pId);
    this.dom = document.createElement('iframe');
    this.tagName = InnerNodeTag.WEB_VIEW;
    this.dom!.onload = this.onLoadEnd.bind(this);
  }

  public set source(value: { uri: string }) {
    this.props[NodeProps.SOURCE] = value;
    if (this.isMounted) {
      this.onLoadStart(this.props[NodeProps.SOURCE]);
      this.dom!.src = value.uri ?? '';
      this.onLoad(this.props[NodeProps.SOURCE]);
    }
  }

  public get source() {
    return this.props[NodeProps.SOURCE];
  }

  public set userAgent(value: string) {
    this.props[NodeProps.USER_AGENT] = value;
  }

  public get userAgent() {
    return this.props[NodeProps.USER_AGENT];
  }

  public set method(value: string) {
    this.props[NodeProps.METHOD] = value;
  }

  public get method() {
    return this.props[NodeProps.METHOD];
  }

  public  onLoadStart(value: { uri: string }) {
    this.props[NodeProps.ON_LOAD_START] && this.context.sendUiEvent(this.id, NodeProps.ON_LOAD_START, value);
  }

  public  onLoad(value: { uri: string }) {
    this.props[NodeProps.ON_LOAD] && this.context.sendUiEvent(this.id, NodeProps.ON_LOAD, value);
  }

  public  onLoadEnd() {
    this.props[NodeProps.ON_LOAD_END] && this.context.sendUiEvent(
      this.id,
      NodeProps.ON_LOAD_END, this.props[NodeProps.SOURCE],
    );
  }

  public async beforeMount(parent: HippyBaseView, position: number) {
    await super.beforeMount(parent, position);
    if (this.props[NodeProps.SOURCE].uri) this.dom!.src = this.props[NodeProps.SOURCE].uri ?? '';
    if (this.dom!.src) {
      this.onLoadStart(this.props[NodeProps.SOURCE]);
    }
  }

  public mounted() {
    this.isMounted = true;
    if (this.dom!.src) {
      this.onLoad(this.props[NodeProps.SOURCE]);
    }
  }

  public set style(value: { uri: string }) {
    this.props[NodeProps.STYLE] = value;
  }

  public get style() {
    return this.props[NodeProps.STYLE];
  }
}
