
layout_engine = "Taitank"
js_engine = "jsc"

Pod::Spec.new do |s|
  if ENV["layout_engine"]
    layout_engine = ENV["layout_engine"]
  end
  if ENV["js_engine"]
    js_engine = ENV["js_engine"]
  end
  puts "layout engine is #{layout_engine}, js engine is #{js_engine}"
  
  s.name             = 'hippy'
  s.version          = '3.0.0'
  s.summary          = 'Hippy Cross Platform Framework'
  s.description      = <<-DESC
                        Hippy is designed for developers to easily build cross-platform 
                        and high-performance awesome apps.
                       DESC
  s.homepage         = 'https://hippyjs.org'
  s.license          = { :type => 'Apache2', :file => 'LICENSE' }
  s.author           = 'OpenHippy Team'
  s.source           = {:git => 'https://github.com/Tencent/Hippy.git', :tag => s.version}
  s.platform = :ios
  s.ios.deployment_target = '11.0'
  # Disable module compilation
  s.module_map = false
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'NO' }

  s.prepare_command = <<-CMD
      ./xcodeinitscript.sh "#{layout_engine}" "#{js_engine}"
  CMD
  
  s.subspec 'Base' do |base|
    base.libraries = 'c++'
    base.source_files = [
    'modules/ios/base/*.{h,m,mm}',
    'modules/ios/logutils/*.{h,mm}',
    ]
    base.public_header_files = [
    'modules/ios/base/*.h',
    'modules/ios/logutils/*.h',
    ]
    base.private_header_files = [
    'modules/ios/base/TypeConverter.h',
    ]
    base.dependency 'hippy/Footstone'
    base.pod_target_xcconfig = {
      'GCC_PREPROCESSOR_DEFINITIONS' => 'HIPPY_VERSION=' + s.version.to_s,
    }
  end
  
  s.subspec 'Framework' do |framework|
    framework.source_files = [
    'framework/ios/**/*.{h,m,c,mm,s,cpp,cc}',
    'renderer/native/ios/**/*.{h,m,mm}',
    'modules/vfs/ios/*.{h,m,mm}',
    'modules/ios/image/*.{h,m,mm}',
    ]
    framework.public_header_files = [
    'framework/ios/**/*.h',
    'renderer/native/ios/**/*.h',
    'modules/vfs/ios/*.h',
    'modules/ios/image/*.h',
    ]
    if js_engine == "jsc"
      framework.exclude_files = [
      'framework/ios/base/enginewrapper/v8',
      'framework/ios/utils/v8']
    elsif js_engine == "v8"
      framework.exclude_files = [
      'framework/ios/base/enginewrapper/jsc',
      'framework/ios/utils/jsc']
    else
      framework.exclude_files = [
      'framework/ios/base/enginewrapper/jsc',
      'framework/ios/utils/jsc',
      'framework/ios/base/enginewrapper/v8',
      'framework/ios/utils/v8']
    end
    framework.libraries = 'c++'
    framework.frameworks = 'CoreServices'
    framework.pod_target_xcconfig = {
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
      'GCC_ENABLE_CPP_EXCEPTIONS' => false,
      'GCC_ENABLE_CPP_RTTI' => false,
    }
    framework.dependency 'hippy/Base'
    framework.dependency 'hippy/JSDriver'
    framework.dependency 'hippy/VFS'
    framework.dependency 'hippy/DomUtils'
    framework.dependency 'hippy/Footstone'
    framework.dependency 'hippy/FootstoneUtils'
  end

  s.subspec 'Footstone' do |footstone|
    footstone.libraries = 'c++'
    footstone.source_files = ['modules/footstone/**/*.{h,cc}']
    footstone.private_header_files = ['modules/footstone/**/*.h']
    footstone.exclude_files = ['modules/footstone/include/footstone/platform/adr', 'modules/footstone/src/platform/adr']
    footstone.header_mappings_dir = 'modules/footstone/include/'
    
    header_search_paths = '$(PODS_TARGET_SRCROOT)/modules/footstone' + ' $(PODS_TARGET_SRCROOT)/modules/footstone/include'
    footstone.pod_target_xcconfig = {
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
      'GCC_PREPROCESSOR_DEFINITIONS[config=Release]' => '${inherited} NDEBUG=1',
      'GCC_ENABLE_CPP_EXCEPTIONS' => false,
      'GCC_ENABLE_CPP_RTTI' => false,
      'HEADER_SEARCH_PATHS' => header_search_paths,
    }
  end

  s.subspec 'FootstoneUtils' do |footstoneutils|
    footstoneutils.libraries = 'c++'
    footstoneutils.source_files = ['modules/ios/footstoneutils/*.{h,mm}']
    footstoneutils.private_header_files = ['modules/ios/footstoneutils/*.h']
    footstoneutils.pod_target_xcconfig = {
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
      'GCC_ENABLE_CPP_EXCEPTIONS' => false,
      'GCC_ENABLE_CPP_RTTI' => false,
    }
    footstoneutils.dependency 'hippy/Footstone'
    footstoneutils.dependency 'hippy/Base'
  end

  s.subspec 'VFS' do |vfs|
    vfs.libraries = 'c++'
    vfs.source_files = ['modules/vfs/native/**/*.{h,cc}']
    vfs.private_header_files = ['modules/vfs/native/include/**/*.h']
    vfs.header_mappings_dir = 'modules/vfs/native/include/'
    
    header_search_paths = '$(PODS_TARGET_SRCROOT)/modules/vfs/native/include/'
    vfs.pod_target_xcconfig = {
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
      'HEADER_SEARCH_PATHS' => header_search_paths,
      'GCC_ENABLE_CPP_EXCEPTIONS' => false,
      'GCC_ENABLE_CPP_RTTI' => false,
    }
    vfs.dependency 'hippy/Footstone'
  end

  s.subspec 'JSDriver' do |driver|
    driver.libraries = 'c++'
    driver.frameworks = 'JavaScriptCore'
    driver.source_files = ['driver/js/include/**/*.h', 'driver/js/src/**/*.cc']
    driver.private_header_files = 'driver/js/include/**/*.h'
    driver.header_mappings_dir = 'driver/js/include/'
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

    definition_engine = ''
    if js_engine == "jsc"
      definition_engine = 'JS_JSC=1'
    elsif js_engine == "v8" 
      definition_engine = 'JS_V8=1'
    else
    end
    
    header_search_paths = '$(PODS_TARGET_SRCROOT)/driver/js/include/'
    driver.pod_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => header_search_paths,
      'GCC_PREPROCESSOR_DEFINITIONS' => definition_engine,
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
      'GCC_ENABLE_CPP_EXCEPTIONS' => false,
      'GCC_ENABLE_CPP_RTTI' => false,
    }
    driver.dependency 'hippy/Footstone'
    driver.dependency 'hippy/Dom'
    driver.dependency 'hippy/VFS'
  end

  s.subspec 'Dom' do |dom|
    dom_source_files = Array['dom/include/**/*.h', 'dom/src/**/*.cc']
    dom_exclude_files = Array['dom/src/dom/*unittests.cc', 
                              'dom/src/dom/tools']

    dom_pod_target_header_path = '$(PODS_TARGET_SRCROOT)/dom/include/'
    
    if layout_engine == "Taitank"
      dom_exclude_files.append('dom/include/dom/yoga_layout_node.h')
      dom_exclude_files.append('dom/src/dom/yoga_layout_node.cc')
    elsif layout_engine == "Yoga"
      dom_exclude_files.append('dom/include/dom/taitank_layout_node.h')
      dom_exclude_files.append('dom/src/dom/taitank_layout_node.cc')
    end
 
    dom.libraries = 'c++'
    dom.source_files = dom_source_files 
    dom.private_header_files = ['dom/include/**/*.h']
    dom.header_mappings_dir = 'dom/include/'
    dom.exclude_files = dom_exclude_files
    dom.pod_target_xcconfig = {
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
      'HEADER_SEARCH_PATHS' => dom_pod_target_header_path,
      'GCC_ENABLE_CPP_EXCEPTIONS' => false,
      'GCC_ENABLE_CPP_RTTI' => false,
    }
    dom.dependency 'hippy/Footstone'
    if layout_engine == "Taitank"
      dom.dependency 'hippy/Taitank'
    elsif layout_engine == "Yoga"
      dom.dependency 'hippy/Yoga'
    end
  end 

  s.subspec 'DomUtils' do |domutils|
    dom_source_files = Array['modules/ios/domutils/*.{h,mm}']
    domutils.libraries = 'c++'
    domutils.source_files = dom_source_files 
    domutils.private_header_files = ['modules/ios/domutils/*.h']
    domutils.pod_target_xcconfig = {
      'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
      'GCC_ENABLE_CPP_EXCEPTIONS' => false,
      'GCC_ENABLE_CPP_RTTI' => false,
    }
    domutils.dependency 'hippy/Dom'
    domutils.dependency 'hippy/FootstoneUtils'
    domutils.dependency 'hippy/Base'
  end 

  if layout_engine == "Taitank"
    s.subspec 'Taitank' do |taitank|
      puts 'hippy subspec \'Taitank\' read begin'
      taitank.source_files = ['dom/dom_project/_deps/taitank-src/src/*.{h,cc}']
      taitank.private_header_files = ['dom/dom_project/_deps/taitank-src/src/*.h']
      taitank.pod_target_xcconfig = {
        'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
        'GCC_ENABLE_CPP_EXCEPTIONS' => false,
        'GCC_ENABLE_CPP_RTTI' => false,
      }
      taitank.libraries = 'c++'
      puts 'hippy subspec \'Taitank\' read end'
    end
  elsif layout_engine == "Yoga"
    s.subspec 'Yoga' do |yoga|
      puts 'hippy subspec \'yoga\' read begin'
      yoga.source_files = ['dom/dom_project/_deps/yoga-src/yoga/**/*.{c,h,cpp}']
      yoga.private_header_files = ['dom/include/dom/yoga_layout_node.h', 'dom/dom_project/_deps/yoga-src/yoga/**/*.h']
      yoga.pod_target_xcconfig = {
        'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
        'GCC_ENABLE_CPP_EXCEPTIONS' => false,
        'GCC_ENABLE_CPP_RTTI' => false,
      }
      yoga.libraries = 'c++'
      puts 'hippy subspec \'yoga\' read end'
    end
  end


  # Dependencies of devtools
  devtools_deps_path = 'devtools/devtools-integration/ios/DevtoolsBackend/_deps'
  s.subspec 'AsioForDevTools' do |ss|
    ss.libraries = 'c++'
    ss.project_header_files = ["#{devtools_deps_path}/asio-src/asio/include/**/*.{hpp,ipp}",]
    ss.source_files = ["#{devtools_deps_path}/asio-src/asio/include/**/*.{hpp,ipp}",]
    ss.header_mappings_dir = "#{devtools_deps_path}/asio-src/asio/include/"
  end

  s.subspec 'JsonForDevTools' do |ss|
    ss.libraries = 'c++'
    ss.project_header_files = ["#{devtools_deps_path}/json-src/single_include/**/*.{hpp}",]
    ss.source_files = ["#{devtools_deps_path}/json-src/single_include/**/*.{hpp}",]
    ss.header_mappings_dir = "#{devtools_deps_path}/json-src/single_include/"
  end

  s.subspec 'WebsocketForDevTools' do |ss|
    ss.libraries = 'c++'
    ss.project_header_files = ["#{devtools_deps_path}/websocketpp-src/websocketpp/**/*.{hpp}",]
    ss.source_files = ["#{devtools_deps_path}/websocketpp-src/websocketpp/**/*.{hpp,ipp}",]
    ss.header_mappings_dir = "#{devtools_deps_path}/websocketpp-src/"
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
    devtools.exclude_files = devtools_exclude_files
    devtools.project_header_files = [
      #devtools_integration/native
      'devtools/devtools-integration/native/**/*.h', 
      'devtools/devtools-integration/native/include/devtools/devtools_data_source.h',
      #devtools_backend
      'devtools/devtools-backend/**/*.{h,hpp}',
    ]
    devtools.source_files = [
      #devtools_integration/native
      'devtools/devtools-integration/native/**/*.{h,cc}',
      #devtools_backend
      'devtools/devtools-backend/**/*.{h,hpp,cc}',
    ]

    pod_search_path =
      " $(PODS_TARGET_SRCROOT)/devtools/devtools-integration/native/include/" +
      " $(PODS_TARGET_SRCROOT)/devtools/devtools-backend/include/" +
      " $(PODS_TARGET_SRCROOT)/#{devtools_deps_path}/asio-src/asio/include/" +
      " $(PODS_TARGET_SRCROOT)/#{devtools_deps_path}/json-src/single_include/" +
      " $(PODS_TARGET_SRCROOT)/#{devtools_deps_path}/websocketpp-src/"
      
    devtools.header_mappings_dir = 'devtools/'
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
    devtools.dependency 'hippy/JsonForDevTools'
    devtools.dependency 'hippy/AsioForDevTools'
    devtools.dependency 'hippy/WebsocketForDevTools'
    devtools.dependency 'hippy/Footstone'
    devtools.dependency 'hippy/Dom'
    devtools.dependency 'hippy/VFS'
    puts 'hippy subspec \'devtools\' read end'
  end

  if js_engine == "v8"
    s.subspec 'v8' do |v8|
      puts 'hippy subspec \'v8\' read begin'
      v8.source_files = ['v8forios/v8/include']
      v8.private_header_files = ['v8forios/v8/include']
      v8.pod_target_xcconfig = {
        'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
        'HEADER_SEARCH_PATHS' => '$(PODS_TARGET_SRCROOT)/v8forios/v8/include $(PODS_TARGET_SRCROOT)/v8forios/v8/include/v8',
        'GCC_ENABLE_CPP_EXCEPTIONS' => false,
        'GCC_ENABLE_CPP_RTTI' => false,
      }
      v8.libraries = 'c++'
      v8.vendored_library = 'v8forios/v8/libv8.a'
      puts 'hippy subspec \'v8\' read end'
    end
  end

  s.test_spec 'UnitTests' do |test_spec|
    test_spec.source_files = 'tests/ios/**/*.{h,m,mm}'
    test_spec.dependency 'OCMock'
  end
  
end
