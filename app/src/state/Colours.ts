import { pink, deepPurple, indigo, blue, teal, lightGreen, amber, deepOrange, lime } from '@material-ui/core/colors';

const LIGHT_VARIANT = 700;
const DARK_VARIANT = 500;

const COLOUR_MAP = {
  pink,
  deepPurple,
  indigo,
  blue,
  teal,
  lightGreen,
  amber,
  deepOrange,
};
export const FALLBACK_COLOUR = lime;

export type Colour = keyof typeof COLOUR_MAP;

export const getColour = (colourName: Colour, dark?: boolean) => {
  const colour = COLOUR_MAP[colourName] || FALLBACK_COLOUR;
  const variant = dark ? DARK_VARIANT : LIGHT_VARIANT;
  return colour[variant];
}

export const COURSE_COLOURS = Object.keys(COLOUR_MAP) as Colour[];

export interface ColourMap {
  [course: string]: Colour,
}

