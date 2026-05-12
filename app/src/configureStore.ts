import { createStore, applyMiddleware } from 'redux'
import thunk, { ThunkMiddleware } from 'redux-thunk'
import { persistStore, persistReducer, PersistConfig, createMigrate } from 'redux-persist'
import storage from 'redux-persist/es/storage'
import reducer from './reducers'
import transforms from './transforms'
import { RootState } from './state'
import { AllActions } from './actions'
import { migrations } from './migrations'

const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  storage,
  transforms,
  version: 5,
  migrate: createMigrate(migrations),
}
const persistedReducer = persistReducer(persistConfig, reducer)
export const store = createStore(
  persistedReducer,
  applyMiddleware(thunk as ThunkMiddleware<RootState, AllActions>),
)
export const persistor = persistStore(store)
