FROM debian

ENV PATH="/opt/depot_tools:${PATH}" ANDROID_SDK_ROOT=/opt/sdk-root ANDROID_NDK_HOME=/opt/sdk-root/ndk/23.1.7779620/

RUN \
apt-get update && apt-get -y install curl openjdk-17-jre git git-lfs unzip python3 python3-distutils python2 python pkg-config bzip2 libc6-i386 lib32atomic1 lib32stdc++6 && apt-get clean && \
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git /opt/depot_tools && gclient && \
curl -O https://dl.google.com/android/repository/commandlinetools-linux-8092744_latest.zip && unzip -d /opt commandlinetools-linux-8092744_latest.zip && rm -rf commandlinetools-linux-8092744_latest.zip && \
curl -O https://bootstrap.pypa.io/pip/2.7/get-pip.py && python get-pip.py && rm -rf get-pip.py && \
yes | /opt/cmdline-tools/bin/sdkmanager --sdk_root=$ANDROID_SDK_ROOT --licenses && \
/opt/cmdline-tools/bin/sdkmanager --sdk_root=$ANDROID_SDK_ROOT --install "ndk;23.1.7779620" "cmake;3.10.2.4988404" "build-tools;30.0.2" "platforms;android-30"
