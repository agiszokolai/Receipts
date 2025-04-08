import {
  AfterViewInit,
  Component,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { SearchService } from '../../../services/search.service';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { IUser } from '../../../model/user';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LoginComponent } from '../../user/login/login.component';
import { RegistrationComponent } from '../../user/registration/registration.component';
import { ToastrService } from 'ngx-toastr';
import { filter, Observable, ReplaySubject, takeUntil } from 'rxjs';
import { IReceipt } from '../../../model/receipt';
import { generateSlug } from '../../../helpers/validators';
import { ReceiptsService } from '../../../services/receipts.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoginComponent, RegistrationComponent],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit, AfterViewInit, OnDestroy {
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

  /** Keresett szöveg */
  isSearchDropdownVisible = false;

  /** Kategóriák selectje le van-e nyitva */
  isDropdownOpen = false;

  isSearchActive = false;

  searchText = '';
  screenWidth = window.innerWidth;

  activePage = window.location.pathname;
  allReceipts: IReceipt[] = [];

  public filterdReceipts$!: Observable<IReceipt[]>;

  private readonly destroyed$ = new ReplaySubject<void>(1);

  public searchService = inject(SearchService);
  private router = inject(Router);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private receiptService = inject(ReceiptsService);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.searchText = this.searchService.searchData().searchText;
    this.getAllReceipts();
    /*  this.searchService.filteredList$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (filteredList) => {
        console.log('Szűrt lista frissítve:', filteredList);
        this.filterdReceipts$ = of(filteredList);
      },
    }); */
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.activePage = event.urlAfterRedirects;
      });

    this.screenWidth = window.innerWidth;
    window.addEventListener('resize', this.onResize.bind(this));
  }
  onResize(event: any) {
    this.screenWidth = event.target.innerWidth;
  }
  ngAfterViewInit(): void {
    this.authService.user$.subscribe({
      next: (u) => {
        this.user.set(u); // A felhasználó adatainak beállítása
      },
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  getAllReceipts() {
    this.receiptService
      .getReceipts()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (r) => {
          this.allReceipts = r;
          this.searchService.setOriginalList(this.allReceipts);
          this.filterdReceipts$ = this.searchService.filteredList$;
        },
      });
  }

  /** Keresendő szó változik */
  onSearchChange() {
    this.isSearchDropdownVisible = true;
    this.searchService.searchData().searchText = this.searchText;
    this.searchService.changeSearchData({ searchText: this.searchService.searchData().searchText });
    this.filterdReceipts$ = this.searchService.filteredList$;
  }

  /** Navigálás a belépett felhasználó profiljára */
  openUserPage(): void {
    this.isUserMenuOpen.set(false);
    this.activePage = '/profil/' + this.user()?.username;
    this.router.navigate(['/profil', this.user()?.username]);
  }

  /** Kijelentkezés */
  logout(): void {
    if (this.user()) {
      this.authService.logOut().subscribe({
        next: () => {
          this.searchService.searchData().searchText = '';
          this.toastr.info('Sikeres kijelentkezés');
        },
        error: () => {
          this.toastr.error('Sikertelen kijelentkezés');
        },
      });
    }
  }

  /** Modal bezárása */
  closeModal() {
    if (this.isLoginModalOpen()) {
      this.isLoginModalOpen.set(false);
    } else if (this.isRegistrationModalOpen()) {
      this.isRegistrationModalOpen.set(false);
    }
  }

  /**navigálás a kezdőoldalra */
  navigateToLandingPage(): void {
    this.router.navigate(['/']);
    this.activePage = '/';
    this.isSearchDropdownVisible = false;
  }

  navigateToReceipts(): void {
    this.router.navigate(['/receptek']);
    this.activePage = '/receptek';
    this.isSearchDropdownVisible = false;
    this.searchText = '';
  }

  navigateToReceipt(receipt: IReceipt): void {
    this.router.navigate(['/recept', generateSlug(receipt.name)], {
      state: { id: receipt.id, direction: `${this.activePage}` },
    });
    this.searchService.searchData().searchText = '';
    this.isSearchDropdownVisible = false;
    this.searchText = '';
  }

  //** Legördülő menük bezárása ha nem oda van kattintva */
  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;

    const isClickInsideUserMenu =
      targetElement.closest('.user-icon') || targetElement.closest('.user-menu');

    const isClickInsideSearch = targetElement.closest('.custom-search');
    const isClickInsideSearchDropdown = targetElement.closest('.search-results');

    if (!isClickInsideSearch) {
      this.isSearchActive = false;
    }
    if (!isClickInsideSearchDropdown) {
      this.isSearchDropdownVisible = false;
    }

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
