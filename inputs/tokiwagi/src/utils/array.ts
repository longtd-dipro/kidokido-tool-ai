export const splitArrayIntoChunks = <T>(array: T[], maxLengthOfSubItem: number) => {
  const results = [];
  for (let i = 0; i < array.length; i += maxLengthOfSubItem) {
    results.push(array.slice(i, i + maxLengthOfSubItem));
  }

  return results;
};

export const calcSumByField = (list, fieldName) => {
  return list.reduce((sum, list) => (list[fieldName] ? sum + list[fieldName] : sum), 0);
};

export const convertToArray = (value) => {
  if (value) {
    return Array.isArray(value) ? value : [value];
  }

  return value;
};
