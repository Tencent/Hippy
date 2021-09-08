package com.tencent.mtt.hippy.devsupport.inspector.model;

import android.app.Activity;
import android.os.Build;
import android.text.TextUtils;
import android.view.View;
import android.view.WindowManager;
import com.tencent.mtt.hippy.HippyEngineContext;
import com.tencent.mtt.hippy.HippyRootView;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.DomDomainData;
import com.tencent.mtt.hippy.dom.DomManager;
import com.tencent.mtt.hippy.dom.node.DomNode;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.uimanager.ControllerManager;
import com.tencent.mtt.hippy.uimanager.RenderManager;
import com.tencent.mtt.hippy.uimanager.RenderNode;
import com.tencent.mtt.hippy.utils.LogUtils;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONObject;

public class DomModel {

  private static final String TAG = "DomModel";

  private static final String DEFAULT_FRAME_ID = "main_frame";
  private DomNode mInspectNode;

  private JSONObject getNode(HippyEngineContext context, int nodeId) {
    JSONArray childrenArray = new JSONArray();
    JSONObject result = null;
    DomManager domManager = context.getDomManager();
    if (domManager != null) {
      DomNode domNode = domManager.getNode(nodeId);
      if (domNode == null) {
        return null;
      }

      DomDomainData domainData = domNode.getDomainData();
      // rootNode domainData为空
      if (domainData != null && !TextUtils.isEmpty(domainData.text)) {
        childrenArray.put(getTextNodeJson(domainData));
      }

      for (int i = 0, size = domNode.getChildCount(); i < size; i++) {
        DomNode childNode = domNode.getChildAt(i);
        childrenArray.put(getNode(context, childNode.getId()));
      }

      try {
        result = getNodeJson(domainData, NodeType.ELEMENT_NODE);
        if (result == null) {
          result = new JSONObject();
        }
        result.put("childNodeCount", childrenArray.length());
        result.put("children", childrenArray);
      } catch (Exception e) {
        LogUtils.e(TAG, "getNode, exception:", e);
      }
    }
    return result;
  }

  private JSONObject getTextNodeJson(DomDomainData domainData) {
    JSONObject result = getNodeJson(domainData, NodeType.TEXT_NODE);
    try {
      result.put("childNodeCount", 0);
      result.put("children", new JSONArray());
    } catch (Exception e) {
      LogUtils.e(TAG, "getTextNodeJson, exception:", e);
    }
    return result;
  }

  private JSONObject getNodeJson(DomDomainData domainData, int nodeType) {
    if (domainData == null) {
      return null;
    }
    JSONObject result = new JSONObject();
    try {
      result.put("nodeId", domainData.id);
      result.put("backendNodeId", 0);
      result.put("nodeType", nodeType);
      result.put("localName", domainData.tagName);
      result.put("nodeName", domainData.tagName);
      result.put("nodeValue", domainData.text);
      result.put("parentId", domainData.pid);
      result.put("attributes", getAttributeList(domainData.attributes));
    } catch (Exception e) {
      LogUtils.e(TAG, "getTextNodeJson, exception:", e);
    }
    return result;
  }

  private JSONArray getAttributeList(HippyMap attributes) {
    JSONArray attributeList = new JSONArray();
    try {
      for (Map.Entry<String, Object> entry : attributes.entrySet()) {
        String key = entry.getKey();
        Object value = entry.getValue();
        if (NodeProps.STYLE.equals(key) && value instanceof HippyMap) {
          value = getInlineStyle((HippyMap) value);
        }
        if (value == null || (value instanceof String && TextUtils.isEmpty((String) value))) {
          continue;
        }
        attributeList.put(key);
        attributeList.put(value.toString());
      }
    } catch (Exception e) {
      LogUtils.e(TAG, "getAttributeList, exception:", e);
    }
    return attributeList;
  }

  private String getInlineStyle(HippyMap data) {
    StringBuilder resultBuilder = new StringBuilder();
    for (Map.Entry<String, Object> entry : data.entrySet()) {
      String key = entry.getKey();
      Object value = entry.getValue();
      if (value instanceof Number) {
        value = String.format("%.1f", ((Number) value).doubleValue());
      }
      resultBuilder.append(key).append(":").append(value).append(";");
    }
    resultBuilder.deleteCharAt(resultBuilder.length() - 1);
    return resultBuilder.toString();
  }

  public JSONObject getDocument(HippyEngineContext context) {
    if (context == null) {
      return new JSONObject();
    }
    try {
      JSONObject result = new JSONObject();
      JSONObject root = new JSONObject();
      int documentNodeId = -3;
      result.put("root", root);
      root.put("nodeId", documentNodeId);
      root.put("backendNodeId", documentNodeId);
      root.put("nodeType", 9);
      root.put("childNodeCount", 1);
      root.put("nodeName", "#document");
      root.put("baseURL", "");
      root.put("documentURL", "");
      DomManager domManager = context.getDomManager();
      if (domManager != null) {
        int rootId = domManager.getRootNodeId();
        JSONObject rootNode = getNode(context, rootId);
        if (rootNode != null) {
          JSONArray childrenArray = rootNode.optJSONArray("children");
          if (childrenArray != null) {
            root.put("children", childrenArray);
          }
        }
      }
      return result;
    } catch (Exception e) {
      LogUtils.e(TAG, "getDocument, exception:", e);
    }
    return new JSONObject();
  }

  private JSONArray getBorder(int x, int y, int width, int height) {
    JSONArray border = new JSONArray();
    try {
      border.put(x);
      border.put(y);
      border.put(x + width);
      border.put(y);
      border.put(x + width);
      border.put(y + height);
      border.put(x);
      border.put(y + height);
    } catch (Exception e) {
      LogUtils.e(TAG, "getBorder, exception:", e);
    }
    return border;
  }

  private JSONArray getPadding(JSONArray border, HippyMap style) {
    int borderTop = 0;
    int borderRight = 0;
    int borderBottom = 0;
    int borderLeft = 0;
    if (style != null) {
      if (style.containsKey(NodeProps.BORDER_TOP_WIDTH)) {
        borderTop = (int) style.get(NodeProps.BORDER_TOP_WIDTH);
      }
      if (style.containsKey(NodeProps.BORDER_RIGHT_WIDTH)) {
        borderRight = (int) style.get(NodeProps.BORDER_RIGHT_WIDTH);
      }
      if (style.containsKey(NodeProps.BORDER_BOTTOM_WIDTH)) {
        borderBottom = (int) style.get(NodeProps.BORDER_BOTTOM_WIDTH);
      }
      if (style.containsKey(NodeProps.BORDER_LEFT_WIDTH)) {
        borderLeft = (int) style.get(NodeProps.BORDER_LEFT_WIDTH);
      }
    }

    JSONArray padding = new JSONArray();
    try {
      padding.put(border.getInt(0) + borderLeft);
      padding.put(border.getInt(1) + borderTop);
      padding.put(border.getInt(2) - borderRight);
      padding.put(border.getInt(3) + borderTop);
      padding.put(border.getInt(4) - borderRight);
      padding.put(border.getInt(5) - borderBottom);
      padding.put(border.getInt(6) + borderLeft);
      padding.put(border.getInt(7) - borderBottom);
    } catch (Exception e) {
      LogUtils.e(TAG, "getPadding, exception:", e);
    }
    return padding;
  }

  private JSONArray getContent(JSONArray padding, HippyMap style) {
    int paddingTop = 0;
    int paddingRight = 0;
    int paddingBottom = 0;
    int paddingLeft = 0;
    if (style != null) {
      if (style.containsKey(NodeProps.PADDING_TOP)) {
        paddingTop = (int) style.get(NodeProps.PADDING_TOP);
      }
      if (style.containsKey(NodeProps.PADDING_RIGHT)) {
        paddingRight = (int) style.get(NodeProps.PADDING_RIGHT);
      }
      if (style.containsKey(NodeProps.PADDING_BOTTOM)) {
        paddingBottom = (int) style.get(NodeProps.PADDING_BOTTOM);
      }
      if (style.containsKey(NodeProps.PADDING_LEFT)) {
        paddingLeft = (int) style.get(NodeProps.PADDING_LEFT);
      }
    }

    JSONArray content = new JSONArray();
    try {
      content.put(padding.getInt(0) + paddingLeft);
      content.put(padding.getInt(1) + paddingTop);
      content.put(padding.getInt(2) - paddingRight);
      content.put(padding.getInt(3) + paddingTop);
      content.put(padding.getInt(4) - paddingRight);
      content.put(padding.getInt(5) - paddingBottom);
      content.put(padding.getInt(6) + paddingLeft);
      content.put(padding.getInt(7) - paddingBottom);
    } catch (Exception e) {
      LogUtils.e(TAG, "getPadding, exception:", e);
    }
    return content;
  }

  private JSONArray getMargin(JSONArray border, HippyMap style) {
    int marginTop = 0;
    int marginRight = 0;
    int marginBottom = 0;
    int marginLeft = 0;
    if (style != null) {
      if (style.containsKey(NodeProps.MARGIN_TOP)) {
        marginTop = (int) style.get(NodeProps.MARGIN_TOP);
      }
      if (style.containsKey(NodeProps.MARGIN_RIGHT)) {
        marginRight = (int) style.get(NodeProps.MARGIN_RIGHT);
      }
      if (style.containsKey(NodeProps.MARGIN_BOTTOM)) {
        marginBottom = (int) style.get(NodeProps.MARGIN_BOTTOM);
      }
      if (style.containsKey(NodeProps.MARGIN_LEFT)) {
        marginLeft = (int) style.get(NodeProps.MARGIN_LEFT);
      }
    }

    JSONArray margin = new JSONArray();
    try {
      margin.put(border.getInt(0) - marginLeft);
      margin.put(border.getInt(1) - marginTop);
      margin.put(border.getInt(2) + marginRight);
      margin.put(border.getInt(3) - marginTop);
      margin.put(border.getInt(4) + marginRight);
      margin.put(border.getInt(5) + marginBottom);
      margin.put(border.getInt(6) - marginLeft);
      margin.put(border.getInt(7) + marginBottom);
    } catch (Exception e) {
      LogUtils.e(TAG, "getPadding, exception:", e);
    }
    return margin;
  }

  public JSONObject getBoxModel(HippyEngineContext context, JSONObject paramsObj) {
    if (context == null || paramsObj == null) {
      return new JSONObject();
    }
    try {
      int nodeId = paramsObj.optInt("nodeId", -1);
      DomManager domManager = context.getDomManager();
      RenderManager renderManager = context.getRenderManager();
      if (domManager != null && renderManager != null) {
        DomNode domNode = domManager.getNode(nodeId);
        RenderNode renderNode = renderManager.getRenderNode(nodeId);
        if (domNode != null && domNode.getDomainData() != null && renderNode != null) {
          int[] viewLocation = getRenderViewLocation(context, renderNode);
          // 没找到view，还未创建
          if (viewLocation == null) {
            return new JSONObject();
          }

          JSONArray border = getBorder(viewLocation[0], viewLocation[1], renderNode.getWidth(),
            renderNode.getHeight());
          HippyMap style = domNode.getDomainData().style;
          JSONArray padding = getPadding(border, style);
          JSONArray content = getContent(padding, style);
          JSONArray margin = getMargin(border, style);
          JSONObject result = new JSONObject();
          JSONObject model = new JSONObject();
          model.put("content", content);
          model.put("padding", padding);
          model.put("border", border);
          model.put("margin", margin);
          model.put("width", renderNode.getWidth());
          model.put("height", renderNode.getHeight());
          result.put("model", model);
          return result;
        }
      }
    } catch (Exception e) {
      LogUtils.e(TAG, "getDocument, exception:", e);
    }
    return new JSONObject();
  }

  private int[] getRenderViewLocation(HippyEngineContext context, RenderNode renderNode) {
    int[] viewLocation = new int[2];
    viewLocation[0] = renderNode.getX();
    viewLocation[1] = renderNode.getY();
    ControllerManager controllerManager = context.getRenderManager().getControllerManager();
    if (controllerManager != null) {
      View view = controllerManager.findView(renderNode.getId());
      if (view != null) {
        view.getLocationOnScreen(viewLocation);
        HippyRootView rootView = getRootView(context);
        if (rootView != null) {
          int[] rootViewLocation = new int[2];
          rootView.getLocationOnScreen(rootViewLocation);
          viewLocation[0] = viewLocation[0] - rootViewLocation[0];
          viewLocation[1] = viewLocation[1] - rootViewLocation[1];
        }
      } else {
        return null;
      }
    }
    return viewLocation;
  }

  private boolean isLocationHitRenderNode(HippyEngineContext context, int x, int y,
    RenderNode renderNode) {
    if (renderNode == null) {
      return false;
    }
    int[] viewLocation = getRenderViewLocation(context, renderNode);
    if (viewLocation == null) {
      return false;
    }
    int dx = viewLocation[0];
    int dy = viewLocation[1];
    int width = renderNode.getWidth();
    int height = renderNode.getHeight();
    boolean isInTopOffset = x >= dx && y >= dy;
    boolean isInBottomOffset = x <= (dx + width) && y <= (dy + height);
    boolean isHit = isInTopOffset && isInBottomOffset;
    return isHit;
  }

  /**
   * @return 是否是沉浸式状态栏
   */
  private boolean isTranslucentStatus(HippyEngineContext context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.KITKAT) {
      return false;
    }
    int rootId = context.getDomManager().getRootNodeId();
    HippyRootView rootView = context.getInstance(rootId);
    if (rootView == null || !(rootView.getHost() instanceof Activity)) {
      return false;
    }
    int flag = ((Activity) rootView.getHost()).getWindow().getAttributes().flags;
    if ((WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS & flag)
      == WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS) {
      return true;
    }
    int options = ((Activity) rootView.getHost()).getWindow().getDecorView()
      .getSystemUiVisibility();
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP
      && (View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN & options)
      == View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN) {
      return true;
    }
    return false;
  }

  /**
   * 获取面积更小的渲染节点
   *
   * @param oldNode
   * @param newNode
   * @return
   */
  private RenderNode getSmallerAreaRenderNode(RenderNode oldNode, RenderNode newNode) {
    if (oldNode == null) {
      return newNode;
    }
    if (newNode == null) {
      return oldNode;
    }

    int oldNodeArea = oldNode.getWidth() * oldNode.getHeight();
    int newNodeArea = newNode.getWidth() * newNode.getHeight();
    return oldNodeArea > newNodeArea ? newNode : oldNode;
  }

  /**
   * 获取当前坐标(x, y)所在的最深层级且面积最小的RenderNode节点
   *
   * @param x
   * @param y
   * @param rootNode
   * @return
   */
  private RenderNode getMaxDepthAndMinAreaHitRenderNode(HippyEngineContext context, int x, int y,
    RenderNode rootNode) {
    if (rootNode == null || !isLocationHitRenderNode(context, x, y, rootNode)) {
      return null;
    }

    RenderNode hitNode = null;
    for (int i = 0, size = rootNode.getChildCount(); i < size; i++) {
      RenderNode childNode = rootNode.getChildAt(i);
      if (isLocationHitRenderNode(context, x, y, childNode)) {
        RenderNode newHitNode = getMaxDepthAndMinAreaHitRenderNode(context, x, y, childNode);
        hitNode = getSmallerAreaRenderNode(hitNode, newHitNode);
      }
    }

    return hitNode != null ? hitNode : rootNode;
  }

  public JSONObject getNodeForLocation(HippyEngineContext context, JSONObject paramsObj) {
    if (context == null || paramsObj == null) {
      return new JSONObject();
    }
    try {
      int x = paramsObj.optInt("x", 0);
      int y = paramsObj.optInt("y", 0);
      DomManager domManager = context.getDomManager();
      RenderManager renderManager = context.getRenderManager();
      if (domManager != null && renderManager != null) {
        int rootId = domManager.getRootNodeId();
        RenderNode renderNode = renderManager.getRenderNode(rootId);
        if (renderNode.getChildCount() > 0) {
          RenderNode rootNode = getRootRenderNode(renderNode, x, y);
          if (rootNode != null) {
            RenderNode hitRenderNode = getMaxDepthAndMinAreaHitRenderNode(context, x, y, rootNode);
            JSONObject result = new JSONObject();
            if (hitRenderNode != null) {
              result.put("backendId", hitRenderNode.getId());
              result.put("frameId", DEFAULT_FRAME_ID);
              result.put("nodeId", hitRenderNode.getId());
            }
            return result;
          }
        }
      }
    } catch (Exception e) {
      LogUtils.e(TAG, "getDocument, exception:", e);
    }
    return new JSONObject();
  }

  private RenderNode getRootRenderNode(RenderNode rootNode, int x, int y) {
    if (rootNode.getWidth() > 0 && rootNode.getHeight() > 0) {
      return rootNode;
    }
    // 当 rootNode 没有宽、高信息时，返回一个包含x,y的子节点
    RenderNode resultNode = null;
    for (int i = 0; i < rootNode.getChildCount(); i++) {
      RenderNode childNode = rootNode.getChildAt(i);
      if (resultNode == null || childNode.getX() <= x && childNode.getY() <= y
        && resultNode.getHeight() <= childNode.getHeight()
        && resultNode.getWidth() <= childNode.getWidth()) {
        // 选择一个范围更大的，且起始点在 x,y 的左上方
        resultNode = rootNode.getChildAt(i);
      }
    }
    return resultNode;
  }

  public JSONObject setInspectMode(HippyEngineContext context, JSONObject paramsObj) {
    if (context == null || paramsObj == null) {
      return new JSONObject();
    }
    try {
      int nodeId = paramsObj.optInt("nodeId", 0);
      DomManager domManager = context.getDomManager();
      if (domManager != null) {
        DomNode domNode = domManager.getNode(nodeId);
        if (domNode != null) {
          mInspectNode = domNode;
        }
      }
    } catch (Exception e) {
      LogUtils.e(TAG, "setInspectMode, exception:", e);
    }
    return new JSONObject();
  }

  private static HippyRootView getRootView(HippyEngineContext context) {
    int rootId = context.getDomManager().getRootNodeId();
    return context.getInstance(rootId);
  }

  /**
   * https://dom.spec.whatwg.org/#dom-node-nodetype
   */
  public static class NodeType {

    public static final int ELEMENT_NODE = 1;
    public static final int ATTRIBUTE_NODE = 2;
    public static final int TEXT_NODE = 3;
    public static final int CDATA_SECTION_NODE = 4;
    public static final int PROCESSING_INSTRUCTION_NODE = 5;
    public static final int COMMENT_NODE = 6;
    public static final int DOCUMENT_NODE = 7;
    public static final int DOCUMENT_TYPE_NODE = 8;
    public static final int DOCUMENT_FRAGMENT_NODE = 9;
  }
}
