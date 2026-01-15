import { useSelector } from 'react-redux'
import { ThemeProvider } from '@material-ui/core'
import { getOptions } from './state/selectors'
import { theme } from './theme'
import App from './AppWrapper'

export const AppContainer = () => {
  const { darkMode } = useSelector(getOptions)

  return (
    <ThemeProvider theme={theme(darkMode)}>
      <App />
    </ThemeProvider>
  )
}
export default AppContainer
