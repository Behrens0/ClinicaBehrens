import { Component, OnInit, OnDestroy, Output, EventEmitter, AfterViewInit, Input, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare const grecaptcha: any;

@Component({
  selector: 'app-recaptcha',
  standalone: true,
  imports: [],
  templateUrl: './recaptcha.component.html',
  styleUrl: './recaptcha.component.scss'
})
export class RecaptchaComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() siteKey: string = '6LfDxwksAAAAAC0Do2awi3AZ5CmHtOiYdlHU0DKo'; // Clave real de Google reCAPTCHA v2
  @Output() resolved = new EventEmitter<string>();
  @Output() errored = new EventEmitter<void>();

  private widgetId: number | null = null;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    // Inicialización
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      this.renderRecaptcha();
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser && this.widgetId !== null) {
      try {
        grecaptcha.reset(this.widgetId);
      } catch (e) {
        console.log('Error al resetear reCAPTCHA:', e);
      }
    }
  }

  private renderRecaptcha(): void {
    // Esperar a que el script de grecaptcha se cargue
    const checkRecaptcha = setInterval(() => {
      if (typeof grecaptcha !== 'undefined' && grecaptcha.render) {
        clearInterval(checkRecaptcha);
        this.initRecaptcha();
      }
    }, 100);

    // Timeout después de 10 segundos
    setTimeout(() => {
      clearInterval(checkRecaptcha);
      if (typeof grecaptcha === 'undefined') {
        console.error('Google reCAPTCHA no se pudo cargar');
        this.errored.emit();
      }
    }, 10000);
  }

  private initRecaptcha(): void {
    try {
      this.widgetId = grecaptcha.render('recaptcha-container', {
        'sitekey': this.siteKey,
        'callback': (response: string) => this.onSuccess(response),
        'expired-callback': () => this.onExpired(),
        'error-callback': () => this.onError(),
        'theme': 'light',
        'size': 'normal'
      });
    } catch (error) {
      console.error('Error al renderizar reCAPTCHA:', error);
      this.errored.emit();
    }
  }

  private onSuccess(response: string): void {
    console.log('reCAPTCHA resuelto exitosamente');
    this.resolved.emit(response);
  }

  private onExpired(): void {
    console.log('reCAPTCHA expirado');
    this.resolved.emit('');
  }

  private onError(): void {
    console.error('Error en reCAPTCHA');
    this.errored.emit();
  }

  public reset(): void {
    if (this.isBrowser && this.widgetId !== null && typeof grecaptcha !== 'undefined') {
      try {
        grecaptcha.reset(this.widgetId);
        this.resolved.emit('');
      } catch (e) {
        console.log('Error al resetear reCAPTCHA:', e);
      }
    }
  }

  public getResponse(): string {
    if (this.isBrowser && this.widgetId !== null && typeof grecaptcha !== 'undefined') {
      try {
        return grecaptcha.getResponse(this.widgetId);
      } catch (e) {
        console.log('Error al obtener respuesta de reCAPTCHA:', e);
        return '';
      }
    }
    return '';
  }
}
