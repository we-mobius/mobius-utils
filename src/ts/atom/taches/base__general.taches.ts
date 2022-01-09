import { isPlainObject, isFunction } from '../../internal/base'
import { looseCurryN } from '../../functional'

import { Data, Mutation } from '../atoms'
import { pipeAtom, binaryTweenPipeAtom } from '../helpers'

import type { AnyStringRecord } from '../../@types'

// S -> Single, M -> Multi

/******************************************************************************************************
 *
 *                                           General Tache
 *
 ******************************************************************************************************/

/**
 *
 */
export interface TacheOptions extends AnyStringRecord { }
export interface TacheLevelContexts extends AnyStringRecord { }

export const DEFAULT_TACHE_OPTIONS: Required<TacheOptions> = {}
export const DEFAULT_TACHE_LEVEL_CONTEXTS: Required<TacheLevelContexts> = {}

type PrepareOptions<Options extends TacheOptions = TacheOptions>
  = (options: Options) => Options
type PrepareTacheLevelContexts<TLC extends TacheLevelContexts = TacheLevelContexts>
  = () => TLC
type PrepareInput<
  Options extends TacheOptions = TacheOptions, TLC extends TacheLevelContexts = TacheLevelContexts,
  Sources extends any[] = any[], In = any
>
  = (tacheOptions: Options, tacheLevelContexts: TLC, sources: [...Sources]) => In
type PrepareMidpiece<Options extends TacheOptions = TacheOptions, TLC extends TacheLevelContexts = TacheLevelContexts, In = any, Mid = any>
  = (tacheOptions: Options, tacheLevelContexts: TLC, inputs: In) => Mid
type PrepareOutput<Options extends TacheOptions = TacheOptions, TLC extends TacheLevelContexts = TacheLevelContexts, Mid = any, Out = any>
  = (tacheOptions: Options, tacheLevelContexts: TLC, midpiece: Mid) => Out
type connect<Options extends TacheOptions = TacheOptions, TLC extends TacheLevelContexts = TacheLevelContexts, In = any, Mid = any, Out = any>
  = (tacheOptions: Options, tacheLevelContexts: TLC, pieces: [In, Mid, Out]) => void

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
  Options extends TacheOptions = TacheOptions, TLC extends TacheLevelContexts = TacheLevelContexts,
  Sources extends any[] = any[], In = any, Mid = any, Out = any
> {
  defaultOptions?: Options
  prepareOptions?: PrepareOptions<Options>
  prepareTacheLevelContexts?: PrepareTacheLevelContexts<TLC>
  prepareInput?: PrepareInput<Options, TLC, Sources, In>
  prepareMidpiece?: PrepareMidpiece<Options, TLC, In, Mid>
  prepareOutput?: PrepareOutput<Options, TLC, Mid, Out>
  connect?: connect<Options, TLC, In, Mid, Out>
}

export const DEFAULT_GENERAL_TACHE_CREATE_OPTIONS: Required<GeneralTacheCreateOptions<any, any, any, any, any, any>> = {
  defaultOptions: DEFAULT_TACHE_OPTIONS,
  prepareOptions: DEFAULT_PREPARE_OPTIONS,
  prepareTacheLevelContexts: DEFAULT_PREPARE_TACHE_LEVEL_CONTEXTS,
  prepareInput: DEFAULT_PREPARE_INPUT,
  prepareMidpiece: DEFAULT_PREPARE_MIDPIECE,
  prepareOutput: DEFAULT_PREPARE_OUTPUT,
  connect: DEFAULT_CONNET
}

export type Tache<Sources extends any[] = any[], Out = any> = (...sources: [...Sources]) => Out

/**
 * @param createOptions
 * @param [tacheOptions]
 * @return { Tache } tache :: `(...sources: any[]) => ReturnType<PrepareOutput>`
 */
export const createGeneralTache = <
  Options extends TacheOptions = TacheOptions, TLC extends TacheLevelContexts = TacheLevelContexts,
  Sources extends any[] = any[], In = any, Mid = any, Out = any
>(
    createOptions: GeneralTacheCreateOptions<Options, TLC, Sources, In, Mid, Out> | PrepareMidpiece<Options, TLC, In, Mid>,
    tacheOptions: Options = ({} as unknown as Options)
  ): Tache<Sources, Out> => {
  if (!isPlainObject(createOptions) && !isFunction(createOptions)) {
    throw (new TypeError('"createOptions" is expected to be type of "PlainObject" | "Function".'))
  }
  if (!isPlainObject(tacheOptions)) {
    throw (new TypeError('"tacheOptions" is expected to be type of "PlainObject".'))
  }

  let preparedCreateOptions: Required<GeneralTacheCreateOptions<Options, TLC, Sources, In, Mid, Out>>

  if (isFunction(createOptions)) {
    preparedCreateOptions = { ...DEFAULT_GENERAL_TACHE_CREATE_OPTIONS, prepareMidpiece: createOptions }
  } else {
    preparedCreateOptions = { ...DEFAULT_GENERAL_TACHE_CREATE_OPTIONS, ...createOptions }
  }

  const {
    defaultOptions,
    prepareOptions, prepareTacheLevelContexts,
    prepareInput, prepareMidpiece, prepareOutput, connect
  } = preparedCreateOptions

  const _tacheLevelContexts = prepareTacheLevelContexts()
  if (!isPlainObject(_tacheLevelContexts)) {
    throw (new TypeError('"tacheLevelContexts" is expected to be type of "PlainObject".'))
  }
  const preparedTacheLevelContexts = { ...DEFAULT_TACHE_LEVEL_CONTEXTS as TLC, ..._tacheLevelContexts }

  const preparedTacheOptions = prepareOptions({ ...defaultOptions, ...tacheOptions })
  if (!isPlainObject(preparedTacheOptions)) {
    throw (new TypeError('The returned value of "prepareOptions" is expected to be type of "PlainObject".'))
  }

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
    Options extends TacheOptions = TacheOptions, TLC extends TacheLevelContexts = TacheLevelContexts,
    Sources extends any[] = any[], In = any, Mid = any, Out = any
  >(
    createOptions: GeneralTacheCreateOptions<Options, TLC, Sources, In, Mid, Out> | PrepareMidpiece<Options, TLC, In, Mid>,
    tacheOptions: Options
  ): Tache<Sources, Out>
  <
    Options extends TacheOptions = TacheOptions, TLC extends TacheLevelContexts = TacheLevelContexts,
    Sources extends any[] = any[], In = any, Mid = any, Out = any
  >(
    createOptions: GeneralTacheCreateOptions<Options, TLC, Sources, In, Mid, Out> | PrepareMidpiece<Options, TLC, In, Mid>
  ): (
    tacheOptions?: Options
  ) => Tache<Sources, Out>
}
/**
 * @see {@link createGeneralTache}
 */
export const createGeneralTache_: ICreateGeneralTache_ = looseCurryN(2, createGeneralTache)

/**
 * @param tacheMaker partial applied createGeneralTache
 */
export const useGeneralTache = <Options = any, Sources extends any[] = any[], Out = any>(
  tacheMaker: (options: Options) => Tache<Sources, Out>, tacheOptions: Options, ...sources: Sources
): Out => {
  const tache = tacheMaker(tacheOptions)
  const outputs = tache(...sources)
  return outputs
}

export interface IPartialUseGeneralTache_<Options = any, Sources extends any[] = any[], Out = any> {
  (tacheOptions: Options, ...sources: Sources): Out
  (tacheOptions: Options): (...sources: Sources) => Out
}
export interface IUseGeneralTache_ {
  // pass all three arguments at one time
  <Options = any, Sources extends any[] = any[], Out = any>
  (tacheMaker: (options: Options) => Tache<Sources, Out>, tacheOptions: Options, ...sources: Sources): Out
  // pass first two arguments then rest one, first two at one time
  <Options = any, Sources extends any[] = any[], Out = any>
  (tacheMaker: (options: Options) => Tache<Sources, Out>, tacheOptions: Options): (...sources: Sources) => Out
  // pass first argument then rest two, rest two at one time
  // or pass all three arguments one by one
  <Options = any, Sources extends any[] = any[], Out = any>
  (tacheMaker: (options: Options) => Tache<Sources, Out>): IPartialUseGeneralTache_<Options, Sources, Out>
}
/**
 * @see {@link useGeneralTache}
 */
export const useGeneralTache_: IUseGeneralTache_ = looseCurryN(3, useGeneralTache)
