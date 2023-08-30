#
# Be sure to run `pod lib lint hippy.podspec --verbose --use-libraries' to ensure this is a
# valid spec before submitting.
#
# Any lines starting with a # are optional, but their use is encouraged
# To learn more about a Podspec see https://guides.cocoapods.org/syntax/podspec.html
#

layout_engine = "Taitank"
js_engine = "jsc"
use_frameworks = false;

Pod::Spec.new do |s|
  if ENV["layout_engine"]
    layout_engine = ENV["layout_engine"]
  end
  if ENV["use_frameworks"]
    use_frameworks = true
  end
  if ENV["js_engine"]
    js_engine = ENV["js_engine"]
  end
  puts "layout engine is #{layout_engine}, js engine is #{js_engine}"
  puts "use_frameworks trigger is #{use_frameworks}"
  if use_frameworks
    framework_header_path = '${PODS_CONFIGURATION_BUILD_DIR}/hippy/hippy.framework/Headers'
    s.module_map = false;
  end
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
  s.ios.deployment_target = '11.0'

  #prepare_command not working for subspecs,so we remove devtools script from devtools subspec to root
  s.prepare_command = <<-CMD
      ./xcodeinitscript.sh "#{layout_engine}" "#{js_engine}"
  CMD

  s.subspec 'Framework' do |framework|
    puts 'hippy subspec \'framework\' read begin'
    framework.source_files = 'framework/ios/**/*.{h,m,c,mm,s,cpp,cc}'
    framework.public_header_files = 'framework/ios/**/*.h'
    if js_engine == "jsc"
      framework.exclude_files = ['framework/ios/base/enginewrapper/v8', 'framework/ios/utils/v8']
    elsif js_engine == "v8" 
      framework.exclude_files = ['framework/ios/base/enginewrapper/jsc', 'framework/ios/utils/jsc']
    else
      framework.exclude_files = ['framework/ios/base/enginewrapper/jsc', 'framework/ios/utils/jsc', 'framework/ios/base/enginewrapper/v8', 'framework/ios/utils/v8']      
    end
    framework.libraries = 'c++'
    framework.pod_target_xcconfig = {
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
      'GCC_ENABLE_CPP_EXCEPTIONS' => false,
      'GCC_ENABLE_CPP_RTTI' => false,
    }
    framework.dependency 'hippy/Base'
    framework.dependency 'hippy/JSDriver'
    framework.dependency 'hippy/Image'
    puts 'hippy subspec \'framework\' read end'
  end

  s.subspec 'Footstone' do |footstone|
    puts 'hippy subspec \'footstone\' read begin'
    footstone.libraries = 'c++'
    footstone.source_files = ['modules/footstone/**/*.{h,cc}']
    footstone.public_header_files = ['modules/footstone/**/*.h']
    footstone.exclude_files = ['modules/footstone/include/footstone/platform/adr', 'modules/footstone/src/platform/adr']
    if use_frameworks
      header_search_paths = "#{framework_header_path}" + " #{framework_header_path}/include"
      footstone.header_mappings_dir = 'modules/footstone'
    else
      header_search_paths = '${PODS_ROOT}/hippy/modules/footstone/include' +
                          ' ${PODS_ROOT}/hippy/modules/footstone'
    end
    footstone.pod_target_xcconfig = {
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
      'GCC_PREPROCESSOR_DEFINITIONS[config=Release]' => '${inherited} NDEBUG=1',
      'GCC_ENABLE_CPP_EXCEPTIONS' => false,
      'GCC_ENABLE_CPP_RTTI' => false,
      'HEADER_SEARCH_PATHS' => header_search_paths
    }
    footstone.user_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => header_search_paths
    }
    footstone.preserve_path = 'modules/footstone'
    puts 'hippy subspec \'footstone\' read end'
  end

  s.subspec 'FootstoneUtils' do |footstoneutils|
    puts 'hippy subspec \'footstoneutils\' read begin'
    footstoneutils.libraries = 'c++'
    footstoneutils.source_files = ['modules/ios/footstoneutils/*.{h,mm}']
    footstoneutils.public_header_files = ['modules/ios/footstoneutils/*.h']
    footstoneutils.pod_target_xcconfig = {
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
      'GCC_ENABLE_CPP_EXCEPTIONS' => false,
      'GCC_ENABLE_CPP_RTTI' => false,
    }
    footstoneutils.dependency 'hippy/Footstone'
    footstoneutils.dependency 'hippy/Base'
    puts 'hippy subspec \'footstoneutils\' read end'
  end

  s.subspec 'Image' do |image|
    puts 'hippy subspec \'image\' read begin'
    image.libraries = 'c++'
    image.frameworks = 'CoreServices'
    image.public_header_files = 'modules/ios/image/*.h'
    image.source_files = 'modules/ios/image/*.{h,m,mm}'
    puts 'hippy subspec \'image\' read end'
  end

  s.subspec 'Base' do |base|
    puts 'hippy subspec \'base\' read begin'
    base.libraries = 'c++'
    base.source_files = ['modules/ios/base/*.{h,m,mm}', 'modules/ios/logutils/*.{h,mm}']
    base.public_header_files = ['modules/ios/base/*.h', 'modules/ios/logutils/*.h']
    base.dependency 'hippy/Footstone'
    puts 'hippy subspec \'base\' read end'
  end

  s.subspec 'VFS' do |vfs|
    puts 'hippy subspec \'vfs\' read begin'
    vfs.libraries = 'c++'
    vfs.source_files = ['modules/vfs/native/**/*.{h,cc}']
    vfs.public_header_files = ['modules/vfs/native/include/vfs/**/*.h']
    if use_frameworks
      header_search_paths = framework_header_path
      vfs.header_mappings_dir = 'modules/vfs/native/include'
    else
      header_search_paths = '${PODS_ROOT}/hippy/modules/vfs/native/include'
    end
    vfs.pod_target_xcconfig = {
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
      'HEADER_SEARCH_PATHS' => header_search_paths,
      'GCC_ENABLE_CPP_EXCEPTIONS' => false,
      'GCC_ENABLE_CPP_RTTI' => false,
    }
    vfs.user_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => header_search_paths
    }
    vfs.preserve_path = 'modules/vfs/native'
    vfs.dependency 'hippy/Footstone'
    puts 'hippy subspec \'vfs\' read end'
  end

  s.subspec 'iOSVFS' do |iosvfs|
    puts 'hippy subspec \'iosvfs\' read begin'
    iosvfs.libraries = 'c++'
    iosvfs.source_files = ['modules/vfs/ios/*.{h,m,mm}']
    iosvfs.public_header_files = ['modules/vfs/ios/*.h']
    iosvfs.pod_target_xcconfig = {
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
      'GCC_ENABLE_CPP_EXCEPTIONS' => false,
      'GCC_ENABLE_CPP_RTTI' => false,
    }
    iosvfs.dependency 'hippy/VFS'
    iosvfs.dependency 'hippy/Footstone'
    iosvfs.dependency 'hippy/FootstoneUtils'
    puts 'hippy subspec \'iosvfs\' read end'
  end

  s.subspec 'JSDriver' do |driver|
    puts 'hippy subspec \'driver\' read begin'
    driver.libraries = 'c++'
    driver.frameworks = 'JavaScriptCore'
    driver.source_files = ['driver/js/include/**/*.h', 'driver/js/src/**/*.cc']
    driver.public_header_files = 'driver/js/include/**/*.h'
    if js_engine == "jsc"
      driver.exclude_files = [
        'driver/js/include/driver/napi/v8',
        'driver/js/src/napi/v8',
        'driver/js/include/driver/runtime',
        'driver/js/src/runtime', 
        'driver/js/include/driver/vm/v8', 
        'driver/js/src/vm/v8']
    elsif js_engine == "v8"
      driver.exclude_files = [
        'driver/js/include/driver/napi/jsc',
        'driver/js/src/napi/jsc', 
        'driver/js/include/driver/vm/jsc', 
        'driver/js/src/vm/jsc']
    else
      driver.exclude_files = [
        'driver/js/include/driver/napi/v8',
        'driver/js/src/napi/v8',
        'driver/js/include/driver/runtime',
        'driver/js/src/runtime', 
        'driver/js/include/vm/v8', 
        'driver/js/src/vm/v8', 
        'driver/js/include/driver/napi/jsc',
        'driver/js/src/napi/jsc', 
        'driver/js/include/vm/jsc', 
        'driver/js/src/vm/jsc']
    end

    if use_frameworks
      header_search_paths = framework_header_path
      driver.header_mappings_dir = 'driver/js/include'
    else
      header_search_paths = '${PODS_ROOT}/hippy/driver/js/include/'
    end
    definition_engine = ''
    if js_engine == "jsc"
      definition_engine = 'JS_JSC=1'
    elsif js_engine == "v8" 
      definition_engine = 'JS_V8=1'
    else
    end
    driver.pod_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => header_search_paths, 
      'GCC_PREPROCESSOR_DEFINITIONS' => definition_engine,
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
      'GCC_ENABLE_CPP_EXCEPTIONS' => false,
      'GCC_ENABLE_CPP_RTTI' => false,
    }
    driver.user_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => header_search_paths, 
    }
    driver.dependency 'hippy/Footstone'
    driver.dependency 'hippy/Dom'
    driver.dependency 'hippy/iOSVFS'
    driver.preserve_path = 'driver/js'
    puts 'hippy subspec \'driver\' read end'
  end 

  s.subspec 'NativeRenderer' do |renderer|
    puts 'hippy subspec \'nativerenderer\' read begin'
    renderer.libraries = 'c++'
    renderer.source_files = 'renderer/native/ios/**/*.{h,m,mm}'
    renderer.public_header_files = 'renderer/native/ios/**/*.h'
    renderer.dependency 'hippy/Base'
    renderer.dependency 'hippy/DomUtils'
    renderer.dependency 'hippy/Image'
    renderer.dependency 'hippy/iOSVFS'
    puts 'hippy subspec \'nativerenderer\' read end'
  end 

  s.subspec 'Dom' do |dom|
    puts 'hippy subspec \'dom\' read begin'
    dom_source_files = Array['dom/include/**/*.h', 'dom/src/**/*.cc']
    dom_exclude_files = Array['dom/src/dom/*unittests.cc', 
                              'dom/src/dom/tools']
    if use_frameworks
      dom_pod_target_header_path = framework_header_path
      dom.header_mappings_dir = 'dom/include'
    else
      dom_pod_target_header_path = '${PODS_ROOT}/hippy/dom/include/'      
    end
    if layout_engine == "Taitank"
      dom_exclude_files.append('dom/include/dom/yoga_layout_node.h')
      dom_exclude_files.append('dom/src/dom/yoga_layout_node.cc')
    elsif layout_engine == "Yoga"
      dom_exclude_files.append('dom/include/dom/taitank_layout_node.h')
      dom_exclude_files.append('dom/src/dom/taitank_layout_node.cc')
    end
 
    dom.libraries = 'c++'
    dom.source_files = dom_source_files 
    dom.public_header_files = ['dom/include/**/*.h']
    dom.exclude_files = dom_exclude_files
    dom.pod_target_xcconfig = {
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
      'HEADER_SEARCH_PATHS' => dom_pod_target_header_path,
      'GCC_ENABLE_CPP_EXCEPTIONS' => false,
      'GCC_ENABLE_CPP_RTTI' => false,
    }
    dom.user_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => dom_pod_target_header_path
    }
    dom.dependency 'hippy/Footstone'
    if layout_engine == "Taitank"
      dom.dependency 'hippy/Taitank'
    elsif layout_engine == "Yoga"
      dom.dependency 'hippy/Yoga'
    end  
    dom.preserve_path = 'dom'
    puts 'hippy subspec \'dom\' read end'
  end 

  s.subspec 'DomUtils' do |domutils|
    puts 'hippy subspec \'domutils\' read begin'
    dom_source_files = Array['modules/ios/domutils/*.{h,mm}']
    domutils.libraries = 'c++'
    domutils.source_files = dom_source_files 
    domutils.public_header_files = ['modules/ios/domutils/*.h']
    domutils.pod_target_xcconfig = {
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
      'GCC_ENABLE_CPP_EXCEPTIONS' => false,
      'GCC_ENABLE_CPP_RTTI' => false,
    }
    domutils.dependency 'hippy/Dom'
    domutils.dependency 'hippy/FootstoneUtils'
    domutils.dependency 'hippy/Base'
    puts 'hippy subspec \'domutils\' read end'
  end 

  if layout_engine == "Taitank"
    s.subspec 'Taitank' do |taitank|
      puts 'hippy subspec \'Taitank\' read begin'
      taitank.source_files = ['dom/dom_project/_deps/taitank-src/src/*.{h,cc}']
      taitank.public_header_files = ['dom/include/dom/taitank_layout_node.h', 'dom/dom_project/_deps/taitank-src/src/*.h']
      if use_frameworks
        header_search_paths = framework_header_path
      else
        header_search_paths = '${PODS_ROOT}/hippy/dom/dom_project/_deps/taitank-src/src'
      end
      taitank.pod_target_xcconfig = {
        'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
        'HEADER_SEARCH_PATHS' => header_search_paths,
        'GCC_ENABLE_CPP_EXCEPTIONS' => false,
        'GCC_ENABLE_CPP_RTTI' => false,
      }
      taitank.libraries = 'c++'
      taitank.preserve_path = 'dom/dom_project'
      puts 'hippy subspec \'Taitank\' read end'
    end
  elsif layout_engine == "Yoga"
    s.subspec 'Yoga' do |yoga|
      puts 'hippy subspec \'yoga\' read begin'
      yoga.source_files = ['dom/dom_project/_deps/yoga-src/yoga/**/*.{c,h,cpp}']
      yoga.public_header_files = ['dom/include/dom/yoga_layout_node.h', 'dom/dom_project/_deps/yoga-src/yoga/**/*.h']
      if use_frameworks
        header_search_paths = framework_header_path
      else
        header_search_paths = '${PODS_ROOT}/hippy/dom/dom_project/_deps/yoga-src'
      end
      yoga.pod_target_xcconfig = {
        'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
        'HEADER_SEARCH_PATHS' => header_search_paths,
        'GCC_ENABLE_CPP_EXCEPTIONS' => false,
        'GCC_ENABLE_CPP_RTTI' => false,
      }
      yoga.libraries = 'c++'
      yoga.preserve_path = 'dom/dom_project'
      puts 'hippy subspec \'yoga\' read end'
    end
  end
  
  #devtools subspec
  s.subspec 'DevTools' do |devtools|
    puts 'hippy subspec \'devtools\' read begin'
    devtools.libraries = 'c++'
    devtools_exclude_files = Array.new;
    if js_engine == "jsc"
      devtools_exclude_files += ['devtools/devtools-integration/native/include/devtools/v8', 'devtools/devtools-integration/native/src/v8']
    elsif js_engine == "v8"
    else
      devtools_exclude_files += ['devtools/devtools-integration/native/include/devtools/v8', 'devtools/devtools-integration/native/src/v8']
    end
    devtools.exclude_files = [
      #test files
      'devtools/devtools-integration/ios/DevtoolsBackend/_deps/**/*test*/**/*',
      'devtools/devtools-integration/ios/DevtoolsBackend/_deps/**/*test*',
      #benchmark files
      'devtools/devtools-integration/ios/DevtoolsBackend/_deps/**/benchmark/**',
      #js files
      'devtools/devtools-integration/ios/DevtoolsBackend/_deps/**/javascript/**',
      #Dom includes all taitank or yoga files, and Devtools dependends on Dom, so let Dom does the including work, otherwise, 'duplicated symbols' error occurs
      #taitank or yoga files
      #currently Devtools specify taitank layout 
      'devtools/devtools-integration/ios/DevtoolsBackend/_deps/taitank-*/**/*',
      #other files
      'devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src/lib/lib_openmp.c',
      'devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src/lib/tables/table_generator.c',
      'devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src/lib/arch/**/{dec,enc}_*.c',
      'devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src/bin/base64.c',
    ] + devtools_exclude_files
    devtools.public_header_files = [
      'devtools/devtools-integration/native/include/devtools/devtools_data_source.h',
      #devtools_integration/native
      'devtools/devtools-integration/native/**/*.h', 
      #devtools_backend
      'devtools/devtools-backend/**/*.{h,hpp}',
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
    if use_frameworks
      pod_search_path = "#{framework_header_path}/devtools-integration/ios/DevtoolsBackend/_deps/asio-src/asio/include" +
                        " #{framework_header_path}/devtools-integration/ios/DevtoolsBackend/_deps/json-src/include" +
                        " #{framework_header_path}/devtools-integration/ios/DevtoolsBackend/_deps/base64-src/include" +
                        " #{framework_header_path}/devtools-integration/ios/DevtoolsBackend/_deps/websocketpp-src" +
                        " #{framework_header_path}/devtools-integration/native/include" +
                        " #{framework_header_path}/devtools-backend/include" +
                        " #{framework_header_path}/devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src/lib/arch"

      devtools.header_mappings_dir = 'devtools'
    else
      pod_search_path = '${PODS_ROOT}/hippy/devtools/devtools-integration/ios/DevtoolsBackend/_deps/asio-src/asio/include' +
                        ' ${PODS_ROOT}/hippy/devtools/devtools-integration/ios/DevtoolsBackend/_deps/json-src/include' +
                        ' ${PODS_ROOT}/hippy/devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src/include' +
                        ' ${PODS_ROOT}/hippy/devtools/devtools-integration/ios/DevtoolsBackend/_deps/websocketpp-src' +
                        ' ${PODS_ROOT}/hippy/devtools/devtools-integration/native/include' +
                        ' ${PODS_ROOT}/hippy/devtools/devtools-backend/include' +
                        ' ${PODS_ROOT}/hippy/devtools/devtools-integration/ios/DevtoolsBackend/_deps/base64-src/lib/arch'
    end
    devtools.pod_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => pod_search_path,
      'GCC_PREPROCESSOR_DEFINITIONS' => 'ENABLE_INSPECTOR=1 ASIO_NO_TYPEID ASIO_NO_EXCEPTIONS ASIO_DISABLE_ALIGNOF _WEBSOCKETPP_NO_EXCEPTIONS_ JSON_NOEXCEPTION BASE64_STATIC_DEFINE',
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
      'GCC_ENABLE_CPP_EXCEPTIONS' => false,
      'GCC_ENABLE_CPP_RTTI' => false,
    }
    devtools.user_target_xcconfig = {
      'GCC_PREPROCESSOR_DEFINITIONS' => 'ENABLE_INSPECTOR=1'
    }
    devtools.dependency 'hippy/Footstone'
    devtools.dependency 'hippy/Dom'
    devtools.dependency 'hippy/VFS'
    devtools.preserve_path = 'devtools'
    puts 'hippy subspec \'devtools\' read end'
  end

  if js_engine == "v8"
    s.subspec 'v8' do |v8|
      puts 'hippy subspec \'v8\' read begin'
      v8.source_files = ['v8forios/v8/include']
      v8.public_header_files = ['v8forios/v8/include']
      v8.pod_target_xcconfig = {
        'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
        'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/v8forios/v8/include ${PODS_ROOT}/hippy/v8forios/v8/include/v8',
        'GCC_ENABLE_CPP_EXCEPTIONS' => false,
        'GCC_ENABLE_CPP_RTTI' => false,
      }
      v8.libraries = 'c++'
      v8.vendored_library = 'v8forios/v8/libv8.a'
      v8.preserve_path = 'v8forios/v8'
      puts 'hippy subspec \'v8\' read end'
    end
  end

  puts 'hippy.podspec read ends'
end
