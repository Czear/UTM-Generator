interface ICookieOptions {
    domain: string
    expires: Date
    path: string
    sameSite: string
    secure: boolean
}

const DEFAULT_OPTIONS: Partial<ICookieOptions> = {
    domain: window.location.hostname,
    path: '/',
}

type IJSONSimpleType = string | number | boolean | null

interface IJSONObjectType {
    [key: string]: IJSONSimpleType | IJSONObjectType
}


type IJSONType = IJSONSimpleType | IJSONObjectType | (IJSONSimpleType | IJSONObjectType)[]

/** Returns JSON parsed cookie value */
export const getCookie = <Type extends IJSONType = IJSONType>(name: string, jsonValue: boolean = true): Type | string | undefined=> {
    for (let cookie of document.cookie.split(';')) {
        cookie = cookie.trim()

        if (cookie.indexOf(`${ name }=`) !== 0) {
            continue
        }

        const value = cookie.slice(name.length + 1)

        if (jsonValue) {
            try {
                return JSON.parse(value)
            } catch (error) {
                // Not JSON value
            }
        }

        return value
    }
}

/** Saves any cookie value as string */
export const setCookie = (name: string, value: IJSONType, options: Partial<ICookieOptions> = {}, jsonValue: boolean = true): void => {
    const cookieParts = [ `${ name }=${ jsonValue ? JSON.stringify(value) : value }` ]
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options }

    for (const optionKey of Object.keys(mergedOptions)) {
        //@ts-ignore
        cookieParts.push(`${ optionKey }=${ mergedOptions[ optionKey ] }`)
    }

    document.cookie = cookieParts.join('; ')
}