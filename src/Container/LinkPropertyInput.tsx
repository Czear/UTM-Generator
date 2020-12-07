/* React */
import React, { ChangeEvent, Fragment } from 'react'

/* Element */
import { FormGroup } from 'shards-react'
import {
    HintItem,
    HintsDropdownFaIco,
    HintText,
    ParamInput,
    RemoveHint,
    UserInputContainer,
    UTMLabel,
    ValidationErrorContainer,
} from 'App/Theme/FormElement'

/* Language */
import languageService from 'Service/Language'

/* Interface */
import { IRecursivePartial, IStringifyBool, ITranslationObj } from 'Global'
import { IErrorLabel, IHintConfig, IHintsHistory, IUTMOptionConfig } from 'UtmGenerator'

/* Asset */
import { faSortDown } from '@fortawesome/free-solid-svg-icons'
import { getCookie, setCookie } from 'Tool/Cookie'
import InputHints from 'Component/InputHints'

interface IState {
    translations: IRecursivePartial<ITranslationObj<string>>
    validationMessage?: IErrorLabel
    showHints?: boolean
    showValidation: boolean
}

interface IProps extends IUTMOptionConfig<IHintConfig> {
    updateHints: Function
}

export default class LinkPropertyInput extends React.Component<IProps, IState> {
    private readonly inputElementRef = React.createRef<HTMLInputElement>()
    private readonly urlRegex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.][a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/ // protected for tests only
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
        showValidation: true,
    }

    /* Hooks */
    public componentDidMount() {
        /* Language change subsection */
        languageService.store.subscribe((): void => {
            this.setState({
                translations: languageService.getPartialTranslation(this.translationConfig),
            })
        })

        /* Include hints related stuff into state if there were specified with props */
        const propsHints = this.props.hints
        if (propsHints) {
            this.setState((prevState) => ( {
                ...prevState,
                hints: [ ...propsHints ],
                showHints: false,
            } ))
        }
    }

    /* Tools */
    private get inputElement(): HTMLInputElement {
        const inputElement = this.inputElementRef.current

        if (inputElement) {
            return inputElement
        }

        throw new Error('Input element not rendered yet')
    }

    private getInputRegex = (inputName: string): string => {
        let elementRegex = this.attributeFieldRegex
        if (inputName === 'url') {
            elementRegex = this.urlRegex
        }

        return elementRegex.toString().replace(/^.|.$/g, '')
    }

    private hideHintsClickCallback = (event: MouseEvent) => {
        const target = event.target

        if (target !== this.inputElement && ( target instanceof HTMLElement && !target.matches(RemoveHint) )) {
            document.removeEventListener('click', this.hideHintsClickCallback)
            this.manageHintVisibility(false)
        }
    }

    private parseStringIntoRegexString = (input: string): string => input.replace(/([[\\^$.|?*+()])/, '\\$1')

    /* Functionality */

    /* DOM handlers */
    private inputGainFocus = () => {
        this.manageHintVisibility(true)
        this.setState({
            showValidation: false,
        })
    }

    private inputLooseFocus = (event: React.FocusEvent) => {
        const eventRelativeTarget = event.nativeEvent.relatedTarget

        if (eventRelativeTarget instanceof HTMLElement) {
            if (!eventRelativeTarget.matches(RemoveHint.toString())) {
                this.manageHintVisibility(false)
            }
        } else if (!this.state.showHints) {
            this.updateInputValue()
        }

        this.setState({
            showValidation: true,
        })
    }

    private hintClickHandler = (event: React.MouseEvent<HTMLUListElement>) => {
        const target = event.target

        if (target instanceof HTMLElement) {

            if (target.matches(HintItem.toString())) {
                this.updateInputValue(String(target.textContent).trim())
            }

            if (!target.matches(RemoveHint.toString())) {
                this.manageHintVisibility(false)
            }
        }
    }

    private inputChangeHandler = (event: ChangeEvent) => {
        event.preventDefault()

        /* Validate value before change event is +*/
        this.updateInputValue()
    }

    /* Input related methods */

    /**
     * Updates input value with onChange event
     */
    private updateInputValue = async (newValue?: string): Promise<void> => {
        const inputElement = this.inputElement
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement?.prototype, 'value')?.set

        if (nativeInputValueSetter) {
            const inputValue = newValue ?? inputElement.value

            if (newValue) {
                inputElement.value = inputValue
            }

            await this.validateInput()

            /* Update parent element input values */
            this.props.change(this.props.name, this.state.validationMessage || !inputValue ? false : inputValue)
        }
    }

    private validateInput = async (): Promise<void> => {
        const targetInput = this.inputElement
        const inputValue = targetInput.value
        let validationErrorLabel: IErrorLabel | undefined

        if (targetInput.required && !inputValue.length) {
            validationErrorLabel = 'empty'
        } else if (targetInput.pattern.length && !new RegExp(targetInput.pattern).test(inputValue)) {
            validationErrorLabel = 'pattern'
        }


        if (this.state.validationMessage !== validationErrorLabel) { /* Update if label differs */
            await this.setState((prevState) => ( {
                ...prevState,
                validationMessage: validationErrorLabel,
            } ))
        }
    }

    /* Other */

    /**
     * Hide / show / toggle hints visibility
     */
    private manageHintVisibility = (showHints = !this.state.showHints) => {
        /* this.state.showHints could be undefined */
        if (showHints && this.state.showHints === false) {
            document.addEventListener('click', this.hideHintsClickCallback)
        }

        if (!showHints) {
            this.inputElement.blur()

            document.removeEventListener('click', this.hideHintsClickCallback)
        }

        if (this.props.hints) {
            this.setState({
                showHints: showHints,
            })
        }
    }

    private removeHint = (hintContent: string) => {
        const historyCookieName = 'hintsHistory'

        const historyCookie = getCookie(historyCookieName) as IHintsHistory

        /* Filter out targeted hint */
        historyCookie[ this.props.name ] = historyCookie[ this.props.name ]?.filter((savedHint) => savedHint !== hintContent)

        if (!historyCookie[ this.props.name ]?.length) {
            delete historyCookie[ this.props.name ]
        }

        setCookie(historyCookieName, historyCookie as {})
        this.props.updateHints()
    }

    private getHintContentElement = (hintContent: string): JSX.Element => {
        let boldedText = null
        let regularText = hintContent

        if (hintContent.length) {
            const matchedTextRegex = new RegExp('^' + this.parseStringIntoRegexString(this.inputElement.value))
            const regularTextMatch = hintContent.match(matchedTextRegex)

            boldedText = hintContent.replace(matchedTextRegex, '')
            regularText = regularTextMatch === null ? '' : regularTextMatch[ 0 ]
        }

        return <HintText>
            { regularText }{ boldedText && ( <b>{ boldedText }</b> ) }
        </HintText>
    }

    public render() {
        /* Translations */
        const inputTranslationsObj = this.state.translations.generatorForm?.field
        const errorsTranslations = this.state.translations.generatorForm?.error
        const inputTranslations = inputTranslationsObj ? inputTranslationsObj[ this.props.name ] : null

        
        /* Missing translations */
        if (!( inputTranslationsObj && inputTranslations && errorsTranslations)) {
            return
        }

        /* Hints */
        const filteredHints = this.props.hints?.filter((hintConfig) => hintConfig.value.match(new RegExp('^' + ( this.inputElementRef.current ? this.inputElement.value : '' ))))
        const hintsVisible = !!( this.state.showHints && filteredHints?.length )

        return ( <FormGroup>
                <UTMLabel required={ this.props.required }
                          htmlFor={ 'utm-link-' + inputTranslations.label?.toLocaleLowerCase() }>
                    { inputTranslations.label }
                </UTMLabel>
                <UserInputContainer>
                    <ParamInput placeholder={ inputTranslations.placeholder }
                                id={ 'utm-link-' + this.props.name }
                                name={ this.props.name }
                                pattern={ this.getInputRegex(this.props.name) }
                                required={ this.props.required }
                                invalid={ !!( this.state.validationMessage && this.state.showValidation ) }
                                innerRef={ this.inputElementRef }
                                onFocus={ this.inputGainFocus }
                                onBlur={ this.inputLooseFocus }
                                onChange={ this.inputChangeHandler }
                                contains-hints={ ( !!filteredHints ).toString() as IStringifyBool }
                                hints-visible={ hintsVisible.toString() as IStringifyBool }
                    />

                    { !!filteredHints?.length && <Fragment>
                        <HintsDropdownFaIco onClick={ () => this.manageHintVisibility() } icon={ faSortDown }/>

                        { this.state.showHints &&
                        <InputHints hints={ filteredHints } removeHint={ this.removeHint }
                                    getHintContentElement={ this.getHintContentElement }
                                    hintClickHandler={ this.hintClickHandler }/>
                        }

                    </Fragment> }
                </UserInputContainer>

                { ( this.state.validationMessage && this.state.showValidation ) &&
                <ValidationErrorContainer>
                    { errorsTranslations[ this.state.validationMessage ] }
                </ValidationErrorContainer> }
            </FormGroup>
        )

    }
}