this is adapter for android enviroment,
build libflexbox.so need following conditions.

How to compile:
1.use bash shell as build platform.
  if at win32 enviroment, you can use git bash in win32(https://gitforwindows.org/)

2.make sure android sdk & ndk installed

3.install cmake tools for android sdk (you can install it in android studio)

4.modify build_flexbox_so.sh
  set "**ANDROID_SDK_CMAKE_BIN**, **ANDROID_NDK**, **ANDROID_SO_STRIP**" variable depend on  your installed path

5.in bash enviroment, run build_flexbox_so.sh 
  in directory `out/android/`, libflexboxso.sh has symbols
  libflexbox_strip.so is stripped that can be used for product.

6.android/libs/armeabi is compiled under the libmtt_shared.so, see android/CMakeLists.txt, can be used directly.

How to use:
java interface is at java directory.
import these and libflexbox.so in your project, 
then use com.tencent.smtt.flexbox.FlexNode(FlexNode.java) to layout.
