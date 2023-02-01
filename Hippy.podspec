#
# Be sure to run `pod lib lint hippy.podspec --verbose --use-libraries' to ensure this is a
# valid spec before submitting.
#
# Any lines starting with a # are optional, but their use is encouraged
# To learn more about a Podspec see https://guides.cocoapods.org/syntax/podspec.html
#

Pod::Spec.new do |s|
  puts 'hippy.podspec read begins'
  s.name             = 'Hippy'
  s.version          = '3.0.0'
  s.summary          = 'Hippy Cross Platform Framework'

# This description is used to generate tags and improve search results.
#   * Think: What does it do? Why did you write it? What is the focus?
#   * Try to keep it short, snappy and to the point.
#   * Write the description between the DESC delimiters below.
#   * Finally, don't worry about the indent, CocoaPods strips it!

  s.description      = <<-DESC
                        Hippy is designed for developers to easily build cross-platform and high-performance awesome apps.
                       DESC
  s.homepage         = 'https://hippyjs.org'
  s.license          = { :type => 'Apache2', :file => 'LICENSE' }
  s.author           = 'OpenHippy Team'
  s.source           = {:git => 'https://github.com/Tencent/Hippy.git', :tag => s.version}
  s.platform = :ios
  s.ios.deployment_target = '10.0'

  #prepare_command not working for subspecs,so we remove devtools script from devtools subspec to root
  s.prepare_command = <<-CMD
      ./xcodeinitscript.sh
  CMD

  s.subspec 'Framework' do |framework|
    puts 'hippy subspec \'framework\' read begin'
    framework.source_files = 'framework/ios/**/*.{h,m,c,mm,s,cpp,cc}'
    framework.public_header_files = 'framework/ios/**/*.h'
    framework.exclude_files = ['framework/ios/base/enginewrapper/v8', 'framework/ios/utils/v8']
    framework.libraries = 'c++'
    framework.pod_target_xcconfig = {
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    }
    puts 'hippy subspec \'framework\' read end'
  end

  s.subspec 'Layout' do |layout|
    puts 'hippy subspec \'layout\' read begin'
    layout.libraries = 'c++'
    layout.source_files = ['layout/engine/*.{h,cpp}', 'modules/ios/layoututils/*.{h,m}']
    layout.public_header_files = ['layout/engine/*.h', 'modules/ios/layoututils/*.h']
    layout.pod_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/layout' + 
                              ' ${PODS_ROOT}/hippy/layout/engine'
    }
    puts 'hippy subspec \'layout\' read end'
  end

  s.subspec 'Footstone' do |footstone|
    puts 'hippy subspec \'footstone\' read begin'
    footstone.libraries = 'c++'
    footstone.source_files = ['modules/footstone/**/*.{h,cc}', 'modules/ios/footstoneutils/*.{h,mm}']
    footstone.public_header_files = ['modules/footstone/**/*.h', 'modules/ios/footstoneutils/*.h']
    footstone.exclude_files = ['modules/footstone/include/footstone/platform/adr', 'modules/footstone/src/platform/adr']
    footstone.pod_target_xcconfig = {
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
      'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/modules/footstone/include' + 
                              ' ${PODS_ROOT}/hippy/modules/footstone'
    }
    footstone.user_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/modules/footstone/include'
    }
    puts 'hippy subspec \'footstone\' read end'
  end

  s.subspec 'Image' do |image|
    puts 'hippy subspec \'image\' read begin'
    image.libraries = 'c++'
    image.frameworks = 'CoreServices'
    image.public_header_files = 'modules/ios/image/*.h'
    image.source_files = 'modules/ios/image/*.{h,m,mm}'
    puts 'hippy subspec \'image\' read end'
  end

  s.subspec 'Dom' do |dom|
    puts 'hippy subspec \'dom\' read begin'
    dom.libraries = 'c++'
    dom.source_files = ['dom/include/**/*.h', 'dom/src/**/*.cc', 'modules/ios/domutils/*.{h,mm}']
    dom.public_header_files = ['dom/include/**/*.h', 'modules/ios/domutils/*.h']
    dom.exclude_files = ['dom/src/dom/*unittests.cc', 'dom/src/dom/tools', 'dom/src/dom/yoga_layout_node.cc']
    dom.pod_target_xcconfig = {
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
      'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/dom/include/'
    }
    dom.user_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/dom/include/'
    }
    dom.dependency 'Hippy/Footstone'
    puts 'hippy subspec \'dom\' read end'
  end 

  s.subspec 'Base' do |base|
    puts 'hippy subspec \'base\' read begin'
    base.libraries = 'c++'
    base.source_files = ['modules/ios/base/*.{h,m,mm}', 'modules/ios/logutils/*.{h,mm}']
    base.public_header_files = ['modules/ios/base/*.h', 'modules/ios/logutils/*.h']
    puts 'hippy subspec \'base\' read end'
  end

  s.subspec 'VFS' do |vfs|
    puts 'hippy subspec \'vfs\' read begin'
    vfs.libraries = 'c++'
    vfs.source_files = ['modules/vfs/native/**/*.{h,cc}', 'modules/vfs/ios/*.{h,m,mm}']
    vfs.public_header_files = ['modules/vfs/native/include/vfs/*.h', 'modules/vfs/ios/*.h']
    vfs.pod_target_xcconfig = {
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
      'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/modules/vfs/native/include'
    }
    vfs.user_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/modules/vfs/native/include'
    }
    puts 'hippy subspec \'vfs\' read end'
  end

  s.subspec 'JSDriver' do |driver|
    puts 'hippy subspec \'driver\' read begin'
    driver.libraries = 'c++'
    driver.frameworks = 'JavaScriptCore'
    driver.source_files = ['driver/js/include/**/*.h', 'driver/js/src/**/*.cc']
    driver.public_header_files = 'driver/js/include/**/*.h'
    driver.exclude_files = ['driver/js/include/driver/napi/v8','driver/js/src/napi/v8','driver/js/include/driver/runtime','driver/js/src/runtime']
    driver.pod_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/driver/js/include/', 
    }
    driver.user_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/driver/js/include/', 
      'GCC_PREPROCESSOR_DEFINITIONS' => 'JS_USE_JSC=1'
    }
    puts 'hippy subspec \'driver\' read end'
  end 

  s.subspec 'NativeRenderer' do |renderer|
    puts 'hippy subspec \'nativerenderer\' read begin'
    renderer.libraries = 'c++'
    renderer.source_files = 'renderer/native/ios/**/*.{h,m,mm}'
    renderer.public_header_files = 'renderer/native/ios/**/*.h'
    puts 'hippy subspec \'nativerenderer\' read end'
  end 

  #devtools subspec
  s.subspec 'DevTools' do |devtools|
    puts 'hippy subspec \'devtools\' read begin'
    devtools.libraries = 'c++'
    devtools.exclude_files = [
      #v8 files
      'devtools/devtools-integration/native/include/devtools/v8', 
      'devtools/devtools-integration/native/src/v8',
      #test files
      'devtools/devtools-integration/ios/DevtoolsBackend/_deps/**/*test*/**/*',
      'devtools/devtools-integration/ios/DevtoolsBackend/_deps/**/*test*',
      #other files
      'devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src/lib/lib_openmp.c',
      'devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src/lib/tables/table_generator.c',
      'devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src/lib/arch/**/{dec,enc}_*.c',
      'devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src/bin/base64.c',
    ]
    devtools.public_header_files = [
      #devtools_integration/native
      'devtools/devtools-integration/native/**/*.h', 
      #devtools_backend
      'devtools/devtools-backend/**/*.{h,hpp}',
    ]
    devtools.private_header_files = [
      'devtools/devtools-integration/ios/DevtoolsBackend/_deps/*-src/**/*.{h,hpp,ipp}',
      'devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src/lib/tables/*.h',
      'devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-build/config.h',
    ]
    devtools.source_files = [
      #devtools_integration/native
      'devtools/devtools-integration/native/**/*.{h,cc}',
      #devtools_integration/ios
      'devtools/devtools-integration/ios/DevtoolsBackend/_deps/*-src/**/*.{h,hpp,c,cc,ipp}',
      'devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-build/config.h',
      #devtools_backend
      'devtools/devtools-backend/**/*.{h,hpp,cc}',
    ]
    devtools.pod_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/devtools/devtools-integration/ios/DevtoolsBackend/_deps/asio-src/asio/include' +
                              ' ${PODS_ROOT}/hippy/devtools/devtools-integration/ios/DevtoolsBackend/_deps/json-src/include' +
                              ' ${PODS_ROOT}/hippy/devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src/include' +
                              ' ${PODS_ROOT}/hippy/devtools/devtools-integration/ios/DevtoolsBackend/_deps/websocketpp-src' +
                              ' ${PODS_ROOT}/hippy/devtools/devtools-integration/native/include' +
                              ' ${PODS_ROOT}/hippy/devtools/devtools-backend/include' +
                              ' ${PODS_ROOT}/hippy/devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src/lib/arch',
      'GCC_PREPROCESSOR_DEFINITIONS' => 'ENABLE_INSPECTOR=1 ASIO_NO_TYPEID ASIO_NO_EXCEPTIONS ASIO_DISABLE_ALIGNOF _WEBSOCKETPP_NO_EXCEPTIONS_ JSON_NOEXCEPTION BASE64_STATIC_DEFINE',
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17'
    }
    devtools.user_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/devtools/devtools-backend/include' +
                              ' ${PODS_ROOT}/hippy/devtools/devtools-integration/native/include' +
                              ' ${PODS_ROOT}/hippy/devtools/devtools-integration/ios/DevtoolsBackend/_deps/json-src/include',
      'GCC_PREPROCESSOR_DEFINITIONS' => 'ENABLE_INSPECTOR=1'
    }
    #base64 contains mutiple files named 'codec.c' in different paths, so we need to keep file structure to avoid files overridings.
    # devtools.header_mappings_dir = 'devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src'
    devtools.preserve_path = 'devtools'
    puts 'hippy subspec \'devtools\' read end'
  end

  puts 'hippy.podspec read ends'
end
