import StateManager from './StateManager'
import getStateManager from './getStateManager'
import version from '../version'

export async function checkVersionChange(campus: string, stateManager?: StateManager) {
  const state = stateManager || getStateManager()
  const lastVersion = await state.get(campus, 'version')
  return version !== lastVersion
}

export async function updateVersion(campus: string, stateManager?: StateManager) {
  const state = stateManager || getStateManager()
  await state.set(campus, 'version', version)
}
