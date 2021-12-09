import { isPlainObject, isFunction } from '../../internal/base'
import { looseCurryN } from '../../functional'

import { Data, Mutation } from '../atoms'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

// S -> Single, M -> Multi

/******************************************************************************************************
 *
 *                                           General Tache
 *
 ******************************************************************************************************/

type AnyStringRecord = Record<string, any>

/**
 *
 */
export interface TacheOptions extends AnyStringRecord {
}
export interface TacheLevelContexts extends AnyStringRecord {
}

const DEFAULT_TACHE_OPTIONS: TacheOptions = {}
const DEFAULT_TACHE_LEVEL_CONTEXTS: TacheLevelContexts = {}

type PrepareOptions<O extends TacheOptions = TacheOptions>
  = (options: O) => O
type PrepareTacheLevelContexts<TLC extends TacheLevelContexts = TacheLevelContexts>
  = () => TLC
type PrepareInput<
  O extends TacheOptions = TacheOptions, TLC extends TacheLevelContexts = TacheLevelContexts,
  S extends any[] = any[], In = any
>
  = (tacheOptions: O, tacheLevelContexts: TLC, sources: S) => In
type PrepareMidpiece<O extends TacheOptions = TacheOptions, TLC extends TacheLevelContexts = TacheLevelContexts, In = any, Mid = any>
  = (tacheOptions: O, tacheLevelContexts: TLC, inputs: In) => Mid
type PrepareOutput<O extends TacheOptions = TacheOptions, TLC extends TacheLevelContexts = TacheLevelContexts, Mid = any, Out = any>
  = (tacheOptions: O, tacheLevelContexts: TLC, midpiece: Mid) => Out
type connect<O extends TacheOptions = TacheOptions, TLC extends TacheLevelContexts = TacheLevelContexts, In = any, Mid = any, Out = any>
  = (tacheOptions: O, tacheLevelContexts: TLC, pieces: [In, Mid, Out]) => void

const DEFAULT_PREPARE_OPTIONS: PrepareOptions = () => DEFAULT_TACHE_OPTIONS
const DEFAULT_PREPARE_TACHE_LEVEL_CONTEXTS: PrepareTacheLevelContexts = () => DEFAULT_TACHE_LEVEL_CONTEXTS
const DEFAULT_PREPARE_INPUT: PrepareInput = (tacheOptions, tacheLevelContexts, sources) => sources
const DEFAULT_PREPARE_MIDPIECE: PrepareMidpiece = (tacheOptions, tacheLevelContexts, inputs) => Mutation.ofLiftBoth<any, any>(any => any)
const DEFAULT_PREPARE_OUTPUT: PrepareOutput = (tacheOptions, tacheLevelContexts, midpiece) => Data.empty<any>()
const DEFAULT_CONNET: connect = (tacheOptions, tacheLevelContexts, pieces) => {
  const [inputs, midpieces, outputs] = pieces
  pipeAtom(midpieces, outputs)
  binaryTweenPipeAtom(inputs, midpieces)
}

export interface GeneralTacheCreateOptions<
  O extends TacheOptions = TacheOptions, TLC extends TacheLevelContexts = TacheLevelContexts,
  S extends any[] = any[], In = any, Mid = any, Out = any
> {
  prepareOptions?: PrepareOptions<O>
  prepareTacheLevelContexts?: PrepareTacheLevelContexts<TLC>
  prepareInput?: PrepareInput<O, TLC, S, In>
  prepareMidpiece?: PrepareMidpiece<O, TLC, In, Mid>
  prepareOutput?: PrepareOutput<O, TLC, Mid, Out>
  connect?: connect<O, TLC, In, Mid, Out>
}

export const DEFAULT_GENERAL_TACHE_CREATE_OPTIONS: Required<GeneralTacheCreateOptions<any, any, any, any, any, any>> = {
  prepareOptions: DEFAULT_PREPARE_OPTIONS,
  prepareTacheLevelContexts: DEFAULT_PREPARE_TACHE_LEVEL_CONTEXTS,
  prepareInput: DEFAULT_PREPARE_INPUT,
  prepareMidpiece: DEFAULT_PREPARE_MIDPIECE,
  prepareOutput: DEFAULT_PREPARE_OUTPUT,
  connect: DEFAULT_CONNET
}

export type Tache<S extends any[] = any[], Out = any> = (...sources: S) => Out

/**
 * @param createOptions
 * @param [tacheOptions]
 * @return { Tache } tache :: `(...sources: any[]) => ReturnType<PrepareOutput>`
 */
export const createGeneralTache = <
  O extends TacheOptions = TacheOptions, TLC extends TacheLevelContexts = TacheLevelContexts,
  S extends any[] = any[], In = any, Mid = any, Out = any
>(
    createOptions: GeneralTacheCreateOptions<O, TLC, S, In, Mid, Out> | PrepareMidpiece<O, TLC, In, Mid>,
    tacheOptions: O = DEFAULT_TACHE_OPTIONS as O
  ): Tache<S, Out> => {
  if (!isPlainObject(createOptions) && !isFunction(createOptions)) {
    throw (new TypeError('"createOptions" is expected to be type of "PlainObject" | "Function".'))
  }
  if (!isPlainObject(tacheOptions)) {
    throw (new TypeError('"tacheOptions" is expected to be type of "PlainObject".'))
  }

  let preparedCreateOptions: Required<GeneralTacheCreateOptions<O, TLC, S, In, Mid, Out>>

  if (isFunction(createOptions)) {
    preparedCreateOptions = { ...DEFAULT_GENERAL_TACHE_CREATE_OPTIONS, prepareMidpiece: createOptions }
  } else {
    preparedCreateOptions = { ...DEFAULT_GENERAL_TACHE_CREATE_OPTIONS, ...createOptions }
  }

  const {
    prepareOptions, prepareTacheLevelContexts,
    prepareInput, prepareMidpiece, prepareOutput, connect
  } = preparedCreateOptions

  const _tacheLevelContexts = prepareTacheLevelContexts()
  if (!isPlainObject(_tacheLevelContexts)) {
    throw (new TypeError('"tacheLevelContexts" is expected to be type of "PlainObject".'))
  }
  const preparedTacheLevelContexts = { ...DEFAULT_TACHE_LEVEL_CONTEXTS as TLC, ..._tacheLevelContexts }

  const _tacheOptions = prepareOptions(tacheOptions)
  if (!isPlainObject(_tacheOptions)) {
    throw (new TypeError('The returned value of "prepareOptions" is expected to be type of "PlainObject".'))
  }
  const preparedTacheOptions = { ...DEFAULT_TACHE_OPTIONS as O, ..._tacheOptions }

  return (...sources) => {
    const inputs = prepareInput(preparedTacheOptions, preparedTacheLevelContexts, sources)
    const midpieces = prepareMidpiece(preparedTacheOptions, preparedTacheLevelContexts, inputs)
    const outputs = prepareOutput(preparedTacheOptions, preparedTacheLevelContexts, midpieces)
    connect(preparedTacheOptions, preparedTacheLevelContexts, [inputs, midpieces, outputs])
    return outputs
  }
}
export interface ICreateGeneralTache_ {
  <
    O extends TacheOptions = TacheOptions, TLC extends TacheLevelContexts = TacheLevelContexts,
    S extends any[] = any[], In = any, Mid = any, Out = any
  >(
    createOptions: GeneralTacheCreateOptions<O, TLC, S, In, Mid, Out> | PrepareMidpiece<O, TLC, In, Mid>,
    tacheOptions: O
  ): Tache<S, Out>
  <
    O extends TacheOptions = TacheOptions, TLC extends TacheLevelContexts = TacheLevelContexts,
    S extends any[] = any[], In = any, Mid = any, Out = any
  >(
    createOptions: GeneralTacheCreateOptions<O, TLC, S, In, Mid, Out> | PrepareMidpiece<O, TLC, In, Mid>
  ): (
    tacheOptions?: O
  ) => Tache<S, Out>
}
/**
 * @see {@link createGeneralTache}
 */
export const createGeneralTache_: ICreateGeneralTache_ = looseCurryN(2, createGeneralTache)

/**
 * @param tacheMaker partial applied createGeneralTache
 */
export const useGeneralTache = <O = any, S extends any[] = any[], Out = any>(
  tacheMaker: (options: O) => Tache<S, Out>, tacheOptions: O, ...sources: S
): Out => {
  const tache = tacheMaker(tacheOptions)
  const outputs = tache(...sources)
  return outputs
}

export interface IPartialUseGeneralTache_<O = any, S extends any[] = any[], Out = any> {
  (tacheOptions: O, ...sources: S): Out
  (tacheOptions: O): (...sources: S) => Out
}
export interface IUseGeneralTache_ {
  // pass all three arguments at one time
  <O = any, S extends any[] = any[], Out = any>
  (tacheMaker: (options: O) => Tache<S, Out>, tacheOptions: O, ...sources: S): Out
  // pass first two arguments then rest one, first two at one time
  <O = any, S extends any[] = any[], Out = any>
  (tacheMaker: (options: O) => Tache<S, Out>, tacheOptions: O): (...sources: S) => Out
  // pass first argument then rest two, rest two at one time
  // or pass all three arguments one by one
  <O = any, S extends any[] = any[], Out = any>
  (tacheMaker: (options: O) => Tache<S, Out>): IPartialUseGeneralTache_<O, S, Out>
}
/**
 * @see {@link useGeneralTache}
 */
export const useGeneralTache_: IUseGeneralTache_ = looseCurryN(3, useGeneralTache)
