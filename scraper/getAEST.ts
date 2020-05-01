import moment from 'moment-timezone';

export const getAEST = () => {
  return moment().tz('Australia/Sydney');
};

export default getAEST;
