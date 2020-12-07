import React from 'react'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { HintItem, HintsContainer, RemoveHintFaIco, RemoveHint } from '../Theme/FormElement'
import { IHintConfig } from "UtmGenerator"

interface IProps {
    hints: IHintConfig[]
    hintClickHandler: (event: React.MouseEvent<HTMLUListElement>) => void
    getHintContentElement: (hintContent: string) => JSX.Element
    removeHint: (hintContent: string) => void
}

export default (props: IProps): JSX.Element => {

    return (
        <HintsContainer onClick={ props.hintClickHandler }>
            { props.hints?.map((hint, index) => (
                <HintItem key={ index + String(hint.value) }>
                    {/*add arrows keys support*/ }
                    { props.getHintContentElement(hint.value) }
                    { hint.removable &&
                    <RemoveHint onClick={ props.removeHint.bind(null, hint.value) }
                                             theme="danger" pill outline>
                        <RemoveHintFaIco icon={ faTimes }/>
                    </RemoveHint> }

                </HintItem> )) }
        </HintsContainer>
    )
}