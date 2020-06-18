import { Meta } from '../../app/src/state/Meta';
import getAEST from '../getAEST';

export function generateMetaData (term: number, sources: string[]): Meta {
  const now = getAEST();
  const currentYear = now.year();
  const currentMonth = now.month();
  const updateDate = now.format('DD/MM/YYYY');
  const updateTime = now.format('h:mm a');

  return {
    year: term === 1 && currentMonth >= 6 ? currentYear + 1 : currentYear,
    term,
    sources,
    updateDate,
    updateTime,
  };
}
