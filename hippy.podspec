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
  s.frameworks = 'JavaScriptCore'
  s.pod_target_xcconfig = {'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17'}

  s.subspec 'layout' do |layout|
    puts 'hippy subspec \'layout\' read begin'
    layout.source_files = 'layout/engine/*.{h,cpp}'
    layout.public_header_files = 'layout/engine/*.h'
    layout.xcconfig = {'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/layout'}
    puts 'hippy subspec \'layout\' read end'
  end

  s.subspec 'footstone' do |footstone|
    puts 'hippy subspec \'footstone\' read begin'
    footstone.source_files = 'modules/footstone/**/*.{h,cc}'
    footstone.public_header_files = 'modules/footstone/**/*.h'
    footstone.exclude_files = ['modules/footstone/include/footstone/platform/adr', 'modules/footstone/src/platform/adr']
    footstone.xcconfig = {'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/modules/footstone/include/ ${PODS_ROOT}/hippy/modules/footstone/'}
    puts 'hippy subspec \'footstone\' read end'
  end

  s.subspec 'vfs' do |vfs|
    puts 'hippy subspec \'vfs\' read begin'
    vfs.source_files = 'modules/vfs/native/**/*.{h,cc}'
    vfs.public_header_files = 'modules/vfs/native/include/vfs/*.h'
    vfs.xcconfig = {'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/modules/vfs/native/include/'}
    puts 'hippy subspec \'vfs\' read end'
  end


  s.subspec 'driver' do |driver|
    puts 'hippy subspec \'driver\' read begin'
    driver.source_files = ['driver/js/include/**/*.h', 'driver/js/src/**/*.cc']
    driver.public_header_files = 'driver/js/include/**/*.h'
    driver.exclude_files = ['driver/js/include/driver/napi/v8','driver/js/include/drive/runtime','driver/js/src/napi/v8','driver/js/src/runtime']
    driver.xcconfig = {'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/driver/js/include/', 'GCC_PREPROCESSOR_DEFINITIONS' => 'JS_USE_JSC=1'}
    puts 'hippy subspec \'driver\' read end'
  end 

  s.subspec 'dom' do |dom|
    puts 'hippy subspec \'dom\' read begin'
    dom.source_files = ['dom/include/**/*.h', 'dom/src/**/*.cc']
    dom.public_header_files = 'dom/include/**/*.h'
    dom.exclude_files = ['dom/src/dom/*unittests.cc', 'dom/src/dom/tools', 'dom/src/dom/yoga_layout_node.cc']
    dom.xcconfig = {'HEADER_SEARCH_PATHS' => '${PODS_ROOT}/hippy/dom/include/'}
    puts 'hippy subspec \'dom\' read end'
  end 

  s.subspec 'nativerender' do |render|
    puts 'hippy subspec \'nativerender\' read begin'
    render.source_files = 'renderer/native/ios/**/*.{h,m,mm}'
    render.public_header_files = 'renderer/native/ios/**/*.h'
    puts 'hippy subspec \'nativerender\' read end'
  end 

  puts 'hippy.podspec read ends'
end
