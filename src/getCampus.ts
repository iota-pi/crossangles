const campusRegex = /\b([a-z]+)\.crossangles.app$/;
const campusMapping: { [subdomain: string]: string } = {
  'next': 'unsw',
};
let cache: string | null = null;

export const getCampus = (hostname: string): string => {
  if (cache !== null) {
    return cache;
  }

  // Default to value from environment variable
  let result = process.env.REACT_APP_DEFAULT_CAMPUS!;

  // Try to find campus from hostname
  const matches = hostname.match(campusRegex);
  if (matches) {
    result = matches[1];
  }

  result = campusMapping[result] || result;

  cache = result;
  return result;
}

export const clearCampusCache = () => {
  cache = null;
}

export default getCampus;
