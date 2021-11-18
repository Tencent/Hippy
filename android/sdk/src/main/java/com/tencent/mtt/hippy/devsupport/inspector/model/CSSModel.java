package com.tencent.mtt.hippy.devsupport.inspector.model;

import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.devsupport.inspector.domain.CSSDomain;
import com.tencent.mtt.hippy.dom.node.DomDomainData;
import com.tencent.mtt.hippy.dom.node.DomNode;
import com.tencent.mtt.hippy.dom.node.DomNodeRecord;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.utils.LogUtils;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class CSSModel {

  private static final String TAG = "CSSModel";

  private Map<String, String[]> transformEnumMap = new HashMap<>();
  private Set<String> transformDoubleMap = new HashSet<>();

  public CSSModel() {
    initTransformValue();
  }

  /**
   * 显示的样式，全部使用内联样式来展示，当前无法区分内联和非内联、继承样式等关系
   *
   * @return 显示的样式
   */
  public JSONObject getMatchedStyles(HippyEngineContext context, int nodeId) {
    JSONObject matchedObject = new JSONObject();
    try {
      DomNodeRecord domNodeRecord = context.getDomManager().getNode(nodeId).getDomNodeRecord();
      if (domNodeRecord instanceof DomDomainData) {
        HippyMap style = ((DomDomainData)domNodeRecord).style;
        if (style != null) {
          matchedObject.put("inlineStyle", getCSSStyle(style, nodeId));
        }
      }
    } catch (Exception e) {
      LogUtils.e(TAG, "getMatchedStyles, Exception: ", e);
    }
    return matchedObject;
  }

  /**
   * 内联样式先不单独在标签里展示，可以在 {@link #getMatchedStyles} 中显示到
   *
   * @return 标签里内联的样式
   */
  public JSONObject getInlineStyles(HippyEngineContext context, int nodeId) {
    // 先在 MatchedStyles 中进行展示
    return new JSONObject();
  }

  /**
   * CSS 最终应用生效的样式：属性和盒子模型
   *
   * @return 最终生效的样式
   */
  public JSONObject getComputedStyle(HippyEngineContext context, int nodeId) {
    JSONObject computedStyle = new JSONObject();
    try {
      DomNodeRecord domNodeRecord = context.getDomManager().getNode(nodeId).getDomNodeRecord();
      if (domNodeRecord instanceof DomDomainData) {
        HippyMap style = ((DomDomainData)domNodeRecord).style;
        if (style != null) {
          computedStyle.put("computedStyle", getComputedStyle(context, nodeId, style));
        }
      }
    } catch (Exception e) {
      LogUtils.e(TAG, "getComputedStyle, Exception: ", e);
    }
    return computedStyle;
  }

  private JSONArray getComputedStyle(HippyEngineContext context, int nodeId, HippyMap style)
    throws JSONException {
    JSONArray computedArray = new JSONArray();
    if (style != null) {
      // property style
      for (Map.Entry entry : style.entrySet()) {
        String key = (String) entry.getKey();
        if (!isCanHandleStyle(key) || NodeProps.WIDTH.equals(key) || NodeProps.HEIGHT
          .equals(key)) {
          continue;
        }
        String value = entry.getValue().toString();
        computedArray.put(getStyleProperty(unCamelize(key), value));
      }

      // box model property
      Map<String, String> boxModelRequireMap = getBoxModelRequireMap();
      for (Map.Entry<String, String> entry : boxModelRequireMap.entrySet()) {
        if (!style.containsKey(entry.getKey())) {
          computedArray.put(getStyleProperty(unCamelize(entry.getKey()), entry.getValue()));
        }
      }
      RenderNode renderNode = context.getRenderManager().getRenderNode(nodeId);
      if (renderNode != null) {
        computedArray.put(
          getStyleProperty(unCamelize(NodeProps.WIDTH), String.valueOf(renderNode.getWidth())));
        computedArray.put(
          getStyleProperty(unCamelize(NodeProps.HEIGHT), String.valueOf(renderNode.getHeight())));
      }
    }
    return computedArray;
  }

  /**
   * 设置样式，并触发 DOM 更新
   *
   * @return 设置后的样式
   */
  public JSONObject setStyleTexts(HippyEngineContext context, JSONArray editArray,
    CSSDomain cssDomain) {
    JSONObject styleObject = new JSONObject();
    try {
      JSONArray styleList = new JSONArray();
      for (int i = 0; i < editArray.length(); i++) {
        JSONObject editObj = (JSONObject) editArray.opt(i);
        JSONObject styleText = setStyleText(context, editObj);
        if (styleText == null) {
          continue;
        }
        styleList.put(styleText);
      }

      /// 更新样式集合不为空，就批量更新节点样式
      if (styleList.length() > 0) {
        // 避免更新 CSS 时，触发 DOM 监听 batch 的更新，同时避免入侵 DomManager 的结构，加个变量控制下
        cssDomain.setNeedBatchUpdateDom(false);
        context.getDomManager().batch();
        cssDomain.setNeedBatchUpdateDom(true);
      }
      styleObject.put("styles", styleList);
    } catch (Exception e) {
      LogUtils.e(TAG, "setStyleTexts, Exception: ", e);
    }
    return styleObject;
  }

  private JSONObject setStyleText(HippyEngineContext context, JSONObject editObj) {
    // set style
    int nodeId = editObj.optInt("styleSheetId");
    DomNode node = context.getDomManager().getNode(nodeId);
    if (node == null || node.getDomNodeRecord() == null) {
      LogUtils.e(TAG, "setStyleText node is null");
      return null;
    }
    HippyRootView hippyRootView = context.getInstance(node.getDomNodeRecord().rootId);
    if (hippyRootView == null) {
      LogUtils.e(TAG, "setStyleText hippyRootView is null");
      return null;
    }
    HippyMap newMap = node.getTotalProps() == null ? new HippyMap() : node.getTotalProps().copy();
    HippyMap style =
      newMap.get(NodeProps.STYLE) != null ? (HippyMap) newMap.get(NodeProps.STYLE) : new HippyMap();

    String text = editObj.optString("text");
    String[] textList = text.split(";");
    for (String item : textList) {
      String[] propertyList = item.trim().split(":");
      if (propertyList.length != 2) {
        continue;
      }
      String key = camelize(propertyList[0].trim());
      String value = propertyList[1].trim();
      Object formatValue = getTransformValue(key, value);
      style.pushObject(key, formatValue);
    }
    newMap.pushMap(NodeProps.STYLE, style);
    context.getDomManager().updateNode(nodeId, newMap, hippyRootView);
    return getCSSStyle(style, nodeId);
  }

  private JSONObject getCSSStyle(HippyMap style, int nodeId) {
    JSONObject cssStyle = new JSONObject();
    if (style == null) {
      return cssStyle;
    }
    StringBuilder totalCSSText = new StringBuilder();
    try {
      JSONArray cssPropertyArray = new JSONArray();
      for (Map.Entry entry : style.entrySet()) {
        String key = (String) entry.getKey();
        if (!isCanHandleStyle(key)) {
          continue;
        }

        String cssName = unCamelize(key);
        String cssValue = entry.getValue().toString();
        String cssText = "cssName" + ":" + cssValue;
        JSONObject cssProperty = getCSSProperty(cssName, cssValue,
          getRange(0, totalCSSText.length(), 0, totalCSSText.length() + cssText.length() + 1));
        cssPropertyArray.put(cssProperty);
        totalCSSText.append(cssText).append(";");
      }

      cssStyle.put("styleSheetId", nodeId);
      cssStyle.put("cssProperties", cssPropertyArray);
      cssStyle.put("shorthandEntries", new JSONArray());
      cssStyle.put("cssText", totalCSSText);
      cssStyle.put("range", getRange(0, 0, 0, totalCSSText.length()));
    } catch (Exception e) {
      LogUtils.e(TAG, "getCSSStyle, Exception: ", e);
    }
    return cssStyle;
  }

  private JSONObject getRange(int startLine, int startColumn, int endLine, int endColumn)
    throws JSONException {
    JSONObject range = new JSONObject();
    range.put("startLine", startLine);
    range.put("startColumn", startColumn);
    range.put("endLine", endLine);
    range.put("endColumn", endColumn);
    return range;
  }

  private JSONObject getCSSProperty(String name, String value, JSONObject sourceRange)
    throws JSONException {
    JSONObject cssProperty = new JSONObject();
    cssProperty.put("name", name);
    cssProperty.put("value", value);
    cssProperty.put("important", false);
    cssProperty.put("implicit", false);
    cssProperty.put("text", null);
    cssProperty.put("parsedOk", true);
    cssProperty.put("disabled", false);
    cssProperty.put("range", sourceRange);
    return cssProperty;
  }

  private JSONObject getStyleProperty(String name, String value) throws JSONException {
    JSONObject object = new JSONObject();
    object.put("name", name);
    object.put("value", value);
    return object;
  }

  private boolean isCanHandleStyle(String key) {
    return transformDoubleMap.contains(key) || transformEnumMap.containsKey(key);
  }

  private static double getDoubleValue(String value) {
    try {
      return Double.parseDouble(value);
    } catch (Exception e) {
      LogUtils.e(TAG, "getDoubleValue, Exception: ", e);
    }
    return 0;
  }

  private static String getEnumValue(String[] options, String value) {
    if (options == null) {
      return null;
    }
    for (String option : options) {
      if (option.equals(value)) {
        return value;
      }
    }
    return options[0];
  }

  /**
   * 可接收 css 样式显示的初始化
   */
  private void initTransformValue() {
    transformDoubleMap.add(NodeProps.FLEX);
    transformDoubleMap.add(NodeProps.FLEX_GROW);
    transformDoubleMap.add(NodeProps.FLEX_SHRINK);
    transformDoubleMap.add(NodeProps.FLEX_BASIS);
    transformDoubleMap.add(NodeProps.WIDTH);
    transformDoubleMap.add(NodeProps.HEIGHT);
    transformDoubleMap.add(NodeProps.MAX_WIDTH);
    transformDoubleMap.add(NodeProps.MIN_WIDTH);
    transformDoubleMap.add(NodeProps.MAX_HEIGHT);
    transformDoubleMap.add(NodeProps.MIN_HEIGHT);
    transformDoubleMap.add(NodeProps.MARGIN_TOP);
    transformDoubleMap.add(NodeProps.MARGIN_RIGHT);
    transformDoubleMap.add(NodeProps.MARGIN_BOTTOM);
    transformDoubleMap.add(NodeProps.MARGIN_LEFT);
    transformDoubleMap.add(NodeProps.PADDING_TOP);
    transformDoubleMap.add(NodeProps.PADDING_RIGHT);
    transformDoubleMap.add(NodeProps.PADDING_BOTTOM);
    transformDoubleMap.add(NodeProps.PADDING_LEFT);
    transformDoubleMap.add(NodeProps.BORDER_WIDTH);
    transformDoubleMap.add(NodeProps.BORDER_TOP_WIDTH);
    transformDoubleMap.add(NodeProps.BORDER_RIGHT_WIDTH);
    transformDoubleMap.add(NodeProps.BORDER_BOTTOM_WIDTH);
    transformDoubleMap.add(NodeProps.BORDER_LEFT_WIDTH);
    transformDoubleMap.add(NodeProps.BORDER_RADIUS);
    transformDoubleMap.add(NodeProps.BORDER_TOP_LEFT_RADIUS);
    transformDoubleMap.add(NodeProps.BORDER_TOP_RIGHT_RADIUS);
    transformDoubleMap.add(NodeProps.BORDER_BOTTOM_LEFT_RADIUS);
    transformDoubleMap.add(NodeProps.BORDER_BOTTOM_RIGHT_RADIUS);
    transformDoubleMap.add(NodeProps.TOP);
    transformDoubleMap.add(NodeProps.RIGHT);
    transformDoubleMap.add(NodeProps.BOTTOM);
    transformDoubleMap.add(NodeProps.LEFT);
    transformDoubleMap.add(NodeProps.Z_INDEX);
    transformDoubleMap.add(NodeProps.OPACITY);
    transformDoubleMap.add(NodeProps.FONT_SIZE);
    transformDoubleMap.add(NodeProps.LINE_HEIGHT);

    transformEnumMap.put(NodeProps.DISPLAY, new String[]{"flex", "none"});
    transformEnumMap.put(NodeProps.FLEX_DIRECTION,
      new String[]{"column", "column-reverse", "row", "row-reverse"});
    transformEnumMap.put(NodeProps.FLEX_WRAP, new String[]{"nowrap", "wrap", "wrap-reverse"});
    transformEnumMap.put(NodeProps.ALIGN_ITEMS,
      new String[]{"flex-start", "center", "flex-end", "stretch", "center", "baseline"});
    transformEnumMap.put(NodeProps.ALIGN_SELF,
      new String[]{"auto", "flex-start", "center", "flex-end", "stretch", "center", "baseline"});
    transformEnumMap.put(NodeProps.JUSTIFY_CONTENT,
      new String[]{"flex-start", "center", "flex-end", "space-between", "space-around",
        "space-evenly"});
    transformEnumMap.put(NodeProps.OVERFLOW, new String[]{"hidden", "visible", "scroll"});
    transformEnumMap.put(NodeProps.POSITION, new String[]{"relative", "absolute"});
    transformEnumMap
      .put(NodeProps.BACKGROUND_SIZE, new String[]{"auto", "contain", "cover", "fit"});
    transformEnumMap.put(NodeProps.BACKGROUND_POSITION_X, new String[]{"left", "center", "right"});
    transformEnumMap.put(NodeProps.BACKGROUND_POSITION_Y, new String[]{"top", "center", "bottom"});
    transformEnumMap.put(NodeProps.FONT_STYLE, new String[]{"normal", "italic"});
    transformEnumMap.put(NodeProps.FONT_WEIGHT,
      new String[]{"normal", "bold", "100", "200", "300", "400", "500", "600", "700", "800",
        "900"});
    transformEnumMap.put(NodeProps.TEXT_ALIGN, new String[]{"left", "center", "right"});
    transformEnumMap
      .put(NodeProps.RESIZE_MODE, new String[]{"cover", "contain", "stretch", "repeat", "center"});
  }

  private Map<String, String> getBoxModelRequireMap() {
    String lengthDefault = "0";
    String displayDefault = "block";
    String positionDefault = "relative";
    Map<String, String> map = new HashMap<>();
    map.put(NodeProps.PADDING_TOP, lengthDefault);
    map.put(NodeProps.PADDING_RIGHT, lengthDefault);
    map.put(NodeProps.PADDING_BOTTOM, lengthDefault);
    map.put(NodeProps.PADDING_LEFT, lengthDefault);
    map.put(NodeProps.BORDER_TOP_WIDTH, lengthDefault);
    map.put(NodeProps.BORDER_RIGHT_WIDTH, lengthDefault);
    map.put(NodeProps.BORDER_BOTTOM_WIDTH, lengthDefault);
    map.put(NodeProps.BORDER_LEFT_WIDTH, lengthDefault);
    map.put(NodeProps.MARGIN_TOP, lengthDefault);
    map.put(NodeProps.MARGIN_RIGHT, lengthDefault);
    map.put(NodeProps.MARGIN_BOTTOM, lengthDefault);
    map.put(NodeProps.MARGIN_LEFT, lengthDefault);
    map.put(NodeProps.DISPLAY, displayDefault);
    map.put(NodeProps.POSITION, positionDefault);
    return map;
  }

  /**
   * 判断是否可以转换
   *
   * @param key   css key
   * @param value css value
   * @return 转换的 value
   */
  private Object getTransformValue(String key, String value) {
    if (transformDoubleMap.contains(key)) {
      return getDoubleValue(value);
    }
    if (transformEnumMap.containsKey(key)) {
      return getEnumValue(transformEnumMap.get(key), value);
    }
    return value;
  }

  /**
   * a-b to aB 转为驼峰
   */
  public static String camelize(String str) {
    StringBuilder result = new StringBuilder();
    String[] splitStr = str.split("-");
    boolean skipFirst = true;
    for (String split : splitStr) {
      if (skipFirst) {
        skipFirst = false;
        result.append(split);
        continue;
      }
      result
        .append(split.replaceFirst(split.substring(0, 1), split.substring(0, 1).toUpperCase()));
    }
    return result.toString();
  }

  /**
   * aB to a-b 驼峰还原中线连接
   */
  public static String unCamelize(String str) {
    StringBuilder result = new StringBuilder();
    String[] splitStr = str.split("(?=(?!^)[A-Z])");
    boolean skipFirst = true;
    for (String split : splitStr) {
      if (skipFirst) {
        skipFirst = false;
        result.append(split);
        continue;
      }
      result.append(
        split.replaceFirst(split.substring(0, 1), "-" + split.substring(0, 1).toLowerCase()));
    }
    return result.toString();
  }

}
