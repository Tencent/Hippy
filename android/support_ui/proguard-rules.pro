# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

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

-dontoptimize
-dontusemixedcaseclassnames
-verbose
-dontskipnonpubliclibraryclasses
-dontskipnonpubliclibraryclassmembers
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

#<!--------这里不对public和protected方法和变量进行混淆-------->

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
