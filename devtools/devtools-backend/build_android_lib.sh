rm -rf build
mkdir build && cd build
cmake \
-H../ \
-B./arm64-v8a \
-DANDROID_ABI=arm64-v8a \
-DANDROID_NDK=~/Library/Android/sdk/ndk/21.4.7075529 \
-DANDROID_PLATFORM=android-21 \
-DCMAKE_TOOLCHAIN_FILE=~/Library/Android/sdk/ndk/21.4.7075529/build/cmake/android.toolchain.cmake \
-G Ninja

cd arm64-v8a
ninja
echo "mv cmake/android/libdevtools_backend.so ../lib/android"
mv cmake/android/libdevtools_backend.so ../../lib/android