import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, input, Output, signal } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { emailValidator, passwordConfirmValidator } from '../../../../helpers/validators';
import { CategoryEnum, DifficultyEnum, UnitEnum } from '../../../../helpers/constants';

@Component({
  selector: 'app-forms',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './forms.component.html',
  styleUrl: './forms.component.scss',
})
export class FormsComponent {
  /** Form neve amelyik megjelenik */
  formName = input<string>();

  /** A submit gombon megjelenő szöveg */
  footerButtonLabel = input<string>();

  /** Esemény, amely értesíti a szülő komponenst a mentésről*/
  @Output() submitEvent = new EventEmitter<any>();

  /** Bejelentkezés űrlapja */
  logInForm = new FormGroup({
    email: new FormControl('', [Validators.required, emailValidator()]),
    password: new FormControl('', Validators.required),
  });

  /**Regisztráció űrlapja */
  registrationForm = new FormGroup({
    email: new FormControl('', [Validators.required, emailValidator()]),
    username: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    passwordConfirm: new FormControl('', [Validators.required, passwordConfirmValidator()]),
  });

  /** Recept létrehozás űrlapja */
  receipeForm = new FormGroup({
    receiptName: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    ingredients: new FormArray([]),
    steps: new FormArray([]),
    prepTime: new FormControl('', [Validators.required, Validators.min(0)]),
    /*  cookingTime: new FormControl('', [Validators.required, Validators.min(0)]), */
    servings: new FormControl('', [Validators.required, Validators.min(1)]),
    difficulty: new FormControl('', Validators.required),
    category: new FormControl('', Validators.required),
    tags: new FormControl<string[]>([]),
    newTag: new FormControl(''),
    imageUrl: new FormControl(''),
    /*  nutrition: this.fb.group({
        calories: new FormControl('', [Validators.required, Validators.min(0)]),
        fat: new FormControl('', [Validators.required, Validators.min(0)]),
        protein: new FormControl('', [Validators.required, Validators.min(0)]),
        carbs: new FormControl('', [Validators.required, Validators.min(0)]),
      }), */
    /*  nutritionPerServing: this.fb.group({
        calories: new FormControl('', [Validators.min(0)]),
        fat: new FormControl('', [Validators.min(0)]),
        protein: new FormControl('', [Validators.min(0)]),
        carbs: new FormControl('', [Validators.min(0)]),
      }), */
  });

  /** Nehézség dropdown-ja nyitva van-e */
  isDifficultyDropdownOpen = false;

  /** Kategória dropdown-ja nyitva van-e */
  isCategoryDropdownOpen = false;

  /** Kiválasztott nehézség */
  selectedDifficulty = '';

  /** Kiválasztott kategória */
  selectedCategory = '';

  /** mértékegységek enumba */
  unitEnum = Object.values(UnitEnum);

  /** nehézségi szint enumja */
  difficultyEnum = Object.values(DifficultyEnum);

  /**  kategóriák enumja */
  categoryEnum = Object.values(CategoryEnum);

  /** új cimke */
  newTag = '';

  /** címkék listája */
  tagsList = signal<string[]>([]);

  /**
   * Hozzávalók FormArray getter
   */
  get ingredients(): FormArray {
    return this.receipeForm.get('ingredients') as FormArray;
  }

  /**
   * Lépések FormArray getter
   */
  get steps(): FormArray {
    return this.receipeForm.get('steps') as FormArray;
  }

  /**
   * Új hozzávaló hozzáadása az űrlaphoz
   */
  onAddIngredientClick(): void {
    this.ingredients.push(
      new FormGroup({
        ingredient: new FormControl('', Validators.required),
        quantity: new FormControl('', Validators.required),
        unit: new FormControl('', Validators.required),
      }),
    );
  }

  /**
   * Hozzávaló eltávolítása az adott index alapján
   * @param {number} index - Az eltávolítandó hozzávaló indexe
   */
  onRemoveIngredientClick(index: number): void {
    this.ingredients.removeAt(index);
  }

  /**
   * Új lépés hozzáadása az űrlaphoz
   */
  onAddStepClick(): void {
    const stepsGroup = new FormGroup({
      stepDescription: new FormControl('', Validators.required),
    });
    this.steps.push(stepsGroup);
  }

  /**
   * Lépés eltávolítása az adott index alapján
   * @param {number} index - Az eltávolítandó lépés indexe
   */
  removeStep(index: number): void {
    this.steps.removeAt(index);
  }

  /**
   * Új címke hozzáadása a recepthez
   */
  onAddTagClick(): void {
    const newTag = this.receipeForm.get('newTag')?.value?.trim() ?? '';
    if (newTag) {
      this.tagsList().push(newTag);
      this.receipeForm.get('tags')?.setValue([...this.tagsList()]);
      this.receipeForm.get('newTag')?.setValue('');
    }
  }

  /**
   * Címke eltávolítása
   * @param {string} tag - Az eltávolítandó címke
   */
  onRemoveTagClick(tag: string): void {
    const index = this.tagsList().findIndex((t) => t === tag);
    if (index !== -1) {
      const updatedTags = [...this.tagsList()];
      updatedTags.splice(index, 1);
      this.tagsList.set(updatedTags);
      this.receipeForm.get('tags')?.setValue(this.tagsList());
    }
  }

  //TODO: megcsinálni
  /**
   * Kép kiválasztásának kezelése
   * @param {Event} event - A fájl kiválasztás eseménye
   */
  onFileSelected(event: any): void {}

  /**
   * Űrlap elküldése a kiválasztott típus alapján
   */
  onSubmit(): void {
    if (this.formName() == 'logInForm') {
      if (this.logInForm.valid) {
        console.log(this.logInForm.value);

        this.submitEvent.emit(this.logInForm.value);
        this.logInForm.reset();
      }
    } else if (this.formName() == 'registrationForm') {
      if (this.registrationForm.valid) {
        this.submitEvent.emit(this.registrationForm.value);
        this.registrationForm.reset();
      }
    } else {
      //TODO: kezelést emgcsináni
      if (this.receipeForm.valid) {
        this.submitEvent.emit(this.receipeForm.value);
      }

      console.log(this.receipeForm.value);
    }
  }

  /**
   * Egérkattintás figyelése a dropdown menük bezárásához
   * @param {MouseEvent} event - A kattintás esemény
   */
  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;

    const isClickInsideDifDropdown = targetElement.closest('.custom-select-input.dif');

    const isClickInsideCatDropdown = targetElement.closest('.custom-select-input.cat');

    if (!isClickInsideDifDropdown) {
      this.isDifficultyDropdownOpen = false;
    }
    if (!isClickInsideCatDropdown) {
      this.isCategoryDropdownOpen = false;
    }
  }
}
