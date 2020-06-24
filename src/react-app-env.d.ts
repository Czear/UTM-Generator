/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production' | 'test';
        readonly PUBLIC_URL: string;
    }
}

declare module '*.bmp' {
    const src: string
    export default src
}

declare module '*.gif' {
    const src: string
    export default src
}

declare module '*.jpg' {
    const src: string
    export default src
}

declare module '*.jpeg' {
    const src: string
    export default src
}

declare module '*.png' {
    const src: string
    export default src
}

declare module '*.webp' {
    const src: string
    export default src
}

declare module '*.svg' {
    import * as React from 'react'

    export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>

    const src: string
    export default src
}

declare module '*.module.css' {
    const classes: { readonly [ key: string ]: string }
    export default classes
}

declare module '*.module.scss' {
    const classes: { readonly [ key: string ]: string }
    export default classes
}

declare module '*.module.sass' {
    const classes: { readonly [ key: string ]: string }
    export default classes
}

declare module 'shards-react' {
    import React from 'react'

    type ISize  = 'sm' | 'lg'

    interface IFormProps extends React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
        inline?: boolean,
    }

    interface IFormGroupProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
        row?: boolean,
        check?: boolean,
        inline?: boolean,
        disabled?: boolean,
    }

    interface IFormSelect extends React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> {
        size?: ISize
        valid?: boolean
        invalid?: boolean
    }

    interface IFormInput extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
        inline?: boolean,
        plaintext?: boolean,
        type?: 'password' | 'email' | 'number' | 'url' | 'tel' | 'search' | 'date' | 'datetime' | 'datetime-local' | 'month' | 'week' | 'time'
        size?: string
        valid?: boolean
        invalid?: boolean
        innerRef?: RefObject | string
    }

    interface IFormCheckbox extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
        inline?: boolean
        valid?: boolean
        invalid?: boolean
        toggle?: boolean
        small?: boolean
        onChange?: (...args: any[]) => void
    }

    interface IButton extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
        theme?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'
        size?: ISize
        outline?: boolean
        pill?: boolean
        squared?: boolean
        active?: boolean
        block?: boolean
        disabled?: boolean
    }

    interface IFormTextarea extends React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement> {
        size?: ISize
        plaintext?: boolean
        valid?: boolean
        invalid?: boolean
        innerRef?: RefObject | string
    }

    export class Form extends React.Component<IFormProps> {
    }

    export class FormGroup extends React.Component<IFormGroupProps> {
    }

    export class FormSelect extends React.Component<IFormSelect> {
    }

    export class FormInput extends React.Component<IFormInput> {
    }

    export class FormCheckbox extends React.Component<IFormCheckbox> {
    }

    export class Button extends React.Component<IButton> {
    }

    export class FormTextarea extends React.Component<IFormTextarea> {
    }
}