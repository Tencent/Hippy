package com.tencent.mtt.hippy.dom.node;

import android.text.style.ForegroundColorSpan;

public final class HippyForegroundColorSpan extends ForegroundColorSpan {

  private final Object customData;
  private final int color;

  public HippyForegroundColorSpan(int color, Object customData) {
    super(color);
    this.color = color;
    this.customData = customData;
  }

  public HippyForegroundColorSpan(int color) {
    this(color, null);
  }

  public int getColor() {
    return color;
  }

  public Object getCustomData() {
    return customData;
  }
}
