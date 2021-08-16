this is adapter for android enviroment,
build libflexbox.so need following conditions.

How to compile:
1.make sure android sdk & ndk installed

2.install cmake tools for android sdk (you can install it in android studio)

3.modify build_flexbox_so.sh
  set "**ANDROID_NDK_HOME**, **CMAKE_MAKE_PROGRAM**" variable depend on  your installed path

4.in bash enviroment, run build_flexbox_so.sh.

How to use:
java interface is at java directory.
import these and libflexbox.so in your project, 
then use com.tencent.smtt.flexbox.FlexNode(FlexNode.java) to layout.
