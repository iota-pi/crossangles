import ReactGA from 'react-ga';

export const initialiseGA = () => {
  ReactGA.initialize('UA-101186620-1', {
    titleCase: false,
  });
}

export const pageView = () => {
  ReactGA.pageview(window.location.pathname.replace(/^\/*/, ''));
}

export const CATEGORY = 'CrossAngles React';
