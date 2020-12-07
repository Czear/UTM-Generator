import { createStore } from 'redux'
import { getCookie, setCookie } from 'Tool/Cookie'
import { IGenericObj, IRecursivePartial, ITranslationConfig, ITranslationObj } from 'Global'

type ILanguage = 'pl' | 'en'

interface ILanguageAction {
    type: string
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

    private getTranslationObj = (type: ILanguage): ITranslationObj<string> => require(`Translation/${ type }.json`)

    private getSavedLanguageType = (): ILanguage => {
        let languageValue = getCookie(this.languageCookieName) as ILanguage

        if (!languageValue) {
            languageValue = this.defaultLanguageValue
        }

        return languageValue
    }

    public store = createStore((state = {}, action: ILanguageAction): ITranslationObj<string> => {
        if (/redux\/init/i.test(action.type)) {
            state = this.getTranslationObj(this.getSavedLanguageType())
        } else if (action.type === 'language-change') {
            setCookie(this.languageCookieName, action.value)
            state = this.getTranslationObj(action.value as ILanguage)
        }

        return state as ITranslationObj<string>
    })

    public getPartialTranslation = (config: ITranslationConfig<ITranslationObj<boolean>>): IRecursivePartial<ITranslationObj<string>>  => {
        const interpretConfigObj = (configObj: IRecursivePartial<ITranslationObj<boolean>>, translationObj: IRecursivePartial<ITranslationObj<string>>):  IRecursivePartial<ITranslationObj<string>>  => {
            let outputObj: IRecursivePartial<ITranslationObj<string>> = {}

            for (const [ key, value ] of Object.entries(configObj)) {
                if (typeof value === 'boolean' && value) {

                    //@ts-ignore // idk
                    outputObj[ key as keyof ITranslationObj<string> ] = translationObj[ key as keyof ITranslationObj<string> ]
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