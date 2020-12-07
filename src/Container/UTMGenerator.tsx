/* React */
import React from 'react'

/* Element */
import * as IShardsReact from 'shards-react'
import * as FormElements from 'App/Theme/FormElement'
import LinkPropertyInput from 'Container/LinkPropertyInput'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

/* Language */
import languageService from 'Service/Language'

/* Interface */
import { IRecursivePartial, ITranslationConfig, ITranslationObj } from 'Global'
import { IGeneratorField, IHintConfig, IHintsHistory, IUTMOptionConfig } from 'UtmGenerator'

/* Asset */
import { faCopy } from '@fortawesome/free-solid-svg-icons'

/* Tool */
import { getCookie, setCookie } from 'Tool/Cookie'

interface IState {
    translations: IRecursivePartial<ITranslationObj<string>>
    generatedUrl?: string
    savedHints?: IHintsHistory
    formOptions: {
        forceLowerCaseOutput: boolean
    }
    inputValues: {
        [inputName in IGeneratorField]?: string
    }
}

export default class UTMGenerator extends React.Component<{}, IState> {
    /* Vars */

    private readonly historyCookieName = 'hintsHistory'
    private readonly outputRef: React.RefObject<HTMLInputElement> = React.createRef()
    private readonly generatorOptionsConfiguration: IUTMOptionConfig<string>[] = [
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
            hints: [ 'google.pl', 'facebook.com', 'instagram.com', 'twitter.com' ],
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

    public state = {
        translations: languageService.getPartialTranslation(this.translationConfig),
        savedHints: getCookie(this.historyCookieName) ?? {},
        formOptions: {
            forceLowerCaseOutput: false,
        },
        inputValues: {},
    } as IState

    /* Hooks */
    public componentDidMount() {
        languageService.store.subscribe((): void => {
            this.setState({
                translations: languageService.getPartialTranslation(this.translationConfig),
            })
        })
    }

    /* Listener handlers */
    private onFormReset = () => {
        this.setState((prevState) => {
            const stateCopy = { ...prevState }

            delete stateCopy.generatedUrl
            stateCopy.formOptions.forceLowerCaseOutput = false

            return stateCopy
        })
    }

    private onFormCopy = (event: React.ClipboardEvent) => {
        if (this.outputRef.current === event.target) {
            this.updateHintsHistory(true)
        }
    }

    private onLowercaseSwitchClick = (): void => {
        this.setState((prevState) => ( {
            formOptions: {
                forceLowerCaseOutput: !prevState.formOptions.forceLowerCaseOutput,
            },
        } ))

        this.updateOutputURL()
    }

    private onCopyBtnClick = () => {
        const outputElement = this.outputRef?.current

        if (outputElement) {
            outputElement.select()
            document.execCommand('copy')
            window.getSelection()?.removeAllRanges()
        }

    }

    private onInputChange = async (inputName: IGeneratorField, inputValue: string | false) => {
        await this.setState((prevState) => {
            const stateCopy = { ...prevState }

            if (inputValue === false) {
                delete stateCopy.inputValues[ inputName ]
            } else {
                stateCopy.inputValues[ inputName ] = inputValue
            }

            return stateCopy
        })

        this.updateOutputURL()
    }

    /* Data updaters */
    private updateOutputURL = (): void => {
        let generatedURL = ''
        let isValid = true

        /* Only valid values are added to state.inputValues so i need only to check if all the required ones are present */
        for (const inputConfig of this.generatorOptionsConfiguration) {
            if (inputConfig.required && !this.state.inputValues[ inputConfig.name ]) {
                isValid = false
                break
            }
        }

        /* Build url */
        if (isValid) {
            const urlFieldValue = this.state.inputValues[ 'url' ]

            if (urlFieldValue) {
                /* Generate url object */
                const urlObject = new URL(( !/^http/.test(urlFieldValue) ? 'http://' : '' ) + urlFieldValue)
                generatedURL += urlObject.origin

                if (urlObject.pathname !== '/') {
                    generatedURL += urlObject.pathname
                }

                generatedURL += urlObject.search

                /* Add form params to url */
                for (const [ inputName, inputValue ] of Object.entries(this.state.inputValues)) {
                    if (inputName !== 'url') {
                        generatedURL += `${ ( /\?/.test(generatedURL) ? '&' : '?' ) }utm_${ inputName }=${ inputValue }`
                    }
                }

                generatedURL += urlObject.hash


                if (this.state.formOptions.forceLowerCaseOutput) {
                    generatedURL = generatedURL.toLowerCase()
                }
            }
        }

        /* Output update */
        this.setState((prevState) => {
            const prevStateCopy = { ...prevState }

            if (isValid) {
                prevStateCopy.generatedUrl = generatedURL
            } else {
                delete prevStateCopy.generatedUrl
            }

            return prevStateCopy
        })
    }

    private updateHintsHistory = (addUserInputsToHistory = false) => {
        const cookiesHistory = ( getCookie(this.historyCookieName) ?? {} ) as IHintsHistory

        if (addUserInputsToHistory) {
            /* Iterate all form input */
            for (const [ inputName, inputValue ] of Object.entries(this.state.inputValues)) {

                if (inputValue && inputName !== 'url') {
                    /* Get input hints space */
                    let inputHistoryArray = cookiesHistory[ inputName as IGeneratorField ]


                    const inputConfigHints = this.getInputBaseConfig(inputName as IGeneratorField)?.hints ?? []

                    if (!inputHistoryArray) {
                        cookiesHistory[ inputName as IGeneratorField ] = []
                        inputHistoryArray = cookiesHistory[ inputName as IGeneratorField ]
                    }

                    /* Add hint */
                    if (inputHistoryArray && ![ ...inputConfigHints, ...inputHistoryArray ].find(savedHint => savedHint === inputValue)) {
                        inputHistoryArray.push(inputValue)

                        while (inputHistoryArray.length > 10) {
                            inputHistoryArray.shift()
                        }
                    } else if (!inputHistoryArray?.length) { /* Remove field if empty */
                        delete cookiesHistory[ inputName as IGeneratorField ]
                    }

                }
            }
        }

        setCookie(this.historyCookieName, cookiesHistory as {})
        this.setState({
            savedHints: cookiesHistory,
        })
    }

    /* Other */
    private getParsedHints = (inputName: IGeneratorField): IHintConfig[] => {
        const defaultHints = this.getInputBaseConfig(inputName)?.hints
        let rawHints: IHintConfig[] = []
        const parsedHints: IHintConfig[] = []

        /* Build raw hints */
        if (defaultHints) {
            rawHints = defaultHints.map((hintValue) => ( {
                value: hintValue,
                removable: false,
            } )) as IHintConfig[]
        }


        if (this.state.savedHints) {
            const currentSavedHints = this.state.savedHints[ inputName ]?.map((hintValue): IHintConfig => ( {
                value: hintValue,
                removable: true,
            } ))

            if (currentSavedHints) {
                rawHints = [ ...rawHints, ...currentSavedHints ]
            }
        }

        /* Build config */
        for (const rawHint of new Set(rawHints).values()) {
            parsedHints.push({
                removable: !defaultHints?.find((defaultHint) => defaultHint === rawHint.value),
                value: rawHint.value,
            })
        }

        return parsedHints
    }

    private getInputBaseConfig = (inputName: IGeneratorField): IUTMOptionConfig<string> | undefined => this.generatorOptionsConfiguration.find((config) => config.name === inputName)

    public render() {
        return (

            <FormElements.UTMForm onReset={ this.onFormReset } autoComplete="off" onCopy={ this.onFormCopy }>
                {
                    this.generatorOptionsConfiguration.map((optionConfig, index): JSX.Element => (
                        <LinkPropertyInput { ...optionConfig } hints={ this.getParsedHints(optionConfig.name) }
                                           key={ index + '-' + optionConfig.name }
                                           updateHints={ this.updateHintsHistory }
                                           change={ this.onInputChange }/>
                    ))
                }

                <hr/>

                <FormElements.OutputInput value={ this.state.generatedUrl } innerRef={ this.outputRef } readOnly
                                          id="utm-output"
                                          placeholder={ this.state.translations.generatorForm?.outputPlaceholder }/>

                <FormElements.UTMCompileOptionContainer>
                    <IShardsReact.FormCheckbox checked={ this.state.formOptions.forceLowerCaseOutput }
                                               onChange={ this.onLowercaseSwitchClick } id="utm-lower-case" toggle
                                               small/>
                    <FormElements.UTMLabel
                        htmlFor="utm-lower-case">{ this.state.translations.generatorForm?.lowercaseSwitch }</FormElements.UTMLabel>

                    <FormElements.FormUtils>
                        <FormElements.UTMResetButton squared
                                                     type="reset">{ this.state.translations.generatorForm?.reset }</FormElements.UTMResetButton>
                        <FormElements.CopyOutputBtn squared type="button" theme="warning"
                                                    onClick={ this.onCopyBtnClick }>
                            { this.state.translations.generatorForm?.copy }
                            <FontAwesomeIcon icon={ faCopy }/>
                        </FormElements.CopyOutputBtn>
                    </FormElements.FormUtils>
                </FormElements.UTMCompileOptionContainer>
            </FormElements.UTMForm>
        )
    }
}