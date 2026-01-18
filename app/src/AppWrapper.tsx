import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './configureStore'
import { fetchData } from './actions'
import App from './App'

const previousMeta = store.getState().meta
store.dispatch(fetchData(previousMeta))

export function wrapApp(AppComponent: typeof App) {
  const AppWraper = () => (
    <Provider store={store}>
      <PersistGate persistor={persistor} loading={null}>
        <AppComponent />
      </PersistGate>
    </Provider>
  )
  return AppWraper
}

export default wrapApp(App)
