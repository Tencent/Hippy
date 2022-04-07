echo "generate core project"
cmake ../../../../devtools/devtools-backend/CMakeLists.txt -B ./devtools_backend -G Xcode -DMODULE_TOOLS=YES -DCMAKE_TOOLCHAIN_FILE=./cmake/ios/ios.toolchain.cmake -DPLATFORM=OS64COMBINED -DENABLE_BITCODE=YES -DENABLE_ARC=YES -DTDF_SERVICE_ENABLED=YES
