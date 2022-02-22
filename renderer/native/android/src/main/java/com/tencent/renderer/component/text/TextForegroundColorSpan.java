package com.tencent.renderer.component.text;

import android.text.style.ForegroundColorSpan;

public final class TextForegroundColorSpan extends ForegroundColorSpan {

    // Support host set custom colors data, such as change skin or night mode.
    private final Object mCustomColors;

    public TextForegroundColorSpan(int color, Object customColors) {
        super(color);
        mCustomColors = customColors;
    }

    public TextForegroundColorSpan(int color) {
        this(color, null);
    }

    public Object getCustomColors() {
        return mCustomColors;
    }
}
