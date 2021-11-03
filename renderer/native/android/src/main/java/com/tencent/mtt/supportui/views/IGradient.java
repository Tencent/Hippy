package com.tencent.mtt.supportui.views;

import java.util.ArrayList;

public interface IGradient {
	void setGradientAngle(String angle);
  
	void setGradientColors(ArrayList<Integer> colors);

	void setGradientPositions(ArrayList<Float> positions);
}
