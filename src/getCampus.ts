export const getCampus = (): string => import.meta.env.VITE_CAMPUS!;

export const isUNSW = () => getCampus() === 'unsw';
export const isUSYD = () => getCampus() === 'usyd';

export default getCampus;
