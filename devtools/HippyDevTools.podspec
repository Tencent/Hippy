#
# Be sure to run `pod lib lint hippy.podspec --verbose --use-libraries' to ensure this is a
# valid spec before submitting.
#
# Any lines starting with a # are optional, but their use is encouraged
# To learn more about a Podspec see https://guides.cocoapods.org/syntax/podspec.html
#

Pod::Spec.new do |s|
  puts 'hippydevtools.podspec read begins'
  s.name             = 'HippyDevTools'
  s.version          = '3.0.0'
  s.summary          = 'Hippy Cross Platform Framework'
  s.description      = <<-DESC
                        Hippy is designed for developers to easily build cross-platform and high-performance awesome apps.
                       DESC
  s.homepage         = 'https://hippyjs.org'
  s.license          = { :type => 'Apache2', :file => 'LICENSE' }
  s.author           = 'OpenHippy Team'
  s.source           = {:git => 'https://github.com/Tencent/Hippy.git', :tag => s.version}
  s.platform = :ios
  s.ios.deployment_target = '10.0'
  s.libraries = 'c++'
  s.prepare_command = <<-CMD
      ../xcodeinitscript.sh
  CMD
  s.source_files = [
    #base64
    'devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src/**/codec.c',
    'devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src/lib/{codec_choose,lib}.c',
    'devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src/lib/tables/tables.c',
    #devtools_backend
    'devtools/devtools-backend/**/*.{h,hpp,cc}',
    #devtools_integration_native
    'devtools/devtools-integration/native/src/adapter/impl/*.cc',
    'devtools/devtools-integration/native/src/*.cc',
    'devtools/devtools-integration/native/src/vfs/devtools_handler.cc',
  ]
  s.public_header_files = 'devtools/devtools-backend/include/**/*.h'
  s.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'GCC_PREPROCESSOR_DEFINITIONS' => 'ENABLE_INSPECTOR=1 ASIO_NO_TYPEID ASIO_NO_EXCEPTIONS ASIO_DISABLE_ALIGNOF _WEBSOCKETPP_NO_EXCEPTIONS_ JSON_NOEXCEPTION BASE64_STATIC_DEFINE',
    'HEADER_SEARCH_PATHS' => "${PODS_ROOT}/HippyDevTools/devtools/devtools-integration/ios/DevtoolsBackend/_deps/asio-src/asio/include" +
                            " ${PODS_ROOT}/HippyDevTools/devtools/devtools-integration/ios/DevtoolsBackend/_deps/json-src/include" +
                            " ${PODS_ROOT}/HippyDevTools/devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src/include" +
                            " ${PODS_ROOT}/HippyDevTools/devtools/devtools-integration/ios/DevtoolsBackend/_deps/websocketpp-src" +
                            " ${PODS_ROOT}/HippyDevTools/devtools/devtools-integration/native/include" +
                            " ${PODS_ROOT}/HippyDevTools/devtools/devtools-backend/include" +
                            " ${PODS_ROOT}/HippyDevTools/devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src/lib/arch" +
                            " ${PODS_ROOT}/HippyDevTools/devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-build" +
                            " ${PODS_ROOT}/HippyDom/dom/include" +
                            " ${PODS_ROOT}/HippyFootstone/modules/footstone/include" +
                            " ${PODS_ROOT}/HippyVFS/modules/vfs/native/include"
  }
  s.user_target_xcconfig = {
    'GCC_PREPROCESSOR_DEFINITIONS' => 'ENABLE_INSPECTOR=1',
    'HEADER_SEARCH_PATHS' => "${PODS_ROOT}/HippyDevTools/devtools/devtools-backend/include" +
                            " ${PODS_ROOT}/HippyDevTools/devtools/devtools-integration/native/include" +
                            " ${PODS_ROOT}/HippyDevTools/devtools/devtools-integration/ios/DevtoolsBackend/_deps/json-src/include"
  }
  s.preserve_path = 'devtools'
  s.dependency 'HippyBase'
  s.dependency 'HippyVFS'
  s.dependency 'HippyFootstone'
  s.dependency 'HippyDom'
  puts 'hippydevtools.podspec read ends'
end
