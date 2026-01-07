import { Meta } from '../../app/src/state/Meta';
import getAEST from '../getAEST';

function generateMetaData(term: number, termStart: string, sources: string[], year?: number): Meta {
  const now = getAEST();
  const currentYear = now.year();
  const currentMonth = now.month();
  const updateDate = now.format('DD/MM/YYYY');
  const updateTime = now.format('h:mm a');
  const guessedYear = term === 1 && currentMonth >= 6 ? currentYear + 1 : currentYear;

  return {
    sources,
    term,
    termStart,
    updateDate,
    updateTime,
    year: year || guessedYear,
  };
}

export default generateMetaData;
