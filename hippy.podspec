#
# Be sure to run `pod lib lint hippy.podspec --verbose --use-libraries' to ensure this is a
# valid spec before submitting.
#
# Any lines starting with a # are optional, but their use is encouraged
# To learn more about a Podspec see https://guides.cocoapods.org/syntax/podspec.html
#

Pod::Spec.new do |s|
  puts 'hippy.podspec read begins'
  s.name             = 'hippy'
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
  s.source_files = 'framework/ios/**/*.{h,m,c,mm,s,cpp,cc}'
  s.public_header_files = 'framework/ios/**/*.h'
  s.exclude_files = ['framework/ios/base/enginewrapper/v8', 'framework/ios/utils/v8']
  s.libraries = 'c++'
  s.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/framework/ios/**/*.h'
  }

  #prepare_command not working for subspecs,so we remove devtools script from devtools subspec to root
  s.prepare_command = <<-CMD
      cd framework/examples/ios-demo && ./cmakebuild.sh && cd ../../..
  CMD


  s.subspec 'layout' do |layout|
    puts 'hippy subspec \'layout\' read begin'
    layout.libraries = 'c++'
    layout.source_files = 'layout/engine/*.{h,cpp}'
    layout.public_header_files = 'layout/engine/*.h'
    layout.pod_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/layout'
    }
    puts 'hippy subspec \'layout\' read end'
  end

  s.subspec 'footstone' do |footstone|
    puts 'hippy subspec \'footstone\' read begin'
    footstone.libraries = 'c++'
    footstone.source_files = 'modules/footstone/**/*.{h,cc}'
    footstone.public_header_files = 'modules/footstone/**/*.h'
    footstone.exclude_files = ['modules/footstone/include/footstone/platform/adr', 'modules/footstone/src/platform/adr']
    footstone.pod_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/modules/footstone/include ${PODS_ROOT}/hippy/modules/footstone'
    }
    footstone.user_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/modules/footstone/include'
    }
    puts 'hippy subspec \'footstone\' read end'
  end

  s.subspec 'image' do |image|
    puts 'hippy subspec \'image\' read begin'
    image.libraries = 'c++'
    image.frameworks = 'CoreServices'
    image.public_header_files = 'modules/ios/image/*.h'
    image.source_files = 'modules/ios/image/*.{h,m,mm}'
    puts 'hippy subspec \'image\' read end'
  end

  s.subspec 'dom' do |dom|
    puts 'hippy subspec \'dom\' read begin'
    dom.libraries = 'c++'
    dom.source_files = ['dom/include/**/*.h', 'dom/src/**/*.cc', 'dom/ios/*.*']
    dom.public_header_files = ['dom/include/**/*.h', 'dom/ios/*.h']
    dom.exclude_files = ['dom/src/dom/*unittests.cc', 'dom/src/dom/tools', 'dom/src/dom/yoga_layout_node.cc']
    dom.pod_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/dom/include/'
    }
    dom.user_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/dom/include/'
    }
    puts 'hippy subspec \'dom\' read end'
  end 

  s.subspec 'base' do |base|
    puts 'hippy subspec \'base\' read begin'
    base.libraries = 'c++'
    base.public_header_files = 'modules/ios/base/*.h'
    base.source_files = 'modules/ios/base/*.{h,m,mm}'
    base.pod_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/modules/ios/base'
    }
    base.user_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/modules/ios/base'
    }
    base.dependency 'hippy/dom'
    base.dependency 'hippy/footstone'
    base.dependency 'hippy/layout'
    puts 'hippy subspec \'base\' read end'
  end


  s.subspec 'vfs' do |vfs|
    puts 'hippy subspec \'vfs\' read begin'
    vfs.libraries = 'c++'
    vfs.source_files = ['modules/vfs/native/**/*.{h,cc}', 'modules/vfs/ios/*.{h,m,mm}']
    vfs.public_header_files = ['modules/vfs/native/include/vfs/*.h', 'modules/vfs/ios/*.h']
    vfs.pod_target_xcconfig = {
      # 'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17'
      'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/modules/vfs/native/include'
    }
    vfs.user_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/modules/vfs/native/include'
    }
    vfs.dependency 'hippy/base'
    puts 'hippy subspec \'vfs\' read end'
  end

  s.subspec 'driver' do |driver|
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

  s.subspec 'nativerender' do |render|
    puts 'hippy subspec \'nativerender\' read begin'
    render.libraries = 'c++'
    render.source_files = 'renderer/native/ios/**/*.{h,m,mm}'
    render.public_header_files = 'renderer/native/ios/**/*.h'
    puts 'hippy subspec \'nativerender\' read end'
  end 

  #devtools subspec
  s.subspec 'devtools' do |devtools|
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
      'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/devtools/devtools-integration/ios/DevtoolsBackend/_deps/asio-src/asio/include ${PODS_ROOT}/hippy/devtools/devtools-integration/ios/DevtoolsBackend/_deps/json-src/include ${PODS_ROOT}/hippy/devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src/include ${PODS_ROOT}/hippy/devtools/devtools-integration/ios/DevtoolsBackend/_deps/websocketpp-src ${PODS_ROOT}/hippy/devtools/devtools-integration/native/include ${PODS_ROOT}/hippy/devtools/devtools-backend/include ${PODS_ROOT}/hippy/devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src/lib/arch',
      'GCC_PREPROCESSOR_DEFINITIONS' => 'ENABLE_INSPECTOR=1 ASIO_NO_TYPEID ASIO_NO_EXCEPTIONS ASIO_DISABLE_ALIGNOF _WEBSOCKETPP_NO_EXCEPTIONS_ JSON_NOEXCEPTION BASE64_STATIC_DEFINE'
    }
    devtools.user_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/devtools/devtools-backend/include ${PODS_ROOT}/hippy/devtools/devtools-integration/native/include ${PODS_ROOT}/hippy/devtools/devtools-integration/ios/DevtoolsBackend/_deps/json-src/include',
      'GCC_PREPROCESSOR_DEFINITIONS' => 'ENABLE_INSPECTOR=1'
    }
    #base64 contains mutiple files named 'codec.c' in different paths, so we need to keep file structure to avoid files overridings.
    devtools.header_mappings_dir = 'devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src'
    devtools.preserve_path = 'devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src'
    puts 'hippy subspec \'devtools\' read end'
  end

  puts 'hippy.podspec read ends'
end
