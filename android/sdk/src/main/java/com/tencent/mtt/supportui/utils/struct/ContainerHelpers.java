package com.tencent.mtt.supportui.utils.struct;

/**
 * Created by leonardgong on 2017/12/7 0007.
 */

class ContainerHelpers
{
	static final int[]		EMPTY_INTS		= new int[0];
	static final long[]		EMPTY_LONGS		= new long[0];
	static final Object[]	EMPTY_OBJECTS	= new Object[0];

	public static int idealIntArraySize(int need)
	{
		return idealByteArraySize(need * 4) / 4;
	}

	public static int idealLongArraySize(int need)
	{
		return idealByteArraySize(need * 8) / 8;
	}

	public static int idealByteArraySize(int need)
	{
		for (int i = 4; i < 32; i++)
			if (need <= (1 << i) - 12)
				return (1 << i) - 12;

		return need;
	}

	public static boolean equal(Object a, Object b)
	{
		return a == b || (a != null && a.equals(b));
	}

	// This is Arrays.binarySearch(), but doesn't do any argument validation.
	static int binarySearch(int[] array, int size, int value)
	{
		int lo = 0;
		int hi = size - 1;

		while (lo <= hi)
		{
			int mid = (lo + hi) >>> 1;
			int midVal = array[mid];

			if (midVal < value)
			{
				lo = mid + 1;
			}
			else if (midVal > value)
			{
				hi = mid - 1;
			}
			else
			{
				return mid; // value found
			}
		}
		return ~lo; // value not present
	}

	static int binarySearch(long[] array, int size, long value)
	{
		int lo = 0;
		int hi = size - 1;

		while (lo <= hi)
		{
			final int mid = (lo + hi) >>> 1;
			final long midVal = array[mid];

			if (midVal < value)
			{
				lo = mid + 1;
			}
			else if (midVal > value)
			{
				hi = mid - 1;
			}
			else
			{
				return mid; // value found
			}
		}
		return ~lo; // value not present
	}
}

