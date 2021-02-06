const _fingerPrint = 'mobius'.split('')

/**
 * @param seed String, default to 'unique'
 * @return String
 */
export const makeUniqueString = (seed = 'unique') => {
  _fingerPrint.unshift(_fingerPrint.pop())
  const fingerPrint = _fingerPrint.join('')
  return `${seed}--${+new Date()}-${fingerPrint}`
}
