// eslint-disable-next-line no-undef
export const isInWXMINA = () => (typeof wx !== 'undefined') && wx.canIUse
export const isInWeb = () => typeof document === 'object'
export const isInBrowser = isInWeb
export const isInNode = () => typeof global !== 'undefined'

let wxmina
if (isInWXMINA()) {
  // eslint-disable-next-line no-undef
  wxmina = wx
}
export { wxmina }

export const adaptMultiPlatform = ({
  webFn = () => {},
  nodeFn = () => {},
  wxminaFn = () => {},
  defaultFn = () => {}
} = {}) => {
  if (isInWeb()) {
    webFn && webFn()
  } else if (isInNode()) {
    nodeFn && nodeFn()
  } else if (isInWXMINA()) {
    wxminaFn && wxminaFn()
  } else {
    defaultFn && defaultFn()
  }
}
export const adaptMultiPlatformAwait = async ({
  webFn = () => {},
  nodeFn = () => {},
  wxminaFn = () => {},
  defaultFn = () => {}
} = {}) => {
  if (isInWeb()) {
    webFn && await webFn()
  } else if (isInNode()) {
    nodeFn && await nodeFn()
  } else if (isInWXMINA()) {
    wxminaFn && await wxminaFn()
  } else {
    defaultFn && await defaultFn()
  }
}
