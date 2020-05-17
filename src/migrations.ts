import { pink, deepPurple, indigo, blue, teal, lightGreen, amber, deepOrange } from '@material-ui/core/colors';

export const migrations = {
  0: (state: any) => {
    // Change colours from simple strings to objects
    const colours: {[course: string]: any} = state.colours;
    for (const c of Object.keys(colours)) {
      const COLOUR_MAP: { [colourName: string]: string } = {
        [pink[700]]: 'pink',
        [deepPurple[700]]: 'deepPurple',
        [indigo[700]]: 'indigo',
        [blue[700]]: 'blue',
        [teal[700]]: 'teal',
        [lightGreen[700]]: 'lightGreen',
        [amber[700]]: 'amber',
        [deepOrange[700]]: 'deepOrange',
      };
      if (typeof colours[c] === 'string') {
        const colour = (colours[c] as string).toLowerCase();
        colours[c] = COLOUR_MAP[colour];
      }
    }
    return {
      ...state,
      colours,
    };
  },
  1: (state: any) => {
    const meta = { ...state.meta };
    meta.sources = [meta.source];
    delete meta.source;
    return {
      ...state,
      meta,
    };
  },
}
