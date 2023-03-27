#
# Be sure to run `pod lib lint hippy.podspec --verbose --use-libraries' to ensure this is a
# valid spec before submitting.
#
# Any lines starting with a # are optional, but their use is encouraged
# To learn more about a Podspec see https://guides.cocoapods.org/syntax/podspec.html
#

Pod::Spec.new do |s|
  s.name             = 'hippy'
  s.version          = '2.0.0'
  s.summary          = 'Hippy Cross Platform Framework'
  s.description      = <<-DESC
                        Hippy is designed for developers to easily build cross-platform and high-performance awesome apps.
                       DESC
  s.homepage         = 'https://hippyjs.org'
  s.license          = { :type => 'Apache2', :file => 'LICENSE' }
  s.author           = 'OpenHippy Team'
  s.source           = {:git => 'https://github.com/Tencent/Hippy.git', :tag => s.version}
  s.platform = :ios
  s.ios.deployment_target = '11.0'
  s.requires_arc = true
  s.default_subspec = 'iOSSDK'
  s.pod_target_xcconfig = {
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'GCC_ENABLE_CPP_EXCEPTIONS' => false,
    'GCC_ENABLE_CPP_RTTI' => false,
  }

  s.subspec 'core' do |ss|
    ss.libraries = 'c++'
    ss.framework = 'JavaScriptCore'
    ss.dependency 'hippy/coreThirdParty'
    ss.source_files = ['core/include/**/*.{h,cc}',
                       'core/src/**/*.{h,cc}']
    ss.public_header_files = 'core/include/**/*.h'
    ss.project_header_files = 'core/include/**/*.h'
    # ss.header_mappings_dir = 'core/include/'
    ss.exclude_files = ['core/include/core/napi/v8',
                        'core/include/core/vm/v8',
                        'core/include/core/inspector',
                        'core/src/napi/v8',
                        'core/src/inspector',
                        'core/src/vm/v8',
                        'core/third_party/base/src/platform/adr']
    ss.pod_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => '$(PODS_TARGET_SRCROOT)/core/include/',
    }
  end 

  s.subspec 'coreThirdParty' do |ss|
    ss.libraries = 'c++'
    ss.framework = 'JavaScriptCore'
    ss.public_header_files = 'core/third_party/**/*.h'
    ss.project_header_files = 'core/third_party/**/*.h'
    # ss.header_mappings_dir = 'core/third_party/base/include/'
    ss.source_files = 'core/third_party/**/*.{h,cc}'
    ss.exclude_files = ['core/third_party/base/src/platform/adr']
    ss.pod_target_xcconfig = {
      'HEADER_SEARCH_PATHS' => '$(PODS_TARGET_SRCROOT)/core/third_party/base/include/',
    }
  end

  s.subspec 'MTTLayout' do |ss|
    ss.libraries = 'c++'
    ss.frameworks = 'UIKit', 'Foundation'
    ss.source_files = 'ios/sdk/layout/**/*.{h,m,c,mm,s,cpp,cc}'
    ss.public_header_files = 'ios/sdk/layout/**/MTTFlex.h'
  end

  s.subspec 'iOSSDK' do |ss|
    ss.dependency 'hippy/core'
    ss.dependency 'hippy/coreThirdParty'
    ss.dependency 'hippy/MTTLayout'
    ss.frameworks = 'UIKit', 'Foundation', 'QuartzCore', 'CFNetwork', 'CoreGraphics', 'CoreTelephony', 
    'ImageIO', 'WebKit', 'SystemConfiguration', 'Security', 'CoreServices', 'Accelerate'
    ss.public_header_files = 'ios/sdk/**/*.h'
    ss.project_header_files = ['ios/sdk/**/HippyJSEnginesMapper.h', ]
    ss.source_files = 'ios/sdk/**/*.{h,m,c,mm,s,cpp,cc}'
    ss.exclude_files = 'ios/sdk/layout/**/*.{h,m,c,mm,s,cpp,cc}'
  end

end
