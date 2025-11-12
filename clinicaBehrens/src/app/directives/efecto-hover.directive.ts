import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appEfectoHover]',
  standalone: true
})
export class EfectoHoverDirective {
  @Input() escalaHover: string = '1.05';
  @Input() colorHover: string = '#667eea';

  constructor(private el: ElementRef) {
    this.el.nativeElement.style.transition = 'all 0.3s ease';
  }

  @HostListener('mouseenter') onMouseEnter() {
    this.el.nativeElement.style.transform = `scale(${this.escalaHover})`;
    this.el.nativeElement.style.boxShadow = `0 8px 16px ${this.colorHover}40`;
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.el.nativeElement.style.transform = 'scale(1)';
    this.el.nativeElement.style.boxShadow = '';
  }
}

