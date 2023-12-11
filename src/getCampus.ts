import env from './env';

export const getCampus = (): string => env.campus;

export const isUNSW = () => getCampus() === 'unsw';
export const isUSYD = () => getCampus() === 'usyd';

export default getCampus;
