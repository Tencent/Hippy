FROM debian

ENV PATH="/opt/depot_tools:${PATH}"

RUN \
apt-get update && apt-get -y install curl git git-lfs unzip python3 python3-distutils python2 python pkg-config bzip2 libc6-i386 lib32atomic1 lib32stdc++6 && apt-get clean && \
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git /opt/depot_tools && gclient && \
curl -O https://bootstrap.pypa.io/pip/2.7/get-pip.py && python get-pip.py && rm -rf get-pip.py && \
curl -O https://bootstrap.pypa.io/pip/3.6/get-pip.py && python3 get-pip.py && rm -rf get-pip.py
