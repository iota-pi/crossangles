import { store } from './configureStore';
import { fetchData as fetchDataThunk } from './actions';

export const fetchData = async () => {
  await store.dispatch(fetchDataThunk(process.env.REACT_APP_DATA_URI as string));
}

export default fetchData;
