
export type If<T extends boolean, TRUE, FALSE> = T extends true ? TRUE : FALSE
export type InvertBoolean<T extends boolean> = T extends true ? false : true
