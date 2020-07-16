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

declare module 'UtmGenerator' {

    /* Form fields names */
    type IGeneratorField = 'url' | 'campaign' | 'source' | 'medium' | 'term' | 'content'

    /* Translation error labels */
    type IErrorLabel = 'empty' | 'pattern'

    interface ITranslationObj {
        language: string
        generatorForm: {
            copy: string
            reset: string
            lowercaseSwitch: string
            outputPlaceholder: string
            error: {
                [key in IErrorLabel]: string
            }
            field: {
                [key in IGeneratorField]: {
                    label: string
                    placeholder: string
                }
            }
        }
    }
}

declare module 'shards-react' {
    import React, { RefObject } from 'react'

    type ISize  = 'sm' | 'lg'
    type ITheme = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark'

    interface IFormProps {
        inline: boolean,
    }

    interface IFormGroupProps {
        row: boolean,
        check: boolean,
        inline: boolean,
        disabled: boolean,
    }

    interface IFormSelect {
        size: ISize
        valid: boolean
        invalid: boolean
    }

    interface IFormInput {
        inline: boolean,
        plaintext: boolean,
        type: 'password' | 'email' | 'number' | 'url' | 'tel' | 'search' | 'date' | 'datetime' | 'datetime-local' | 'month' | 'week' | 'time'
        size: string
        valid: boolean
        invalid: boolean
        innerRef: RefObject | string
    }

    interface IFormCheckbox  {
        inline: boolean
        valid: boolean
        invalid: boolean
        toggle: boolean
        small: boolean
        onChange: (...args: any[]) => void
    }

    interface IButton {
        theme: ITheme
        size: ISize
        outline: boolean
        pill: boolean
        squared: boolean
        active: boolean
        block: boolean
        disabled: boolean
    }

    interface IFormTextarea {
        size: ISize
        plaintext: boolean
        valid: boolean
        invalid: boolean
        innerRef: RefObject | string
    }

    interface INavbar {
        full: boolean
        fixed: string
        sticky: string
        theme: string
        role: string
        type: ITheme
        tag: string
        expand: boolean | string
    }

    interface INavbarBrand {
        tag: string
    }

    interface INav {
        navbar: boolean
        horizontal: string
        tabs: boolean
        card: boolean
        pills: boolean
        justified: boolean
        fill: boolean
        vertical: boolean | string
        tag: string
    }

    /* Basic elements */
    export class Button extends React.Component<Partial<IButton> & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>> {}

    /* Form */
    export class Form extends React.Component<Partial<IFormProps> & React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>>{}
    export class FormInput extends React.Component<Partial<IFormInput> & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>> {}
    export class FormSelect extends React.Component<Partial<IFormSelect> & React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>> {}
    export class FormGroup extends React.Component<Partial<IFormGroupProps> & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>> {}
    export class FormCheckbox extends React.Component<Partial<IFormCheckbox> & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>> {}
    export class FormTextarea extends React.Component<Partial<IFormTextarea> & React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>> {}

    /* Navigation */
    export class Nav extends React.Component<Partial<INav> & React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>> {}
    export class Navbar extends React.Component<Partial<INavbar> & React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>> {}
    export class NavbarBrand extends React.Component<Partial<INavbarBrand> & React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement> > {}
}