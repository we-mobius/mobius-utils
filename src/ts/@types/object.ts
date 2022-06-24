import type {
  Undefinedable, Nullable, Nilable,
  NonUndefinedable, NonNullable, NonNilable
} from './base'
import type { SetIntersection, SetDifference, SetComplement } from './union'

/**
 * Strict version of `Omit`, `K` must be subset of `typeof T`.
 */
export type StrictOmit<T, K extends keyof T> = Omit<T, K>

export type StringRecord<T> = Record<string, T>
export type NumberRecord<T> = Record<number, T>
export type SymbolRecord<T> = Record<symbol, T>
export type HybridRecord<T> = Record<string | number | symbol, T>
export type AnyStringRecord = StringRecord<any>
export type AnyNumberRecord = NumberRecord<any>
export type AnySymbolRecord = SymbolRecord<any>
export type AnyHybridRecord = Record<string | number | symbol, any>
export type AnyRecordUnion = AnyStringRecord | AnyNumberRecord | AnySymbolRecord

// export type ObjectPrettify<Target extends AnyHybridRecord> = Target extends infer O ? { [K in keyof O]: O[K] } : never
export type ObjectPrettify<Target extends AnyHybridRecord> = Pick<Target, keyof Target>

/**
 * @example
 * ```
 *   interface Temp { a: string, b: number, c?: boolean }
 *   // Expect to be: { a: string | undefined, b: number, c?: boolean }
 *   type test1 = UndefinedableByKeys<Temp, 'a'>
 * ```
 */
export type UndefinedableByKeys<Target, Keys> = {
  [Key in keyof Target]: Key extends Keys ? Undefinedable<Target[Key]> : Target[Key]
}
export type UndefinedableAllKeys<Target> = UndefinedableByKeys<Target, keyof Target>

/**
 * @example
 * ```
 *   interface Temp { a: string, b: number, c?: boolean }
 *   // Expect to be: { a: string | null, b: number, c?: boolean }
 *   type test1 = NullableByKeys<Temp, 'a'>
 * ```
 */
export type NullableByKeys<Target, Keys> = {
  [Key in keyof Target]: Key extends Keys ? Nullable<Target[Key]> : Target[Key]
}
export type NullableAllKeys<Target> = NullableByKeys<Target, keyof Target>

/**
 * @example
 * ```
 *   interface Temp { a: string, b: number, c?: boolean }
 *   // Expect to be: { a: string | null | undefined, b: number, c?: boolean }
 *   type test1 = NilableByKeys<Temp, 'a'>
 * ```
 */
export type NilableByKeys<Target, Keys> = {
  [Key in keyof Target]: Key extends Keys ? Nilable<Target[Key]> : Target[Key]
}
export type NilableAllKeys<Target> = NilableByKeys<Target, keyof Target>

/**
 * @example
 * ```
 *   interface Temp { a: string | undefined, b: number, c?: boolean | undefined }
 *   // Expect to be: { a: string, b: number, c?: boolean }
 *   type test1 = NonUndefinedableAllKeys<Temp>
 * ```
 */
export type NonUndefinedableAllKeys<Target> = {
  [Key in keyof Target]: NonUndefinedable<Target[Key]>
}
/**
 * @example
 * ```
 *   interface Temp { a: string | undefined, b: number, c?: boolean }
 *   // Expect to be: { a: string, b: number, c?: boolean }
 *   type test1 = NonUndefinedableByKeys<Temp, 'a'>
 *   type test2 = NonUndefinedableByKeys<Temp, 'a' | 'b'>
 *
 *   interface Temp { a: string | undefined, b: number, c?: boolean | undefined }
 *   // Expect to be: { a: string, b: number, c?: boolean }
 *   type test3 = NonUndefinedableByKeys<Temp, 'a' | 'c'>
 *   // Expect to be: { a: string | undefined, b: number, c?: boolean }
 *   type test4 = NonUndefinedableByKeys<Temp, 'c'>
 * ```
 */
export type NonUndefinedableByKeys<Target, Keys> = ObjectPrettify<
NonUndefinedableAllKeys<Pick<Target, SetIntersection<RequiredKeys<Target>, Keys>>>
& Pick<Target, SetDifference<RequiredKeys<Target>, Keys>>
& Partial<NonUndefinedableAllKeys<Pick<Target, SetIntersection<OptionalKeys<Target>, Keys>>>>
& Pick<Target, SetDifference<OptionalKeys<Target>, Keys>>
>

/**
 * @example
 * ```
 *   interface Temp { a: string | null, b: number, c?: boolean | null }
 *   // Expect to be: { a: string, b: number, c?: boolean }
 *   type test1 = NonNullableAllKeys<Temp>
 * ```
 */
export type NonNullableAllKeys<Target> = {
  [Key in keyof Target]: NonNullable<Target[Key]>
}
/**
 * @example
 * ```
 *   interface Temp { a: string | null, b: number, c?: boolean }
 *   // Expect to be: { a: string, b: number, c?: boolean }
 *   type test1 = NonNullableByKeys<Temp, 'a'>
 *   type test2 = NonNullableByKeys<Temp, 'a' | 'b'>
 *
 *   interface Temp { a: string | null, b: number, c?: boolean | null }
 *   // Expect to be: { a: string, b: number, c?: boolean }
 *   type test3 = NonNullableByKeys<Temp, 'a' | 'c'>
 *   // Expect to be: { a: string | null, b: number, c?: boolean }
 *   type test4 = NonNullableByKeys<Temp, 'c'>
 * ```
 */
export type NonNullableByKeys<Target, Keys> = ObjectPrettify<
NonNullableAllKeys<Pick<Target, SetIntersection<RequiredKeys<Target>, Keys>>>
& Pick<Target, SetDifference<RequiredKeys<Target>, Keys>>
& Partial<NonNullableAllKeys<Pick<Target, SetIntersection<OptionalKeys<Target>, Keys>>>>
& Pick<Target, SetDifference<OptionalKeys<Target>, Keys>>
>

/**
 * @example
 * ```
 *   interface Temp { a: string | null | undefined, b: number, c?: boolean | null }
 *   // Expect to be: { a: string, b: number, c?: boolean }
 *   type test1 = NonNilableAllKeys<Temp>
 * ```
 */
export type NonNilableAllKeys<Target> = {
  [Key in keyof Target]: NonNilable<Target[Key]>
}

/**
 * @example
 * ```
 *   interface Temp { a: string | null | undefined, b: number, c?: boolean }
 *   // Expect to be: { a: string, b: number, c?: boolean }
 *   type test1 = NonNilableByKeys<Temp, 'a'>
 *   type test2 = NonNilableByKeys<Temp, 'a' | 'b'>
 *
 *   interface Temp { a: string | null | undefined, b: number, c?: boolean | null | undefined }
 *   // Expect to be: { a: string, b: number, c?: boolean }
 *   type test3 = NonNilableByKeys<Temp, 'a' | 'c'>
 *   // Expect to be: { a: string | null | undefined, b: number, c?: boolean }
 *   type test4 = NonNilableByKeys<Temp, 'c'>
 * ```
 */
export type NonNilableByKeys<Target, Keys> = ObjectPrettify<
NonNilableAllKeys<Pick<Target, SetIntersection<RequiredKeys<Target>, Keys>>>
& Pick<Target, SetDifference<RequiredKeys<Target>, Keys>>
& Partial<NonNilableAllKeys<Pick<Target, SetIntersection<OptionalKeys<Target>, Keys>>>>
& Pick<Target, SetDifference<OptionalKeys<Target>, Keys>>
>

/**
 * @example
 * ```
 *  interface Temp { a?: string | undefined, b?: number, c?: boolean }
 *  // Expect to be: { readonly a: string | undefined, readonly b: number, readonly c: boolean }
 *  type test1 = ReadonlyAllKeys<Temp>
 * ```
 */
export type ReadonlyAllKeys<Target> = {
  +readonly [Key in keyof Target]: Target[Key]
}
/**
 * @example
 * ```
 *  interface Temp { a?: string | undefined, b?: number, c?: boolean }
 *  // Expect to be: { readonly a: string | undefined, readonly b: number, readonly c: boolean }
 *  type test1 = ReadonlyByKeys<Temp, 'a' | 'b' | 'c'>
 * ```
 */
export type ReadonlyByKeys< Target, Keys> = ObjectPrettify<
ReadonlyAllKeys<Pick<Target, SetIntersection<keyof Target, Keys>>> & Pick<Target, SetDifference<keyof Target, Keys>>
>

/**
 * @example
 * ```
 *  interface Temp { readonly a?: string | undefined, readonly b?: number, readonly c?: boolean }
 *  // Expect to be: { a: string | undefined, b: number, c: boolean }
 *  type test1 = WritableAllKeys<Temp>
 * ```
 */
export type WritableAllKeys<Target> = {
  -readonly [Key in keyof Target]: Target[Key]
}
/**
 * @example
 * ```
 *  interface Temp { readonly a?: string | undefined, readonly b?: number, readonly c?: boolean }
 *  // Expect to be: { a: string | undefined, b: number, c: boolean }
 *  type test1 = WritableByKeys<Temp, 'a' | 'b' | 'c'>
 * ```
 */
export type WritableByKeys< Target, Keys> = ObjectPrettify<
WritableAllKeys<Pick<Target, SetIntersection<keyof Target, Keys>>> & Pick<Target, SetDifference<keyof Target, Keys>>
>

/**
 * @example
 * ```
 *  interface Temp { a?: string | undefined, b?: number, c?: boolean }
 *  // Expect to be: { a: string | undefined, b: number, c: boolean }
 *  type test1 = RequiredAllKeys<Temp>
 * ```
 */
export type RequiredAllKeys<Target> = {
  [Key in keyof Target]-?: Target[Key]
}
/**
 * @example
 * ```
 *  interface Temp { a?: string | undefined, b?: number, c?: boolean }
 *  // Expect to be: { a: string | undefined, b: number, c: boolean }
 *  type test1 = RequiredByKeys<Temp, 'a' | 'b' | 'c'>
 * ```
 */
export type RequiredByKeys< Target, Keys> = ObjectPrettify<
RequiredAllKeys<Pick<Target, SetIntersection<keyof Target, Keys>>> & Pick<Target, SetDifference<keyof Target, Keys>>
>

/**
 * @example
 * ```
 *  interface Temp { a: string | undefined, b: number, c?: boolean | undefined }
 *  // Expect to be: { a?: string | undefined, b?: number, c?: boolean | undefined }
 *  type test1 = OptionalAllKeys<Temp>
 * ```
 */
export type OptionalAllKeys<Target> = {
  [Key in keyof Target]+?: Target[Key]
}
/**
 * @example
 * ```
 *  interface Temp { a: string | undefined, b: number, c?: boolean | undefined }
 *  // Expect to be: { a?: string | undefined, b?: number, c?: boolean }
 *  type test1 = OptionalByKeys<Temp, 'a' | 'b' | 'c'>
 * ```
 */
export type OptionalByKeys<Target, Keys> = ObjectPrettify<
OptionalAllKeys<Pick<Target, SetIntersection<keyof Target, Keys>>> & Pick<Target, SetDifference<keyof Target, Keys>>
>

/**
 * Given a type `{ a?: string, b: number }`, return `{ a: string, b?: number }`.
 *
 * @see {@link ReverseRequired}
 * @see Reference - The solution is refer to https://stackoverflow.com/questions/57593022/reverse-required-and-optional-properties
 */
export type ReverseOptional<Target> = ObjectPrettify<
Required<Pick<Target, OptionalKeys<Target>>> & OptionalAllKeys<Omit<Target, OptionalKeys<Target>>>
>
/**
  * @see {@link ReverseOptional}
  */
export type ReverseRequired<Target> = ReverseOptional<Target>

/**
  * @example
  * ```
  *   interface Temp { a: string, b?: number, c?: boolean }
  *
  *   // Expect: { a: string, b: number, c?: boolean }
  *   type test1 = ReverseOptionalByKeys<Temp, 'b'>
  * ```
  */
export type ReverseOptionalByKeys<Target, Keys extends keyof Target> = ObjectPrettify<
Omit<Target, Keys> & ReverseOptional<Pick<Target, Keys>>
>
/**
  * @see {@link ReverseOptionalByKeys}
  */
export type ReverseRequiredByKeys<Target, Keys extends keyof Target> = ReverseOptionalByKeys<Target, Keys>

/**
 * ObjectValues
 * @description Get the union type of all the values in target object.
 * @example
 * ```
 *   interface Props { name: string, age: number, visible: boolean }
 *   // Expect: 'name' | 'age' | 'visible'
 *   type Keys = ObjectKeys<Props>
 * ```
 */
export type ObjectKeys<Target> = Target extends AnyHybridRecord ? keyof Target : never

/**
 * ObjectValues
 * @description Get the union type of all the values in target object.
 * @example
 * ```
 *   interface Props { name: string, age: number, visible: boolean }
 *   // Expect: string | number | boolean
 *   type PropsValues = ObjectValues<Props>
 * ```
 */
export type ObjectValues<Target> = Target extends AnyHybridRecord ? Target[keyof Target] : never

/**
 * FunctionKeys
 * @description Get union type of keys that are functions in object type `Target`
 * @example
 * ```
 *  type MixedProps = {name: string; setName: (name: string) => void; someKeys?: string; someFn?: (...args: any) => any;};
 *
 *   // Expect: "setName | someFn"
 *   type Keys = FunctionKeys<MixedProps>
 * ```
 * @see Copyright - The code is copy from {@link https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts}
 */
export type FunctionKeys<Target extends AnyHybridRecord> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [Key in keyof Target]-?: NonUndefinedable<Target[Key]> extends Function ? Key : never;
}[keyof Target]

/**
 * NonFunctionKeys
 * @description Get union type of keys that are non-functions in object type `Target`
 * @example
 * ```
 *   type MixedProps = {name: string; setName: (name: string) => void; someKeys?: string; someFn?: (...args: any) => any;};
 *
 *   // Expect: "name | someKey"
 *   type Keys = NonFunctionKeys<MixedProps>
 * ```
 * @see Copyright - The code is copy from {@link https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts}
 */
export type NonFunctionKeys<Target extends AnyHybridRecord> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [Key in keyof Target]-?: NonUndefinedable<Target[Key]> extends Function ? never : Key;
}[keyof Target]

/**
 * WARNING: https://github.com/ts-essentials/ts-essentials/blob/5aa1f264e77fb36bb3f673c49f00927c7c181a7f/lib/types.ts#L440
 * @see https://stackoverflow.com/a/52473108/1815209 with comments
 */
type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : B
/**
 * ReadonlyKeys
 * @description Get union type of keys that are readonly in object type `Target`
 * Credit: Matt McCutchen
 * https://stackoverflow.com/questions/52443276/how-to-exclude-getter-only-properties-from-type-in-typescript
 * @example
 * ```
 *   type Props = { readonly foo: string; bar: number };
 *
 *   // Expect: "foo"
 *   type Keys = ReadonlyKeys<Props>
 * ```
 * @see Copyright - The code is copy from {@link https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts}
 */
export type ReadonlyKeys<Target extends AnyHybridRecord> = {
  [Key in keyof Target]-?: IfEquals<{ [Q in Key]: Target[Key] }, { -readonly [Q in Key]: Target[Key] }, never, Key>
}[keyof Target]
/**
 * WritableKeys
 * @description Get union type of keys that are mutable in object type `Target`
 * Credit: Matt McCutchen
 * https://stackoverflow.com/questions/52443276/how-to-exclude-getter-only-properties-from-type-in-typescript
 * @example
 * ```
 *   interface Props { readonly foo: string, bar: number }
 *
 *   // Expect: "bar"
 *   type Keys = WritableKeys<Props>
 * ```
 * @see Copyright - The code is copy from {@link https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts}
 */
export type WritableKeys<Target extends AnyHybridRecord> = {
  [Key in keyof Target]-?: IfEquals<{ [Q in Key]: Target[Key] }, { -readonly [Q in Key]: Target[Key] }, Key, never>
}[keyof Target]

/**
 * RequiredKeys
 * @description Get union type of keys that are required in object type `Target`
 * @see https://stackoverflow.com/questions/52984808/is-there-a-way-to-get-all-required-properties-of-a-typescript-object
 * @example
 * ```
 *   type Props = { req: number; reqUndef: number | undefined; opt?: string; optUndef?: number | undefined; };
 *
 *   // Expect: "req" | "reqUndef"
 *   type Keys = RequiredKeys<Props>
 * ```
 * @see Copyright - The code is copy from {@link https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts}
 */
export type RequiredKeys<Target> = {
  [Key in keyof Target]-?: Record<string | number | symbol, never> extends Pick<Target, Key> ? never : Key;
}[keyof Target]

/**
 * OptionalKeys
 * @description Get union type of keys that are optional in object type `Target`
 * @see https://stackoverflow.com/questions/52984808/is-there-a-way-to-get-all-required-properties-of-a-typescript-object
 * @example
 * ```
 *   type Props = { req: number; reqUndef: number | undefined; opt?: string; optUndef?: number | undefined; };
 *
 *   // Expect: "opt" | "optUndef"
 *   type Keys = OptionalKeys<Props>
 * ```
 * @see Copyright - The code is copy from {@link https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts}
 */
export type OptionalKeys<Target> = {
  [Key in keyof Target]-?: Record<string | number | symbol, never> extends Pick<Target, Key> ? Key : never;
}[keyof Target]

/**
 * PickKeysByValue
 * @example
 * ```
 *   interface Temp { req: number, reqUndef: number | undefined, opt?: string }
 *   // Expect: 'req'
 *   type test1 = PickKeysByValue<Temp, number>
 *   // Expect: 'req' | 'reqUndef'
 *   type test2 = PickKeysByValue<Temp, number | undefined>
 * ```
 * @attention (For ALL `ByValue` utilities) When we want to get 'opt' as result in above example, `PickKeysByValue<Temp, string>`
 *            will not work. We should use `PickKeysByValue<Temp, string | undefined>` instead. It's so weird that we don't always
 *            know whether the target key is optional or not in actual most of situations so we have to include `undefined`
 *            in the target matching `ValueType`'s union. It's unnecessary and redundant.
 *
 *            On the other hand, normal keys and optional keys are quite different. We indeed need an approach to
 *            distinguish them. Seems like add `undefined` to the union of optional keys' value type is a reasonable way.
 *
 *            Here our final choice is give `undefined` a chance until we get a more fantastic solution. Meanwhile, turn the
 *            `exactOptionalPropertyTypes: true` typescript's compiler option on. It will make the use of `undefined` on optional
 *            properties more reasonable. For more information on it: see {@link https://www.typescriptlang.org/tsconfig#exactOptionalPropertyTypes},
 *            there's also a use guide on that information, see {@link https://tkdodo.eu/blog/optional-vs-undefined}.
 */
export type PickKeysByValue<Target, ValueType> = {
  [Key in keyof Target]-?: Target[Key] extends ValueType ? Key : never
}[keyof Target]

/**
 * PickByValue
 * @description From `Target` pick a set of properties by value matching `ValueType`.
 * Credit: [Piotr Lewandowski](https://medium.com/dailyjs/typescript-create-a-condition-based-subset-types-9d902cea5b8c)
 * @example
 * ```
 *   interface Temp { req: number, reqUndef: number | undefined, opt?: string }
 *
 *   // Expect: { req: number }
 *   type test1 = PickByValue<Temp, number>
 *   // Expect: { req: number; reqUndef: number | undefined; }
 *   type test2 = PickByValue<Temp, number | undefined>
 * ```
 * @see
 */
export type PickByValue<Target, ValueType> = Pick<Target, PickKeysByValue<Target, ValueType>>

/**
 * PickKeysByValue
 * @example
 * ```
 *   interface Temp { req: number, reqUndef: number | undefined, opt?: string }
 *   // Expect: 'req'
 *   type test1 = PickKeysByValue<Temp, number>
 *   // Expect: 'reqUndef'
 *   type test2 = PickKeysByValue<Temp, number | undefined>
 * ```
 */
export type PickKeysByValueExact<Target, ValueType> = {
  [Key in keyof Target]-?: [ValueType] extends [Target[Key]] ? ([Target[Key]] extends [ValueType] ? Key : never) : never;
}[keyof Target]

/**
 * PickByValueExact
 * @description From `Target` pick a set of properties by value matching exact `ValueType`.
 * @example
 * ```
 *   interface Temp { req: number, reqUndef: number | undefined, opt?: string }
 *
 *   // Expect: { req: number }
 *   type test1 = PickByValueExact<Temp, number>
 *   // Expect: { reqUndef: number | undefined; }
 *   type test2 = PickByValueExact<Temp, number | undefined>
 * ```
 * @see Copyright - The code is copy from {@link https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts}
 */
export type PickByValueExact<Target, ValueType> = Pick<Target, PickKeysByValueExact<Target, ValueType>>

/**
 * OmitByValue
 * @description From `Target` remove a set of properties by value matching `ValueType`.
 * Credit: [Piotr Lewandowski](https://medium.com/dailyjs/typescript-create-a-condition-based-subset-types-9d902cea5b8c)
 * @example
 * ```
 *   interface Temp { req: number, reqUndef: number | undefined, opt?: string }
 *
 *   // Expect: { reqUndef: number | undefined; opt?: string; }
 *   type test1 = OmitByValue<Temp, number>
 *   // Expect: { opt?: string; }
 *   type test2 = OmitByValue<Temp, number | undefined>
 * ```
 * @see
 */
export type OmitByValue<Target, ValueType> = Omit<Target, PickKeysByValue<Target, ValueType>>

/**
 * OmitByValueExact
 * @description From `Target` remove a set of properties by value matching exact `ValueType`.
 * @example
 * ```
 *   interface Temp { req: number, reqUndef: number | undefined, opt?: string }
 *
 *   // Expect: { reqUndef: number | undefined; opt?: string; }
 *   type test1 = OmitByValueExact<Temp, number>
 *   // Expect: { req: number; opt?: string }
 *   type test2 = OmitByValueExact<Temp, number | undefined>
 * ```
 * @see Copyright - The code is copy from {@link https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts}
 */
export type OmitByValueExact<Target, ValueType> = Omit<Target, PickKeysByValueExact<Target, ValueType>>

/**
 * ObjectIntersection
 * @description From `T` pick properties that exist in `U`.
 * @example
 * ```
 *   type Props = { name: string; age: number; visible: boolean };
 *   type DefaultProps = { age: number };
 *
 *   // Expect: { age: number; }
 *   type DuplicateProps = ObjectIntersection<Props, DefaultProps>
 * ```
 * @see Copyright - The code is copy from {@link https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts}
 */
export type ObjectIntersection<T extends AnyHybridRecord, U extends AnyHybridRecord> = Pick<T, SetIntersection<keyof T, keyof U>>

/**
 * ObjectDifference
 * @description From `T` remove properties that exist in `U`.
 * @example
 * ```
 *   type Props = { name: string; age: number; visible: boolean };
 *   type DefaultProps = { age: number };
 *
 *   // Expect: { name: string; visible: boolean; }
 *   type DiffProps = ObjectDifference<Props, DefaultProps>
 * ```
 * @see Copyright - The code is copy from {@link https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts}
 */
export type ObjectDifference<T extends AnyHybridRecord, U extends AnyHybridRecord> = Pick<T, SetDifference<keyof T, keyof U>>

/**
 * ObjectComplement
 * @description From `T` remove properties that exist in `SuperT` (`SuperT` has a subset of the properties of `T`)
 * @example
 * ```
 *   type Props = { name: string; age: number; visible: boolean };
 *   type DefaultProps = { age: number };
 *
 *   // Expect: { name: string; visible: boolean; }
 *   type RestProps = ObjectComplement<Props, DefaultProps>
 * ```
 * @see Copyright - The code is copy from {@link https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts}
 */
export type ObjectComplement<T extends SuperT, SuperT extends AnyHybridRecord> = Pick<T, SetComplement<keyof T, keyof SuperT>>

/**
 * ObjectSymmetricDifference
 * @example
 * ```
 *   interface PropsA { name: string, age: number, visible: boolean }
 *   interface PropsB { age: number, sex: string }
 *
 *   // Expect: { name: string; visible: boolean; sex: string };
 *   type ResultProps = ObjectSymmetricDifference<PropsA, PropsB>
 *   // Expect: 'name' | 'visible' | 'sex'
 *   type ResultProps = keyof ObjectSymmetricDifference<PropsA, PropsB>
 * ```
 */
export type ObjectSymmetricDifference<T extends AnyHybridRecord, U extends AnyHybridRecord> = ObjectPrettify<
ObjectDifference<T, U> & ObjectDifference<U, T>
>

/**
 * ObjectOverwrite
 * @description From `U` overwrite properties to `T`.
 * @example
 * ```
 *   interface Props { name: string, age: number, visible: boolean }
 *   interface NewProps { age: string, other: string }
 *
 *   // Expect: { name: string; age: string; visible: boolean; }
 *   type ReplacedProps = ObjectOverwrite<Props, NewProps>
 * ```
 * @see Copyright - The code is copy from {@link https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts}
 */
export type ObjectOverwrite<Target extends AnyHybridRecord, Patch extends AnyHybridRecord> = ObjectPrettify<
ObjectDifference<Target, Patch> & ObjectIntersection<Patch, Target>
>

/**
 * ObjectAssign
 * @description From `U` assign properties to `T` (just like object assign).
 * @example
 * ```
 *   interface Props { name: string, age: number, visible: boolean }
 *   interface NewProps { age: string, other: string }
 *
 *   // Expect: { name: string; age: string; visible: boolean; other: string; }
 *   type ExtendedProps = ObjectAssign<Props, NewProps>
 * ```
 * @see Copyright - The code is copy from {@link https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts}
 */
export type ObjectAssign<Target extends AnyHybridRecord, Patch extends AnyHybridRecord> = ObjectPrettify<
// ObjectDifference<Target, Patch> & ObjectIntersection<Patch, Target> & ObjectDifference<Patch, Target>
Omit<Target, keyof Patch> & Patch
>
/**
 * Alias for `ObjectAssign`, defined for semantic of `ObjectMergeN`.
 * @see {@link ObjectAssign}
 */
export type ObjectMerge<Target extends AnyHybridRecord, Patch extends AnyHybridRecord> = ObjectAssign<Target, Patch>

/**
 * __internal type__, defined for `ObjectMergeN`.
 * @see {@link ObjectMergeN}
 */
type _ObjectMergeN<Targets extends any[], Result> = Targets extends [infer Head, ...infer Tail] ?
  _ObjectMergeN<Tail, ObjectMerge<Result, Head>> : Result
/**
 * @example
 * ```
 *   interface a { a: string }
 *   interface b { readonly b: string }
 *   interface c { c?: string }
 *   // Expect: { a: string; readonly b: string; c?: string; }
 *   type Result = ObjectMergeN<[a, b, c]>
 * ```
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export type ObjectMergeN<Targets extends AnyHybridRecord[]> = ObjectPrettify<_ObjectMergeN<Targets, {}>>

/**
 * ObjectUnionize
 * @desc Disjoin object to form union of objects, each with single property.
 * @example
 * ```
 *   interface Props { name: string, age: number, visible: boolean }
 *
 *   // Expect: { name: string; } | { age: number; } | { visible: boolean; }
 *   type UnionizedType = ObjectUnionize<Props>
 * ```
 * @see Copyright - The code is copy from {@link https://github.com/piotrwitek/utility-types/blob/master/src/mapped-types.ts}
 */
export type ObjectUnionize<Target extends AnyHybridRecord> = {
  [Key in keyof Target]: { [Q in Key]: Target[Key] };
}[keyof Target]

/**
 * @example
 * ```
 *   interface Temp {
 *     readonly grandpa: {
 *       readonly name: string
 *       father?: {
 *         readonly name?: string
 *         son: {
 *           readonly name?: string
 *         }
 *       }
 *     }
 *   }
 *   // Expect: { grandpa?: { name?: string, father?: { name?: string, son?: { name?: string } } } }
 *   type test1 = ObjectDeepWritable<Temp>
 * ```
 */
export type ObjectDeepWritable<Target extends AnyStringRecord> = {
  -readonly [Key in keyof Target]: Target[Key] extends (AnyStringRecord | undefined) ?
    ObjectDeepWritable<NonUndefinedable<Target[Key]>> : Target[Key];
}

/**
 * @example
 * ```
 *   interface Temp {
 *     grandpa: {
 *       name: string
 *       father?: {
 *         name?: string
 *         son: {
 *           name?: string
 *         }
 *       }
 *     }
 *   }
 *   // Expect: { readonly grandpa?: {
 *   //             readonly name?: string, readonly father?: { readonly name?: string, readonly son?: { readonly name?: string } }
 *   //         } }
 *   type test1 = ObjectDeepReadonly<Temp>
 * ```
 */
export type ObjectDeepReadonly<Target extends AnyStringRecord> = {
  +readonly [Key in keyof Target]: Target[Key] extends (AnyStringRecord | undefined) ?
    ObjectDeepReadonly<NonUndefinedable<Target[Key]>> : Target[Key];
}

/**
 * @example
 * ```
 *   interface Temp {
 *     grandpa: {
 *       name: string
 *       father?: {
 *         name?: string
 *         son: {
 *           name?: string
 *         }
 *       }
 *     }
 *   }
 *   // Expect: { grandpa: { name: string, father: { name: string, son: { name: string } } } }
 *   type test1 = ObjectDeepRequired<Temp>
 * ```
 */
export type ObjectDeepRequired<Target extends AnyStringRecord> = {
  [Key in keyof Target]-?: Target[Key] extends (AnyStringRecord | undefined) ?
    ObjectDeepRequired<NonUndefinedable<Target[Key]>> : Target[Key];
}

/**
 * @example
 * ```
 *   interface Temp {
 *     grandpa: {
 *       name: string
 *       father?: {
 *         name?: string
 *         son: {
 *           name?: string
 *         }
 *       }
 *     }
 *   }
 *   // Expect: { grandpa?: { name?: string, father?: { name?: string, son?: { name?: string } } } }
 *   type test1 = ObjectDeepOptional<Temp>
 * ```
 */
export type ObjectDeepOptional<Target extends AnyStringRecord> = {
  [Key in keyof Target]+?: Target[Key] extends (AnyStringRecord | undefined) ?
    ObjectDeepOptional<NonUndefinedable<Target[Key]>> : Target[Key];
}

/**
 * If the `Target` is an empty Record/Object, then return `never`.
 * @see example - For usecases, see {@link https://github.com/ts-essentials/ts-essentials#nonemptyobject}
 */
export type ObjectNonEmpty<Target extends AnyStringRecord> = keyof Target extends never ? never : Target

/**
 * ObjectNamedKeys
 * @example
 * ```
 *   interface Temp {
 *     name: string
 *     age?: number
 *     [key: string]: string | number
 *   }
 *   // Expect: 'name' | 'age'
 *   type test1 = ObjectNamedKeys<Temp>
 * ```
 * @see Copyright - The code is copy from {@link https://github.com/millsp/ts-toolbelt/blob/319e55123b9571d49f34eca3e5926e41ca73e0f3/sources/Any/KnownKeys.ts#L11}
 * @see Issue - https://github.com/millsp/ts-toolbelt/issues/164
 * @see Reference - https://stackoverflow.com/questions/51465182/how-to-remove-index-signature-using-mapped-types/51956054#51956054
 */
export type ObjectNamedKeys<Target> = keyof {
  [Key in keyof Target as (
    string extends Key ? never : number extends Key ? never : symbol extends Key ? never : Key
  )]: Target[Key]
}
export type ObjectNamedParts<Target> = ObjectPrettify<Pick<Target, ObjectNamedKeys<Target>>>
export type ObjectIndexedParts<Target> = ObjectPrettify<Omit<Target, ObjectNamedKeys<Target>>>
export type ObjectHasNamedKeys<Target> = ObjectNamedKeys<Target> extends never ? false : true
export type ObjectHasIndexedKeys<Target> = keyof ObjectIndexedParts<Target> extends never ? false : true
