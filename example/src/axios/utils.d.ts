declare const isString: (value: any) => value is string, isObject: (value: any) => value is Record<string, string>, forEach: <T extends Record<string, any>>(obj: T, fn: (value: T[keyof T], key: keyof T, obj: T) => void) => void, merge: <T extends Record<string, any>>(...args: T[]) => T;
declare function objectToQueryString(obj: Record<string, any>): string;
export { isString, isObject, forEach, merge, objectToQueryString };
