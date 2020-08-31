import React, { ChangeEvent } from 'react'

import styled, { CSSObject, StyledComponent } from 'styled-components'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy } from '@fortawesome/free-solid-svg-icons'

import * as IShardsReact from 'shards-react'
import languageService from 'Service/Language'
import { theme } from 'Theme'
import { IRecursivePartial, ITranslationConfig, ITranslationObj } from 'Global'
import { IErrorLabel, IGeneratorField, IUTMOptionConfig } from 'UtmGenerator'

import GeneratorInput from 'Container/GeneratorInput'

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
    boxShadow: '0 0 16px -4px #00000040',
    borderRadius: '16px',
}) as StyledComponent<typeof IShardsReact.Form, any, any> /* Prevent autocomplete attribute warning */

const OutputFormGroup = styled(IShardsReact.FormGroup)({
    display: 'flex',
})

const UTMResetButton = styled(IShardsReact.Button)({
    backgroundImage: 'linear-gradient(    rgb(36,58,164) 0%,    rgb(36,58,134) 51%,    rgb(36, 58, 114) 100%)',
    borderWidth: 0,
    '&:hover': {
        backgroundImage: 'unset',
        backgroundColor: theme.cnvBlue,
    },
})

const CopyOutputBtn = styled(IShardsReact.Button)({
    padding: '.75rem 0.9rem',
    marginLeft: 16,
    color: '#fff',
    backgroundImage: 'linear-gradient(rgb(253, 102, 33) 0%, rgb(253, 90, 31) 51%, rgb(253, 78, 30) 100%)',
    borderWidth: 0,
    ':hover': {
        color: '#fff !important',
        backgroundImage: 'unset',
        backgroundColor: theme.cnvOrange,
    },
    ':active': {
        color: '#fff !important',
    },
    'svg': {
        marginLeft: '.5em',
    },
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

const FormUtils = styled.div({
    marginLeft: 'auto',
    'button': {
        transitionDuration: '0s',
    },
    [ `@media (max-width: ${ theme.mdBreakpoint }px)` ]: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row-reverse',
        justifyContent: 'flex-end',
        marginTop: 16,
        [ UTMResetButton ]: {
            marginLeft: 16,
        },

        [ CopyOutputBtn ]: {
            marginLeft: 0,
        },
    },
})

export default class UTMGenerator extends React.Component<IProps, IState> {
    private readonly copyURLRef: React.RefObject<HTMLInputElement> = React.createRef()
    private readonly outputRef: React.RefObject<HTMLInputElement> = React.createRef()
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
            hints: ['google.pl', 'facebook.com', 'instagram.com', 'twitter.com' ]
        },
        {
            name: 'medium',
            required: true,
            hints: [ 'cpc', 'email', 'social', 'affiliate' ],
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
        const root = this.outputRef.current?.form

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

    public render() {
        return (
            <UTMForm onReset={ this.resetFormHandler } onChange={ this.updateOutputURL } autoComplete="off">
                {
                    this.generatorOptionsConfiguration.map((optionConfig, index): JSX.Element =>
                        <GeneratorInput { ...optionConfig } key={ index + optionConfig.name }/>)
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
                        <UTMResetButton squared
                                        type="reset">{ this.state.translations.generatorForm?.reset }</UTMResetButton>
                        <CopyOutputBtn squared type="button" theme="warning" onClick={ this.copyOutputToClipboard }>
                            { this.state.translations.generatorForm?.copy }
                            <FontAwesomeIcon icon={ faCopy }/>
                        </CopyOutputBtn>
                    </FormUtils>
                </UTMCompileOptionContainer>
            </UTMForm>
        )
    }
}