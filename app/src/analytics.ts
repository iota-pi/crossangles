import ReactGA from 'react-ga';

export const initialiseGA = () => {
  ReactGA.initialize('UA-101186620-1');
}

export const pageView = () => {
  ReactGA.pageview(window.location.origin + window.location.pathname);
}
