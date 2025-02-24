export interface Receipt {
  id: number;
  name: string;
  description?: string;
  ingredients: Ingredient[];
  steps: string[];
  prepTime?: number;
  cookingTime?: number;
  servings?: number;
  difficulty?: DifficultyEnum;
  category?: CategoryEnum[] | string[];
  tags?: string[];
  imageUrl: string;
  nutrition?: Nutrition;
  nutritionPerServing?: Nutrition;
  createdAt: string;
  createdById: number;
  reviews?: Review[];
  averageRating?: number;
}

export interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: UnitEnum;
  optional?: boolean;
  nutrition?: Nutrition;
}

export enum DifficultyEnum {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard',
}

export enum UnitEnum {
  Ml = 'ml', // milliliter
  L = 'l', // liter
  G = 'g', // gramm
  Dkg = 'dkg', // dekagramm
  Kg = 'kg', // kilogramm
  Dl = 'dl', // deciliter
  Tbsp = 'tbsp', // evőkanál
  Tsp = 'tsp', // teáskanál
  Sp = 'sp', // evőkanál
  Cup = 'cup', // csésze
  Pinch = 'pinch', // csipet
  Dash = 'dash', // egy kevés
  Pcs = 'pcs', // darab
  Slice = 'slice', // szelet
  Pack = 'pack', // csomag
  Can = 'can', // konzerv
  Bunch = 'bunch', // csokor (pl. petrezselyem)
  Head = 'head', // fej
  Stick = 'stick', // rúd
  Clove = 'clove', // gerezd
  Sheet = 'sheet', // lap (pl. réteslap)
  ToTaste = 'to taste', // ízlés szerint
}

export interface Nutrition {
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
}

export enum CategoryEnum {
  Breakfast = 'breakfast',
  Lunch = 'lunch',
  Dinner = 'dinner',
  Dessert = 'dessert',
  Soup = 'soup',
  Salad = 'salad',
  Appetizer = 'appetizer',
  SideDish = 'side dish',
  MainCourse = 'main-course',
  Snack = 'snack',
  Drink = 'drink',
  Vegan = 'vegan',
  Vegetarian = 'vegetarian',
  GlutenFree = 'gluten-free',
  LowCarb = 'low-carb',
  HighProtein = 'high-protein',
  Holiday = 'holiday',
  QuickEasy = 'quick & easy',
  Healthy = 'healthy',
  Spicy = 'spicy',
}

export interface Review {
  userId: number;
  username: string;
  likes?: number;
  rating: number;
  comment?: string;
  createdAt: string;
}
