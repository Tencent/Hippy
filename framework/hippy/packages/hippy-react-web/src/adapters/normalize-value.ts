import unitlessNumbers from './unitless-numbers';

const units = {
  rotateZ: 'deg',
};

function normalizeValue(property: string, value: string | number | Element, valueType?: string) {
  let finalValue = value;
  if (valueType && typeof value === 'number') {
    finalValue = `${value}${valueType}`;
  } else if (!(unitlessNumbers as any)[property] && typeof value === 'number') {
    finalValue = (units as any)[property] ? `${value}${(units as any)[property]}` : `${value}px`;
  }
  return finalValue;
}

export default normalizeValue;
