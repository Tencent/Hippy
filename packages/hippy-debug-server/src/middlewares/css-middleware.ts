import color from 'color-normalize';
import { MiddleWareManager } from './middleware-context';

export const cssMiddleWareManager: MiddleWareManager = {
  upwardMiddleWareListMap: {
    'CSS.getMatchedStylesForNode': ({ msg, sendToDevtools }) => {
      const commandRes = msg as Adapter.CDP.CommandRes;
      commandRes.result.inlineStyle = CssDomain.conversionInlineStyle(commandRes.result.inlineStyle);
      return sendToDevtools(commandRes);
    },
    'CSS.getComputedStyleForNode': ({ msg, sendToDevtools }) => {
      const commandRes = msg as Adapter.CDP.CommandRes;
      commandRes.result.computedStyle = CssDomain.conversionComputedStyle(commandRes.result.computedStyle);
      return sendToDevtools(commandRes);
    },
    'CSS.setStyleTexts': ({ msg, sendToDevtools }) => {
      const commandRes = msg as Adapter.CDP.CommandRes;
      commandRes.result.styles = commandRes.result.styles.map((style) => CssDomain.conversionInlineStyle(style));
      return sendToDevtools(commandRes);
    },
  },
  downwardMiddleWareListMap: {
    'CSS.setStyleTexts': ({ msg, sendToApp }) => {
      const req = msg as Adapter.CDP.Req;
      req.params.edits = req.params.edits.map((data) => {
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
      return sendToApp(req);
    },
  },
};

class CssDomain {
  static skipStyleList = ['backgroundImage', 'transform', 'shadowOffset'];

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
}
