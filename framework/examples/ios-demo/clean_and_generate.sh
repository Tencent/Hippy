#!/bin/bash

pod deintegrate

rm -rf HippyDemo.xcodeproj
rm -rf HippyDemo.xcworkspace
rm Podfile.lock

rm -rf ../../../devtools/devtools-integration/ios/DevtoolsBackend
rm -rf ../../../dom/dom_project

xcodegen