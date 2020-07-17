export const getLocalState = (key: any) => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState == null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};
export const setLocalState = (key: any, value: any) => {
  try {
    const serializedState = JSON.parse(JSON.stringify(value));
    localStorage.setItem(key, serializedState);
  } catch (err) {}
};
