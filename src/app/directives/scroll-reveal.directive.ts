import { Directive, ElementRef, inject, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  ngOnInit(): void {
    const observer = new IntersectionObserver( // figyeli, hogy egy elem a látható területen belül van-e.
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.renderer.addClass(this.el.nativeElement, 'show');
            observer.unobserve(this.el.nativeElement);
            // Miután az elem láthatóvá vált, leállítjuk a figyelését,
            // így nem fogja tovább figyelni azt.
          }
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(this.el.nativeElement);
  }
}
