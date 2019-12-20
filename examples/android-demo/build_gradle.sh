export ANDROID_HOME=$ANDROID_SDK
export JAVA_HOME=$JDK8
export GRADLE_HOME=/data/rdm/apps/gradle/gradle-4.1
export ANDROID_NDK=$ANDROIDNDK_LINUX_R9D
export PATH=$JDK8/bin:$GRADLE_HOME/bin:$ANDROID_NDK:$PATH

echo $ANDROIDNDK_LINUX_R10E
echo $ANDROIDNDK_LINUX_R9D

gradle :sdk:assembleRelease