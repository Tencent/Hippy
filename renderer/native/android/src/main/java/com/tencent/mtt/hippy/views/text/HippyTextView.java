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
import android.view.MotionEvent;
import android.view.View;

import androidx.annotation.MainThread;
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
    private CommonBackgroundDrawable mBackgroundDrawable;
    @Nullable
    protected Layout mLayout;
    @Nullable
    private TextGestureSpan mGestureSpan;
    @Nullable
    private NativeGestureDispatcher mGestureDispatcher;
    private boolean mGestureEnable = false;
    private boolean mTextBold = false;
    private int mCustomTextColor = 0;


    @Override
    public void resetProps() {
        setPadding(0, 0, 0, 0);
        mBackgroundDrawable = null;
        setBackground(null);
        mGestureDispatcher = null;
        mGestureSpan = null;
        mLayout = null;
        mTextBold = false;
        mGestureEnable = false;
        mCustomTextColor = 0;
    }

    @Override
    public void clear() {
        mLayout = null;
    }

    public HippyTextView(Context context) {
        super(context);
    }

    @MainThread
    public void setTextBold(boolean bold) {
        mTextBold = bold;
        invalidate();
    }

    @MainThread
    public void setCustomColor(int color) {
        mCustomTextColor = color;
        setTextColor(color);
        invalidate();
    }

    @MainThread
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

    @Override
    public void setBorderRadius(float radius, int position) {
        getBackGround().setBorderRadius(radius, position);
    }

    @Override
    public void setBorderWidth(float width, int position) {
        getBackGround().setBorderWidth(width, position);
    }

    @Override
    public void setBorderColor(int color, int position) {
        getBackGround().setBorderColor(color, position);
    }

    @Override
    public void setBorderStyle(int borderStyle) {
        getBackGround().setBorderStyle(borderStyle);
    }

    @Override
    public void setBackgroundColor(int color) {
        getBackGround().setBackgroundColor(color);
    }

    protected void setTextColor(int textColor) {
        if (mLayout == null || !(mLayout.getText() instanceof SpannableStringBuilder)) {
            return;
        }
        SpannableStringBuilder textSpan = (SpannableStringBuilder) mLayout.getText();
        TextForegroundColorSpan[] spans = textSpan
                .getSpans(0, mLayout.getText().length(), TextForegroundColorSpan.class);
        if (spans == null || spans.length == 0) {
            textSpan.setSpan(new TextForegroundColorSpan(textColor), 0,
                    textSpan.toString().length(), Spannable.SPAN_EXCLUSIVE_INCLUSIVE);
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
        if (!mGestureEnable) {
            return super.dispatchTouchEvent(event);
        }
        int action = event.getAction();
        if (action == MotionEvent.ACTION_DOWN) {
            mGestureSpan = findGestureSpan(event);
        }
        if (mGestureSpan != null) {
            boolean flag = mGestureSpan.handleDispatchTouchEvent(this, event);
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
        if (mGestureSpan != null) {
            result |= mGestureSpan.handleTouchEvent(this, event);
        }
        return result;
    }

    public void setGestureEnable(boolean gestureEnable) {
        this.mGestureEnable = gestureEnable;
    }

    private CommonBackgroundDrawable getBackGround() {
        if (mBackgroundDrawable == null) {
            mBackgroundDrawable = new CommonBackgroundDrawable();
            Drawable background = getBackground();
            super.setBackground(null);
            if (background == null) {
                super.setBackground(mBackgroundDrawable);
            } else {
                LayerDrawable layerDrawable = new LayerDrawable(
                        new Drawable[]{mBackgroundDrawable, background});
                super.setBackground(layerDrawable);
            }
        }
        return mBackgroundDrawable;
    }

    @Nullable
    private TextGestureSpan findGestureSpan(int x, int y) {
        if (mLayout == null) {
            return null;
        }
        TextGestureSpan result = null;
        int line = mLayout.getLineForVertical(y);
        int lineStartX = (int) mLayout.getLineLeft(line);
        int lineEndX = (int) mLayout.getLineRight(line);
        CharSequence charSequence = mLayout.getText();
        if (charSequence instanceof Spanned && x >= lineStartX && x <= lineEndX) {
            Spanned spannedText = (Spanned) charSequence;
            int index = mLayout.getOffsetForHorizontal(line, x);
            TextGestureSpan[] spans = spannedText
                    .getSpans(index, index, TextGestureSpan.class);
            if (spans != null && spans.length > 0) {
                int targetSpanTextLength = charSequence.length();
                for (TextGestureSpan gestureSpan : spans) {
                    int spanStart = spannedText.getSpanStart(gestureSpan);
                    int spanEnd = spannedText.getSpanEnd(gestureSpan);
                    if (spanEnd > index && (spanEnd - spanStart) <= targetSpanTextLength) {
                        result = gestureSpan;
                        targetSpanTextLength = (spanEnd - spanStart);
                    }
                }
            }
        }
        // If there is no gesture span on the specify location text, try to get the first
        // gesture span in all spans.
        if (result == null && charSequence instanceof Spanned) {
            Spanned spanned = (Spanned) charSequence;
            TextGestureSpan[] spans = spanned
                    .getSpans(0, spanned.length(), TextGestureSpan.class);
            if (spans.length == 1) {
                AbsoluteSizeSpan[] absoluteSizeSpan = spanned
                        .getSpans(0, spanned.length(), AbsoluteSizeSpan.class);
                if (absoluteSizeSpan.length == 1) {
                    result = spans[0];
                }
            }
        }
        return result;
    }

    @Nullable
    private TextGestureSpan findGestureSpan(MotionEvent event) {
        if (mLayout == null) {
            return null;
        }
        int x = (int) event.getX();
        int y = (int) event.getY();
        int width;
        switch (mLayout.getAlignment()) {
            case ALIGN_CENTER:
                int totalHeight =
                        getHeight() + getPaddingTop() + getPaddingBottom() - mLayout.getHeight();
                width = (getWidth() - mLayout.getWidth()) / 2;
                x -= width;
                y -= totalHeight / 2;
                break;
            case ALIGN_OPPOSITE:
                width = getWidth() - getPaddingRight() - mLayout.getWidth();
                x -= width;
                break;
            default:
                // Just need to handle center and opposite alignment.

        }
        return findGestureSpan(x, y);
    }
}
