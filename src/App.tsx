import React from 'react'
import ReactDOM from 'react-dom'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'shards-ui/dist/css/shards.min.css'
import 'Global.scss'

import styled from 'styled-components'

import UTMGenerator from 'Container/UTMGenerator'
import Header from 'Container/Header'

import ThemeConfig from 'Theme/Layout'

const Root = styled.div({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
})

const Container = styled.main({
    margin: '32px auto !important',
    width: '100% !important',
    '@media (min-width: 1200px)': {
        maxWidth: 960,
    },
    [ `@media (max-width: ${ ThemeConfig.smBreakpoint }px)` ]: {
        margin: '32px auto',
    },
})


class App extends React.Component {
    public render() {
        return (
            <Root>
                <Header/>

                <Container className="container">
                    <UTMGenerator/>
                </Container>
            </Root>
        )
    }
}


ReactDOM.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
    document.querySelector<HTMLDivElement>('#main-content .row-wrapper-x'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.unregister()
