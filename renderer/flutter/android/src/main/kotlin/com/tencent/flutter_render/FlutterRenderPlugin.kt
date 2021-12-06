package com.tencent.flutter_render

import android.content.Context
import android.os.Build
import android.util.DisplayMetrics.DENSITY_DEFAULT
import androidx.annotation.NonNull
import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import io.flutter.plugin.common.MethodChannel.MethodCallHandler
import io.flutter.plugin.common.MethodChannel.Result
import io.flutter.plugin.common.PluginRegistry.Registrar
import java.util.*
import kotlin.collections.HashMap
import kotlin.collections.set

/** FlutterRenderPlugin */
public class FlutterRenderPlugin: FlutterPlugin, MethodCallHandler {
  private var applicationContext: Context? = null
  /// The MethodChannel that will the communication between Flutter and native Android
  ///
  /// This local reference serves to register the plugin with the Flutter Engine and unregister it
  /// when the Flutter Engine is detached from the Activity
  private lateinit var channel : MethodChannel

  override fun onAttachedToEngine(@NonNull flutterPluginBinding: FlutterPlugin.FlutterPluginBinding) {
    channel = MethodChannel(flutterPluginBinding.getFlutterEngine().getDartExecutor(), "flutter_render")
    channel.setMethodCallHandler(this)
    applicationContext = flutterPluginBinding.applicationContext
  }

  // This static function is optional and equivalent to onAttachedToEngine. It supports the old
  // pre-Flutter-1.12 Android projects. You are encouraged to continue supporting
  // plugin registration via this function while apps migrate to use the new Android APIs
  // post-flutter-1.12 via https://flutter.dev/go/android-project-migration.
  //
  // It is encouraged to share logic between onAttachedToEngine and registerWith to keep
  // them functionally equivalent. Only one of onAttachedToEngine or registerWith will be called
  // depending on the user's project. onAttachedToEngine or registerWith must both be defined
  // in the same class.
  companion object {
    @JvmStatic
    fun registerWith(registrar: Registrar) {
      val channel = MethodChannel(registrar.messenger(), "flutter_render")
      channel.setMethodCallHandler(FlutterRenderPlugin())
    }
  }

  override fun onMethodCall(@NonNull call: MethodCall, @NonNull result: Result) {
    when (call.method) {
        "getPlatformVersion" -> {
          result.success("hello")
        }
        "getPlatformInfo" -> {
          val context = applicationContext
          val resultMap = HashMap<String, Any>()
          resultMap["os"] = "android"
          resultMap["apiLevel"] = Build.VERSION.SDK_INT
          resultMap["osVersion"] = Build.VERSION.RELEASE
          resultMap["codeName"] = Build.VERSION.CODENAME
          resultMap["model"] = Build.MODEL
          resultMap["deviceId"] = Build.ID
          val locale = Locale.getDefault()
          resultMap["language"] = locale.language.toLowerCase(locale)
          resultMap["country"] = locale.country.toLowerCase(locale)

          if (context != null) {
            resultMap["densityApi"] = getDensityApi(context)
          } else {
            resultMap["densityApi"] = DENSITY_DEFAULT
          }
          result.success(resultMap)
        }
        "getLocaleInfo" -> {
          val locale: Locale = Locale.getDefault()
          val resultMap = HashMap<String, Any>()

          resultMap["language"] = locale.language
          resultMap["country"] = locale.country

          result.success(resultMap)
        }
        else -> {
          result.notImplemented()
        }
    }
  }

  override fun onDetachedFromEngine(@NonNull binding: FlutterPlugin.FlutterPluginBinding) {
    channel.setMethodCallHandler(null)
  }
}
