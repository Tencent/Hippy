package com.tencent.mtt.tkd.views.scroll;

import android.content.Context;
import android.text.TextUtils;
import android.view.View;
import android.view.ViewGroup;
import com.tencent.mtt.hippy.annotation.HippyController;
import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.modules.Promise;
import com.tencent.mtt.hippy.uimanager.HippyGroupController;
import com.tencent.mtt.hippy.utils.PixelUtil;
import com.tencent.mtt.hippy.views.scroll.HippyScrollViewController;

/**
 * @Description: TODO
 * @author: edsheng
 * @date: 2018/8/27 9:55
 * @version: V1.0
 */
@HippyController(name = TkdScrollViewController.CLASS_NAME)
public class TkdScrollViewController extends HippyScrollViewController
{
	public static final String	CLASS_NAME	= "tkdScrollView";

	private static final String	LOAD_MORE_FINISH = "loadMoreFinish";

	private static final String	SCROLL_TO_TOP = "scrollToTop";

	private static final String	SCROLL_TO_POSITION = "scrollToPosition";

	@Override
	protected View createViewImpl(Context context, HippyMap iniProps)
	{

		if (iniProps != null && iniProps.containsKey("horizontal"))
		{
			return new TkdHorizontalScrollView(context);
		}
		else
		{
			return new TkdVerticalScrollView(context);
		}

		//        return super.createViewImpl(context, iniProps);
	}

	@Override
	protected View createViewImpl(Context context)
	{
		return null;
		//        return new HippyScrollView(context);
	}

	@Override
	public void dispatchFunction(View view, String functionName, HippyArray args) {
		super.dispatchFunction(view, functionName, args);
		if(view instanceof  TkdScrollView)
		{
			if (TextUtils.equals(SCROLL_TO, functionName))
			{
				int destX = Math.round(PixelUtil.dp2px(args.getDouble(0)));
				int destY = Math.round(PixelUtil.dp2px(args.getDouble(1)));
				boolean animated = args.getBoolean(2);

				if (animated)
				{
					((TkdScrollView)view).callSmoothScrollTo(destX, destY, 0);
				}
				else
				{
					view.scrollTo(destX, destY);
				}
			} else if (TextUtils.equals(LOAD_MORE_FINISH, functionName)) {
				((TkdScrollView)view).callLoadMoreFinish();
			} else if (TextUtils.equals(SCROLL_TO_TOP, functionName)) {
				boolean isSmoothScroll = args.getBoolean(0);
				((TkdScrollView)view).callScrollToTop(isSmoothScroll);
			}
		}
	}

	@Override
	public void dispatchFunction(View view, String functionName, HippyArray params, Promise promise)
	{
		super.dispatchFunction(view, functionName, params, promise);
		if(view instanceof TkdScrollView) {
      if (TextUtils.equals(SCROLL_TO_POSITION, functionName)) {
        String msg = "";
        int distance = 0;
        int duration = 0;
        if (params != null && params.size() > 0) {
          HippyMap paramsMap = params.getMap(0);
          if (paramsMap != null) {
            distance = (int)PixelUtil.dp2px(paramsMap.getInt("distance"));
            duration = paramsMap.getInt("duration");
          }
        } else {
          msg = "invalid parameter!";
        }

        if (distance != 0) {
          ((TkdScrollView)view).callScrollToPosition(distance, duration, promise);
        } else {
          msg = "invalid distance parameter!";
        }

        if (!TextUtils.isEmpty(msg) && promise != null) {
          HippyMap resultMap = new HippyMap();
          resultMap.pushString("msg", msg);
          promise.resolve(resultMap);
        }
      }
    }
	}

	@HippyControllerProps(name = "preloadDistance", defaultType = HippyControllerProps.NUMBER, defaultNumber = 200)
	public void setPreloadDistance(TkdScrollView view, int preloadDistance)
	{
		view.setPreloadDistance(preloadDistance);
	}

}
