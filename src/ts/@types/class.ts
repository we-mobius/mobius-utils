
export type AnyConstructor = new (...args: any[]) => any
export type AnyConstructorOf<TargetClass> = new (...args: any[]) => TargetClass
export type ConstructorOf<TargetClass = any, ARGS extends any[] = any[]> = new (...args: ARGS) => TargetClass
