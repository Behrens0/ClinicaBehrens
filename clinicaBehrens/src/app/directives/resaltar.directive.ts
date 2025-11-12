import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: '[appResaltar]',
  standalone: true
})
export class ResaltarDirective implements OnInit {
  @Input() appResaltar: string = 'yellow';

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.el.nativeElement.style.backgroundColor = this.appResaltar;
    this.el.nativeElement.style.padding = '4px 8px';
    this.el.nativeElement.style.borderRadius = '4px';
    this.el.nativeElement.style.transition = 'all 0.3s ease';
  }
}

