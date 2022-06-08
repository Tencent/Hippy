package com.tencent.mtt.supportui.utils;

public class CommonTool
{
    public static boolean hasPositiveItem(float[] array)
    {
        if (array != null)
        {
            for (int i = 0; i < array.length; i++)
            {
                if (array[i] > 0)
                    return true;
            }
        }
        return false;
    }
}
