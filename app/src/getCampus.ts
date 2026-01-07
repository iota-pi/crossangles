import env from './env';

export const getCampus = (): string => env.campus;

export const isUNSW = () => getCampus() === 'unsw';

export default getCampus;
