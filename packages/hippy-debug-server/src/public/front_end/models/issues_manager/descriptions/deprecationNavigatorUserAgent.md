# Audit usage of navigator.userAgent, navigator.appVersion, and navigator.platform

A page or script is accessing at least one of `navigator.userAgent`, `navigator.appVersion`, and `navigator.platform`.
In a future version of Chrome, the amount of information available in the User Agent string will be reduced.

To fix this issue, replace the usage of `navigator.userAgent`, `navigator.appVersion`, and `navigator.platform` with feature detection, progressive enhancement, or migrate to `navigator.userAgentData`.

Note that for performance reasons, only the first access to one of the properties is shown.
