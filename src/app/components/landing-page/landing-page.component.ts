import { Component, inject } from '@angular/core';
import { blankUser, foodLanding } from '../../helpers/constants';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ScrollRevealDirective } from '../../directives/scroll-reveal.directive';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, ScrollRevealDirective],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent {
  foodImg = foodLanding;
  userImg = blankUser;
  emmaImg = '../../assets/images/users/emma-brown.jpg';
  liaImg = '../../assets/images/users/kiss-anna.jpg';
  johnImg = '../../assets/images/users/john-smith.jpg';

  private router = inject(Router);

  navigateToReceipts(): void {
    this.router.navigate(['/receptek']);
  }
}
