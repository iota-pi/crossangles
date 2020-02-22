export interface YearAndTerm {
  year: number,
  term: number,
}

export interface MinistryMeta {
  promoText: string,
  ministryName: string,
  ministryWebsite: string,
  signupURL: string,
  signupValidFor: YearAndTerm[],
}

export interface Meta extends YearAndTerm, MinistryMeta {
  updateDate: string,
  updateTime: string,
  signup: string,
  source: string,
}
