#
# Be sure to run `pod lib lint hippy.podspec --verbose --use-libraries' to ensure this is a
# valid spec before submitting.
#
# Any lines starting with a # are optional, but their use is encouraged
# To learn more about a Podspec see https://guides.cocoapods.org/syntax/podspec.html
#

Pod::Spec.new do |s|
  puts 'hippydom read begins'
  s.name             = 'HippyDom'
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
  s.libraries = 'c++'
  s.source_files = ['dom/include/dom/**/*.h', 'dom/src/dom/**/*.cc']
  s.public_header_files = 'dom/include/**/*.h'
  s.exclude_files = ['dom/include/dom/yoga_layout_node.h', 'dom/src/dom/*unittests.cc', 'dom/src/dom/tools', 'dom/src/dom/yoga_layout_node.cc']
  s.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'GCC_PREPROCESSOR_DEFINITIONS[config=Release]' => '$(inherited) NDEBUG=1',
    'GCC_PREPROCESSOR_DEFINITIONS[config=Debug]' => '$(inherited) DEBUG=1',
    'HEADER_SEARCH_PATHS' => "${PODS_ROOT}/HippyDom/dom/include" + 
                            " ${PODS_ROOT}/HippyFootstone/modules/footstone/include" + 
                            " ${PODS_ROOT}/HippyFootstone/modules/footstone" + 
                            " ${PODS_ROOT}/HippyLayout/layout"
  }
  s.user_target_xcconfig = {
    'HEADER_SEARCH_PATHS' => "${PODS_ROOT}/HippyDom/dom/include"
  }
  s.preserve_path = ['dom/include', 'dom/src']
  s.dependency 'HippyFootstone'
  s.dependency 'HippyLayout'
  puts 'hippydom read ends'
end
