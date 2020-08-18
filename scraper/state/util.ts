import { StateManager } from './StateManager';
import getStateManager from './getStateManager';

const GLOBAL_STATE = '__all__';
const version = process.env.SCRAPER_VERSION;

export async function checkVersionChange(stateManager?: StateManager) {
  const state = stateManager || getStateManager();
  const lastVersion = await state.get(GLOBAL_STATE, 'version');
  return version !== lastVersion;
}

export async function updateVersion(stateManager?: StateManager) {
  const state = stateManager || getStateManager();
  await state.set(GLOBAL_STATE, 'version', version);
}
