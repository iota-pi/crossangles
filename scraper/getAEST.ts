import moment from 'moment-timezone'

const getAEST = () => moment().tz('Australia/Sydney')

export default getAEST
