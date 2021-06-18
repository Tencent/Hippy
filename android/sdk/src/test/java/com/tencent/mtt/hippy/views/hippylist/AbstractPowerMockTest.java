package com.tencent.mtt.hippy.views.hippylist;

import static org.powermock.api.mockito.PowerMockito.mock;
import static org.powermock.api.mockito.PowerMockito.mockStatic;
import static org.powermock.api.mockito.PowerMockito.when;

import org.junit.Before;
import org.powermock.core.classloader.annotations.PowerMockIgnore;

@PowerMockIgnore({"org.powermock.*", "org.mockito.*", "org.robolectric.*", "android.*", "javax.xml.*",
        "com.sun.org.apache.xerces.*"})
public abstract class AbstractPowerMockTest {

    public static <T> T mockGetInstance(Class<T> clazz, Object... arguments) throws Exception {
        T result = mock(clazz);
        mockStatic(clazz);
        when(clazz, "getInstance", arguments).thenReturn(result);
        return result;
    }

    @Before
    public void setUp() throws Exception {
    }

}
