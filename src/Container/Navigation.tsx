import React from 'react'
import styled, { CSSObject } from 'styled-components'

import languageService from 'Service/Language'

import { Nav, Navbar, NavbarBrand, FormCheckbox } from 'shards-react'

import LogoB64 from 'Asset/logo.png'
import PLFlag from 'Asset/PL-flag.svg'
import GBFlag from 'Asset/UK-flag.svg'
import langSwitcherBackground from 'Asset/lang-swich-bg--bold.svg'

import { getCookie } from 'Tool/Cookie'

import { IRecursivePartial, ITranslationObj } from 'Global'
import { theme } from 'Theme'

interface IState {
    languageChanged: boolean
    translations: IRecursivePartial<ITranslationObj<string>>
}

const NavigationBar = styled(Navbar)({
    marginTop: '16px',
    '& > *': {
        width: '33%',
        margin: 0,
    },
    h1: {
        textAlign: 'center',
        marginTop: '.65em',
    },
    ul: {
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    [ `@media (max-width: ${ theme.lgBreakpoint }px)` ]: {
        flexWrap: 'wrap',
        ul: {
            order: 1,
        },
        h1: {
            width: '100%',
            order: 2,
        },
    },
    [ `@media (max-width: ${ theme.mdBreakpoint }px)` ]: {
        h1: {
            fontSize: '10vw',
        },
    },
})

const NavbarBrandContainer = styled(NavbarBrand)(() => ( {
    padding: 0,
    [ `@media (max-width: ${ theme.lgBreakpoint }px)` ]: {
        order: 1,
    },
} ))

const LogoImage = styled.img({
    height: 48,
})

const LagSwitcher = styled(FormCheckbox)((props: { checked: boolean }) => {
    const addImportantToStyles = (obj: CSSObject): CSSObject => {
        let outputObj: CSSObject = {}

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
        'label': {
            '&::before, &::after': {
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
            },
            '&::before': {
                backgroundColor: 'unset',
                backgroundImage: `url(${ langSwitcherBackground })`,
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
    }

    return addImportantToStyles(styles)
})

export default class Navigation extends React.Component<{}, IState> {
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
            type: 'language-change',
            value: languageValue,
        })
    }

    public render() {
        return ( <NavigationBar>
            <NavbarBrandContainer href="/">
                <LogoImage src={ LogoB64 } alt="brand logo"/>
            </NavbarBrandContainer>
            <h1>
                { this.state.translations.headingTitle }
            </h1>
            <Nav navbar>
                <LagSwitcher checked={ this.state.languageChanged } ref={ this.langSwitchRef } toggle
                             onChange={ this.langSwitchChangeHandler }/>
            </Nav>
        </NavigationBar> )
    }
}