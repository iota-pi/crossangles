import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { AppContainer } from './AppContainer';
import { store } from './configureStore';


const rootElement = document.getElementById('root')!;
const root = createRoot(rootElement);
root.render(
  <Provider store={store}>
    <AppContainer />
  </Provider>,
);
