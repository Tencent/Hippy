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
package com.tencent.mtt.hippy.websocket;

import java.io.IOException;
import java.net.ProtocolException;

public final class StatusLine
{

	public final int	code;
	public final String	message;

	public StatusLine(int code, String message)
	{
		this.code = code;
		this.message = message;
	}

	public static StatusLine parse(String statusLine) throws IOException
	{

		int codeStart;
		if (statusLine.startsWith("HTTP/1."))
		{
			if (statusLine.length() < 9 || statusLine.charAt(8) != ' ')
			{
				throw new ProtocolException("Unexpected status line: " + statusLine);
			}
			int httpMinorVersion = statusLine.charAt(7) - '0';
			codeStart = 9;
			if (httpMinorVersion != 0 && httpMinorVersion != 1)
			{
                throw new ProtocolException("Unexpected status line: " + statusLine);
			}
		}
		else if (statusLine.startsWith("ICY "))
		{
			codeStart = 4;
		}
		else
		{
			throw new ProtocolException("Unexpected status line: " + statusLine);
		}

		if (statusLine.length() < codeStart + 3)
		{
			throw new ProtocolException("Unexpected status line: " + statusLine);
		}
		int code;
		try
		{
			code = Integer.parseInt(statusLine.substring(codeStart, codeStart + 3));
		}
		catch (NumberFormatException e)
		{
			throw new ProtocolException("Unexpected status line: " + statusLine);
		}

		String message = "";
		if (statusLine.length() > codeStart + 3)
		{
			if (statusLine.charAt(codeStart + 3) != ' ')
			{
				throw new ProtocolException("Unexpected status line: " + statusLine);
			}
			message = statusLine.substring(codeStart + 4);
		}

		return new StatusLine(code, message);
	}
}
