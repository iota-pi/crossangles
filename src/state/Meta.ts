export interface MinistryMeta {
  promoText: string,
  linkText: string,
  linkURL: string,
}

export interface Meta extends MinistryMeta {
  term: number,
  year: number,
  updateDate: string,
  updateTime: string,
  signup: string,
}
