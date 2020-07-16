import { createStore } from 'redux'
import { getCookie, setCookie } from 'Tool/Cookie'
import { ITranslationObj } from 'UtmGenerator'

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

    private getTranslationObj = (type: ILanguage): ITranslationObj => require(`Translation/${ type }.json`)

    private getSavedLanguageType = (): ILanguage => {
        let languageValue = getCookie(this.languageCookieName) as ILanguage

        if (!languageValue) {
            languageValue = this.defaultLanguageValue
        }

        return languageValue
    }

    public store = createStore((state = {}, action: ILanguageAction): ITranslationObj => {
        if (/redux\/init/i.test(action.type)) {
            state = this.getTranslationObj(this.getSavedLanguageType())
        } else if (action.type === 'language-change') {
            setCookie(this.languageCookieName, action.value)
            state = this.getTranslationObj(action.value as ILanguage)
        }

        return state as ITranslationObj
    })
}

export default new LanguageService()