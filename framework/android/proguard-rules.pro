# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in D:\Users\xiandongluo\AppData\Local\Android\sdk1/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile
#-optimizationpasses 7
#-optimizations !code/simplification/arithmetic,!field/*,!class/merging/*
-dontoptimize
-dontusemixedcaseclassnames
-verbose
-dontskipnonpubliclibraryclasses
-dontskipnonpubliclibraryclassmembers
#noinspection ShrinkerUnresolvedReference
#-overloadaggressively

-dontwarn **HoneycombMR2
-dontwarn **CompatICS
-dontwarn **Honeycomb
-dontwarn **CompatIcs*
-dontwarn **CompatFroyo
-dontwarn **CompatGingerbread
-dontwarn android.support.**
-dontwarn com.alipay.sdk.**
-dontwarn com.tencent.mm.opensdk.**
-dontwarn android.telephony.**
-dontwarn android.graphics.**
-dontwarn android.view.**
-dontwarn com.tencent.mtt.weapp.**
-dontwarn **ConcurrentHashMap**
-dontwarn **KeySetView

#<!-------------------  下方是android平台自带的排除项，这里不要动         ---------------->

-keep public class * extends android.app.Activity {
	public <fields>;
	public <methods>;
}
-keep public class * extends android.app.Application {
	public <fields>;
	public <methods>;
}

-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider
-keep public class * extends android.app.backup.BackupAgentHelper
-keep public class * extends android.preference.Preference

-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

-keepclasseswithmembers class * {
	public <init>(android.content.Context, android.util.AttributeSet);
}

-keepclasseswithmembers class * {
	public <init>(android.content.Context, android.util.AttributeSet, int);
}

-keepattributes *Annotation*,Signature,InnerClasses

# <!--改成这样,因为发现部分SDK中没有被java代码显示调用过,SO文件中调用的native方法会被混淆掉-->

-keepclasseswithmembers class * {
	native <methods>;
}

-keep class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator *;
}

#<!--------------------  下方是共性的排除项目         ------------------>
# <!--方法名中含有“JNI”字符的，认定是Java Native Interface方法，自动排除-->
# <!--方法名中含有“JRI”字符的，认定是Java Reflection Interface方法，自动排除-->

-keep class **JNI* {*;}

-keep class * extends com.tencent.mtt.hippy.modules.nativemodules.HippyNativeModuleBase{   public *;}

-keep interface com.tencent.mtt.hippy.adapter.HippyLogAdapter{*;}

-keep class com.openhippy.**{*;}

-keep class com.tencent.vfs.**{*;}

-keep class com.tencent.devtools.**{*;}

-keep class com.tencent.renderer.**{*;}

-keep class com.tencent.mtt.hippy.**{*;}

-keep public interface com.tencent.mtt.hippy.modules.nativemodules.deviceevent.DeviceEventModule$InvokeDefaultBackPress {*;}

-keep class com.tencent.mtt.supportui.views.** {*;}

-keepclasseswithmembernames class * {
    native <methods>;
}

-keepclasseswithmembers class com.tencent.mtt.supportui.** {
public <methods>;
}

-keepclasseswithmembers class com.tencent.mtt.supportui.** {
protected <methods>;
}

-keepclasseswithmembers class com.tencent.mtt.supportui.** {
public <fields>;
}

-keepclasseswithmembers class com.tencent.mtt.supportui.** {
protected <fields>;
}

-keepclasseswithmembers class androidx.recyclerview.widget.** {
public <methods>;
}

-keepclasseswithmembers class androidx.recyclerview.widget.** {
protected <methods>;
}

-keepclasseswithmembers class androidx.recyclerview.widget.** {
public <fields>;
}

-keepclasseswithmembers class androidx.recyclerview.widget.** {
protected <fields>;
}

# turbo
-keep class com.tencent.mtt.hippy.annotation.HippyTurboObj

-keep @com.tencent.mtt.hippy.annotation.HippyTurboObj class * {*;}

-keep class com.tencent.mtt.hippy.annotation.HippyTurboProp

-keepclasseswithmembers class * {
    @com.tencent.mtt.hippy.annotation.HippyTurboProp <methods>;
}

-keep public class com.tencent.mtt.hippy.bridge.jsi.TurboModuleManager {
public <fields>;
public <methods>;
}
