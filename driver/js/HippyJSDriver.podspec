#
# Be sure to run `pod lib lint hippy.podspec --verbose --use-libraries' to ensure this is a
# valid spec before submitting.
#
# Any lines starting with a # are optional, but their use is encouraged
# To learn more about a Podspec see https://guides.cocoapods.org/syntax/podspec.html
#

Pod::Spec.new do |s|
  puts 'hippyjsdriver.podspec read begins'
  s.name             = 'HippyJSDriver'
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
  s.source_files = ['driver/js/include/driver/**/*.h', 'driver/js/src/**/*.cc']
  s.public_header_files = 'driver/js/include/driver/**/*.h'
  s.exclude_files = ['driver/js/include/driver/napi/v8','driver/js/src/napi/v8','driver/js/include/driver/runtime','driver/js/src/runtime']
  s.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'HEADER_SEARCH_PATHS' => "${PODS_ROOT}/HippyJSDriver/driver/js/include" + 
                            " ${PODS_ROOT}/HippyDom/dom/include" + 
                            " ${PODS_ROOT}/HippyFootstone/modules/footstone/include" + 
                            " ${PODS_ROOT}/HippyFootstone/modules/footstone" + 
                            " ${PODS_ROOT}/HippyVFS/modules/vfs/native/include" + 
                            " ${PODS_ROOT}/HippyDevTools/devtools/devtools-integration/native/include"
  }
  s.user_target_xcconfig = {
    'HEADER_SEARCH_PATHS' => "${PODS_ROOT}/HippyJSDriver/driver/js/include",
  }
  s.preserve_path = ['driver/js/include', 'driver/js/src']
  s.dependency 'HippyBase'
  s.dependency 'HippyDom'
  s.dependency 'HippyFootstone'
  s.dependency 'HippyVFS'
  s.dependency 'HippyDevTools'
  puts 'hippyjsdriver.podspec read ends'
end
