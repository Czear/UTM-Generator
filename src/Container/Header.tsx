import React from 'react'
import styled, { CSSObject } from 'styled-components'

import languageService from 'Service/Language'

import { FormCheckbox } from 'shards-react'

import PLFlag from 'Asset/PL-flag.svg'
import GBFlag from 'Asset/UK-flag.svg'

import { getCookie } from 'Tool/Cookie'

import { IRecursivePartial, ITranslationObj } from 'Global'
import ThemeConfig from 'Theme/Layout'

interface IState {
    languageChanged: boolean
    translations: IRecursivePartial<ITranslationObj<string>>
}

const LangSwitcher = styled(FormCheckbox)((props: { checked: boolean }) => {
    const addImportantToStyles = (obj: CSSObject): CSSObject => {
        let outputObj: CSSObject = {}

        /* Add '!important' */
        for (const [ key, value ] of Object.entries(obj)) {
            if (/string|number/.test(typeof value)) {
                outputObj[ key ] = `${ value } !important`
            } else if (typeof value === 'object') {
                outputObj = {
                    ...outputObj,
                    [ key ]: {
                        ...addImportantToStyles(value),
                    },
                }
            }
        }

        return outputObj
    }

    const buttonPadding = '5px'
    const styles = {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '3.15rem',
        position: 'absolute' as 'absolute',
        right: 'calc(50% - 480px)',
        width: 'unset',
        bottom: 0,
        label: {

            position: 'relative' as 'relative',
            width: '3.125rem',
            height: '1.75rem',
            margin: '0 0.5rem',
            '&::before, &::after': {
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
            },
            '&::before': {
                backgroundColor: 'unset',
                backgroundSize: '95%',
                borderColor: '#becad6',
            },
            '&::after': {
                backgroundColor: '#fff',
                backgroundImage: `url(${ props.checked ? PLFlag : GBFlag })`,
                backgroundSize: 'cover',
                borderRadius: '100%',
                width: `calc(1.5625rem - ${ buttonPadding } - 1px)`,
                height: `calc(1.75rem - ${ buttonPadding } * 2 )`,
                boxShadow: '0 0 16px -5px #000',
                top: buttonPadding,
                transitionProperty: 'left, transform',
                left: props.checked ? `calc(3.125rem - ${ buttonPadding })` : buttonPadding,
            },
        },
        '&::before': {
            content: '"EN"',
        },
        '&::after': {
            content: '"PL"',
        },

        [ `@media (min-width: ${ ThemeConfig.mdBreakpoint }px) and (max-width: ${ ThemeConfig.lgBreakpoint - 1 }px)` ]: {
            right: '0',
        },
        [ `@media (max-width: ${ ThemeConfig.mdBreakpoint }px)` ]: {
            position: 'static' as 'static',
            padding: 0,
        },
    }

    return addImportantToStyles(styles)
})

const langSwitcherSelector = LangSwitcher.toString()

const NavigationBar = styled.header({
    marginBottom: 0,
    paddingBottom: 0,
    marginTop: '24px',
    padding: '8px 0',
    position: 'relative',
    h1: {
        fontSize: '2.75rem',
        textAlign: 'center',
        margin: 'auto',
    },
    [ `@media (max-width: ${ ThemeConfig.mdBreakpoint }px)` ]: {
        display: 'flex',
        justifyContent: 'space-between',

        h1: {
            margin: 0,
        },
        [ langSwitcherSelector ]: {
            marginBottom: 0,
        },
    },
    [ `@media (max-width: ${ ThemeConfig.smBreakpoint }px)` ]: {
        margin: '24px 12px 0',

        h1: {
            fontSize: '8vw',
        },
    },
})

export default class Header extends React.Component<{}, IState> {
    private readonly langSwitchRef: React.RefObject<FormCheckbox> = React.createRef()
    private readonly langConfig: IRecursivePartial<ITranslationObj<boolean>> = {
        headingTitle: true,
    }

    public state = {
        languageChanged: getCookie(languageService.languageCookieName) !== languageService.defaultLanguageValue,
        translations: languageService.getPartialTranslation(this.langConfig),
    }

    public componentDidMount() {
        languageService.store.subscribe((): void => {
            this.setState({
                translations: languageService.getPartialTranslation(this.langConfig),
            })
        })
    }

    private langSwitchChangeHandler = () => {
        /* Set new switcher value */
        if (this.langSwitchRef.current && typeof this.langSwitchRef.current.props.checked === 'boolean') {
            this.setState(( {
                languageChanged: !this.langSwitchRef.current.props.checked,
            } ), () => {
                this.updateLanguage(this.state.languageChanged ? 'pl' : 'en')
            })
        }

    }

    private updateLanguage = (languageValue: 'pl' | 'en'): void => {
        languageService.store.dispatch({
            type: 'LANG_CHANGE',
            value: languageValue,
        })
    }

    public render() {
        return ( <NavigationBar>
            <h1>
                { this.state.translations.headingTitle }
            </h1>
            <LangSwitcher checked={ this.state.languageChanged } ref={ this.langSwitchRef } toggle
                          onChange={ this.langSwitchChangeHandler }/>
        </NavigationBar> )
    }
}