import React from 'react'
import { useSelector } from 'react-redux'
import { ThemeProvider } from '@material-ui/core'
import loadable from '@loadable/component'
import { getOptions } from './state/selectors'
import { theme } from './theme'

const App = loadable(() => import('./AppWrapper'))

export const AppContainer = () => {
  const { darkMode } = useSelector(getOptions)

  return (
    <ThemeProvider theme={theme(darkMode)}>
      <App />
    </ThemeProvider>
  )
}
export default AppContainer
