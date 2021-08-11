let requestId = 0;
export const getRequestId = () => {
  requestId -= 1;
  return requestId;
};
