import { AfterViewInit, Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { SearchService } from '../../../services/search.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { IUser } from '../../../model/user';
import { ModalComponent } from '../modal/modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CategoryEnum } from '../../../helpers/constants';
import { LoginComponent } from '../../user/login/login.component';
import { RegistrationComponent } from '../../user/registration/registration.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    FormsModule,
    ReactiveFormsModule,
    LoginComponent,
    RegistrationComponent,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, AfterViewInit {
  /** Bejelentkezett felhasználó*/
  user = signal<IUser | null>(null);

  /** Felahsználói menü le van e nyitva */
  isUserMenuOpen = signal(false);

  /** Bejelentkezési modal nyitva van-e */
  isLoginModalOpen = signal(false);

  /** Regisztrációs modal nyitva van-e */
  isRegistrationModalOpen = signal(false);

  /** Kiválasztott kategóriák*/
  selectedCategories: string[] = [];

  /** Kategóriák */
  categoryEnum = Object.values(CategoryEnum);

  /** Keresett szöveg */
  searchText = '';

  /** Kategóriák selectje le van-e nyitva */
  isDropdownOpen = false;

  private searchService = inject(SearchService);
  private router = inject(Router);
  private userService = inject(UserService);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.searchService.originalList$.subscribe((list) => {
      this.searchService.setFilteredList(list);
    });
  }

  ngAfterViewInit(): void {
    this.userService.user$.subscribe({
      next: (u) => {
        this.user.set(u); // A felhasználó adatainak beállítása
      },
    });
  }

  /** Keresendő szó változik */
  onSearchChange() {
    this.searchService.changeSearchText(this.searchText);
  }

  /** Kiválasztott katgóriák változnak */
  onChangeCategoryClick(category: string) {
    this.selectedCategories = this.selectedCategories.includes(category)
      ? this.selectedCategories.filter((c) => c !== category)
      : [...this.selectedCategories, category];

    this.searchService.changeSelectedCategories(this.selectedCategories);
  }

  /** */
  /**
   *  Kiválasztott kategóriák megjelenítésének formázása
   * @param {string[]} selected a kiválasztott kategóriák listája
   * @returns Visszaddja a lista formázott alakját
   */
  formatSelectedCategory(selected: string[]): string {
    if (selected.length <= 2) {
      return selected.join(', ');
    }
    return `${selected.slice(0, 2).join(', ')} ...`;
  }

  /** Navigálás a belépett felhasználó profiljára */
  openUserPage(): void {
    this.isUserMenuOpen.set(false);
    this.router.navigate(['/profil', this.user()?.username]);
  }

  navigateToLandingPage(): void {
    this.router.navigate(['/']);
  }

  /** Kijelentkezés */
  logout(): void {
    if (this.user()) {
      this.userService.logOut().subscribe({
        next: () => {
          this.selectedCategories = [];
          this.searchText = '';
          console.log('Kijelentkezve!');
          this.toastr.info('Sikeres kijelentkezés');
        },
        error: () => {
          this.toastr.error('Sikertelen kijelentkezés');
        },
      });
    }
    /*  if (this.user()) {
      this.userService.logOut().subscribe(() => {
        this.selectedCategories = [];
        this.searchText = '';
        console.log('Kijelentkezve!');
        this.toastr.info('Sikeres kijelentkezés');
      });
    } */
  }

  /** Modal bezárása */
  closeModal() {
    if (this.isLoginModalOpen()) {
      this.isLoginModalOpen.set(false);
    } else if (this.isRegistrationModalOpen()) {
      this.isRegistrationModalOpen.set(false);
    }
  }

  //** Legördülő menük bezárása ha nem oda van kattintva */
  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;

    const isClickInsideUserMenu =
      targetElement.closest('.user-icon') || targetElement.closest('.user-menu');

    if (!isClickInsideUserMenu) {
      this.isUserMenuOpen.set(false);
    }

    const isClickInsideDropdown =
      targetElement.closest('.custom-select-input') ||
      targetElement.closest('.custom-dropdown-menu');

    if (!isClickInsideDropdown) {
      this.isDropdownOpen = false;
    }
  }
}
