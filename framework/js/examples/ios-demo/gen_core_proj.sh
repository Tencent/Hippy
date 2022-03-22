echo "generate core project"
cmake ../../../../third_party/devtools-backend/CMakeLists.txt -B ./devtools_backend -G Xcode -DMODULE_TOOLS=YES -DCMAKE_TOOLCHAIN_FILE=./cmake/ios/ios.toolchain.cmake -DPLATFORM=OS64COMBINED -DENABLE_BITCODE=NO -DENABLE_ARC=YES
