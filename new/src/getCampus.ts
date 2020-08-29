export const getCampus = (): string => process.env.REACT_APP_CAMPUS!;

export const isUNSW = () => getCampus() === 'unsw';
export const isUSYD = () => getCampus() === 'usyd';

export default getCampus;
