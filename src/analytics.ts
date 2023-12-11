import { initialize, pageview } from 'react-ga';

export const initialiseGA = () => {
  initialize('UA-101186620-1', { titleCase: false });
};

export const pageView = () => {
  pageview(window.location.pathname);
};

export const CATEGORY = 'CrossAngles React';
