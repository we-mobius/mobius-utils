
export const isPhoneNum = (v: string): boolean => /^1[3-9]\d{9}$/.test(v)
export const isTelNum = (v: string): boolean => /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/.test(v)
export const isQQId = (v: string): boolean => /^[1-9][0-9]{4,10}$/.test(v)
export const isEmailAddress = (v: string): boolean => /^([A-Za-z0-9_\-.])+@([A-Za-z0-9_\-.])+\.([A-Za-z]{2,4})$/.test(v)
