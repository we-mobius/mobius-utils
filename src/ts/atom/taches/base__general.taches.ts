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

/**
 *
 */
export interface TacheOptions {
  [key: string]: any
}
export interface TacheLevelContexts {
  [key: string]: any
}

const DEFAULT_TACHE_OPTIONS: TacheOptions = {}
const DEFAULT_TACHE_LEVEL_CONTEXTS: TacheLevelContexts = {}

type PrepareOptions<O extends TacheOptions = TacheOptions>
  = (options: O) => O
type PrepareTacheLevelContexts<TLC extends TacheLevelContexts = TacheLevelContexts>
  = () => TLC
type PrepareInput<O extends TacheOptions = TacheOptions, TLC extends TacheLevelContexts = TacheLevelContexts, In = any>
  = (tacheOptions: O, tacheLevelContexts: TLC, sources: any) => In
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
  O extends TacheOptions = TacheOptions, TLC extends TacheLevelContexts = TacheLevelContexts, In = any, Mid = any, Out = any
> {
  prepareOptions?: PrepareOptions<O>
  prepareTacheLevelContexts?: PrepareTacheLevelContexts<TLC>
  prepareInput?: PrepareInput<O, TLC, In>
  prepareMidpiece?: PrepareMidpiece<O, TLC, In, Mid>
  prepareOutput?: PrepareOutput<O, TLC, Mid, Out>
  connect?: connect<O, TLC, In, Mid, Out>
}

export const DEFAULT_GENERAL_TACHE_CREATE_OPTIONS: Required<GeneralTacheCreateOptions> = {
  prepareOptions: DEFAULT_PREPARE_OPTIONS,
  prepareTacheLevelContexts: DEFAULT_PREPARE_TACHE_LEVEL_CONTEXTS,
  prepareInput: DEFAULT_PREPARE_INPUT,
  prepareMidpiece: DEFAULT_PREPARE_MIDPIECE,
  prepareOutput: DEFAULT_PREPARE_OUTPUT,
  connect: DEFAULT_CONNET
}

export type Tache = (...sources: any[]) => ReturnType<PrepareOutput>

/**
 * @param createOptions
 * @param [tacheOptions]
 * @return { Tache } tache :: `(...sources: any[]) => ReturnType<PrepareOutput>`
 */
export const createGeneralTache = (
  createOptions: GeneralTacheCreateOptions | PrepareMidpiece, tacheOptions: TacheOptions = DEFAULT_TACHE_OPTIONS
): Tache => {
  if (!isPlainObject(createOptions) && !isFunction(createOptions)) {
    throw (new TypeError('"createOptions" is expected to be type of "PlainObject" | "Function".'))
  }
  if (!isPlainObject(tacheOptions)) {
    throw (new TypeError('"tacheOptions" is expected to be type of "PlainObject".'))
  }

  let preparedCreateOptions: Required<GeneralTacheCreateOptions>

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
  const preparedTacheLevelContexts = { ...DEFAULT_TACHE_LEVEL_CONTEXTS, ..._tacheLevelContexts }

  const _tacheOptions = prepareOptions(tacheOptions)
  if (!isPlainObject(_tacheOptions)) {
    throw (new TypeError('The returned value of "prepareOptions" is expected to be type of "PlainObject".'))
  }
  const preparedTacheOptions = { ...DEFAULT_TACHE_OPTIONS, ..._tacheOptions }

  return (...sources) => {
    const inputs = prepareInput(preparedTacheOptions, preparedTacheLevelContexts, sources.length > 1 ? sources : sources[0])
    const midpieces = prepareMidpiece(preparedTacheOptions, preparedTacheLevelContexts, inputs)
    const outputs = prepareOutput(preparedTacheOptions, preparedTacheLevelContexts, midpieces)
    connect(preparedTacheOptions, preparedTacheLevelContexts, [inputs, midpieces, outputs])
    return outputs
  }
}
interface ICreateGeneralTache_ {
  (createOptions: GeneralTacheCreateOptions | PrepareMidpiece, tacheOptions?: TacheOptions): Tache
  (createOptions: GeneralTacheCreateOptions | PrepareMidpiece): (tacheOptions?: TacheOptions) => Tache
}
/**
 * @see {@link createGeneralTache}
 */
export const createGeneralTache_: ICreateGeneralTache_ = looseCurryN(2, createGeneralTache)

/**
 * @param tacheMaker partial applied createGeneralTache
 */
export const useGeneralTache = (
  tacheMaker: (options: TacheOptions) => Tache, tacheOptions: TacheOptions, ...sources: any[]
): Tache => {
  const tache = tacheMaker(tacheOptions)
  const outputs = sources.length > 1 ? tache(...sources) : tache(sources[0])
  return outputs
}
export const useGeneralTache_ = looseCurryN(3, useGeneralTache)
