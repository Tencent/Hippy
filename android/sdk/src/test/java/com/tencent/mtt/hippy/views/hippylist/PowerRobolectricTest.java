package com.tencent.mtt.hippy.views.hippylist;

import android.app.Application;
import android.content.Context;
import android.os.Build.VERSION;
import androidx.annotation.NonNull;
import android.text.TextUtils;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import com.tencent.mtt.nxeasy.listview.BuildConfig;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;
import org.junit.Rule;
import org.junit.runner.RunWith;
import org.powermock.modules.junit4.rule.PowerMockRule;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.RuntimeEnvironment;
import org.robolectric.annotation.Config;

@RunWith(RobolectricTestRunner.class)
@Config(constants = BuildConfig.class, manifest = "AndroidManifest.xml", application = Application.class, sdk = 21)
public abstract class PowerRobolectricTest extends AbstractPowerMockTest {

    // 用于解决 PowerMock 和 Robolectric 的兼容性问题
    @Rule
    public PowerMockRule rule = new PowerMockRule();

    protected Context context;

    @Override
    public void setUp() throws Exception {
        super.setUp();
        context = RuntimeEnvironment.application.getApplicationContext();
    }

    protected List<View> getVisibleChildren(View view) {
        List<View> selected = new ArrayList<>();
        List<View> unvisited = new ArrayList<>();
        unvisited.add(view);
        while (!unvisited.isEmpty()) {
            View child = unvisited.remove(0);
            if (child.getVisibility() == View.VISIBLE) {
                selected.add(child);
                if (!(child instanceof ViewGroup)) {
                    continue;
                }
                ViewGroup group = (ViewGroup) child;
                final int childCount = group.getChildCount();
                for (int i = 0; i < childCount; i++) {
                    unvisited.add(group.getChildAt(i));
                }
            }
        }
        return selected;
    }

    protected String getVisibleText(View view) {
        StringBuilder sb = new StringBuilder();
        for (View child : getVisibleChildren(view)) {
            if (child instanceof TextView) {
                sb.append(((TextView) child).getText());
            }
        }
        return sb.toString();
    }

    protected TextView findVisibleTextView(View view, String searchFor) {
        for (View child : getVisibleChildren(view)) {
            if (child instanceof TextView) {
                TextView textView = (TextView) child;
                if (textView.getText().toString().contains(searchFor)) {
                    return textView;
                }
            }
        }
        return null;
    }

    protected void setSDKVersion(int version) throws Exception {
        Field sdkInt = VERSION.class.getField("SDK_INT");
        sdkInt.setAccessible(true);
        Field modifiersField = Field.class.getDeclaredField("modifiers");
        modifiersField.setAccessible(true);
        modifiersField.setInt(sdkInt, sdkInt.getModifiers() & ~Modifier.FINAL);
        sdkInt.set(null, version);
    }

    protected void runOnThread(Runnable runnable) {
        new Thread(runnable).start();
    }

    public <T extends View> T findView(View view, Class<T> cls) {
        if (cls.isInstance(view)) {
            return (T) view;
        }
        if (view instanceof ViewGroup) {
            ViewGroup vg = (ViewGroup) view;
            for (int i = 0; i < vg.getChildCount(); i++) {
                T child = findView(vg.getChildAt(i), cls);
                if (child != null) {
                    return child;
                }
            }
        }
        return null;
    }

    protected String findFullText(View view, String text) {
        if (view instanceof TextView) {
            TextView textView = (TextView) view;
            String result = textView.getText().toString();
            if (result.contains(text)) {
                return result;
            }
        }
        if (view instanceof ViewGroup) {
            ViewGroup group = (ViewGroup) view;
            for (int i = 0; i < group.getChildCount(); i++) {
                String result = findFullText(group.getChildAt(i), text);
                if (!TextUtils.isEmpty(result)) {
                    return result;
                }
            }
        }
        return null;
    }

    /**
     * 获取 view 的所有可见的子孙节点（不包含 view 本身）中，类型为 @param clazz 及其子类的那些节点。可用于获取
     * 一个页面上所有可见的 ListViewItem。
     */
    public <T extends View> List<T> getVisibleChildrenOf(@NonNull View view, Class<T> clazz) {
        List<T> result = new ArrayList<>();
        for (View child : getVisibleChildren(view)) {
            if (clazz.isInstance(child)) {
                result.add((T) child);
            }
        }
        return result;
    }

}
