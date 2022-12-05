#
# Be sure to run `pod lib lint hippy.podspec --verbose --use-libraries' to ensure this is a
# valid spec before submitting.
#
# Any lines starting with a # are optional, but their use is encouraged
# To learn more about a Podspec see https://guides.cocoapods.org/syntax/podspec.html
#

Pod::Spec.new do |s|
  puts 'hippyframework.podspec read begins'
  s.name             = 'HippyFramework'
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
  s.source_files = '**/*.{h,m,c,mm,s,cpp,cc}'
  s.public_header_files = '**/*.h'
  s.exclude_files = ['base/enginewrapper/v8', 'utils/v8']
  s.libraries = 'c++'
  s.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'HEADER_SEARCH_PATHS' => "${PODS_ROOT}/HippyJSDriver/driver/js/include" + 
                            " ${PODS_ROOT}/HippyDom/dom/include" +
                            " ${PODS_ROOT}/HippyLayout/layout/engine" +
                            " ${PODS_ROOT}/HippyFootstone/modules/footstone/include" + 
                            " ${PODS_ROOT}/HippyFootstone/modules/footstone" +
                            " ${PODS_ROOT}/HippyVFS/modules/vfs/native/include"
  }
  s.dependency 'HippyBase'
  s.dependency 'HippyJSDriver'
  s.dependency 'HippyDom'
  s.dependency 'HippyLayout'
  s.dependency 'HippyFootstone'
  s.dependency 'HippyVFS'
puts 'hippyframework.podspec read ends'
end
