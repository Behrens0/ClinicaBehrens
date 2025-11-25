import { Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective implements OnDestroy {
  @Input() appTooltip: string = '';
  @Input() tooltipPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';
  @Input() tooltipDelay: number = 500;

  private tooltipElement: HTMLElement | null = null;
  private showTimeout: any;
  private hideTimeout: any;

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('mouseenter', ['$event'])
  onMouseEnter(event: MouseEvent): void {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }

    if (!this.appTooltip.trim()) return;

    this.showTimeout = setTimeout(() => {
      this.showTooltip();
    }, this.tooltipDelay);
  }

  @HostListener('mouseleave', ['$event'])
  onMouseLeave(event: MouseEvent): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }

    this.hideTimeout = setTimeout(() => {
      this.hideTooltip();
    }, 100);
  }

  private showTooltip(): void {
    if (this.tooltipElement) {
      this.hideTooltip();
    }

    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipElement, 'custom-tooltip');
    this.renderer.addClass(this.tooltipElement, `tooltip-${this.tooltipPosition}`);
    

    const textNode = this.renderer.createText(this.appTooltip);
    this.renderer.appendChild(this.tooltipElement, textNode);

    this.renderer.appendChild(document.body, this.tooltipElement);


    this.positionTooltip();

    setTimeout(() => {
      if (this.tooltipElement) {
        this.renderer.addClass(this.tooltipElement, 'tooltip-visible');
      }
    }, 10);
  }

  private hideTooltip(): void {
    if (this.tooltipElement) {
      this.renderer.removeClass(this.tooltipElement, 'tooltip-visible');
      
      setTimeout(() => {
        if (this.tooltipElement) {
          this.renderer.removeChild(document.body, this.tooltipElement);
          this.tooltipElement = null;
        }
      }, 200);
    }
  }

  private positionTooltip(): void {
    if (!this.tooltipElement) return;

    const hostElement = this.elementRef.nativeElement;
    const hostRect = hostElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let top = 0;
    let left = 0;

    switch (this.tooltipPosition) {
      case 'top':
        top = hostRect.top + scrollTop - tooltipRect.height - 8;
        left = hostRect.left + scrollLeft + (hostRect.width / 2) - (tooltipRect.width / 2);
        break;
      
      case 'bottom':
        top = hostRect.bottom + scrollTop + 8;
        left = hostRect.left + scrollLeft + (hostRect.width / 2) - (tooltipRect.width / 2);
        break;
      
      case 'left':
        top = hostRect.top + scrollTop + (hostRect.height / 2) - (tooltipRect.height / 2);
        left = hostRect.left + scrollLeft - tooltipRect.width - 8;
        break;
      
      case 'right':
        top = hostRect.top + scrollTop + (hostRect.height / 2) - (tooltipRect.height / 2);
        left = hostRect.right + scrollLeft + 8;
        break;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 0) left = 8;
    if (left + tooltipRect.width > viewportWidth) {
      left = viewportWidth - tooltipRect.width - 8;
    }
    if (top < scrollTop) top = scrollTop + 8;
    if (top + tooltipRect.height > scrollTop + viewportHeight) {
      top = scrollTop + viewportHeight - tooltipRect.height - 8;
    }

    this.renderer.setStyle(this.tooltipElement, 'position', 'absolute');
    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
    this.renderer.setStyle(this.tooltipElement, 'z-index', '10000');
  }

  ngOnDestroy(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    this.hideTooltip();
  }
}
