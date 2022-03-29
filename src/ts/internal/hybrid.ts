import { arrayFilter } from './array'
import { isTruthy, isFalsy } from './boolean'

export const filterTruthy = <T = any>(targetArray: T[]): T[] => arrayFilter(isTruthy, targetArray)
export const filterFalsy = <T = any>(targetArray: T[]): T[] => arrayFilter(isFalsy, targetArray)
