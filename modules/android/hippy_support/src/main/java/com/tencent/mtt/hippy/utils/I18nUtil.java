package com.tencent.mtt.hippy.utils;

import android.os.Build;
import android.os.LocaleList;
import android.text.TextUtils;
import android.view.View;
import java.util.Locale;

public class I18nUtil {
  private static Locale getLocale() {
    Locale locale;
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
      locale = LocaleList.getDefault().get(0);
    } else {
      locale = Locale.getDefault();
    }

    return locale;
  }

  public static boolean isRTL() {
    return getLayoutDirection() == View.LAYOUT_DIRECTION_RTL;
  }

  public static int getLayoutDirection() {
    return TextUtils.getLayoutDirectionFromLocale(getLocale());
  }

  public static String getLanguage() {
    return getLocale().getLanguage();
  }

  public static String getCountry() {
    return getLocale().getCountry();
  }
}
