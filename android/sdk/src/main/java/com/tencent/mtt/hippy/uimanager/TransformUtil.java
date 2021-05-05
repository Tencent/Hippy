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

import com.tencent.mtt.hippy.common.HippyArray;
import com.tencent.mtt.hippy.common.HippyMap;

@SuppressWarnings({"deprecation","unused"})
public class TransformUtil
{

	private static final ThreadLocal<double[]> sHelperMatrix = new ThreadLocal<double[]>()
	{
		@Override
		protected double[] initialValue()
		{
			return new double[16];
		}
	};

	private static double convertToRadians(HippyMap transformMap, String key)
	{
		double value = 0;
		boolean inRadians = true;
		if (transformMap.get(key) instanceof String)
		{
			String stringValue = (String) transformMap.get(key);
			if (stringValue.endsWith("rad") || stringValue.endsWith("deg")) {
				stringValue = stringValue.substring(0, stringValue.length() - 3);
			}

			if (stringValue.endsWith("deg")) {
				inRadians = false;
			}

			value = Float.parseFloat(stringValue);
		}
		else if (transformMap.get(key) instanceof Number)
		{
			value = ((Number) transformMap.get(key)).doubleValue();
		}
		return inRadians ? value : MatrixUtil.degreesToRadians(value);
	}

	public static void processTransform(HippyArray transforms, double[] result)
	{
		double[] helperMatrix = sHelperMatrix.get();
		MatrixUtil.resetIdentityMatrix(result);

		for (int transformIdx = 0, size = transforms.size(); transformIdx < size; transformIdx++)
		{
			HippyMap transform = transforms.getMap(transformIdx);
			String transformType = transform.keySet().iterator().next();

			MatrixUtil.resetIdentityMatrix(helperMatrix);
			Object value = transform.get(transformType);
			if ("matrix".equals(transformType) && value instanceof HippyArray)
			{
				HippyArray matrix = (HippyArray) value;
				for (int i = 0; i < 16; i++)
				{
					Object matrixValue = matrix.getObject(i);
					if (matrixValue instanceof Number)
					{
						helperMatrix[i] = ((Number) matrixValue).doubleValue();
					}
				}
			}
			else if ("perspective".equals(transformType) && value instanceof Number)
			{
				MatrixUtil.applyPerspective(helperMatrix, ((Number) value).doubleValue());
			}
			else if ("rotateX".equals(transformType))
			{
				MatrixUtil.applyRotateX(helperMatrix, convertToRadians(transform, transformType));
			}
			else if ("rotateY".equals(transformType))
			{
				MatrixUtil.applyRotateY(helperMatrix, convertToRadians(transform, transformType));
			}
			else if ("rotate".equals(transformType) || "rotateZ".equals(transformType))
			{
				MatrixUtil.applyRotateZ(helperMatrix, convertToRadians(transform, transformType));
			}
			else if ("scale".equals(transformType) && value instanceof Number)
			{
				double scale = ((Number) value).doubleValue();
				MatrixUtil.applyScaleX(helperMatrix, scale);
				MatrixUtil.applyScaleY(helperMatrix, scale);
			}
			else if ("scaleX".equals(transformType) && value instanceof Number)
			{
				MatrixUtil.applyScaleX(helperMatrix, ((Number) value).doubleValue());
			}
			else if ("scaleY".equals(transformType))
			{
				MatrixUtil.applyScaleY(helperMatrix, ((Number) value).doubleValue());
			}
			else if ("translate".equals(transformType) && value instanceof HippyArray)
			{
				double x = 0d, y = 0d, z = 0d;

				if (((HippyArray) value).size() > 0)
				{
					Object tranX = ((HippyArray) value).getObject(0);
					if (tranX instanceof Number)
					{
						x = ((Number) tranX).doubleValue();
					}
				}

				if (((HippyArray) value).size() > 1)
				{
					Object tranY = ((HippyArray) value).getObject(1);
					if (tranY instanceof Number)
					{
						y = ((Number) tranY).doubleValue();
					}
				}

				if (((HippyArray) value).size() > 2)
				{
					Object tranZ = ((HippyArray) value).getObject(2);
					if (tranZ instanceof Number)
					{
						z = ((Number) tranZ).doubleValue();
					}
				}
				MatrixUtil.applyTranslate3D(helperMatrix, x, y, z);
			}
			else if ("translateX".equals(transformType) && value instanceof Number)
			{
				MatrixUtil.applyTranslate2D(helperMatrix, ((Number) value).doubleValue(), 0d);
			}
			else if ("translateY".equals(transformType) && value instanceof Number)
			{
				MatrixUtil.applyTranslate2D(helperMatrix, 0d, ((Number) value).doubleValue());
			}
			else if ("skewX".equals(transformType))
			{
				MatrixUtil.applySkewX(helperMatrix, convertToRadians(transform, transformType));
			}
			else if ("skewY".equals(transformType))
			{
				MatrixUtil.applySkewY(helperMatrix, convertToRadians(transform, transformType));
			}
			else
			{
				RuntimeException runtimeException = new RuntimeException("Unsupported transform type: " + transformType);
				runtimeException.printStackTrace();
			}

			MatrixUtil.multiplyInto(result, result, helperMatrix);
		}
	}
}
