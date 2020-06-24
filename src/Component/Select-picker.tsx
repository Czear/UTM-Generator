import React from 'react'
import styled from 'styled-components'
import { FormGroup, FormSelect } from 'shards-react'

interface IProps {
    selectOptions: Array<ISelectOption>
    changeChandler?: (event?: React.ChangeEvent) => void
}

interface ISelectOption {
    label: string
    value: string
}

const Root = styled(FormGroup)({})

const OutputContainer = styled.div({})

const OptionsSelect = styled(FormSelect)({})

export default (props: IProps): JSX.Element => {
    return (
        <Root>
            <OutputContainer>Output </OutputContainer>
            <OptionsSelect defaultValue="default-value">
                <option disabled hidden value="default-value">default value</option>
                { props.selectOptions.map((optionConfig, index) => (
                    <option key={ index } value={ optionConfig.value }>{ optionConfig.label }</option>
                )) }
            </OptionsSelect>
        </Root>
    )
}