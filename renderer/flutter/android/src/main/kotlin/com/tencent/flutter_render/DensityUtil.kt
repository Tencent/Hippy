package com.tencent.flutter_render

import android.content.Context

/**
 * 屏幕密度api相关工具类
 * Created by luciolong on 2020/9/15.
 */

fun getDensityApi(context: Context): Int {
    val displayMetrics = context.resources.displayMetrics
    return displayMetrics.densityDpi
}