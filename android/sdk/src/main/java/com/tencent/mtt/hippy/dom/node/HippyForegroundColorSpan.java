package com.tencent.mtt.hippy.dom.node;

import android.text.style.ForegroundColorSpan;
import androidx.annotation.Nullable;

public final class HippyForegroundColorSpan extends ForegroundColorSpan {

  // Support host set custom colors data, such as change skin or night mode.
  @Nullable
  private Object mCustomColors;

  public HippyForegroundColorSpan(int color, Object customColors) {
    super(color);
    mCustomColors = customColors;
  }

  public HippyForegroundColorSpan(int color) {
    this(color, null);
  }

  public Object getCustomColors() {
    return mCustomColors;
  }
}
