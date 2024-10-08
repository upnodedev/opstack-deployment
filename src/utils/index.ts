export const mergeDict = (dict1: any, dict2: any) => {
  const res = { ...dict1 };
  for (const key in dict2) {
    if (dict2.hasOwnProperty(key)) {
      res[key] = dict2[key];
    }
  }
  return res;
};

export const replaceEnv = (old: string, newEnv: Record<string, any>) => {
  let res = old;
  for (const key in newEnv) {
    res = res.replace(
      new RegExp(`${key}=(.+)`, 'g'),
      `${key}=${newEnv[key]}`
    );
  }
  return res;
};
