import ReactGA from 'react-ga';

export const initialiseGA = () => {
  ReactGA.initialize('UA-101186620-1', {
    titleCase: false,
  });
}

export const pageView = () => {
  ReactGA.pageview(window.location.origin + window.location.pathname);
}

export const CATEGORY = 'CrossAngles React';
