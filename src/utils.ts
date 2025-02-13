export function mapToObject(map: Map<string, any>) {
  const obj = {};
  for (const [key, value] of map) {
    // TODO: FIX THIS TYPE ERROR
    // @ts-ignore
    obj[key] = value instanceof Map ? mapToObject(value) : value;
  }
  return obj;
}
