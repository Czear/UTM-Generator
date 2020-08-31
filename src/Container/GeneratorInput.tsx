import React, { Fragment } from 'react'
import * as IShardsReact from 'shards-react'

import { theme } from 'Theme'

import languageService from 'Service/Language'

import { IRecursivePartial, ITranslationObj } from 'Global'
import { IErrorLabel, IUTMOptionConfig } from 'UtmGenerator'
import styled, { CSSObject } from 'styled-components'
import { faSortDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface IState {
    translations: IRecursivePartial<ITranslationObj<string>>
    validationMessage?: IErrorLabel
    hints?: string[]
    showHints?: boolean
    hintsFading?: boolean
}

type IStringifyBool = 'true' | 'false';

const focusSelectBorderColor = '#becad6'

const UserInputContainer = styled.div({
    position: 'relative' as 'relative',
    'svg': {
        pointerEvents: 'none',
        cursor: 'pointer',
        position: 'absolute' as 'absolute',
        transform: 'translateY(-50%)',
        top: 16,
        right: 12,
    },
})


const UTMLabel = styled.label((props: { required?: boolean }): CSSObject => ( {
    '&::after': {
        content: props.required ? '\'*\'' : 'unset',
        color: theme.red,
        'margin-left': '.25em',
    },
} ))

const HintItem = styled(IShardsReact.ListGroupItem)((props: { disabled?: boolean }) => ( {
    borderColor: focusSelectBorderColor,
//    cursor: props.disabled ? 'not-allowed' : 'pointer',
    backgroundColor: props.disabled ? '#f2f2f2' : '#ffffff',
    '&:hover': {
        backgroundColor: '#57b8ff',
        fontWeight: 700,
        color: '#ffffff',
    },
} ))

//const HintsContainer = styled(IShardsReact.ListGroup)({
const HintsContainer = styled.ul({
    margin: 0,
    transitionDuration: '.2s',
    position: 'absolute' as 'absolute',
    zIndex: 1,
    cursor: 'pointer',
    width: '100%',
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    [ HintItem ]: {
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
    },
})

const ParamInput = styled(IShardsReact.FormInput)((props: ( { hints: IStringifyBool, [ 'hints-visible' ]?: IStringifyBool } )) => {
    const containsHints = props.hints === 'true'

    let styles: CSSObject = {
        padding: '.5rem .8rem',
        cursor: containsHints ? 'pointer' : 'initial',
        '&::placeholder': {
            fontSize: '.8em',
        },
    }

    if (props[ 'hints-visible' ] === 'true') {
        styles = {
            ...styles,
            ...{
                cursor: 'initial',
                borderBottomRightRadius: 0,
                borderBottomLeftRadius: 0,
                borderColor: focusSelectBorderColor + ' !important',
                backgroundSize: 0,
                marginBottom: '-1px',
                boxShadow: 'unset !important',
                backgroundImage: 'unset !important',
                '& + svg': {
                    transform: 'rotate(180deg) ',
                },
            },
        }
    }


    if (containsHints) {
        styles.backgroundPosition = 'right calc(.375em + .1875rem + 18px) center !important'
    }

    return styles
})

const ValidationErrorContainer = styled.div({
    color: '#ef5350',
    marginTop: '.5em',
    '&::first-letter': {
        textTransform: 'uppercase',
    },
})

export default class GeneratorInput extends React.Component<IUTMOptionConfig, IState> {
    private readonly inputElementRef = React.createRef<HTMLInputElement>()
    private readonly hintsContainerRef = React.createRef<HTMLUListElement>()
    protected readonly urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.][a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/ // protected for tests only
    private readonly attributeFieldRegex = /(^(?![\s\S])|[^$&+,/:;=?@ "'<>#%{}|\\^~[\]`.]+)/
    private readonly translationConfig = {
        generatorForm: {
            error: true,
            field: {
                [ this.props.name ]: true,
            },
        },
    }

    public state: IState = {
        translations: languageService.getPartialTranslation(this.translationConfig),
    }

    /* Init */
    public componentDidMount() {

        /* Language change subsection */
        languageService.store.subscribe((): void => {
            this.setState({
                translations: languageService.getPartialTranslation(this.translationConfig),
            })
        })

        /* Include hints related stuff into state if there were specified with props */
        if (this.props.hints) {
            this.setState((prevState) => ( {
                ...prevState,
                hints: [ ...this.props.hints as string[] ],
                showHints: false,
            } ))
        }
    }

    /* Tools */
    private getInputRegex = (inputName: string): string => {
        let elementRegex = this.attributeFieldRegex
        if (inputName === 'url') {
            elementRegex = this.urlRegex
        }

        return elementRegex.toString().replace(/^.|.$/g, '')
    }

    /* Functionality */
    private inputGainFocus = () => {
        this.manageHintVisibility(true)
    }

    private inputLooseFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        if (event.nativeEvent.relatedTarget) {
            this.manageHintVisibility(false)
        } else if (!this.state.showHints) {
            this.updateInputValue()
        }
    }

    /**
     * Hide / show / toggle hints visibility
     */
    private manageHintVisibility = (showHints = !this.state.showHints) => {
        if (showHints && !this.state.showHints) {
            const shutDownHintsDisplay = (event: MouseEvent) => {
                if (event.target !== this.inputElementRef.current) {
                    document.removeEventListener('click', shutDownHintsDisplay)
                    this.manageHintVisibility(false)
                }
            }
            document.addEventListener('click', shutDownHintsDisplay)
        } else if (!showHints) {
            this.inputElementRef.current?.blur()
            this.updateInputValue()
        }

        if (this.props.hints) {
            this.setState({
                showHints: showHints,
            })
        }
    }

    /**
     * Updates input value with onChange event
     *
     * @param newValue - input value to set. Can be empty ro only trigger form onChange
     */
    private updateInputValue = (newValue?: string): void => {
        const inputElement = this.inputElementRef.current
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement?.prototype, 'value')?.set

        if (inputElement && nativeInputValueSetter) {
            const inputValue = newValue ? newValue : inputElement.value

            /* Set input to dummy value, so the change event can occur  */
            inputElement.value += ' '

            /* Use native setter to trigger event properly */
            nativeInputValueSetter.call(inputElement, inputValue.trim())

            inputElement.dispatchEvent(new Event('input', { bubbles: true }))

            this.validateInput()
        }

    }

    private hintClickHandler = (event: React.MouseEvent<HTMLUListElement>) => {
        const target = event.target
        const inputElement = this.inputElementRef.current

        if (target instanceof Element && target.nodeName === 'LI' && inputElement) {
            inputElement.value = ( String(target.textContent) )
        }

        this.manageHintVisibility(false)
    }

    private validateInput = (): void => {
        if (this.inputElementRef.current) {
            const targetInput = this.inputElementRef.current
            const inputValue = targetInput.value
            let validationErrorLabel: IErrorLabel | undefined

            if (targetInput.required && !inputValue.length) {
                validationErrorLabel = 'empty'
            } else if (targetInput.pattern.length && !new RegExp(targetInput.pattern).test(inputValue)) {
                validationErrorLabel = 'pattern'
            }

            if (this.state.validationMessage !== validationErrorLabel) { /* Update if label differs */
                this.setState((prevState) => ( {
                    ...prevState,
                    validationMessage: validationErrorLabel,
                } ))
            }
        }
    }

    private inputChangeHandler = () => {
        if (this.props.hints) {
            this.setState({
                hints: this.props.hints.filter((hint) => {
                    const inputValue = this.inputElementRef.current?.value
                    return !( inputValue && ( !( new RegExp(inputValue, 'i') ).test(hint) || hint === inputValue ) )
                }),
            })
        }
    }

    public render() {
        const inputTranslationsObj = this.state.translations.generatorForm?.field
        const errorsTranslations = this.state.translations.generatorForm?.error

        if (inputTranslationsObj) {
            const inputTranslations = inputTranslationsObj[ this.props.name ]

            return ( inputTranslations &&
                <IShardsReact.FormGroup>
                    <UTMLabel required={ this.props.required }
                              htmlFor={ 'utm-link-' + inputTranslations.label?.toLocaleLowerCase() }>
                        { inputTranslations.label }
                    </UTMLabel>
                    <UserInputContainer>
                        <ParamInput placeholder={ inputTranslations.placeholder }
                                    hints-visible={ this.state.showHints?.toString() as IStringifyBool }
                                    name={ this.props.name }
                                    onFocus={ this.inputGainFocus }
                                    onBlur={ this.inputLooseFocus }
                                    onChange={ this.inputChangeHandler }
                                    pattern={ this.getInputRegex(this.props.name) }
                                    required={ this.props.required }
                                    invalid={ !!this.state.validationMessage }
                                    hints={ ( !!this.state.hints ).toString() as IStringifyBool }
                                    data-param={ this.props.name !== 'url' }
                                    innerRef={ this.inputElementRef }
                                    id={ 'utm-link-' + this.props.name }/>

                        { !!this.props.hints?.length && <Fragment>
                            <FontAwesomeIcon icon={ faSortDown }/>

                            { this.state.showHints &&
                            <HintsContainer onClick={ this.hintClickHandler } ref={ this.hintsContainerRef }>
                                { this.state.hints?.length ? this.state.hints.map((hint, index) => (
                                        <HintItem key={ index + String(hint) }>{ hint } </HintItem> )) :
                                    <HintItem disabled>no hints /* ToDo */</HintItem> }
                            </HintsContainer> }

                        </Fragment> }
                    </UserInputContainer>

                    { this.state.validationMessage && <ValidationErrorContainer>
                        { errorsTranslations && errorsTranslations[ this.state.validationMessage ] }
                    </ValidationErrorContainer> }
                </IShardsReact.FormGroup>
            )
        }
    }
}