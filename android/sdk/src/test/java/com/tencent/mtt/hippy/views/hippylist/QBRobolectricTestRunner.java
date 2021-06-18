package com.tencent.mtt.hippy.views.hippylist;

import org.junit.runners.model.InitializationError;
import org.robolectric.RobolectricTestRunner;

public class QBRobolectricTestRunner extends RobolectricTestRunner {

    static {
        System.setProperty("robolectric.dependency.repo.id", "local");
        System.setProperty("robolectric.dependency.repo.url",
                "https://mirrors.tencent.com/nexus/repository/maven-public/");
    }

    /**
     * Creates a runner to run {@code testClass}. Looks in your working directory for your
     * AndroidManifest.xml file and res directory by default. Use the {@link Config} annotation to
     * configure.
     *
     * @param testClass the test class to be run
     * @throws InitializationError if junit says so
     */
    public QBRobolectricTestRunner(Class<?> testClass) throws InitializationError {
        super(testClass);
    }
}
