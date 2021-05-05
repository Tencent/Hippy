package com.tencent.mtt.hippy.adapter.image;

import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;

/**
 * Copyright (C) 2015-2025 TENCENT Inc.All Rights Reserved.
 * FileName: ByteBufferInputStream
 * Description：
 * History：
 * 2.0 harryguo on 2019/4/26
 */

public class ByteBufferInputStream extends InputStream {
	private final ByteBuffer byteBuffer;
	private int markPos = -1;

	@SuppressWarnings("unused")
	ByteBufferInputStream(ByteBuffer byteBuffer) {
		this.byteBuffer = byteBuffer;
		byteBuffer.flip();
	}

	public int available() {
		return this.byteBuffer.remaining();
	}

	public int read() {
		return !this.byteBuffer.hasRemaining() ? -1 : this.byteBuffer.get();
	}

	public synchronized void mark(int readLimit) {
		this.markPos = this.byteBuffer.position();
	}

	public boolean markSupported() {
		return true;
	}

	public int read(byte[] buffer, int byteOffset, int byteCount) {
		if (!this.byteBuffer.hasRemaining()) {
			return -1;
		} else {
			int toRead = Math.min(byteCount, this.available());
			this.byteBuffer.get(buffer, byteOffset, toRead);
			return toRead;
		}
	}

	public synchronized void reset() throws IOException {
		if (this.markPos == -1) {
			throw new IOException("Cannot reset to unset mark position");
		} else {
			this.byteBuffer.position(this.markPos);
		}
	}

	public long skip(long byteCount) {
		if (!this.byteBuffer.hasRemaining()) {
			return -1L;
		} else {
			long toSkip = Math.min(byteCount, (long)this.available());
			this.byteBuffer.position((int)((long)this.byteBuffer.position() + toSkip));
			return toSkip;
		}
	}
}