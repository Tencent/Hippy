/* Tencent is pleased to support the open source community by making Hippy available.
 * Copyright (C) 2018 THL A29 Limited, a Tencent company. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.tencent.mtt.hippy.uimanager;

import android.view.View;

import com.tencent.mtt.hippy.annotation.HippyControllerProps;
import com.tencent.mtt.hippy.common.HippyMap;
import com.tencent.mtt.hippy.dom.node.NodeProps;
import com.tencent.mtt.hippy.utils.ArgumentUtils;
import com.tencent.mtt.hippy.utils.LogUtils;

import com.tencent.mtt.hippy.views.custom.HippyCustomPropsController;
import java.lang.reflect.Method;
import java.lang.reflect.Type;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class ControllerUpdateManger<T, G>
{
	static final Map<Class, Map<String, PropsMethodHolder>>	CLASS_PROPS_METHOD	= new HashMap<>();

	public static class PropsMethodHolder
	{
		Method	mMethod;
		String	mDefaultType;
		String	mDefaultString;
		double	mDefaultNumber;
		boolean	mDefaultBoolean;
		Type[]	mTypes;
	}

	private T customPropsController;

	public void setCustomPropsController(T controller) {
		assert(controller != null);
		customPropsController = controller;
	}

	private void findPropsMethod(Class cls, Map<String, PropsMethodHolder> hashMap)
	{
		if (cls != HippyViewController.class)
		{
			// find parent methods first
			findPropsMethod(cls.getSuperclass(), hashMap);
		}

		Map<String, PropsMethodHolder> methodHolder = CLASS_PROPS_METHOD.get(cls);
		if (methodHolder == null)
		{

			Method[] methods = cls.getMethods();
			for (Method method : methods)
			{
				HippyControllerProps controllerProps = method.getAnnotation(HippyControllerProps.class);
				if (controllerProps != null)
				{
					String style = controllerProps.name();
					PropsMethodHolder propsMethodHolder = new PropsMethodHolder();
					propsMethodHolder.mDefaultNumber = controllerProps.defaultNumber();
					propsMethodHolder.mDefaultType = controllerProps.defaultType();
					propsMethodHolder.mDefaultString = controllerProps.defaultString();
					propsMethodHolder.mDefaultBoolean = controllerProps.defaultBoolean();
					propsMethodHolder.mMethod = method;
					hashMap.put(style, propsMethodHolder);
				}
			}
			// put to CLASS_PROPS_METHOD
			CLASS_PROPS_METHOD.put(cls, new HashMap<String, PropsMethodHolder>(hashMap));
		}
		else
		{
			hashMap.putAll(methodHolder);
		}

	}

	private Map<String, PropsMethodHolder> findPropsMethod(Class cla)
	{
		Map<String, PropsMethodHolder> hashMap = new HashMap<>();
		findPropsMethod(cla, hashMap);
		return hashMap;
	}

	private void invokePropMethod(T t, G g, HippyMap hippyMap, String prop, PropsMethodHolder propsMethodHolder) {
		try {
			if (hippyMap.get(prop) == null) {
				switch (propsMethodHolder.mDefaultType) {
					case HippyControllerProps.BOOLEAN:
						propsMethodHolder.mMethod.invoke(t, g, propsMethodHolder.mDefaultBoolean);
						break;
					case HippyControllerProps.NUMBER:
						if (propsMethodHolder.mTypes == null) {
							propsMethodHolder.mTypes = propsMethodHolder.mMethod.getGenericParameterTypes();
						}
						propsMethodHolder.mMethod.invoke(t, g, ArgumentUtils.parseArgument(propsMethodHolder.mTypes[1], propsMethodHolder.mDefaultNumber));
						break;
					case HippyControllerProps.STRING:
						propsMethodHolder.mMethod.invoke(t, g, propsMethodHolder.mDefaultString);
						break;
					default:
						Object o = null;
						propsMethodHolder.mMethod.invoke(t, g, o);
						break;
				}
			} else {
				Object object = hippyMap.get(prop);
				if (object instanceof Number) {
					if (propsMethodHolder.mTypes == null) {
						propsMethodHolder.mTypes = propsMethodHolder.mMethod.getGenericParameterTypes();
					}
					object = ArgumentUtils.parseArgument(propsMethodHolder.mTypes[1], hippyMap, prop);
				}

				propsMethodHolder.mMethod.invoke(t, g, object);
			}
		} catch (Throwable e) {
			LogUtils.e("ControllerUpdateManager", e.getMessage(), e);
			e.printStackTrace();
		}
	}

	private void handleCustomProps(T t, G g, HippyMap hippyMap, String prop) {
		assert(g instanceof View);
		assert(customPropsController instanceof HippyCustomPropsController);

		boolean hasCustomMethodHolder = false;

		if(!(g instanceof View)) {
			return;
		}

		Object customProps = hippyMap.get(prop);

		if (customPropsController != null && customPropsController instanceof HippyCustomPropsController) {
			Class cla = customPropsController.getClass();
			Map<String, PropsMethodHolder> methodHolder = CLASS_PROPS_METHOD.get(cla);
			if (methodHolder == null) {
				methodHolder = findPropsMethod(cla);
			}
			PropsMethodHolder propsMethodHolder = methodHolder.get(prop);
			try {
				if (propsMethodHolder != null) {
					invokePropMethod(customPropsController, g, hippyMap, prop, propsMethodHolder);
					hasCustomMethodHolder = true;
				}
			} catch (Throwable e) {
				LogUtils.e("ControllerUpdateManager", "customProps " + e.getMessage(), e);
				e.printStackTrace();
			}
		}

		if (!hasCustomMethodHolder && t instanceof HippyViewController) {
			((HippyViewController)t).setCustomProp((View)g, prop, customProps);
		}
	}

	public void updateProps(T t, G g, HippyMap hippyMap) {
		assert (hippyMap != null);

		if (hippyMap == null) {
			return;
		}
		Class cla = t.getClass();

		Map<String, PropsMethodHolder> methodHolder = CLASS_PROPS_METHOD.get(cla);
		if (methodHolder == null) {
			methodHolder = findPropsMethod(cla);
		}

		Set<String> props = hippyMap.keySet();
		for (String prop : props) {
			PropsMethodHolder propsMethodHolder = methodHolder.get(prop);
			if (propsMethodHolder != null) {
				invokePropMethod(t, g, hippyMap, prop, propsMethodHolder);
			} else {
				if (prop.equals(NodeProps.STYLE) && hippyMap.get(prop) instanceof HippyMap) {
					updateProps(t, g, (HippyMap)hippyMap.get(prop));
				} else {
					handleCustomProps(t, g, hippyMap, prop);
				}
			}
		}
	}
}
