import { createTheme, PaletteOptions } from '@mui/material/styles'
import { indigo, lightBlue } from '@mui/material/colors'

export const theme = (dark = false) => {
  let palette: PaletteOptions
  if (dark) {
    palette = {
      // In dark theme, we swap the primary and secondary colours
      secondary: { main: indigo[500] },
      primary: { main: lightBlue[400] },
      mode: 'dark',
      background: {
        default: 'rgb(48, 48, 48)',
        paper: 'rgb(66, 66, 66)',
      },
    }
  } else {
    palette = {
      primary: { main: indigo[600] },
      secondary: { main: lightBlue[600] },
      mode: 'light',
      background: {
        default: 'rgb(250, 250, 250)',
        paper: 'rgb(255, 255, 255)',
      },
    }
  }
  return createTheme({
    palette,
    components: {
      MuiSelect: {
        styleOverrides: {
          select: {
            '&:focus': {
              backgroundColor: 'none',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          sizeSmall: {
            padding: 6,
          },
        },
      },
    },
    typography: {},
  })
}

export default theme
