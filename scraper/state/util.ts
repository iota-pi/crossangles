import StateManager from './StateManager';
import getStateManager from './getStateManager';

const GLOBAL_STATE = '__all__';
const version = process.env.SCRAPER_VERSION;

export async function checkVersionChange (state?: StateManager) {
  state = state || getStateManager();
  const lastVersion = await state.get(GLOBAL_STATE, 'version');
  return version !== lastVersion;
}

export async function updateVersion (state?: StateManager) {
  state = state || getStateManager();
  await state.set(GLOBAL_STATE, 'version', version);
}
