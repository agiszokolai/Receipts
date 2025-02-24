import {
  Component,
  HostListener,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { SearchService } from '../../../services/search.service';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CategoryEnum } from '../../../model/receipt';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { take } from 'rxjs';
import { User } from '../../../model/user';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  resultList = output<any[]>();

  searchList: any[] = [];
  filteredList: any[] = [];
  selectedCategories: string[] = [];
  categoryEnum = Object.values(CategoryEnum);

  user = signal<User | null>(null);

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

  isUserMenuOpen = signal(false);
  isLoginModalOpen = signal(false);
  isRegistrationModalOpen = signal(false);

  searchText: string = '';

  selectedOption: string[] = [];

  isDropdownOpen = false;

  private searchService = inject(SearchService);
  private router = inject(Router);
  private userService = inject(UserService);

  ngOnInit(): void {
    this.userService.user$.subscribe({
      next: (u) => {
        this.user.set(u); // A felhasználó adatainak beállítása
        console.log('navbar: ', this.user);
      },
    });

    this.searchService.originalList$.subscribe({
      next: (list) => {
        this.searchList = list;
        this.filterList();
      },
    });
  }

  onSearchChange() {
    this.filterList();
  }

  onCategoryChange(category: string) {
    // Kategória változás kezelése
    this.selectOption(category);
    if (this.selectedCategories.length > 0) {
      this.filterList();
    } else {
      this.searchService.setFilteredList(this.searchList);
    }
  }

  selectOption(category: string) {
    const index = this.selectedCategories.indexOf(category);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(category);
    }
  }

  filterList(): void {
    if (this.searchText.trim() === '' && this.selectedCategories.length === 0) {
      this.searchService.setFilteredList(this.searchList);
    } else {
      this.searchService.originalList$.subscribe((list) => {
        let filteredList = list;
        //Ha van kategória
        if (this.selectedCategories.length > 0) {
          filteredList = filteredList.filter((item) =>
            this.selectedCategories.some((category) =>
              item.category.includes(category)
            )
          );
        }
        //Ha van beírt szöveg
        if (this.searchText.trim() !== '') {
          filteredList = filteredList.filter((item) =>
            item.name.toLowerCase().includes(this.searchText.toLowerCase())
          );
        }

        this.searchService.setFilteredList(filteredList);
      });
    }
  }

  formatSelectedCategory(selected: string[]): string {
    if (selected.length <= 2) {
      return selected.join(', ');
    }
    return `${selected.slice(0, 2).join(', ')} ...`;
  }

  openUserPage(): void {
    console.log(this.user()?.username);

    this.isUserMenuOpen.set(false);
    this.router.navigate(['/user'], {
      queryParams: { id: this.user()?.userId },
    });
  }

  logout(): void {
    if (this.user()) {
      this.userService.logOut(this.user()!).subscribe((success) => {
        if (success) {
          console.log('Sikeres kijelentkezés!');
          this.user.set(null);
          this.router.navigate(['/']);
        } else {
          console.log('Nem volt bejelentkezett felhasználó.');
        }
      });
    }
  }

  logIn(formData: any) {
    console.log('Bejelentkezés adat:', formData);

    const { email, password } = formData;

    this.userService
      .logIn(email, password)
      .pipe(take(1))
      .subscribe({
        next: (u) => {
          if (u) {
            this.user.set(u);
            console.log('Sikeres bejelentkezés:', u);
            this.isLoginModalOpen.set(false);
          }
        },
        error: (error) => {
          console.error('Hiba történt:', error.message);
          alert('Hibás email vagy jelszó!');
        },
      });
  }

  registration(formData: any) {
    // Az adatokat itt kapod meg
    console.log('Regisztráció adat:', formData);

    const { email, name, username, password, passwordConfirm } = formData;

    this.userService
      .registration(email, username, password)
      .pipe(take(1))
      .subscribe({
        next: (u) => {
          this.user.set(u);
          console.log('Sikeres regisztráció:', this.user());
          this.isRegistrationModalOpen.set(false);
          this.router.navigate(['/user'], {
            queryParams: { id: this.user()?.userId },
          });
        },
        error: (error) => {
          console.log('Hiba történt:', error.message);
        },
      });
  }

  closeModal() {
    if (this.isLoginModalOpen()) {
      this.isLoginModalOpen.set(false); // Modal bezárása
    } else if (this.isRegistrationModalOpen()) {
      this.isRegistrationModalOpen.set(false); // Regisztrációs modal bezárása
    }
  }

  passwordConfirmValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;
      const password = control.parent.get('password')?.value;
      const passwordConfirm = control.value;

      return password !== passwordConfirm ? { passwordConfirm: true } : null;
    };
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;

    // Kivétel: ha kattintás a menüben vagy a felhasználói ikonon történt
    const isClickInsideUserMenu =
      targetElement.closest('.user-icon') ||
      targetElement.closest('.user-menu');

    if (!isClickInsideUserMenu) {
      this.isUserMenuOpen.set(false); // Bezárja a felhasználói menüt
    }

    const isClickInsideDropdown =
      targetElement.closest('.custom-select-input') ||
      targetElement.closest('.custom-dropdown-menu');

    if (!isClickInsideDropdown) {
      this.isDropdownOpen = false; // Bezárja a kategóriák legördülő menüt
    }
  }
}
