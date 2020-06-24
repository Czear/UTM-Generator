import React from 'react'

import styled, { CSSObject } from 'styled-components'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from '@fortawesome/free-solid-svg-icons'

import { Button, Form, FormGroup, FormInput, FormCheckbox, FormTextarea } from 'shards-react'
import { theme } from 'Theme'

interface IUTMOptionConfig {
    label: string
    placeholder?: string
    name: string
    required?: boolean
}

interface IFieldValidation {
    [ inputName: string ]: string
}

interface IState {
    outputURL: string
    formOptions: {
        forceLowerCaseOutput: boolean
    }
    fieldsValidation: IFieldValidation
}

const UTMForm = styled(Form)({
    padding: 32,
})

const OutputFormGroup = styled(FormGroup)({
    display: 'flex',
})

const UTMResetButton = styled(Button)((): CSSObject => {
    const mainColor = theme.cnvBlue

    return {
        backgroundColor: mainColor,
        borderColor: mainColor,
    }
})

const CopyOutputBtn = styled(Button)((): CSSObject => {
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

const UTMCompileOptionContainer = styled(FormGroup)((): CSSObject => ( {
    alignItems: 'center',
    display: 'flex',
    [ UTMResetButton ]: {
        marginLeft: 'auto',
    },
} ))

const OutputInput = styled(FormTextarea)({
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

const ParamInput = styled(FormInput)({
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
        textTransform: 'uppercase'
    }
})

export default class UTMGenerator extends React.Component<{}, IState> {
    protected readonly urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/ // protected for tests only
    private readonly copyURLRef: React.RefObject<HTMLInputElement> = React.createRef()
    private readonly outputRef: React.RefObject<HTMLInputElement> = React.createRef()
    private readonly attributeFieldRegex = /(^(?![\s\S])|[^$&+,/:;=?@ "'<>#%{}|\\^~[\]`.]+)/
    private readonly generatorOptionsConfiguration = [
        {
            label: 'URL',
            name: 'url',
            required: true,
            placeholder: 'The full website URL (e.g. https://www.example.com)',
        },
        {
            label: 'Campaign',
            name: 'campaign',
            required: true,
            placeholder: 'Name of promotion / campaign (e.g. BlackFriday)',
        },
        {
            label: 'Source',
            name: 'source',
            required: true,
            placeholder: 'Traffic source (eg. Google)',
        },
        {
            label: 'Medium',
            name: 'medium',
            required: true,
            placeholder: 'Advertising medium (eg. Banner)',
        },
        {
            label: 'Term',
            name: 'term',
            placeholder: 'Searched item (eg Pendrive)',
        },
        {
            label: 'Content',
            name: 'content',
            placeholder: 'Element which redirected user to site (e.g. PromoLogo)',
        },
    ]

    public state = {
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

    private lowercaseSwitchHandler = (): void => {
        this.setState((prevState) => ( {
            formOptions: {
                forceLowerCaseOutput: !prevState.formOptions.forceLowerCaseOutput,
            },
        } ))
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
        const inputName = targetInput.name
        let validationMessage = 'validated'

        if (targetInput.required && !inputValue.length) {
            validationMessage = 'cannot be empty'
        } else if (targetInput.pattern.length && !new RegExp(targetInput.pattern).test(inputValue)) {
            validationMessage = 'bad input value'
        }

        if (this.state.fieldsValidation[ inputName ] !== validationMessage) { // If new validation data
            this.setState((prevState) => ( {
                fieldsValidation: {
                    ...prevState.fieldsValidation,
                    [ inputName ]: validationMessage,
                },
            } ))
        }
    }

    public render() {
        return (
            <UTMForm onReset={ this.resetFormHandler } onChange={ this.updateOutputURL }>

                {
                    this.generatorOptionsConfiguration.map((optionConfig, index) => {
                        const validationMessage = this.state.fieldsValidation[ optionConfig.name ]
                        const isValid = !validationMessage || validationMessage === 'validated'

                        console.log(validationMessage)

                        return (
                            <FormGroup key={ String(index) + optionConfig.label }>
                                <UTMLabel required={ optionConfig.required }
                                          htmlFor={ 'utm-link-' + optionConfig.label.toLocaleLowerCase() }>
                                    { optionConfig.label }
                                </UTMLabel>

                                <ParamInput placeholder={ optionConfig.placeholder }
                                            name={ optionConfig.name }
                                            onBlur={ this.validateInput }
                                            pattern={ this.getInputRegex(optionConfig.name) }
                                            required={ optionConfig.required }
                                            invalid={ !isValid }
                                            data-param={ optionConfig.name !== 'url' }
                                            id={ 'utm-link-' + optionConfig.name }/>
                                { !isValid && <ValidationErrorContainer>
                                    { validationMessage }
                                </ValidationErrorContainer> }
                            </FormGroup>
                        )
                    })
                }

                <hr/>

                <OutputFormGroup>
                    <CopyHelperInput value={ this.state.outputURL } ref={ this.copyURLRef } readOnly/>
                    <OutputInput value={ this.state.outputURL } innerRef={ this.outputRef } readOnly disabled required
                                 id="utm-output"
                                 placeholder="Please, fill in fields above"/>
                </OutputFormGroup>

                <UTMCompileOptionContainer>
                    <FormCheckbox checked={ this.state.formOptions.forceLowerCaseOutput }
                                  onChange={ this.lowercaseSwitchHandler } id="utm-lower-case" toggle
                                  small/>
                    <UTMLabel htmlFor="utm-lower-case">Lower case link</UTMLabel>

                    <FormUtils>
                        <UTMResetButton pill type="reset">Reset</UTMResetButton>
                        <CopyOutputBtn type="button" theme="warning" pill onClick={ this.copyOutputToClipboard }>
                            Copy
                            <FontAwesomeIcon icon={ faCopy }/>
                        </CopyOutputBtn>
                    </FormUtils>
                </UTMCompileOptionContainer>
            </UTMForm>
        )
    }
}