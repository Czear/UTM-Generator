import React, { ChangeEvent } from 'react'

import styled, { CSSObject } from 'styled-components'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from '@fortawesome/free-solid-svg-icons'

import * as IShardsReact from 'shards-react'
import languageService from 'Service/Language'
import { theme } from 'Theme'
import { IRecursivePartial, ITranslationConfig, ITranslationObj } from 'Global'
import { IErrorLabel, IGeneratorField } from 'UtmGenerator'

interface IUTMOptionConfig {
    name: IGeneratorField
    required?: boolean
}

type IFieldValidation = {
    [inputName in IGeneratorField]: IErrorLabel
}

interface IState {
    translations: IRecursivePartial<ITranslationObj<string>>
    outputURL: string
    fieldsValidation: IFieldValidation
    formOptions: {
        forceLowerCaseOutput: boolean
    }
}

interface IProps {

}

const UTMForm = styled(IShardsReact.Form)({
    padding: 32,
})

const OutputFormGroup = styled(IShardsReact.FormGroup)({
    display: 'flex',
})

const UTMResetButton = styled(IShardsReact.Button)((): CSSObject => {
    const mainColor = theme.cnvBlue

    return {
        backgroundColor: mainColor,
        borderColor: mainColor,
    }
})

const CopyOutputBtn = styled(IShardsReact.Button)((): CSSObject => {
    const mainColor = theme.cnvOrange

    return {
        padding: '.75rem 0.9rem',
        marginLeft: 16,
        color: '#fff',
        backgroundColor: mainColor,
        borderColor: mainColor,
        ':hover': {
            color: '#fff !important',
        },
        ':active': {
            color: '#fff !important',
        },
        'svg': {
            marginLeft: '.5em',
        },
    }
})

const UTMLabel = styled.label((props: { required?: boolean }): CSSObject => ( {
    '&::after': {
        content: props.required ? '\'*\'' : 'unset',
        color: theme.red,
        'margin-left': '.25em',
    },
} ))

const UTMCompileOptionContainer = styled(IShardsReact.FormGroup)((): CSSObject => ( {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    [ UTMResetButton ]: {
        marginLeft: 'auto',
    },
} ))

const OutputInput = styled(IShardsReact.FormTextarea)({
    cursor: 'text !important',
})

const CopyHelperInput = styled.input({
    height: 1,
    width: 1,
    borderWidth: 0,
    padding: 0,
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
})

const ParamInput = styled(IShardsReact.FormInput)({
    padding: '.5rem .8rem',
    '&::placeholder': {
        fontSize: '.8em',
    },
})

const FormUtils = styled.div({
    marginLeft: 'auto',
})

const ValidationErrorContainer = styled.div({
    color: '#ef5350',
    marginTop: '.5em',
    '&::first-letter': {
        textTransform: 'uppercase',
    },
})

export default class UTMGenerator extends React.Component<IProps, IState> {
    protected readonly urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/ // protected for tests only
    private readonly copyURLRef: React.RefObject<HTMLInputElement> = React.createRef()
    private readonly outputRef: React.RefObject<HTMLInputElement> = React.createRef()
    private readonly attributeFieldRegex = /(^(?![\s\S])|[^$&+,/:;=?@ "'<>#%{}|\\^~[\]`.]+)/
    private readonly generatorOptionsConfiguration: IUTMOptionConfig[] = [
        {
            name: 'url',
            required: true,
        },
        {
            name: 'campaign',
            required: true,
        },
        {
            name: 'source',
            required: true,
        },
        {
            name: 'medium',
            required: true,
        },
        {
            name: 'term',
        },
        {
            name: 'content',
        },
    ]

    private readonly translationConfig: ITranslationConfig<ITranslationObj<boolean>> = {
        generatorForm: {
            outputPlaceholder: true,
            lowercaseSwitch: true,
            reset: true,
            error: true,
            copy: true,
            field: true,
        },
    }


    public componentDidMount() {
        languageService.store.subscribe((): void => {
            this.setState({
                translations: languageService.getPartialTranslation(this.translationConfig),
            })
        })
    }

    public state = {
        translations: languageService.getPartialTranslation(this.translationConfig),
        fieldsValidation: {} as IFieldValidation,
        outputURL: '',
        formOptions: {
            forceLowerCaseOutput: false,
        },
    }

    private updateOutputURL = (): void => {
        const outputElement = this.outputRef.current

        if (outputElement) {
            const root = outputElement.form

            if (root) {
                let generatedURL = ''

                if (root.checkValidity()) {
                    const formData = new FormData(root)
                    const urlValue = formData.get('url') as string
                    let urlInput = ''

                    // Remove url data from formData (it is not needed any more + it makes mess in params add loop)
                    formData.delete('url')

                    // Add protocol if missing
                    if (urlValue) {
                        urlInput += ( !/^http/.test(urlValue) ? 'http://' : '' ) + urlValue
                    }

                    const urlObject = new URL(urlInput)
                    generatedURL += urlObject.origin

                    if (urlObject.pathname !== '/') {
                        generatedURL += urlObject.pathname
                    }

                    generatedURL += urlObject.search

                    //Add params
                    for (const [ inputName, inputValue ] of formData.entries()) {
                        if (inputValue) {
                            generatedURL += `${ ( /\?/.test(generatedURL) ? '&' : '?' ) }utm_${ inputName }=${ inputValue }`
                        }
                    }

                    generatedURL += urlObject.hash
                }

                this.setState((prevState) => ( {
                    outputURL: prevState.formOptions.forceLowerCaseOutput ? generatedURL.toLowerCase() : generatedURL,
                } ))
            }
        }
    }

    private lowercaseSwitchHandler = (event: ChangeEvent<HTMLInputElement>): void => {
        this.setState((prevState) => ( {
            formOptions: {
                forceLowerCaseOutput: !prevState.formOptions.forceLowerCaseOutput,
            },
        } ))

        if (event.target && ( event.target as HTMLElement ).nodeName.toLowerCase() === 'label') { // label click does not trigger form change event
            this.updateOutputURL()
        }
    }

    private copyOutputToClipboard = () => {
        if (this.copyURLRef.current) {
            this.copyURLRef.current.select()
            document.execCommand('copy')
        }
    }

    private resetFormHandler = () => {
        this.setState(() => ( {
            outputURL: '',
            formOptions: {
                forceLowerCaseOutput: false,
            },
        } ))
    }

    private getInputRegex = (elementName: string): string => {
        let elementRegex = this.attributeFieldRegex
        if (elementName === 'url') {
            elementRegex = this.urlRegex
        }

        return elementRegex.toString().replace(/^.|.$/g, '')
    }

    private validateInput = (event: React.FocusEvent<HTMLInputElement>): void => {
        const targetInput = event.target
        const inputValue = targetInput.value
        const inputName = targetInput.name as IGeneratorField
        let validationErrorLabel: IErrorLabel | undefined

        if (targetInput.required && !inputValue.length) {
            validationErrorLabel = 'empty'
        } else if (targetInput.pattern.length && !new RegExp(targetInput.pattern).test(inputValue)) {
            validationErrorLabel = 'pattern'
        }

        if (this.state.fieldsValidation[ inputName ] !== validationErrorLabel) { // Update if label differs
            this.setState((prevState) => {
                const stateCopy = { ...prevState }

                if (validationErrorLabel) { // Update state with new label
                    stateCopy.fieldsValidation[ inputName ] = validationErrorLabel
                } else { // Remove label missing
                    delete stateCopy.fieldsValidation[ inputName ]
                }

                return stateCopy
            })
        }
    }

    public render() {
        return (
            <UTMForm onReset={ this.resetFormHandler } onChange={ this.updateOutputURL }>

                {
                    this.generatorOptionsConfiguration.map((optionConfig, index): JSX.Element | undefined => {
                        const validationMessageLabel = this.state.fieldsValidation[ optionConfig.name ]
                        const isValid = !validationMessageLabel
                        const formTranslations = this.state.translations.generatorForm

                        if (formTranslations && formTranslations.field && formTranslations.field[ optionConfig.name ]) {
                            const translations = formTranslations.field[ optionConfig.name ]

                            return ( translations &&
                                <IShardsReact.FormGroup key={ String(index) + optionConfig.name }>
                                    <UTMLabel required={ optionConfig.required }
                                              htmlFor={ 'utm-link-' + translations.label?.toLocaleLowerCase() }>
                                        { translations.label }
                                    </UTMLabel>

                                    <ParamInput placeholder={ translations.placeholder }
                                                name={ optionConfig.name }
                                                onBlur={ this.validateInput }
                                                pattern={ this.getInputRegex(optionConfig.name) }
                                                required={ optionConfig.required }
                                                invalid={ !isValid }
                                                data-param={ optionConfig.name !== 'url' }
                                                id={ 'utm-link-' + optionConfig.name }/>
                                    { !isValid && <ValidationErrorContainer>
                                        { formTranslations.error && formTranslations.error[ validationMessageLabel ] }
                                    </ValidationErrorContainer> }
                                </IShardsReact.FormGroup>
                            )
                        } else {
                            return undefined
                        }
                    })
                }

                <hr/>

                <OutputFormGroup>
                    <CopyHelperInput value={ this.state.outputURL } ref={ this.copyURLRef } readOnly/>
                    <OutputInput value={ this.state.outputURL } innerRef={ this.outputRef } readOnly disabled required
                                 id="utm-output"
                                 placeholder={ this.state.translations.generatorForm?.outputPlaceholder }/>
                </OutputFormGroup>

                <UTMCompileOptionContainer>
                    <IShardsReact.FormCheckbox checked={ this.state.formOptions.forceLowerCaseOutput }
                                               onChange={ this.lowercaseSwitchHandler } id="utm-lower-case" toggle
                                               small/>
                    <UTMLabel
                        htmlFor="utm-lower-case">{ this.state.translations.generatorForm?.lowercaseSwitch }</UTMLabel>

                    <FormUtils>
                        <UTMResetButton pill
                                        type="reset">{ this.state.translations.generatorForm?.reset }</UTMResetButton>
                        <CopyOutputBtn type="button" theme="warning" pill onClick={ this.copyOutputToClipboard }>
                            { this.state.translations.generatorForm?.copy }
                            <FontAwesomeIcon icon={ faCopy }/>
                        </CopyOutputBtn>
                    </FormUtils>
                </UTMCompileOptionContainer>
            </UTMForm>
        )
    }
}