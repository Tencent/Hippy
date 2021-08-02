/* eslint-disable no-alert, no-mixed-operators, no-param-reassign */

import color from 'color-normalize';

export default class CssDomain {
  messageMethodMap;
  static skipStyleList = ['backgroundImage', 'transform', 'shadowOffset'];

  constructor() {
    this.messageMethodMap = {};
  }

  static intToRGBA(int32Color) {
    const int = int32Color << 0;
    const int32 = ((int << 8) | (int >>> 24)) >>> 0;
    const int8 = new Uint8Array(new Uint32Array([int32]).buffer).reverse();
    const r = int8[0];
    const g = int8[1];
    const b = int8[2];
    const a = Math.round((int8[3] / 255) * 100) / 100;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  static rgbaToInt(stringColor) {
    const uint8 = color(stringColor, 'uint8');
    const int = Buffer.from(uint8).readUInt32BE(0);
    return ((int << 24) | (int >>> 8)) >>> 0;
  }

  static getMethodName(type, method) {
    return method.replace(/^css\.(\w)(.*)/i, (s, p1, p2) => `${type.toLowerCase()}${p1.toUpperCase()}${p2}`);
  }

  static skipStyle(styleName) {
    return CssDomain.skipStyleList.some(
      (name) => name.toString().trim().toLowerCase() === styleName.toString().trim().toLowerCase(),
    );
  }

  static conversionInlineStyle(style) {
    let totalCSSText = '';
    style.cssProperties = style.cssProperties.reduce((ret, item) => {
      if (CssDomain.skipStyle(item.name)) return ret;

      const cssText = `${item.name}: ${item.value}`;
      if (item.name.toLowerCase().includes('color')) {
        item.value = CssDomain.intToRGBA(parseInt(item.value, 10));
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

  static conversionComputedStyle(style) {
    if (!style) return [];
    return style.reduce((ret, item) => {
      if (!CssDomain.skipStyle(item.name)) {
        if (item.name.toLowerCase().includes('color')) {
          item.value = CssDomain.intToRGBA(parseInt(item.value, 10));
        }
        ret.push(item);
      }
      return ret;
    }, []);
  }

  static transformRGBA(colorText) {
    return colorText.trim().replace(/^rgba?\(([^()]+)\)$/i, (s, p1) => {
      const flag = p1.includes(',') ? ',' : ' ';
      const channelList = p1.split(flag);
      const r = channelList[0];
      const g = channelList[1];
      const b = channelList[2];
      let a = channelList.length > 3 ? channelList[channelList.length - 1] : 1;
      if (a.toString().includes('%')) {
        a = parseInt(a, 10) / 100;
      }
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    });
  }

  // 下行数据处理
  handlerDown(msg) {
    if (msg.method.toLowerCase().indexOf('css') === 0) {
      this.messageMethodMap[msg.id] = msg.method;
      const method = CssDomain.getMethodName('down', msg.method);
      if (this[method]) {
        return this[method].call(this, msg);
      }
    }
  }

  // 上行数据处理
  handlerUp(msg) {
    if (this.messageMethodMap[msg.id]) {
      const method = CssDomain.getMethodName('up', this.messageMethodMap[msg.id]);
      if (this[method]) {
        return this[method].call(this, msg);
      }
    }
  }

  upGetMatchedStylesForNode(msg) {
    msg.result.inlineStyle = CssDomain.conversionInlineStyle(msg.result.inlineStyle);
    return msg;
  }

  upGetComputedStyleForNode(msg) {
    msg.result.computedStyle = CssDomain.conversionComputedStyle(msg.result.computedStyle);
    return msg;
  }

  upSetStyleTexts(msg) {
    msg.result.styles = msg.result.styles.map((style) => CssDomain.conversionInlineStyle(style));
    return msg;
  }

  downSetStyleTexts(msg) {
    msg.params.edits = msg.params.edits.map((data) => {
      const textList = data.text
        .trim()
        .split(';')
        .reduce((ret, styleItem) => {
          if (!styleItem.trim()) return ret;
          // eslint-disable-next-line prefer-const
          let [name, ...values] = styleItem.split(':');
          if (!CssDomain.skipStyle(name)) {
            if (name.toLowerCase().includes('color')) {
              const rgba = CssDomain.transformRGBA(values[0]);
              values = [CssDomain.rgbaToInt(rgba)];
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
    return msg;
  }
}
