package com.tencent.mtt.hippy.utils;

import java.util.Arrays;

public class GrowByteBuffer
{

	private static final byte[]	FALSE_BYTES				= { 'f', 'a', 'l', 's', 'e' };
	private static final byte[]	TRUE_BYTES				= { 't', 'r', 'u', 'e' };
	private static final byte[]	INT_MIN_BYTES			= { '-', '2', '1', '4', '7', '4', '8', '3', '6', '4', '8' };
	private static final byte[]	LONG_MIN_BYTES			= { '-', '9', '2', '2', '3', '3', '7', '2', '0', '3', '6', '8', '5', '4', '7', '7', '5', '8',
			'0', '8' };

	private static final int	MAX_ARRAY_SIZE			= Integer.MAX_VALUE - 8;

	private final static int[]	INT_STRING_SIZE_TABLE	= { 9, 99, 999, 9999, 99999, 999999, 9999999, 99999999, 999999999, Integer.MAX_VALUE };


	private final static byte[]	DigitTens				= { '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '1', '1', '1', '1', '1', '1', '1', '1',
			'1', '1', '2', '2', '2', '2', '2', '2', '2', '2', '2', '2', '3', '3', '3', '3', '3', '3', '3', '3', '3', '3', '4', '4', '4', '4', '4',
			'4', '4', '4', '4', '4', '5', '5', '5', '5', '5', '5', '5', '5', '5', '5', '6', '6', '6', '6', '6', '6', '6', '6', '6', '6', '7', '7',
			'7', '7', '7', '7', '7', '7', '7', '7', '8', '8', '8', '8', '8', '8', '8', '8', '8', '8', '9', '9', '9', '9', '9', '9', '9', '9', '9',
			'9', };

	private final static byte[]	DigitOnes				= { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '1', '2', '3', '4', '5', '6', '7',
			'8', '9', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '1', '2', '3', '4',
			'5', '6', '7', '8', '9', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '1',
			'2', '3', '4', '5', '6', '7', '8', '9', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '1', '2', '3', '4', '5', '6', '7', '8',
			'9', };

	private final static byte[]	digits					= { '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h',
			'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' };

	// Requires positive x
	private static int intStringSize(int x)
	{
		for (int i = 0;; i++)
			if (x <= INT_STRING_SIZE_TABLE[i])
				return i + 1;
	}

	private static int longStringSize(long x)
	{
		long p = 10;
		for (int i = 1; i < 19; i++)
		{
			if (x < p)
				return i;
			p = 10 * p;
		}
		return 19;
	}

	private byte[]			value;
	private int				count;
	private int				length;
	private StringBuilder	stringBuilder;

	public GrowByteBuffer(int size)
	{
		value = new byte[size];
		length = size;
		count = 0;
	}

	public int length()
	{
		return count;
	}


	public int capacity()
	{
		return value.length;
	}

	public final void trimToSize()
	{
		if (count < value.length)
		{
			value = Arrays.copyOf(value, count);
		}
	}

	public final byte[] getValue()
	{
		return value;
	}

	public final void reset()
	{
		count = 0;
		if (stringBuilder != null)
		{
			stringBuilder.setLength(0);
		}
	}


	private void ensureCapacityInternal(int minimumCapacity)
	{
		// overflow-conscious code
		if (minimumCapacity - value.length > 0)
		{
			value = Arrays.copyOf(value, newCapacity(minimumCapacity));
		}
	}


	private int newCapacity(int minCapacity)
	{
		// overflow-conscious code
		int newCapacity = (value.length << 1) + 2;
		if (newCapacity - minCapacity < 0)
		{
			newCapacity = minCapacity;
		}
		return (newCapacity <= 0 || MAX_ARRAY_SIZE - newCapacity < 0) ? hugeCapacity(minCapacity) : newCapacity;
	}

	private int hugeCapacity(int minCapacity)
	{
		if (Integer.MAX_VALUE - minCapacity < 0)
		{ // overflow
			throw new OutOfMemoryError();
		}
		return (minCapacity > MAX_ARRAY_SIZE) ? minCapacity : MAX_ARRAY_SIZE;
	}


	public GrowByteBuffer putByteArray(byte[] bytes)
	{
		final int len = bytes.length;
		ensureCapacityInternal(count + len);
		System.arraycopy(bytes, 0, value, count, len);
		count += len;
		return this;
	}

	public GrowByteBuffer putByte(byte onebyte)
	{
		ensureCapacityInternal(count + 1);
		value[count++] = onebyte;
		return this;
	}

	public GrowByteBuffer putInt(int i)
	{
		if (i == Integer.MIN_VALUE)
		{
			return putByteArray(INT_MIN_BYTES);
		}
		final int len = (i < 0) ? intStringSize(-i) + 1 : intStringSize(i);
		final int finalLen = count + len;

		ensureCapacityInternal(finalLen);
		getBytesFromInt(i, finalLen, value);
		count = finalLen;

		return this;
	}

	public GrowByteBuffer putChar(char c)
	{
		return putByteArray(Character.toString(c).getBytes());
	}

	public GrowByteBuffer putLong(long l)
	{
		if (l == Long.MIN_VALUE)
		{
			return putByteArray(LONG_MIN_BYTES);
		}
		int appendedLength = (l < 0) ? longStringSize(-l) + 1 : longStringSize(l);
		int spaceNeeded = count + appendedLength;
		ensureCapacityInternal(spaceNeeded);
		getBytesFromLong(l, spaceNeeded, value);
		count = spaceNeeded;

		return this;
	}

	public GrowByteBuffer putBoolean(boolean b)
	{
		return putByteArray(b ? TRUE_BYTES : FALSE_BYTES);
	}

	public GrowByteBuffer putDouble(double d)
	{
		return putString(Double.toString(d));
	}

	public GrowByteBuffer putFloat(float f)
	{
		return putString(Float.toString(f));
	}

	public GrowByteBuffer putString(String str)
	{
		return putByteArray(str.getBytes());
	}

	public StringBuilder getStringBuilderCache()
	{
		if (stringBuilder == null)
		{
			stringBuilder = new StringBuilder();
		}

		stringBuilder.setLength(0);
		return stringBuilder;
	}

	private static void getBytesFromInt(int i, int index, byte[] buf)
	{
		int q, r;
		int charPos = index;
		byte sign = 0;

		if (i < 0)
		{
			sign = '-';
			i = -i;
		}

		// Generate two digits per iteration
		while (i >= 65536)
		{
			q = i / 100;
			// really: r = i - (q * 100);
			r = i - ((q << 6) + (q << 5) + (q << 2));
			i = q;
			buf[--charPos] = DigitOnes[r];
			buf[--charPos] = DigitTens[r];
		}

		// Fall thru to fast mode for smaller numbers
		// assert(i <= 65536, i);
		for (;;)
		{
			q = (i * 52429) >>> (16 + 3);
			r = i - ((q << 3) + (q << 1)); // r = i-(q*10) ...
			buf[--charPos] = digits[r];
			i = q;
			if (i == 0)
				break;
		}
		if (sign != 0)
		{
			buf[--charPos] = sign;
		}
	}

	private static void getBytesFromLong(long i, int index, byte[] buf)
	{
		long q;
		int r;
		int charPos = index;
		byte sign = 0;

		if (i < 0)
		{
			sign = '-';
			i = -i;
		}

		// Get 2 digits/iteration using longs until quotient fits into an int
		while (i > Integer.MAX_VALUE)
		{
			q = i / 100;
			// really: r = i - (q * 100);
			r = (int) (i - ((q << 6) + (q << 5) + (q << 2)));
			i = q;
			buf[--charPos] = DigitOnes[r];
			buf[--charPos] = DigitTens[r];
		}

		// Get 2 digits/iteration using ints
		int q2;
		int i2 = (int) i;
		while (i2 >= 65536)
		{
			q2 = i2 / 100;
			// really: r = i2 - (q * 100);
			r = i2 - ((q2 << 6) + (q2 << 5) + (q2 << 2));
			i2 = q2;
			buf[--charPos] = DigitOnes[r];
			buf[--charPos] = DigitTens[r];
		}

		// Fall thru to fast mode for smaller numbers
		// assert(i2 <= 65536, i2);
		for (;;)
		{
			q2 = (i2 * 52429) >>> (16 + 3);
			r = i2 - ((q2 << 3) + (q2 << 1)); // r = i2-(q2*10) ...
			buf[--charPos] = digits[r];
			i2 = q2;
			if (i2 == 0)
				break;
		}
		if (sign != 0)
		{
			buf[--charPos] = sign;
		}
	}
}
