import { Meta } from '../../app/src/state/Meta';
import getAEST from '../getAEST';

function generateMetaData(term: number, sources: string[], year?: number): Meta {
  const now = getAEST();
  const currentYear = now.year();
  const currentMonth = now.month();
  const updateDate = now.format('DD/MM/YYYY');
  const updateTime = now.format('h:mm a');
  const guessedYear = term === 1 && currentMonth >= 6 ? currentYear + 1 : currentYear;

  return {
    year: year || guessedYear,
    term,
    sources,
    updateDate,
    updateTime,
  };
}

export default generateMetaData;
