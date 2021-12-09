package com.tencent.mtt.hippy.dom.node;

import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;

public class DomDomainData extends DomNodeRecord {

  public DomDomainData(int rootId, int id, int pid, int index,
      final String className, final String tagName, final HippyMap props) {
    this.rootId = rootId;
    this.id = id;
    this.pid = pid;
    this.index = index;
    this.className = className;
    this.tagName = tagName;
    if (props != null) {
      this.style = props.getMap(NodeProps.STYLE);
      this.text = props.getString("text");
      this.attributes = props.getMap(NodeProps.ATTRIBUTES);
    }
  }

  public void updateLayout(double layoutX, double layoutY, double width, double height) {
    this.layoutX = layoutX;
    this.layoutY = layoutY;
    this.width = width;
    this.height = height;
  }

  public double layoutX;
  public double layoutY;
  public double width;
  public double height;
  public String text;
  public HippyMap style;
  public HippyMap attributes;
}
