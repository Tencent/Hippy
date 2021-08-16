package com.tencent.mtt.hippy.dom.node;

import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;

public class DomDomainData {

  public DomDomainData(int id, int rootId, int pid, String className, String tagName,
    HippyMap map) {
    this.id = id;
    this.rootId = rootId;
    this.pid = pid;
    this.name = className;
    this.tagName = tagName;
    if (map != null) {
      this.style = map.getMap(NodeProps.STYLE);
      this.attributes = map.getMap(NodeProps.ATTRIBUTES);
    }
  }

  public void updateLayout(double layoutX, double layoutY, double width, double height) {
    this.layoutX = layoutX;
    this.layoutY = layoutY;
    this.width = width;
    this.height = height;
  }

  public int id;
  public int rootId;
  public int pid;
  public String name;
  public String tagName;
  public double layoutX;
  public double layoutY;
  public double width;
  public double height;
  public String text;
  public HippyMap style;
  public HippyMap attributes;
}
