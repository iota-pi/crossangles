import { createStore, applyMiddleware } from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import { persistStore, persistReducer, PersistConfig } from 'redux-persist';
import reducer from './reducers';
import transforms from './transforms';
import storage from 'redux-persist/lib/storage';
import { RootState } from './state';
import { AllActions } from './actions';

const persistConfig: PersistConfig = {
  key: 'root',
  storage,
  transforms,
}
const persistedReducer = persistReducer(persistConfig, reducer);
export const store = createStore(persistedReducer, applyMiddleware(thunk as ThunkMiddleware<RootState, AllActions>));
export const persistor = persistStore(store);
