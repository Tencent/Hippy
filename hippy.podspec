#
# Be sure to run `pod lib lint hippy.podspec --verbose --use-libraries' to ensure this is a
# valid spec before submitting.
#
# Any lines starting with a # are optional, but their use is encouraged
# To learn more about a Podspec see https://guides.cocoapods.org/syntax/podspec.html
#

Pod::Spec.new do |s|
  s.name             = 'hippy'
  s.version          = '2.0.1'
  s.summary          = 'hippy lib for ios'

# This description is used to generate tags and improve search results.
#   * Think: What does it do? Why did you write it? What is the focus?
#   * Try to keep it short, snappy and to the point.
#   * Write the description between the DESC delimiters below.
#   * Finally, don't worry about the indent, CocoaPods strips it!

  s.description      = <<-DESC
TODO: Add long description of the pod here.
                       DESC
  s.homepage         = 'https://tencent.github.io/Hippy/#/'
  s.license          = { :type => 'Apache2', :file => 'LICENSE' }
  s.author           = { 'mengyanluo' => 'mengyanluo@tencent.com' }
  s.source           = {:git => 'https://github.com/Tencent/Hippy.git', :tag => s.version}
  s.ios.deployment_target = '8.0'
  s.source_files = ['ios/sdk/**/*.{h,m,c,mm,s,cpp,cc}', 'core/**/*.{h,cc}']
  s.exclude_files = ['core/napi/v8','core/js']
  s.libraries    = "c++"
  s.ios.deployment_target = '8.0'
  s.pod_target_xcconfig = {'USER_HEADER_SEARCH_PATHS' => '${PODS_TARGET_SRCROOT} ${PODS_TARGET_SRCROOT}/ios/sdk/**'}
  if ENV['hippy_use_frameworks']
  else
    s.user_target_xcconfig = {'OTHER_LDFLAGS' => '-force_load "${PODS_CONFIGURATION_BUILD_DIR}/hippy/libhippy.a"'}
end
end
