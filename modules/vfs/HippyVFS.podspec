#
# Be sure to run `pod lib lint hippy.podspec --verbose --use-libraries' to ensure this is a
# valid spec before submitting.
#
# Any lines starting with a # are optional, but their use is encouraged
# To learn more about a Podspec see https://guides.cocoapods.org/syntax/podspec.html
#

Pod::Spec.new do |s|
  puts 'hippyvfs read begins'
  s.name             = 'HippyVFS'
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
  s.source_files = ['modules/vfs/native/**/*.{h,cc}', 'modules/vfs/ios/*.{h,m,mm}']
  s.public_header_files = ['modules/vfs/native/include/**/*.h', 'modules/vfs/ios/*.h']
  s.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'GCC_PREPROCESSOR_DEFINITIONS[config=Release]' => '$(inherited) NDEBUG=1',
    'GCC_PREPROCESSOR_DEFINITIONS[config=Debug]' => '$(inherited) DEBUG=1',
    'HEADER_SEARCH_PATHS' => "${PODS_ROOT}/HippyVFS/modules/vfs/native/include" + 
                            " ${PODS_ROOT}/HippyFootstone/modules/footstone/include" + 
                            " ${PODS_ROOT}/HippyFootstone/modules/footstone" + 
                            " ${PODS_ROOT}/HippyDom/dom/include"
  }
  s.user_target_xcconfig = {
    'HEADER_SEARCH_PATHS' => "${PODS_ROOT}/HippyVFS/modules/vfs/native/include"
  }
  s.preserve_path = 'modules/vfs/native'
  s.dependency 'HippyFootstone'
  s.dependency 'HippyBase'
  puts 'hippydom read ends'
end
