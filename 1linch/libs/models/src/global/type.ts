export type Type<T = any> = new (...args: any[]) => T
export type ClassInstance<T> = T extends { constructor: new (...args: any[]) => infer R }
  ? R
  : never
export type ClassType<T> = T extends new (...args: any[]) => any ? T : never
