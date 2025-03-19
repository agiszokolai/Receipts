import {
  Component,
  computed,
  EventEmitter,
  HostListener,
  inject,
  input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import {
  FormGroup,
  FormArray,
  FormBuilder,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { UnitEnum, DifficultyEnum, CategoryEnum } from '../../../helpers/constants';
import { IIngredientSection, IReceipt } from '../../../model/receipt';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { IUser } from '../../../model/user';
import { MOCK_RECEIPTS } from '../../../mocks/mock-recipe-data';
import { ModalComponent } from '../../shared/modal/modal.component';

@Component({
  selector: 'app-recipe-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './recipe-create.component.html',
  styleUrl: './recipe-create.component.scss',
})
export class RecipeCreateComponent implements OnInit {
  user = input.required<IUser>();

  isCreateReceipt = input<boolean>(false);

  existingReceipt = input<IReceipt | null>(null);

  isExistingRecipe = computed(() => {
    return this.existingReceipt() ? true : false;
  });

  @Output() createEvent = new EventEmitter<any>();
  @Output() updateEvent = new EventEmitter<any>();
  @Output() closeEvent = new EventEmitter<any>();

  receipeForm!: FormGroup;

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

  ingredientsList: IIngredientSection[] = [];

  showNewSectionInput = false;

  /** címkék listája */
  tagsList = signal<string[]>([]);
  /**
   * Lépések FormArray getter
   */
  get steps(): FormArray {
    return this.receipeForm.get('steps') as FormArray;
  }
  get categories(): FormArray {
    return this.receipeForm.get('category') as FormArray;
  }
  get sections(): FormArray {
    return this.receipeForm.get('ingredients') as FormArray;
  }

  ingredients(index: number): FormArray {
    return (this.sections.at(index) as FormGroup).get('ingredients') as FormArray;
  }
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    /*  this.receipeForm = new FormGroup({
      receiptName: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      ingredients: this.fb.array([]),
      steps: new FormArray([]),
      prepTime: new FormControl('', [Validators.required, Validators.min(0)]),
      // cookingTime: new FormControl('', [Validators.required, Validators.min(0)]),
      servings: new FormControl('', [Validators.required, Validators.min(1)]),
      difficulty: new FormControl('', Validators.required),
      category: new FormControl('', Validators.required),
      tags: new FormControl<string[]>([]),
      newTag: new FormControl(''),
      //   newSection: new FormControl(''), 
      imageUrl: new FormControl(''),
      sectionName: new FormControl(''),
      //  nutrition: this.fb.group({
       //         calories: new FormControl('', [Validators.required, Validators.min(0)]),
//fat: new FormControl('', [Validators.required, Validators.min(0)]),
         //       protein: new FormControl('', [Validators.required, Validators.min(0)]),
             //   carbs: new FormControl('', [Validators.required, Validators.min(0)]),
    //          }), 
      /*  nutritionPerServing: this.fb.group({
                calories: new FormControl('', [Validators.min(0)]),
                fat: new FormControl('', [Validators.min(0)]),
                protein: new FormControl('', [Validators.min(0)]),
                carbs: new FormControl('', [Validators.min(0)]),
              }), */
    //    });

    this.initForm();
  }

  initForm() {
    if (this.existingReceipt()) {
      this.receipeForm = this.fb.group({
        receiptName: [this.existingReceipt()?.name, Validators.required],
        description: [this.existingReceipt()?.description || '', Validators.required],
        ingredients: this.fb.array(
          this.createIngredientsArray(this.existingReceipt()!.ingredients),
        ),
        steps: this.fb.array(this.createStepsArray(this.existingReceipt()!.steps)),
        prepTime: [this.existingReceipt()?.prepTime, [Validators.required, Validators.min(0)]],
        servings: [this.existingReceipt()?.servings, [Validators.required, Validators.min(1)]],
        difficulty: [this.existingReceipt()?.difficulty, Validators.required],
        category: [this.existingReceipt()?.category, Validators.required],
        tags: [this.createTagsArray(this.existingReceipt()?.tags || [])],
        newTag: [''],
        imageUrl: [this.existingReceipt()?.imageUrl],
        sectionName: [''],
      });
    } else {
      this.receipeForm = this.fb.group({
        receiptName: ['', Validators.required],
        description: ['', Validators.required],
        ingredients: this.fb.array([]),
        steps: this.fb.array([]),
        prepTime: ['', [Validators.required, Validators.min(0)]],
        servings: ['', [Validators.required, Validators.min(1)]],
        difficulty: ['', Validators.required],
        category: ['', Validators.required],
        tags: [[]],
        newTag: [''],
        imageUrl: [''],
        sectionName: [''],
      });
    }

    console.log(this.receipeForm);
  }

  createIngredientsArray(ingredients: IIngredientSection[]): FormGroup[] {
    return ingredients.map((section) => {
      return this.fb.group({
        sectionName: [section.sectionName, Validators.required],
        ingredients: this.fb.array(
          section.ingredients.map((ingredient) =>
            this.fb.group({
              name: [ingredient.name, Validators.required],
              amount: [ingredient.amount, [Validators.required, Validators.min(0)]],
              unit: [ingredient.unit, Validators.required],
              optional: [ingredient.optional || false],
            }),
          ),
        ),
      });
    });
  }

  createStepsArray(steps: any[]): FormGroup[] {
    return steps.map((step) => {
      return this.fb.group({
        stepDescription: [step],
      });
    });
  }
  createTagsArray(tags: string[]) {
    tags.map((tag) => {
      return this.tagsList().push(tag);
    });
  }

  onSubmit(): void {
    const formValues = this.receipeForm.getRawValue();
    console.log();

    const stepsFormatted = formValues.steps.map((step: any) => step.stepDescription);
    const recipeId = this.existingReceipt() ? this.existingReceipt()!.id : MOCK_RECEIPTS.length + 1;
    //TODO: reviews-t átalakaítani
    const data: IReceipt = {
      id: recipeId,
      name: formValues.receiptName,
      description: formValues.description,
      ingredients: formValues.ingredients,
      steps: stepsFormatted,
      prepTime: formValues.prepTime,
      servings: formValues.servings,
      difficulty: formValues.difficulty,
      category: formValues.category,
      tags: formValues.tags,
      imageUrl: formValues.imageUrl || '',
      createdAt: new Date().toISOString(),
      createdById: +this.user().userId!,
      reviews: null,
      averageRating: 0,
      likes: 0,
      saves: 0,
    };
    console.log('data', data);

    if (this.existingReceipt()) {
      this.updateEvent.emit(data);
    } else {
      this.createEvent.emit(data);
    }
    this.onClose();

    // Új recept hozzáadása a mock adatbázishoz
    /*  this.receiptService.createReceipt(data).subscribe({
        next: (createdReceipt) => {
          console.log('Új recept létrehozva:', createdReceipt);
        },
        error: (err) => {
          console.error('Hiba a recept létrehozásakor', err);
        },
      }); */
  }

  addSection() {
    console.log(this.receipeForm.get('sectionName'));
    this.showNewSectionInput = false;
    const sectionGroup = this.fb.group({
      sectionName: this.receipeForm.get('sectionName')?.value,
      ingredients: this.fb.array([]),
    });
    this.sections.push(sectionGroup);
    this.receipeForm.get('sectionName')?.setValue('');
  }

  addIngredient(sectionId: number) {
    const ingredientGroup = this.fb.group({
      name: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      unit: ['g', Validators.required],
    });
    this.ingredients(sectionId).push(ingredientGroup);
  }
  removeSection(index: number) {
    this.sections.removeAt(index);
  }
  removeIngredient(sectionIndex: number, ingredientsIndex: number) {
    this.ingredients(sectionIndex).removeAt(ingredientsIndex);
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
    console.log(this.tagsList().length);

    if (newTag && this.tagsList().length < 10) {
      this.tagsList.set([...this.tagsList(), newTag]);
      this.receipeForm.get('tags')?.setValue([...this.tagsList()]);
      this.receipeForm.get('newTag')?.setValue('');
    } else {
      this.toastr.warning('Maximum 10 címkét adhat hozzá egy recepthez!');
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
  selectCategory(category: string) {
    this.selectedCategory = category;
    this.receipeForm.get('category')?.setValue(category);
    this.isCategoryDropdownOpen = false;
  }
  selectDifficulty(difficulty: string) {
    this.selectedDifficulty = difficulty;
    this.receipeForm.get('difficulty')?.setValue(difficulty);
    this.isDifficultyDropdownOpen = false;
  }

  onClose() {
    /* this.isCreateReceipt.set(false); */
    this.closeEvent.emit();
    this.receipeForm.reset();
    this.tagsList.set([]);
    this.steps.clear();
    /*  this.ingredients.clear(); */
    /*  this.selectedCategories = []; */
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.receipeForm.patchValue({
          imageUrl: e.target.result,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  //** Legördülő menük bezárása ha nem oda van kattintva */
  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;

    // Ha nem a legördülő menüben kattintottak, akkor zárjuk be
    const isClickInsideDifficultyDropdown =
      targetElement.closest('.custom-select-input.dif') ||
      targetElement.closest('.custom-dropdown-menu');
    if (!isClickInsideDifficultyDropdown) {
      this.isDifficultyDropdownOpen = false;
    }

    const isClickInsideCategoryDropdown =
      targetElement.closest('.custom-select-input.cat') ||
      targetElement.closest('.custom-dropdown-menu');
    if (!isClickInsideCategoryDropdown) {
      this.isCategoryDropdownOpen = false;
    }
  }
}
