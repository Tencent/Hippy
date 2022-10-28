package com.openhippy.connector;

import java.nio.ByteBuffer;

public interface JSBridgeProxy {

    void callNatives(String moduleName, String moduleFunc, String callId, byte[] buffer);

    void callNatives(String moduleName, String moduleFunc, String callId, ByteBuffer buffer);
}
