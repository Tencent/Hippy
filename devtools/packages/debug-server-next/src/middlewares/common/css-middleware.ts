/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company.
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

import color from 'color-normalize';
import { ChromeCommand } from '@hippy/devtools-protocol/dist/types/enum-chrome-mapping';
import { MiddleWareManager } from '../middleware-context';

export const cssMiddleWareManager: MiddleWareManager = {
  downwardMiddleWareListMap: {
    [ChromeCommand.CSSGetMatchedStylesForNode]: ({ msg, sendToDevtools }) => {
      // narrow down type
      const commandRes = msg as Adapter.CDP.CommandRes<ProtocolIOS90.CSS.GetInlineStylesForNodeResponse>;
      commandRes.result.inlineStyle = CssDomainAdapter.conversionInlineStyle(commandRes.result.inlineStyle);
      return sendToDevtools(commandRes);
    },
    [ChromeCommand.CSSGetComputedStyleForNode]: ({ msg, sendToDevtools }) => {
      const commandRes = msg as Adapter.CDP.CommandRes<ProtocolIOS90.CSS.GetComputedStyleForNodeResponse>;
      commandRes.result.computedStyle = CssDomainAdapter.conversionComputedStyle(commandRes.result.computedStyle);
      return sendToDevtools(commandRes);
    },
    [ChromeCommand.CSSSetStyleTexts]: ({ msg, sendToDevtools }) => {
      const commandRes = msg as Adapter.CDP.CommandRes<ProtocolChrome.CSS.SetStyleTextsResponse>;
      commandRes.result.styles = commandRes.result.styles.map((style) => CssDomainAdapter.conversionInlineStyle(style));
      return sendToDevtools(commandRes);
    },
  },
  upwardMiddleWareListMap: {
    [ChromeCommand.CSSSetStyleTexts]: ({ msg, sendToApp }) => {
      const req = msg as Adapter.CDP.Req<ProtocolChrome.CSS.SetStyleTextsRequest>;
      req.params.edits = req.params.edits.map((data) => {
        const textList = data.text
          .trim()
          .split(';')
          .reduce((ret, styleItem) => {
            if (!styleItem.trim()) return ret;
            const styleItems = styleItem.split(':');
            const [name] = styleItems;
            let [, ...values] = styleItems;
            if (!CssDomainAdapter.shouldSkipStyle(name)) {
              values[0] = values[0].trim();
              if (name.toLowerCase().includes('color') && !/^\d+$/.test(values[0])) {
                const rgba = CssDomainAdapter.transformRGBA(values[0]);
                values = [String(CssDomainAdapter.rgbaToInt(rgba))];
              }
              ret.push(`${name}: ${values.join(':').trim()}`);
            }
            return ret;
          }, []);
        const totalCSSText = textList.join(';');
        return {
          ...data,
          range: {
            ...data.range,
            endColumn: totalCSSText.length,
          },
          text: totalCSSText,
        };
      });
      return sendToApp(req);
    },
  },
};

export class CssDomainAdapter {
  private static skipStyleList = ['backgroundImage', 'transform', 'shadowOffset'];

  public static intToRGBA(int32Color: number): string {
    const int = int32Color << 0;
    // Converts 0xaarrggbb into 0xrrggbbaa
    const int32 = ((int << 8) | (int >>> 24)) >>> 0;
    const int8 = new Uint8Array(new Uint32Array([int32]).buffer).reverse();
    const r = int8[0];
    const g = int8[1];
    const b = int8[2];
    const a = Math.round((int8[3] / 255) * 100) / 100;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  public static rgbaToInt(stringColor: string): number {
    const uint8 = color(stringColor, 'uint8');
    const int = Buffer.from(uint8).readUInt32BE(0);
    // Converts 0xrrggbbaa into 0xaarrggbb
    return ((int << 24) | (int >>> 8)) >>> 0;
  }

  public static shouldSkipStyle(styleName: string): boolean {
    return CssDomainAdapter.skipStyleList.some(
      (name) => name.toString().trim().toLowerCase() === styleName.toString().trim().toLowerCase(),
    );
  }

  public static conversionInlineStyle(style: ProtocolIOS90.CSS.CSSStyle): ProtocolChrome.CSS.CSSStyle {
    let totalCSSText = '';
    style.cssProperties = (style.cssProperties || []).reduce((ret, item) => {
      if (CssDomainAdapter.shouldSkipStyle(item.name)) return ret;

      const cssText = `${item.name}: ${item.value}`;
      if (item.name.toLowerCase().includes('color')) {
        item.value = CssDomainAdapter.intToRGBA(parseInt(item.value, 10));
      }
      item.range = {
        ...item.range,
        startColumn: totalCSSText.length,
        endColumn: totalCSSText.length + cssText.length + 1,
      };
      totalCSSText += `${cssText}; `;
      ret.push(item);
      return ret;
    }, []);
    style.cssText = totalCSSText;
    style.range = {
      ...style.range,
      endColumn: totalCSSText.length,
    };
    return style;
  }

  public static conversionComputedStyle(
    style: ProtocolIOS90.CSS.CSSComputedStyleProperty[],
  ): ProtocolChrome.CSS.CSSComputedStyleProperty[] {
    if (!style) return [];
    return style.reduce((ret, item) => {
      if (!CssDomainAdapter.shouldSkipStyle(item.name)) {
        if (item.name.toLowerCase().includes('color')) {
          item.value = CssDomainAdapter.intToRGBA(parseInt(item.value, 10));
        }
        ret.push(item);
      }
      return ret;
    }, []);
  }

  /**
   * input:
   *   rgb(165 21 21)
   *   rgb(183 12 12 / 95%)
   *   rgb(100% 0% 0% / 50%)
   *   rgba(0 0 255 / 50%)
   *   rgba(2, 0, 0, 0)
   *   rgba(100%, 0%, 0%, 50%)
   *
   * output: rgba(r, g, b, a)
   *         r, g, b, a are int number
   */
  public static transformRGBA(colorText: string): string {
    return colorText.trim().replace(/^rgba?\(([^()]+)\)$/i, (s, p1) => {
      let r: string;
      let g: string;
      let b: string;
      let a: string;
      if (p1.includes('/')) {
        const [rgb, alpha] = p1.split(/\s*\/\s*/);
        a = alpha;
        [r, g, b] = rgb.split(' ');
      } else {
        const spliter = p1.includes(',') ? ',' : ' ';
        [r, g, b, a] = p1.split(spliter);
      }
      a ||= '1';

      [r, g, b] = [r, g, b].map((value) => {
        if (value.toString().includes('%')) {
          return Math.floor((parseInt(value, 10) / 100) * 255).toString();
        }
        return value.trim();
      });
      if (a.toString().includes('%')) {
        a = (parseInt(a, 10) / 100).toString();
      } else {
        a = a.trim();
      }

      return `rgba(${r}, ${g}, ${b}, ${a})`;
    });
  }
}
