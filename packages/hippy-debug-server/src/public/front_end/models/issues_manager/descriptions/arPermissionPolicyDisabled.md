# Ensure the "attribution-reporting" Permission Policy is enabled when using the Attribution Reporting API

This page tries to use the Attribution Reporting API but this was aborted, because the `attribution-reporting` policy is not enabled.

This API is enabled by default in the top-level context and in same-origin child frames, but must
be explicitly opted-in for cross-origin frames. Add the permission policy as follows: `<iframe src="..." allow="attribution-reporting">`.
