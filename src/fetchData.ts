import { store } from './configureStore';
import { fetchData as fetchDataThunk } from './actions';
import config from './campusConfig';
import getCampus from './getCampus';

export const fetchData = async () => {
  const campus = getCampus(window.location.hostname);
  const uri = config[campus].dataURI;
  await store.dispatch(fetchDataThunk(uri));
}

export default fetchData;
