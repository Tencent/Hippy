/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.tencent.mtt.hippy.views.text;

import android.annotation.SuppressLint;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.LayerDrawable;
import android.text.Layout;
import android.text.Spannable;
import android.text.SpannableStringBuilder;
import android.text.Spanned;
import android.text.style.AbsoluteSizeSpan;
import android.text.style.ForegroundColorSpan;
import android.view.MotionEvent;
import android.view.View;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.tencent.mtt.hippy.uimanager.HippyViewBase;
import com.tencent.mtt.hippy.uimanager.NativeGestureDispatcher;
import com.tencent.mtt.hippy.utils.LogUtils;
import com.tencent.mtt.hippy.views.common.CommonBackgroundDrawable;
import com.tencent.mtt.hippy.views.common.CommonBorder;
import com.tencent.mtt.hippy.views.list.HippyRecycler;
import com.tencent.renderer.component.text.TextForegroundColorSpan;
import com.tencent.renderer.component.text.TextGestureSpan;

public class HippyTextView extends View implements CommonBorder, HippyViewBase, HippyRecycler {

    private static final String TAG = "HippyTextView";
    @Nullable
    private CommonBackgroundDrawable mBGDrawable;
    @Nullable
    protected Layout mLayout;

    private boolean mNativeGestureEnable = false;

    private TextGestureSpan mNativeGestureSpan;

    private NativeGestureDispatcher mGestureDispatcher;

    private boolean mTextBold = false;

    private int mCustomTextColor = 0;


    @Override
    public void resetProps() {
        setPadding(0, 0, 0, 0);
        mNativeGestureEnable = false;
        mBGDrawable = null;
        //noinspection deprecation
        setBackgroundDrawable(null);
        mTextBold = false;
        mGestureDispatcher = null;
        mNativeGestureSpan = null;
        mCustomTextColor = 0;
        mLayout = null;
    }

    @Override
    public void clear() {
        mLayout = null;
    }

    public HippyTextView(Context context) {
        super(context);
    }

    public void setTextBold(boolean bold) {
        mTextBold = bold;
        postInvalidate();
    }

    public void setCustomColor(int color) {
        mCustomTextColor = color;
        setTextColor(color);
        postInvalidate();
    }

    public void setLayout(@NonNull Layout layout) {
        mLayout = layout;
        if (mCustomTextColor != 0) {
            setTextColor(mCustomTextColor);
        }
        invalidate();
    }

    @Override
    protected void onDraw(Canvas canvas) {
        try {
            super.onDraw(canvas);
            if (mLayout == null) {
                LogUtils.w(TAG, "mLayout == null, id=" + getId());
            }
            canvas.save();
            switch (mLayout.getAlignment()) {
                case ALIGN_CENTER:
                    int totalHeight =
                            getHeight() + getPaddingTop() + getPaddingBottom() - mLayout
                                    .getHeight();
                    int width = (getWidth() - mLayout.getWidth()) / 2;
                    canvas.translate((float) width, totalHeight / 2.0f);
                    break;
                case ALIGN_OPPOSITE:
                    int x = getWidth() - getPaddingRight() - mLayout.getWidth();
                    canvas.translate(x, 0);
                    break;
                default:
                    canvas.translate(getPaddingLeft(), getPaddingTop());
            }
            Paint paint = mLayout.getPaint();
            if (paint != null) {
                paint.setFakeBoldText(mTextBold);
            }
            mLayout.draw(canvas);
            canvas.restore();
        } catch (Throwable e) {
            LogUtils.e(TAG, e.getMessage() + " onDraw: id=" + getId());
        }
    }

    @Override
    protected void dispatchDraw(Canvas canvas) {
        super.dispatchDraw(canvas);
    }

    public void setBorderRadius(float radius, int position) {
        getBackGround().setBorderRadius(radius, position);
    }

    public void setBorderWidth(float width, int position) {
        getBackGround().setBorderWidth(width, position);
    }

    public void setBorderColor(int color, int position) {
        getBackGround().setBorderColor(color, position);
    }

    @Override
    public void setBorderStyle(int borderStyle) {
    }

    @Override
    public void setBackgroundColor(int color) {
        getBackGround().setBackgroundColor(color);
    }

    private CommonBackgroundDrawable getBackGround() {
        if (mBGDrawable == null) {
            mBGDrawable = new CommonBackgroundDrawable();
            Drawable currBGDrawable = getBackground();
            //noinspection deprecation
            super.setBackgroundDrawable(null);
            if (currBGDrawable == null) {
                //noinspection deprecation
                super.setBackgroundDrawable(mBGDrawable);
            } else {
                LayerDrawable layerDrawable = new LayerDrawable(
                        new Drawable[]{mBGDrawable, currBGDrawable});
                //noinspection deprecation
                super.setBackgroundDrawable(layerDrawable);
            }
        }
        return mBGDrawable;
    }

    protected void setTextColor(int textColor) {
        if (mLayout == null || !(mLayout.getText() instanceof SpannableStringBuilder)) {
            return;
        }
        SpannableStringBuilder textSpan = (SpannableStringBuilder) mLayout.getText();
        TextForegroundColorSpan[] spans = textSpan
                .getSpans(0, mLayout.getText().length(), TextForegroundColorSpan.class);
        if (spans == null || spans.length == 0) {
            textSpan.setSpan(new ForegroundColorSpan(textColor), 0,
                    textSpan.toString().length(),
                    Spannable.SPAN_EXCLUSIVE_INCLUSIVE);
        } else {
            for (TextForegroundColorSpan span : spans) {
                int start = textSpan.getSpanStart(span);
                int end = textSpan.getSpanEnd(span);
                textSpan.removeSpan(span);
                int spanFlags = Spannable.SPAN_EXCLUSIVE_INCLUSIVE;
                if (start == 0) {
                    spanFlags = Spannable.SPAN_INCLUSIVE_INCLUSIVE;
                }
                textSpan.setSpan(new TextForegroundColorSpan(textColor), start, end, spanFlags);
            }
        }
    }

    @Override
    public NativeGestureDispatcher getGestureDispatcher() {
        return mGestureDispatcher;
    }

    @Override
    public void setGestureDispatcher(NativeGestureDispatcher dispatcher) {
        mGestureDispatcher = dispatcher;
    }

    @Override
    public boolean dispatchTouchEvent(MotionEvent event) {

        if (!mNativeGestureEnable) {
            return super.dispatchTouchEvent(event);
        }
        int action = event.getAction();

        if (action == MotionEvent.ACTION_DOWN) {
            mNativeGestureSpan = findNativeGestureSpanForTouch(event);
        }
        if (mNativeGestureSpan != null) {
            boolean flag = mNativeGestureSpan.handleDispatchTouchEvent(this, event);
            if (flag) {
                super.dispatchTouchEvent(event);
                return true;
            }
        }
        return super.dispatchTouchEvent(event);
    }

    @SuppressLint("ClickableViewAccessibility")
    @Override
    public boolean onTouchEvent(MotionEvent event) {
        boolean result = super.onTouchEvent(event);
        if (mNativeGestureSpan != null) {
            result |= mNativeGestureSpan.handleTouchEvent(this, event);
        }
        return result;
    }

    public void setNativeGestureEnable(boolean nativeGestureEnable) {
        this.mNativeGestureEnable = nativeGestureEnable;
    }


    private TextGestureSpan findNativeGestureSpanForTouch(MotionEvent event) {
        TextGestureSpan span = null;
        if (mLayout == null) {
            return null;
        }

        int x = (int) event.getX();
        int y = (int) event.getY();

        switch (mLayout.getAlignment()) {
            case ALIGN_CENTER: {
                int totalHeight =
                        getHeight() + getPaddingTop() + getPaddingBottom() - mLayout.getHeight();
                int width = (getWidth() - mLayout.getWidth()) / 2;
                x -= width;
                y -= totalHeight / 2;
            }
            break;
            case ALIGN_OPPOSITE: {
                int width = getWidth() - getPaddingRight() - mLayout.getWidth();
                x -= width;
            }

        }
        Layout layout = mLayout;
        int line = layout.getLineForVertical(y);

        int lineStartX = (int) layout.getLineLeft(line);
        int lineEndX = (int) layout.getLineRight(line);

        CharSequence charSequence = layout.getText();
        if (charSequence instanceof Spanned && x >= lineStartX && x <= lineEndX) {
            Spanned spannedText = (Spanned) charSequence;
            int index = mLayout.getOffsetForHorizontal(line, x);

            TextGestureSpan[] spans = spannedText
                    .getSpans(index, index, TextGestureSpan.class);

            if (spans != null && spans.length > 0) {
                int targetSpanTextLength = charSequence.length();
                for (TextGestureSpan hippyNativeGestureSpan : spans) {
                    int spanStart = spannedText.getSpanStart(hippyNativeGestureSpan);
                    int spanEnd = spannedText.getSpanEnd(hippyNativeGestureSpan);
                    if (spanEnd > index && (spanEnd - spanStart) <= targetSpanTextLength) {
                        span = hippyNativeGestureSpan;
                        targetSpanTextLength = (spanEnd - spanStart);
                    }
                }
            }
        }
        //extend touch area ,if there is no touch event on the text ,use the first node ,it must be the real node
        if (span == null && charSequence instanceof Spanned) {
            Spanned spanned = (Spanned) charSequence;
            TextGestureSpan[] spans = spanned
                    .getSpans(0, spanned.length(), TextGestureSpan.class);
            if (spans.length == 1) //only support one text node
            {
                AbsoluteSizeSpan[] absoluteSizeSpan = spanned
                        .getSpans(0, spanned.length(), AbsoluteSizeSpan.class);
                if (absoluteSizeSpan.length == 1) {
                    span = spans[0];
                }
            }
        }
        return span;
    }
}
