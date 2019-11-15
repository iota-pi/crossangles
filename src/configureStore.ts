import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { persistStore, persistReducer, PersistConfig } from 'redux-persist';
import reducer from './reducers';
import storage from 'redux-persist/lib/storage';
import transforms from './state/transforms';

const persistConfig: PersistConfig = {
  key: 'root',
  storage,
  transforms,
}
const persistedReducer = persistReducer(persistConfig, reducer);
export const store = createStore(persistedReducer, applyMiddleware(thunk));
export const persistor = persistStore(store);
