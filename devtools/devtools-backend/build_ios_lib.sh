rm -rf build
mkdir build && cd build
cmake .. -G Xcode -DCMAKE_TOOLCHAIN_FILE=../ios.toolchain.cmake -DPLATFORM=OS64COMBINED
cmake --build . --config Release
echo "mv cmake/ios/Release-iphoneos/libdevtools_backend.a ../lib/ios"
mv cmake/ios/Release-iphoneos/libdevtools_backend.a ../lib/ios