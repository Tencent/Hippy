#
# Be sure to run `pod lib lint hippy.podspec --verbose --use-libraries' to ensure this is a
# valid spec before submitting.
#
# Any lines starting with a # are optional, but their use is encouraged
# To learn more about a Podspec see https://guides.cocoapods.org/syntax/podspec.html
#

Pod::Spec.new do |s|
  puts 'hippybase read begins'
  s.name             = 'HippyBase'
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
  s.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'GCC_PREPROCESSOR_DEFINITIONS[config=Release]' => '$(inherited) NDEBUG=1',
    'GCC_PREPROCESSOR_DEFINITIONS[config=Debug]' => '$(inherited) DEBUG=1'
  }

  s.subspec 'Image' do |image|
    puts 'hippybase subspec \'image\' read begin'
    image.libraries = 'c++'
    image.frameworks = 'CoreServices'
    image.source_files = 'modules/ios/image/*.{h,m,mm}'
    image.public_header_files = 'modules/ios/image/*.h'
    puts 'hippybase subspec \'image\' read end'
  end

  s.subspec 'Base' do |base|
    puts 'hippybase subspec \'base\' read begin'
    base.libraries = 'c++'
    base.source_files = 'modules/ios/base/*.{h,m,mm}'
    base.public_header_files = 'modules/ios/base/*.h'
    base.pod_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => "${PODS_ROOT}/HippyDom/dom/include" + 
                              " ${PODS_ROOT}/HippyFootstone/modules/footstone/include" + 
                              " ${PODS_ROOT}/HippyFootstone/modules/footstone" + 
                              " ${PODS_ROOT}/HippyLayout/layout"
    }
    base.dependency 'HippyFootstone'
    base.dependency 'HippyLayout'
    base.dependency 'HippyDom'
    puts 'hippybase subspec \'base\' read end'
  end

  puts 'hippybase read ends'
end
