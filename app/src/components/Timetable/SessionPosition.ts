import * as tt from './timetableUtil';

export const getClashOffset = (clashDepth: number) => {
  return {
    x: clashDepth * tt.CLASH_OFFSET_X,
    y: clashDepth * tt.CLASH_OFFSET_Y,
  };
}

export const getRaisedOffset = (isRaised: boolean) => {
  return {
    x: isRaised ? tt.RAISE_DIST_X : 0,
    y: isRaised ? tt.RAISE_DIST_Y : 0,
  };
}

export const getZ = (isSnapped: boolean, isDragging: boolean, clashDepth: number) => {
  const unsnapZ = (!isSnapped) ? tt.SESSION_DRAG_Z : 0;
  const dragZ = (isDragging) ? tt.SESSION_DRAG_Z : 0;
  const clashZ = tt.SESSION_LIFT_Z * clashDepth;
  return tt.SESSION_BASE_Z + unsnapZ + dragZ + clashZ;
}
