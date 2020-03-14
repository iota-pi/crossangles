export interface YearAndTerm {
  year: number,
  term: number,
}

export interface Meta extends YearAndTerm {
  updateDate: string,
  updateTime: string,
  signup: string,
  source: string,
}

// Ministry-specific metadata, to be attached to additional courses
export interface MinistryMeta {
  promoText: string,
  website: string,
  signupURL: string,
  signupValidFor: YearAndTerm[],
}
