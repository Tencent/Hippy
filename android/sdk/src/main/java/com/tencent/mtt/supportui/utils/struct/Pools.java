package com.tencent.mtt.supportui.utils.struct;

/**
 * Created by leonardgong on 2017/12/7 0007.
 */

/**
 * Helper class for crating pools of objects. An example use looks like this:
 * 
 * <pre>
 * public class MyPooledClass {
 *
 *     private static final SynchronizedPool<MyPooledClass> sPool =
 *             new SynchronizedPool<MyPooledClass>(10);
 *
 *     public static MyPooledClass obtain() {
 *         MyPooledClass instance = sPool.acquire();
 *         return (instance != null) ? instance : new MyPooledClass();
 *     }
 *
 *     public void recycle() {
 *          // Clear state if needed.
 *          sPool.release(this);
 *     }
 *
 *     . . .
 * }
 * </pre>
 *
 */
public final class Pools
{

	/**
	 * Interface for managing a pool of objects.
	 *
	 * @param <T> The pooled type.
	 */
	public interface Pool<T>
	{

		/**
		 * @return An instance from the pool if such, null otherwise.
		 */
		T acquire();

		/**
		 * Release an instance to the pool.
		 *
		 * @param instance The instance to release.
		 * @return Whether the instance was put in the pool.
		 *
		 * @throws IllegalStateException If the instance is already in the pool.
		 */
		boolean release(T instance);
	}

	private Pools()
	{
		/* do nothing - hiding constructor */
	}

	/**
	 * Simple (non-synchronized) pool of objects.
	 *
	 * @param <T> The pooled type.
	 */
	public static class SimplePool<T> implements Pool<T>
	{
		private final Object[]	mPool;

		private int				mPoolSize;

		/**
		 * Creates a new instance.
		 *
		 * @param maxPoolSize The max pool size.
		 *
		 * @throws IllegalArgumentException If the max pool size is less than zero.
		 */
		public SimplePool(int maxPoolSize)
		{
			if (maxPoolSize <= 0)
			{
				throw new IllegalArgumentException("The max pool size must be > 0");
			}
			mPool = new Object[maxPoolSize];
		}

		@Override
		@SuppressWarnings("unchecked")
		public T acquire()
		{
			if (mPoolSize > 0)
			{
				final int lastPooledIndex = mPoolSize - 1;
				T instance = (T) mPool[lastPooledIndex];
				mPool[lastPooledIndex] = null;
				mPoolSize--;
				return instance;
			}
			return null;
		}

		@Override
		public boolean release(T instance)
		{
			if (isInPool(instance))
			{
				throw new IllegalStateException("Already in the pool!");
			}
			if (mPoolSize >= 0 && mPoolSize < mPool.length)
			{
				mPool[mPoolSize] = instance;
				mPoolSize++;
				return true;
			}
			return false;
		}

		private boolean isInPool(T instance)
		{
			for (int i = 0; i < mPoolSize; i++)
			{
				if (mPool[i] == instance)
				{
					return true;
				}
			}
			return false;
		}
	}

	/**
	 * Synchronized) pool of objects.
	 *
	 * @param <T> The pooled type.
	 */
	public static class SynchronizedPool<T> extends SimplePool<T>
	{
		private final Object mLock = new Object();

		/**
		 * Creates a new instance.
		 *
		 * @param maxPoolSize The max pool size.
		 *
		 * @throws IllegalArgumentException If the max pool size is less than zero.
		 */
		public SynchronizedPool(int maxPoolSize)
		{
			super(maxPoolSize);
		}

		@Override
		public T acquire()
		{
			synchronized (mLock)
			{
				return super.acquire();
			}
		}

		@Override
		public boolean release(T element)
		{
			synchronized (mLock)
			{
				return super.release(element);
			}
		}
	}
}

