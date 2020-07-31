const COLOUR_MAP = {
  pink:       { light: '#c2185b', dark: '#d81b60' },
  deepPurple: { light: '#512da8', dark: '#5e35b1' },
  indigo:     { light: '#303f9f', dark: '#3949ab' },
  blue:       { light: '#1976d2', dark: '#1e88e5' },
  teal:       { light: '#00796b', dark: '#00897b' },
  lightGreen: { light: '#689f38', dark: '#7cb342' },
  amber:      { light: '#ffa000', dark: '#ffb300' },
  deepOrange: { light: '#e64a19', dark: '#f4511e' },
};
export const FALLBACK_COLOUR = { light: '#afb42b', dark: '#c0ca33' };

export type Colour = keyof typeof COLOUR_MAP;

export const getColour = (colourName: Colour, dark?: boolean) => {
  const colour = COLOUR_MAP[colourName] || FALLBACK_COLOUR;
  return dark ? colour.dark : colour.light;
};

export const COURSE_COLOURS = Object.keys(COLOUR_MAP) as Colour[];

export interface ColourMap {
  [course: string]: Colour,
}
