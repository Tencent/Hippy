package com.tencent.mtt.supportui.views;

import com.tencent.renderer.component.drawable.BorderDrawable.BorderStyle;

public interface IBorder
{
	void setBorderRadius(float radius, int position);

	void setBorderWidth(float width, int position);

	void setBorderColor(int color, int position);

	void setBorderStyle(BorderStyle style);
}
