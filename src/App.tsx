import React from 'react'
import ReactDOM from 'react-dom'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'shards-ui/dist/css/shards.min.css'
import 'Global.styl'

import * as serviceWorker from './serviceWorker'
import styled from 'styled-components'

import UTMGenerator from 'Container/UTM-Generator'
import Navigation from 'Container/Navigation'
import { theme } from 'Theme'

const Root = styled.div({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: '100vh',
})

const Container = styled.main({
    '@media (min-width: 1200px)': {
        maxWidth: 960,
    },
})

class App extends React.Component {
    public render() {
        return (
            <Root>
                <Navigation/>
                <Container className="container">
                    <UTMGenerator/>
                </Container>

                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">

                    <defs>
                        <linearGradient id="MyGradient">
                            <stop offset="15%" stopColor={ theme.cnvOrange }/>
                            <stop offset="85%" stopColor={ theme.cnvBlue }/>
                        </linearGradient>
                    </defs>
                    <path d="M0,96L40,122.7C80,149,160,203,240,208C320,213,400,171,480,144C560,117,640,107,720,138.7C800,171,880,245,960,261.3C1040,277,1120,235,1200,213.3C1280,192,1360,192,1400,192L1440,192L1440,320L1400,320C1360,320,1280,320,1200,320C1120,320,1040,320,960,320C880,320,800,320,720,320C640,320,560,320,480,320C400,320,320,320,240,320C160,320,80,320,40,320L0,320Z"
                        fill="url(#MyGradient)"/>
                </svg>
            </Root>
        )
    }
}


ReactDOM.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
    document.querySelector<HTMLDivElement>('#root'))

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register()
