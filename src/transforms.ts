import { createTransform } from "redux-persist";
import { StateHistory } from "./state";

export const historyTransform = createTransform(
  (inboundState: StateHistory) => {
    return {
      past: [],
      present: inboundState.present,
      future: [],
    };
  },
  (outboundState: StateHistory) => {
    return outboundState;
  },
  {
    whitelist: ['history'],
  },
)

export default [historyTransform];
