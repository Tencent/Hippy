# region ABI_COMPILE_OPTIONS
if (CMAKE_SYSTEM_NAME STREQUAL "Android")
  add_definitions("-DJS_V8")
  set(JS_ENGINE "V8")
  set(FRAMEWORK_ANDROID_DEPS android log)
  set(ABI_COMPILE_OPTIONS
          -fomit-frame-pointer
          -fno-threadsafe-statics
          -fno-strict-aliasing
          -fno-short-enums
          -fno-unique-section-names
          -fno-trigraphs
          -Werror
          -Wall
          -Wextra
          -Wextra-semi
          -Wconversion
          -Wimplicit-fallthrough
          -Wimplicit-int-conversion
          -Wloop-analysis
          -Wmissing-field-initializers
          -Wunused-local-typedefs
          -Wstring-conversion
          -Wthread-safety
          -Wtautological-overlap-compare
          -Wunreachable-code
          -Wenum-compare-conditional
          -Wheader-hygiene
          -Wshadow
          -Wno-unused-parameter
          -Wno-trigraphs
          --param=ssp-buffer-size=4
          -pipe
          -Os)
  message("ANDROID_ABI: ${ANDROID_ABI}")
  if (${ANDROID_ABI} STREQUAL "armeabi-v7a")
    set(ABI_COMPILE_OPTIONS ${ABI_COMPILE_OPTIONS}
            -mfloat-abi=softfp)
  elseif (${ANDROID_ABI} STREQUAL "arm64-v8a")
    # (Empty)
  elseif (${ANDROID_ABI} STREQUAL "x86")
    set(ABI_COMPILE_OPTIONS ${ABI_COMPILE_OPTIONS}
            -m32
            -mssse3
            -mfpmath=sse)
  elseif (${ANDROID_ABI} STREQUAL "x86_64")
    set(ABI_COMPILE_OPTIONS ${ABI_COMPILE_OPTIONS}
            -m64
            -mpopcnt
            -msse4.2)
  else ()
    message(FATAL_ERROR "${ANDROID_ABI} is not supported")
  endif ()
  add_definitions("-DOS_ANDROID")
  add_definitions("-DANDROID")
elseif (CMAKE_SYSTEM_NAME STREQUAL "iOS")
  set(JS_ENGINE "JSC")
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -x objective-c++ -fprofile-instr-generate -fcoverage-mapping -std=c++17")
elseif (CMAKE_SYSTEM_NAME STREQUAL "Darwin")
  set(JS_ENGINE "JSC")
  set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -x objective-c++ -fprofile-instr-generate -fcoverage-mapping -std=c++17")
elseif (CMAKE_SYSTEM_NAME STREQUAL "Windows")
  set(JS_ENGINE "V8")
endif (CMAKE_SYSTEM_NAME STREQUAL "Android")
