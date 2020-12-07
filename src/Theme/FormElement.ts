
import Layout from 'Theme/Layout'

import * as IShardsReact from 'shards-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { IStringifyBool } from 'Global'
import styled, { CSSObject, StyledComponent } from 'styled-components'


export const UTMForm = styled(IShardsReact.Form)({
    padding: 32,
    boxShadow: '0 0 16px -4px #00000040',
    borderRadius: '16px',
}) as StyledComponent<typeof IShardsReact.Form, any, any> /* Prevent autocomplete attribute warning */

export const UTMResetButton = styled(IShardsReact.Button)({
    backgroundImage: 'linear-gradient(    rgb(36,58,164) 0%,    rgb(36,58,134) 51%,    rgb(36, 58, 114) 100%)',
    borderWidth: 0,
    '&:hover': {
        backgroundImage: 'unset',
        backgroundColor: Layout.cnvBlue,
    },
})

export const CopyOutputBtn = styled(IShardsReact.Button)({
    padding: '.75rem 0.9rem',
    marginLeft: 16,
    color: '#fff',
    backgroundImage: 'linear-gradient(rgb(253, 102, 33) 0%, rgb(253, 90, 31) 51%, rgb(253, 78, 30) 100%)',
    borderWidth: 0,
    ':hover': {
        color: '#fff !important',
        backgroundImage: 'unset',
        backgroundColor: Layout.cnvOrange,
    },
    ':active': {
        color: '#fff !important',
    },
    'svg': {
        marginLeft: '.5em',
    },
})

export const UTMLabel = styled.label((props: { required?: boolean }): CSSObject => ( {
    '&::after': {
        content: props.required ? '\'*\'' : 'unset',
        color: Layout.errorRed,
        'margin-left': '.25em',
    },
} ))

export const UTMCompileOptionContainer = styled(IShardsReact.FormGroup)((): CSSObject => ( {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'wrap',
    [ UTMResetButton ]: {
        marginLeft: 'auto',
    },
} ))

export const OutputInput = styled(IShardsReact.FormTextarea)({
    cursor: 'text !important',
    marginBottom: '1rem',
})

export const FormUtils = styled.div({
    marginLeft: 'auto',
    'button': {
        transitionDuration: '0s',
    },
    [ `@media (max-width: ${ Layout.smBreakpoint }px)` ]: {
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

export const UserInputContainer = styled.div({
    position: 'relative' as 'relative',
})

export const ParamInput = styled(IShardsReact.FormInput)((props: ( { [ 'contains-hints' ]: IStringifyBool, [ 'hints-visible' ]?: IStringifyBool } )) => {
    const containsHints = props[ 'contains-hints' ] === 'true'

    let styles: CSSObject = {
        padding: '.5rem .8rem',
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
                borderColor: Layout.focusSelectBorderColor + ' !important',
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

export const ValidationErrorContainer = styled.div({
    color: '#ef5350',
    marginTop: '.5em',
    '&::first-letter': {
        textTransform: 'uppercase',
    },
})

export const HintsDropdownFaIco = styled(FontAwesomeIcon)({
//    pointerEvents: 'none',
    cursor: 'pointer',
    position: 'absolute' as 'absolute',
    transform: 'translateY(-50%)',
    top: 16,
    right: 12,
})

export const RemoveHintFaIco = styled(FontAwesomeIcon)({
    height: '16px',
    width: '16px !important',
})


export const HintItem = styled(IShardsReact.ListGroupItem)((props: { disabled?: boolean }) => ( {
    borderColor: Layout.focusSelectBorderColor,
    backgroundColor: props.disabled ? '#f2f2f2' : '#ffffff',
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
        backgroundColor: '#57b8ff',
        fontWeight: 700,
        color: '#ffffff',

        [ RemoveHintFaIco ]: {
            color: '#ffffff',
        },
    },
} ))

export const RemoveHint = styled(IShardsReact.Button)({
    borderWidth: 0,
    marginLeft: 'auto',
    padding: 0,
    boxShadow: 'none',
    backgroundColor: 'transparent !important',
    outline: 'none',
    '&:hover': {
        boxShadow: 'unset',
        [ RemoveHintFaIco ]: {
            color: '#c4183c',
            backgroundColor: 'transparent',
        },
    },
    '&.btn:not(:disabled):not(.disabled)': {
        '&:active, &:focus': {
            boxShadow: 'none !important',

            '&:hover': {
                color: '#eb607e',
            },
        },
    },
})

//const HintsContainer = styled(IShardsReact.ListGroup)({
export const HintsContainer = styled.ul({
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

export const HintText = styled.p({
    marginBottom: '0 !important',
    'b': {
        fontWeight: 700,
    },
})

