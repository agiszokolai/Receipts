import { CommonModule, NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  inject,
  input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CategoryEnum, DifficultyEnum, UnitEnum } from '../../../model/receipt';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent implements OnInit, AfterViewInit {
  isModalVisible = input<boolean>(false);
  size = input<string>('');
  header = input<string>();
  formName = input<string>();
  footerButtonLabel = input<string>();
  isFooterCancelVisible = input<boolean>(false);

  actualForm = signal<FormGroup | any>(0);

  @Output() registrationEvent = new EventEmitter<any>();
  @Output() logInEvent = new EventEmitter<any>();
  @Output() closeEvent = new EventEmitter<any>();

  formGroup!: FormGroup;

  private fb = inject(FormBuilder);

  logInForm = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  registrationForm = new FormGroup({
    email: new FormControl('', Validators.required),
    username: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    passwordConfirm: new FormControl('', [
      Validators.required,
      this.passwordConfirmValidator(),
    ]),
  });

  receipeForm = new FormGroup({
    name: new FormControl('', Validators.required),
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
    imageUrl: new FormControl('', Validators.required),
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

  unitEnum = Object.values(UnitEnum);
  difficultyEnum = Object.values(DifficultyEnum);
  categoryEnum = Object.values(CategoryEnum);

  newTag: string = '';
  tagsList = signal<string[]>([]);

  get ingredients(): FormArray {
    return this.receipeForm.get('ingredients') as FormArray;
  }
  get steps(): FormArray {
    return this.receipeForm.get('steps') as FormArray;
  }
  /* get tags(): FormArray {
    return this.receipeForm.get('tags') as FormArray;
  }
 */

  ngOnInit() {
    console.log(this.formName());
    if (this.formName() == 'logInForm') {
      this.actualForm.set(this.logInForm);
    } else if (this.formName() === 'registrationForm') {
      this.actualForm.set(this.registrationForm);
    } else {
      this.actualForm.set(this.receipeForm);
    }
  }

  ngAfterViewInit(): void {}

  addIngredient() {
    this.ingredients.push(
      new FormGroup({
        ingredient: new FormControl('', Validators.required),
        quantity: new FormControl('', Validators.required),
        unit: new FormControl('', Validators.required),
      })
    );
  }

  removeIngredient(index: number) {
    this.ingredients.removeAt(index);
  }

  addStep() {
    const stepsGroup = new FormGroup({
      stepDescription: new FormControl('', Validators.required),
    });
    this.steps.push(stepsGroup);
  }

  removeStep(index: number) {
    this.steps.removeAt(index);
  }

  addTag() {
    const newTag = this.receipeForm.get('newTag')?.value?.trim() ?? '';
    if (newTag) {
      this.tagsList().push(newTag);
      this.receipeForm.get('tags')?.setValue([...this.tagsList()]); // Frissítjük a tags mezőt
      this.receipeForm.get('newTag')?.setValue(''); // Input mező törlése
    }
  }
  removeTag(tag: string) {
    const index = this.tagsList().findIndex((t) => t === tag);
    if (index !== -1) {
      const updatedTags = [...this.tagsList()];
      updatedTags.splice(index, 1);
      this.tagsList.set(updatedTags);
      this.receipeForm.get('tags')?.setValue(this.tagsList());
    }
  }
  /* 
  addTag() {
    if (this.newTag.trim()) {
      this.tags.push(this.fb.control(this.newTag.trim(), Validators.required));
      this.newTag = '';
    }
  }

  removeTag(index: number) {
    this.tags.removeAt(index);
  } */

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.receipeForm.patchValue({
          imageUrl: e.target.result, // A fájl URL-t itt menthetjük
        });
      };
      reader.readAsDataURL(file);
    }
  }

  passwordConfirmValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      // Ha nincs group (csak egyéni inputtól), akkor visszatérünk
      if (!control.parent) {
        return null;
      }

      const password = control.parent.get('password')?.value;
      const passwordConfirm = control.value;

      // Ha a jelszavak nem egyeznek
      return password !== passwordConfirm ? { passwordConfirm: true } : null;
    };
  }

  onSubmit() {
    if (this.formName() == 'logInForm') {
      if (this.logInForm.valid) {
        this.logInEvent.emit(this.logInForm.value);
        this.logInForm.reset();
      }
    } else if (this.formName() == 'registrationForm') {
      if (this.registrationForm.valid) {
        this.registrationEvent.emit(this.registrationForm.value);
        this.registrationForm.reset();
      }
    } else {
      //TODO: kezelést emgcsináni
      console.log(this.receipeForm.value);
    }
  }

  closeModal() {
    if (this.formName() == 'logInForm') {
      this.logInForm.reset();
    } else if (this.formName() == 'registrationForm') {
      this.registrationForm.reset();
    } else {
      this.receipeForm.reset();
    }
    this.closeEvent.emit();
  }
}
