import { TimetablePlacement } from './Placement';

export class DropzonePlacement extends TimetablePlacement {
  protected clashDepthMultiplier = 1.5;
}
export default DropzonePlacement;
