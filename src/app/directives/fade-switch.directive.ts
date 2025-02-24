import {
  Directive,
  ElementRef,
  Input,
  AfterViewInit,
  OnInit,
  inject,
} from '@angular/core';

@Directive({
  selector: '[appFadeSwitch]',
  standalone: true,
})
export class FadeSwitchDirective implements AfterViewInit, OnInit {
  @Input() appFadeSwitch: boolean = true;

  private el = inject(ElementRef);

  ngOnInit(): void {
    this.el.nativeElement.style.opacity = '0';
    this.el.nativeElement.style.transform = 'scale(0.95)';
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.appFadeSwitch) {
        this.fadeIn();
      }
    }, 10);
  }

  private fadeIn() {
    this.el.nativeElement.style.opacity = '1';
    this.el.nativeElement.style.transform = 'scale(1)';
    this.el.nativeElement.style.transition =
      'opacity 500ms ease-in-out, transform 500ms ease-in-out';
  }
}
