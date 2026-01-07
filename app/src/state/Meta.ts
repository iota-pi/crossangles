export interface YearAndTerm {
  year: number,
  term: number,
}

export interface Meta extends YearAndTerm {
  updateDate: string,
  updateTime: string,
  termStart: string,
  sources: string[],
}

// Ministry-specific metadata, to be attached to additional courses
export interface MinistryMeta {
  promoText: string,
  website: string,
  signupURL: string,
  signupValidFor: YearAndTerm[],
}

export const getCurrentTerm = (meta: YearAndTerm) => `${meta.year}~${meta.term}`;
