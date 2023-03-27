#!/bin/bash

# The package name of the target application
PACKAGE_NAME=com.example.app

# Get the process ID of the target application
PID=$(adb shell pidof $PACKAGE_NAME)

# Get the memory info of the target process
MEMINFO=$(adb shell dumpsys meminfo $PID)

# Parse the meminfo output to get the PSS value
PSS=$(echo $MEMINFO | grep "TOTAL:" | awk '{print $2}')

# Print the result
echo "App memory usage: $PSS KB"
