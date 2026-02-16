import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './configureStore'
import { fetchData } from './actions'
import App from './App'

export function wrapApp(AppComponent: typeof App) {
  const AppWraper = () => {
    const handleBeforeLift = () => {
      const previousMeta = store.getState().meta
      store.dispatch(fetchData(previousMeta))
    }

    return (
      <Provider store={store}>
        <PersistGate persistor={persistor} loading={null} onBeforeLift={handleBeforeLift}>
          <AppComponent />
        </PersistGate>
      </Provider>
    )
  }
  return AppWraper
}

export default wrapApp(App)
