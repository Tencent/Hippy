FROM centos

RUN \
yum -y install git git-lfs unzip python3 python2 pkg-config bzip2 glibc-devel.i686 libstdc++-devel.i686 ncurses-compat-libs libatomic.so.1 && \
yum clean all && \
ln -fs /usr/bin/python2.7 /usr/bin/python && \
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git && \
curl -O https://dl.google.com/android/repository/android-ndk-r21e-linux-x86_64.zip && \
unzip android-ndk-r21e-linux-x86_64.zip && \
rm android-ndk-r21e-linux-x86_64.zip

ENV ANDROID_NDK_HOME=/android-ndk-r21e PATH="/depot_tools:${PATH}"