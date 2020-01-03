export type Colour =  '#C2185B' | '#512DA8' | '#303F9F' | '#1976D2' | '#00796B' | '#689F38' | '#FFA000' | '#E64A19';

export const COURSE_COLOURS: Colour[] = [
  '#C2185B',
  '#512DA8',
  '#303F9F',
  '#1976D2',
  '#00796B',
  '#689F38',
  '#FFA000',
  '#E64A19',
];

export const CBS_COLOUR: Colour = COURSE_COLOURS[2];

export interface ColourMap {
  [course: string]: Colour,
}

