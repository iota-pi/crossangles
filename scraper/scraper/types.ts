import type StateManager from '../state/StateManager'

export interface ScrapeCampusArgs {
  state?: StateManager | null;
  outputPrefix: string;
}
