import StateManager from './StateManager';
import getStateManager from './getStateManager';
import version from '../version';

const GLOBAL_STATE = '__all__';

export async function checkVersionChange(stateManager?: StateManager) {
  const state = stateManager || getStateManager();
  const lastVersion = await state.get(GLOBAL_STATE, 'version');
  return version !== lastVersion;
}

export async function updateVersion(stateManager?: StateManager) {
  const state = stateManager || getStateManager();
  await state.set(GLOBAL_STATE, 'version', version);
}
