export class SubMenuItem {
  label: string;
  name: string;

  constructor(label: string, name: string) {
    this.label = label;
    this.name = name;
  }
}

export interface ISearch {
  searchText: string;
  categories: string[];
  difficulties: string[];
  prepTime: string[];
  rating: string[];
}
