
/**
 * Use spread operator to spread the iterable target into the array.
 */
export const spreadToArray = <T = any>(target: Iterable<T>): T[] => [...target]

/**
 * Returns the length of `targetArray`.
 */
export const arrayLength = (targetArray: any[]): number => {
  return targetArray.length
}

/**
 * Returns a copy of `targetArray` in which last element has been removed.
 * New array's length is `targetArray.length - 1`.
 * @see {@link arrayPush}, {@link arrayShift}
 */
export const arrayPop = <T = any>(targetArray: T[]): T[] => {
  return targetArray.slice(0, -1)
}

/**
 * Returns a copy of `targetArray` in which inserts the given `item` as new last item.
 * New array's length is `targetArray.length + 1`.
 * @see {@link arrayPop}, {@link arrayUnshift}, {@link arrayAppend}
 */
export const arrayPush = <T = any>(item: T, targetArray: T[]): T[] => {
  return [...targetArray, item]
}

/**
 * Returns a new array containing the contents of the given array, followed by the given element.
 * @see {@link https://ramdajs.com/docs/#append}
 * @see {@link arrayPush}, {@link arrayPrepend}
 */
export const arrayAppend = arrayPush

/**
 * Returns a copy of `targetArray` in which inserts the given `item` as new fist item.
 * New array's length is `targetArray`'s length + 1.
 * @see {@link arrayShift}, {@link arrayPush}, {@link arrayPrepend}
 */
export const arrayUnshift = <T = any>(item: T, targetArray: T[]): T[] => {
  return [item, ...targetArray]
}

/**
 * Returns a new array with the given element at the front, followed by the contents of the array.
 * @see {@link https://ramdajs.com/docs/#prepend}
 * @see {@link arrayUnshift}, {@link arrayAppend}
 */
export const arrayPrepend = arrayUnshift

/**
 * Returns a copy of `targetArray` in which first element has been removed.
 * New array's length is `targetArray`'s length - 1.
 * @see {@link arrayUnshift}, {@link arrayPop}
 */
export const arrayShift = <T = any>(targetArray: T[]): T[] => {
  return targetArray.slice(1)
}

/**
 * Returns the first element of `targetArray`.
 * @see {@link arrayTail}， {@link arrayLast}
 */
export const arrayHead = <T = any>(targetArray: T[]): T | undefined => {
  return targetArray[0]
}

/**
 * Returns the tail of `targetArray`.
 * @see {@link arrayHead}, {@link arrayInit}
 */
export const arrayTail = <T = any>(targetArray: T[]): T[] => {
  return targetArray.slice(1)
}

/**
 * Returns the init of `targetArray`.
 * @see {@link arrayLast}, {@link arrayTail}
 */
export const arrayInit = <T = any>(targetArray: T[]): T[] => {
  return targetArray.slice(0, -1)
}

/**
 * Returns the last element of `targetArray`.
 * @see {@link arrayInit}, {@link arrayHead}
 */
export const arrayLast = <T = any>(targetArray: T[]): T | undefined => {
  return targetArray[targetArray.length - 1]
}

/**
 * Returns a copy of a section of an array.
 * @see {@link Array.slice}, {@link arraySliceInit}, {@link arraySliceTail}
 */
export const arraySlice = <T = any>(
  start: number, end: number, targetArray: T[]
): T[] => {
  return targetArray.slice(start, end)
}
/**
 * Returns a copy of a section of an array.
 * @see {@link Array.slice}, {@link arraySlice}, {@link arraySliceTail}
 * @see {@link arrayDrop}
 */
export const arraySliceTail = <T = any>(
  start: number, targetArray: T[]
): T[] => {
  return targetArray.slice(start)
}
/**
 * @see {@link https://ramdajs.com/docs/#drop}
 * @see {@link arraySliceTail}
 */
export const arrayDrop = <T = any>(
  n: number, targetArray: T[]
): T[] => {
  return targetArray.slice(Math.abs(Math.round(n)))
}
/**
 * Returns a copy of a section of an array.
 * @see {@link Array.slice}, {@link arraySlice}, {@link arraySliceInit}
 */
export const arraySliceInit = <T = any>(
  end: number, targetArray: T[]
): T[] => {
  return targetArray.slice(0, Math.round(end))
}
/**
 * @see {@link https://ramdajs.com/docs/#dropLast}
 * @see {@link arraySliceInit}
 */
export const arrayDropLast = <T = any>(
  n: number, targetArray: T[]
): T[] => {
  return targetArray.slice(0, -Math.abs(Math.round(n)))
}

/**
 * Combines two array. `appendedArray` will be appended to the end of `targetArray`.
 * @see {@link Array.concat}
 */
export const arrayConcat = <T = any>(appendedArray: T[], targetArray: T[]): T[] => {
  return [...targetArray, ...appendedArray]
}

/**
 * Adds all the elements of an array into a string, separated by the specified separator string.
 * @see {@link Array.join}
 */
export const arrayJoin = (separator: string, targetArray: any[]): string => {
  return targetArray.join(separator)
}

/**
 * @see {@link Array.indexOf}
 */
export const arrayIndexOf = (searchElement: any, targetArray: any[]): number => {
  return targetArray.indexOf(searchElement)
}

/**
 * @see {@link Array.lastIndexOf}
 */
export const arrayLastIndexOf = (searchElement: any, targetArray: any[]): number => {
  return targetArray.lastIndexOf(searchElement)
}

/**
 * Predicate whether the target array includes the searchElement.
 * @see {@link Array.includes}
 */
export const arrayIncludes = <T = any>(searchElement: T, targetArray: T[]): boolean => {
  return targetArray.includes(searchElement)
}

/**
 * @see {@link Array.every}
 */
export function arrayEvery <T = any, S extends T = T> (
  predicate: (item: T, index: number, array: T[]) => item is S, targetArray: T[]
): targetArray is S[]
export function arrayEvery <T= any> (
  predicate: (item: T, index: number, array: T[]) => boolean, targetArray: T[]
): boolean
export function arrayEvery <T = any> (
  predicate: (item: T, index: number, array: T[]) => boolean, targetArray: T[]
): boolean {
  return targetArray.every((item, index, array) => predicate(item, index, array))
}

/**
 * @see {@link https://ramdajs.com/docs/#all}
 * @see {@link arrayEvery}
 */
export const arrayAll = arrayEvery

/**
 * @see {@link Array.some}
 */
export const arraySome = <T = any>(
  predicate: (item: T, index: number, array: T[]) => boolean, targetArray: T[]
): boolean => {
  return targetArray.some((item, index, array) => predicate(item, index, array))
}

/**
 * @see {@link https://ramdajs.com/docs/#any}
 * @see {@link arraySome}
 */
export const arrayAny = arraySome

/**
 * @see {@link Array.forEach}
 */
export const arrayForEach = <T = any>(
  callback: (item: T, index: number, array: T[]) => void, targetArray: T[]
): void => {
  return targetArray.forEach((item, index, array) => callback(item, index, array))
}

/**
 * @see {@link Array.filter}, {@link arrayReject}
 */
export function arrayFilter <T = any, S extends T = T> (
  predicate: (item: T, index: number, array: T[]) => item is S, targetArray: T[]
): S[]
export function arrayFilter <T = any> (
  predicate: (item: T, index: number, array: T[]) => boolean, targetArray: T[]
): T[]
export function arrayFilter <T = any> (
  predicate: (item: T, index: number, array: T[]) => boolean, targetArray: T[]
): T[] {
  return targetArray.filter((item, index, array) => predicate(item, index, array))
}

/**
 * @see {@link arrayFilter}
 */
export const arrayReject = <T = any>(
  predicate: (item: T, index: number, array: T[]) => boolean, targetArray: T[]
): T[] => {
  return targetArray.filter((item, index, array) => !predicate(item, index, array))
}

/**
 * @see {@link arrayFilter}, {@link arrayReject}
 */
export const arrayPartition = <T = any>(
  predicate: (item: T, index: number, array: T[]) => boolean, targetArray: T[]
): [T[], T[]] => {
  const truthyArray: T[] = []
  const falsyArray: T[] = []
  targetArray.forEach((item, index, array) => {
    if (predicate(item, index, array)) {
      truthyArray.push(item)
    } else {
      falsyArray.push(item)
    }
  })
  return [truthyArray, falsyArray]
}

/**
 * @see {@link Array.map}
 */
export const arrayMap = <T = any, R = any>(
  transformation: (item: T, index: number, array: T[]) => R,
  targetArray: T[]
): R[] => {
  return targetArray.map((item, index, array) => transformation(item, index, array))
}

/**
 * @see {@link Array.flat}, {@link arrayFlatMap}
 */
export const arrayFlat = <T = any, D extends number = number> (
  depth: D, targetArray: T[]
): Array<FlatArray<T[], D>> => {
  return targetArray.flat(depth)
}

/**
 * @see {@link Array.flatMap}, {@link arrayMap}, {@link arrayFlat}
 */
export const arrayFlatMap = <T = any, R = any>(
  transformation: (item: T, index: number, array: T[]) => (R | R[]), targetArray: T[]
): R[] => {
  return targetArray.flatMap((item, index, array) => transformation(item, index, array))
}

/**
 * @see {@link Array.reduce}, {@link arrayReduceLeft}, {@link arrayReduceRight}
 */
export const arrayReduce = <T = any, R = any>(
  reducer: (accumulated: R, item: T, index: number, array: T[]) => R,
  initialValue: R,
  targetArray: T[]
): R => {
  return targetArray.reduce((accumulated, item, index, array) => reducer(accumulated, item, index, array), initialValue)
}
/**
 * @see {@link Array.reduce}, {@link arrayReduceLeft}, {@link arrayReduceRight}
 */
export const arrayReduceLeft = arrayReduce
/**
 * @see {@link Array.reduce}, {@link arrayReduceLeft}, {@link arrayReduceRight}
 */
export const arrayReduceRight = <T = any, R = any>(
  reducer: (accumulated: R, item: T, index: number, array: T[]) => R,
  initialValue: R,
  targetArray: T[]
): R => {
  return targetArray.reduceRight((accumulated, item, index, array) => reducer(accumulated, item, index, array), initialValue)
}

/**
 * Returns a new array containing only one copy of each element in the original array.
 */
export const arrayUnique = <T = any>(targetArray: T[]): T[] => Array.from(new Set(targetArray))

/**
 * Combines two arrays into one array (no duplicates) composed of the elements of each array.
 * @see {@link https://ramdajs.com/docs/#union}
 * @see {@link arrayIntersection}
 */
export const arrayUnion = <T = any>(firstArray: T[], secondArray: T[]): T[] => {
  return arrayUnique([...firstArray, ...secondArray])
}

type CompareArray = (arr1: any[], arr2: any[]) => any[]
const _longer: CompareArray = (arr1, arr2) => arr1.length > arr2.length ? arr1 : arr2
const _shorter: CompareArray = (arr1, arr2) => arr1.length > arr2.length ? arr2 : arr1
/**
 * Combines two arrays into one array (no duplicates) composed of those elements common to both arrays.
 * @see {@link https://ramdajs.com/docs/#intersection}
 * @see {@link arrayUnion}
 */
export const arrayIntersection = <T = any>(firstArray: T[], secondArray: T[]): T[] => {
  // reference: ramda, it is more efficient when the array length gap is large
  const lookupArr = _longer(firstArray, secondArray)
  const filteredArr = _shorter(firstArray, secondArray)
  return arrayUnique(filteredArr.filter(item => lookupArr.includes(item)))
}

/**
 * @see {@link Array.reverse}
 */
export const arrayReverse = <T = any>(targetArray: T[]): T[] => {
  return [...targetArray].reverse()
}

/**
 * @param compareFunction `compareFunction` is expected to return
 * - a negative value if the first argument is less than the second,
 * - a positive value if it is greater than the second,
 * - or zero if they are equivalent.
 * @see {@link Array.sort}
 */
export const arraySort = <T = any>(
  compareFunction: (a: T, b: T) => number, targetArray: T[]
): T[] => {
  return [...targetArray].sort(compareFunction)
}

/**
 * Shuffle the target array.
 * @see https://github.com/mqyqingfeng/Blog/issues/51
 */
export const shuffle = <T = any>(target: T[]): T[] => {
  const _target = [...target]
  for (let i = _target.length; i !== 0; i--) {
    const j = Math.floor(Math.random() * i);
    [_target[i - 1], _target[j]] = [_target[j], _target[i - 1]]
  }
  return _target
}

/**
 * Applies a function to the value at the given index of an array,
 * returning a new copy of the array with the element at the given index
 * replaced with the result of the function application.
 * @see {@link https://ramdajs.com/docs/#adjust}
 */
export const arrayAdjust = <T = any>(
  index: number, transformation: (item: T) => T, targetArray: T[]
): T[] => {
  const _targetArray = [...targetArray]
  _targetArray[index] = transformation(_targetArray[index])
  return _targetArray
}

/**
 * Returns a new copy of the array with the element
 * at the provided index replaced with the given value.
 * @see {@link https://ramdajs.com/docs/#update}
 * @see {@link arrayAdjust}
 */
export const arrayUpdate = <T = any>(
  index: number, newItem: T, targetArray: T[]
): T[] => {
  return arrayAdjust(index, () => newItem, targetArray)
}
