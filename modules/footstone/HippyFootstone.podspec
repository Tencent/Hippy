#
# Be sure to run `pod lib lint hippy.podspec --verbose --use-libraries' to ensure this is a
# valid spec before submitting.
#
# Any lines starting with a # are optional, but their use is encouraged
# To learn more about a Podspec see https://guides.cocoapods.org/syntax/podspec.html
#

Pod::Spec.new do |s|
  puts 'hippyfootstone read begins'
  s.name             = 'HippyFootstone'
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
  s.source_files = 'modules/footstone/**/*.{h,cc}'
  s.public_header_files = 'modules/footstone/include/footstone/**/*.h'
  s.exclude_files = ['modules/footstone/include/footstone/platform/adr', 'modules/footstone/src/platform/adr']
  s.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'GCC_PREPROCESSOR_DEFINITIONS[config=Release]' => '$(inherited) NDEBUG=1',
    'GCC_PREPROCESSOR_DEFINITIONS[config=Debug]' => '$(inherited) DEBUG=1',
    'HEADER_SEARCH_PATHS' => "${PODS_ROOT}/HippyFootstone/modules/footstone/include" + 
                            " ${PODS_ROOT}/HippyFootstone/modules/footstone"
  }
  s.user_target_xcconfig = {
    'HEADER_SEARCH_PATHS' => "${PODS_ROOT}/HippyFootstone/modules/footstone/include"
  }
  s.preserve_path = ['modules/footstone/include', 'modules/footstone/src']

  puts 'hippyfootstone read ends'
end
