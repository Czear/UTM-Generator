import { createStore } from 'redux'
import { getCookie, setCookie } from 'Tool/Cookie'
import { IGenericObj, IRecursivePartial, ITranslationConfig, ITranslationObj } from 'Global'

type ILanguage = 'pl' | 'en'

interface ILanguageAction {
    type: 'LANG_CHANGE'
    value: ILanguage
}

class LanguageService {
    public readonly languageCookieName = 'translation-language'
    public readonly defaultLanguageValue: ILanguage = 'en'

    constructor() {
        if (!getCookie(this.languageCookieName)) {
            setCookie(this.languageCookieName, this.defaultLanguageValue)
        }
    }

    private get savedLanguageType(): ILanguage {
        return getCookie(this.languageCookieName) as ILanguage ?? this.defaultLanguageValue
    }

    private getTranslationObj = (type: ILanguage): ITranslationObj<string> => require(`Translation/${ type }.json`)

    public store = createStore((state: Object = {}, action: ILanguageAction): ITranslationObj<string> => {
        if (/@@redux\/init/i.test(action.type)) {
            return this.getTranslationObj(this.savedLanguageType)

        } else if (action.type === 'LANG_CHANGE') {
            setCookie(this.languageCookieName, action.value)
            return this.getTranslationObj(action.value as ILanguage)

        } else {
            throw new Error('Undefined language redux action')
        }
    })

    public getPartialTranslation = (config: ITranslationConfig<ITranslationObj<boolean>>): IRecursivePartial<ITranslationObj<string>> => {
        const interpretConfigObj = (configObj: IRecursivePartial<ITranslationObj<boolean>>, translationObj: IRecursivePartial<ITranslationObj<string>>): IRecursivePartial<ITranslationObj<string>> => {
            let outputObj: IRecursivePartial<ITranslationObj<string>> = {}

            for (const [ key, value ] of Object.entries(configObj)) {
                if (typeof value === 'boolean' && value) {
                    //@ts-ignore Recursive keyof needed
                    outputObj[ key ] = translationObj[ key as keyof ITranslationObj<string> ]

                } else if (typeof value === 'object') {
                    const interpretedData = interpretConfigObj(value as IRecursivePartial<ITranslationObj<boolean>>, translationObj[ key as keyof ITranslationObj<string> ] as IRecursivePartial<ITranslationObj<string>>)

                    if (interpretedData) {

                        outputObj = {
                            ...outputObj,
                            [ key ]: {
                                ...interpretedData,
                            },
                        }
                    }
                }
            }

            return outputObj
        }

        return interpretConfigObj(config as IRecursivePartial<IGenericObj<boolean>>, this.store.getState() as ITranslationObj<string>)
    }
}

export default new LanguageService()