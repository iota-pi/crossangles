import moment from 'moment-timezone';

export const getAEST = () => {
  return moment().tz('Australia/Sydney').toDate();
};

export default getAEST;
