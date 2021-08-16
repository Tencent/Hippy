let requestId = 0;
export const getRequestId = () => {
  requestId -= 1;
  return requestId;
};

let contextId = 0;
export const getContextId = () => {
  contextId -= 1;
  return contextId;
};
