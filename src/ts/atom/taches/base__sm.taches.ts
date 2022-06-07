import { isArray, isPlainObject, isFunction } from '../../internal/base'

import { Data, Mutation, isAtomLike, DEFAULT_MUTATION_OPTIONS } from '../atoms'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type {
  MutatorOriginalTransformationUnion
} from '../particles'
import type { MutationOptions, AtomLikeOfOutput } from '../atoms'

// S -> Single, M -> Multi

/******************************************************************************************************
 *
 *                                           SM Tache
 *
 ******************************************************************************************************/

/**
 *
 */
interface ArraySMTacheConfig<P> {
  transformation: MutatorOriginalTransformationUnion<P, any>
  options?: MutationOptions<P, any>
}
export type ArraySMTache<P = any> = (source: AtomLikeOfOutput<P>) => Array<Data<any>>
/**
 * @param configArr `[{ transformation, options }, ...]`
 * @return { ArraySMTache<P> } ArraySSTache :: `(source) => Array<Data<any>>`
 */
export const createArraySMTache = <P>(configArr: Array<ArraySMTacheConfig<P>>): ArraySMTache<P> => {
  if (!isArray(configArr)) {
    throw (new TypeError('"configArr" is expected to be type of "Array".'))
  }

  // format configs
  configArr = configArr.map(({ transformation, options = {} }) => {
    if (!isFunction(transformation)) {
      throw (new TypeError('"transformation" is expected to be type of "Function".'))
    }
    options = { ...DEFAULT_MUTATION_OPTIONS, ...options }
    return { transformation, options }
  })

  /**
   * @param source Atom
   * @return { Data<any> } Array of Data
   */
  return source => {
    if (!isAtomLike(source)) {
      throw (new TypeError('"source" is expected to be type of "AtomLike".'))
    }

    const mutations = configArr.map(({ transformation, options }) => {
      return Mutation.ofLift(transformation, options)
    })
    const outputs = Array.from({ length: configArr.length }).map(() => Data.empty<any>())

    outputs.forEach((output, index) => {
      pipeAtom(mutations[index], output)
      binaryTweenPipeAtom(source, mutations[index])
    })

    return outputs
  }
}

interface ObjectSMTacheConfig<P> {
  transformation: MutatorOriginalTransformationUnion<P, any>
  options?: MutationOptions<P, any>
}
export type ObjectSMTache<P = any> = (source: AtomLikeOfOutput<P>) => Record<string, Data<any>>
/**
 * @param configObj `{ [key: string]: { transformation, options? } }`
 * @return { ObjectSMTache<P> } ObjectSSTache :: `(source) => Record<string, Data<any>>`
 */
export const createObjectSMTache = <P>(configObj: Record<string, ObjectSMTacheConfig<P>>): ObjectSMTache<P> => {
  if (!isPlainObject(configObj)) {
    throw (new TypeError('"configObj" is expected to be type of "PlainObject".'))
  }

  // // format configs
  configObj = Object.entries(configObj).reduce<(typeof configObj)>(
    (acc, [name, { transformation, options = {} }]) => {
      if (!isFunction(transformation)) {
        throw (new TypeError('"transformation" is expected to be type of "Function".'))
      }

      acc[name] = acc[name] ?? { transformation, options: { ...DEFAULT_MUTATION_OPTIONS, ...options } }

      return acc
    }
  , {})

  /**
   * @param source Atom
   * @return Object of Data
   */
  return source => {
    if (!isAtomLike(source)) {
      throw (new TypeError('"source" is expected to be type of "AtomLike".'))
    }

    const mutations = Object.entries(configObj).reduce<Record<string, Mutation<P, any>>>(
      (acc, [name, { transformation, options }]) => {
        acc[name] = acc[name] ?? Mutation.ofLift(transformation, options)
        return acc
      }
      , {})

    const outputs = Object.entries(configObj).reduce<Record<string, Data<any>>>((acc, [name]) => {
      acc[name] = acc[name] ?? Data.empty()
      return acc
    }, {})

    Object.entries(outputs).forEach(([name, output]) => {
      pipeAtom(mutations[name], output)
      binaryTweenPipeAtom(source, mutations[name])
    })

    return outputs
  }
}

interface ICreateSMTache {
  <P>(config: Array<ArraySMTacheConfig<P>>): ArraySMTache<P>
  <P>(config: Record<string, ObjectSMTacheConfig<P>>): ObjectSMTache<P>
}
/**
 * @return TacheMaker
 */
export const createSMTache: ICreateSMTache = (config: any): any => {
  if (isPlainObject(config)) {
    return createObjectSMTache(config)
  } else if (isArray<any>(config)) {
    return createArraySMTache(config)
  } else {
    throw (new TypeError('"config" is expected to be type of "Array" | "PlainObject".'))
  }
}
