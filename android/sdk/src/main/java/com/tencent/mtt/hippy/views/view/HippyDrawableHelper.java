package com.tencent.mtt.hippy.views.view;

import android.content.Context;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.graphics.drawable.Drawable;
import android.graphics.drawable.RippleDrawable;
import android.os.Build;

import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.utils.PixelUtil;

import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;

public class HippyDrawableHelper {

  @RequiresApi(api = Build.VERSION_CODES.M)
  public static Drawable createDrawableFromJSDescription(Context context, HippyMap drawableDescriptionDict) {
    RippleDrawable rd = null;
    if (android.os.Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      rd = getRippleDrawable(context, drawableDescriptionDict);
      return setRadius(drawableDescriptionDict, rd);
    }
    return null;
  }

  /**
   * set radius of ripple
   * @param drawableDescriptionDict
   * @param drawable
   * @return
   */
  public static Drawable setRadius(HippyMap drawableDescriptionDict, Drawable drawable) {
    if (Build.VERSION.SDK_INT > Build.VERSION_CODES.M
      && drawableDescriptionDict.containsKey("rippleRadius")
      && drawable instanceof RippleDrawable) {
      RippleDrawable rippleDrawable = (RippleDrawable) drawable;
      double rippleRadius = drawableDescriptionDict.getDouble("rippleRadius");
      rippleDrawable.setRadius((int) PixelUtil.dp2px(rippleRadius));
    }
    return drawable;
  }

  @RequiresApi(api = Build.VERSION_CODES.M)
  private static RippleDrawable getRippleDrawable(
    Context context, HippyMap drawableDescriptionDict) {
    if (Build.VERSION.SDK_INT > Build.VERSION_CODES.M) {
      int color = getColor(drawableDescriptionDict);
      Drawable mask = getMask(drawableDescriptionDict);
      ColorStateList colorStateList =
        new ColorStateList(new int[][] { new int[]{} }, new int[] {color});

      return new RippleDrawable(colorStateList, null, mask);
    }
    return null;
  }

  private static int getColor(HippyMap drawableDescriptionDict) {
    if (drawableDescriptionDict.containsKey("color")
      && !drawableDescriptionDict.isNull("color")) {
      return Color.parseColor(drawableDescriptionDict.getString("color"));
    }
    return Color.BLUE;
  }

  /**
   * set mask if borderless is null or false
   * @param drawableDescriptionDict
   * @return
   */
  private static @Nullable Drawable getMask(HippyMap drawableDescriptionDict) {
    if (!drawableDescriptionDict.containsKey("borderless")
      || drawableDescriptionDict.isNull("borderless")
      || !drawableDescriptionDict.getBoolean("borderless"))
      return new ColorDrawable(Color.WHITE);

    return null;
  }
}
