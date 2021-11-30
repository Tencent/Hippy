#
# To learn more about a Podspec see http://guides.cocoapods.org/syntax/podspec.html.
# Run `pod lib lint flutter_render.podspec' to validate before publishing.
#
Pod::Spec.new do |s|
  s.name             = 'tencent_voltron_render'
  s.version          = '0.0.1'
  s.summary          = 'A new flutter plugin project.'
  s.description      = <<-DESC
A new flutter plugin project.
                       DESC
  s.homepage         = 'http://example.com'
  s.license          = { :file => '../LICENSE' }
  s.author           = { 'Your Company' => 'email@example.com' }
  s.source           = { :path => '.' }
  s.source_files = "Classes/**/*"
  s.vendored_frameworks = '*.xcframework'
  s.libraries = 'c++'
  s.dependency 'Flutter'
  s.platform = :ios, '11.0'

  # Flutter.framework does not contain a i386 slice. Only x86_64 simulators are supported.
  # s.pod_target_xcconfig = { 'OTHER_LDFLAGS' => '-all_load' }
  s.swift_version = '5.0'

  # s.subspec 'rendercore' do |sub|
  #   sub.name = 'rendercore'
  #   sub.source_files = "RenderCore/**/*"
  #   sub.libraries = 'c++'
  # end
  
end
