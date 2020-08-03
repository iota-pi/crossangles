import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './configureStore';
import { fetchData } from './actions';
import App from './App';

store.dispatch(fetchData());

export function wrapApp(AppComponent: typeof App) {
  return class AppWrapper extends Component {
    render() {
      return (
        <Provider store={store}>
          <PersistGate persistor={persistor} loading={null}>
            <AppComponent {...this.props} />
          </PersistGate>
        </Provider>
      );
    }
  };
}

export default wrapApp(App);
