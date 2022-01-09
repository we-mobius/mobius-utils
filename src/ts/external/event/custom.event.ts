
const DEFAULT_CUSTOM_EVENT_DETAIL: Record<string, any> = {}
export interface CustomEventOptions extends EventInit { }

/**
 * "event.detail" is always of type object which has an "eventType" property in it,
 *   "eventType"'s value equals to name of custom type.
 */
export const makeCustomEvent = <Detail extends Record<string, any>>(
  type: string,
  detail: Detail = DEFAULT_CUSTOM_EVENT_DETAIL as Detail,
  options: CustomEventOptions = {}
): CustomEvent<{ eventType: string } & Detail> => {
  const preparedDetail = { ...DEFAULT_CUSTOM_EVENT_DETAIL, eventType: type, ...detail }
  const eventInitDict = { ...options, detail: preparedDetail }
  const customEvent = new CustomEvent(type, eventInitDict)
  return customEvent
}
