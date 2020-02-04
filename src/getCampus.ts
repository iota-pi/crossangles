const campusRegex = /\b([a-z]+)\.crossangles.app$/;
let cache: string | null = null;

export const getCampus = (hostname: string): string => {
  if (cache !== null) {
    return cache;
  }

  // Default to value from environment variable
  let result = process.env.REACT_APP_CAMPUS!;

  // Try to find campus from hostname
  const matches = hostname.match(campusRegex);
  if (matches) {
    result = matches[1];
  }

  cache = result;
  return result;
}

export const clearCampusCache = () => {
  cache = null;
}

export default getCampus;
