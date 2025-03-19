import { DifficultyEnum, UnitEnum } from '../helpers/constants';

export interface IReceipt {
  id: number;
  name: string;
  description: string;
  ingredients: IIngredientSection[];
  steps: string[];
  prepTime: number;
  cookingTime?: number;
  servings: number;
  difficulty: DifficultyEnum;
  category: string;
  tags: string[];
  imageUrl?: string;
  nutrition?: INutrition;
  nutritionPerServing?: INutrition;
  createdAt: string;
  createdById: number;
  reviews?: IReview[] | null;
  averageRating: number;
  likes: number;
  saves: number;
}
export interface IIngredientSection {
  sectionName: string; // Pl. "Tészta", "Krém", "Máz"
  ingredients: IIngredient[]; // Az adott szekcióhoz tartozó hozzávalók
}

export interface IIngredient {
  id: number;
  name: string;
  amount: number;
  unit: UnitEnum | string;
  optional?: boolean;
  nutrition?: INutrition;
}

export interface INutrition {
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
}

//TODO: ezt átgondolni
export interface IReview {
  id: number;
  userId: string;
  username: string;
  likes: number | null;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt?: string | null;
}
