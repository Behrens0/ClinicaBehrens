import { Directive, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appCaptchaPropio]',
  standalone: true
})
export class CaptchaPropioDirective implements OnInit {
  @Input() captchaHabilitado: boolean = true; 
  @Output() captchaResuelto = new EventEmitter<boolean>(); 
  @Output() captchaError = new EventEmitter<string>(); 

  private num1: number = 0;
  private num2: number = 0;
  private operador: string = '+';
  private respuestaCorrecta: number = 0;
  private inputElement: HTMLInputElement | null = null;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    if (!this.captchaHabilitado) {
      console.log('🔒 [CaptchaPropio] Captcha deshabilitado');
      this.captchaResuelto.emit(true);
      return;
    }

    console.log('🔐 [CaptchaPropio] Inicializando captcha personalizado');
    this.generarCaptcha();
    this.crearInterfazCaptcha();
  }

  private generarCaptcha(): void {
  
    this.num1 = Math.floor(Math.random() * 10) + 1;
    this.num2 = Math.floor(Math.random() * 10) + 1;

   
    const operadores = ['+', '-', '*'];
    this.operador = operadores[Math.floor(Math.random() * operadores.length)];


    switch (this.operador) {
      case '+':
        this.respuestaCorrecta = this.num1 + this.num2;
        break;
      case '-':

        if (this.num1 < this.num2) {
          [this.num1, this.num2] = [this.num2, this.num1];
        }
        this.respuestaCorrecta = this.num1 - this.num2;
        break;
      case '*':
        this.respuestaCorrecta = this.num1 * this.num2;
        break;
    }

    console.log(`🧮 [CaptchaPropio] Pregunta: ${this.num1} ${this.operador} ${this.num2} = ${this.respuestaCorrecta}`);
  }

  private crearInterfazCaptcha(): void {
    const hostElement = this.el.nativeElement;

    
    const captchaContainer = this.renderer.createElement('div');
    this.renderer.addClass(captchaContainer, 'captcha-propio-container');

  
    const titulo = this.renderer.createElement('label');
    this.renderer.addClass(titulo, 'captcha-titulo');
    const tituloTexto = this.renderer.createText('🔐 Verificación de Seguridad');
    this.renderer.appendChild(titulo, tituloTexto);

   
    const pregunta = this.renderer.createElement('div');
    this.renderer.addClass(pregunta, 'captcha-pregunta');
    const preguntaTexto = this.renderer.createText(`¿Cuánto es ${this.num1} ${this.operador} ${this.num2}?`);
    this.renderer.appendChild(pregunta, preguntaTexto);

    
    this.inputElement = this.renderer.createElement('input');
    this.renderer.setAttribute(this.inputElement, 'type', 'number');
    this.renderer.setAttribute(this.inputElement, 'placeholder', 'Ingresa tu respuesta');
    this.renderer.addClass(this.inputElement, 'captcha-input');

    
    const botonVerificar = this.renderer.createElement('button');
    this.renderer.addClass(botonVerificar, 'captcha-btn-verificar');
    this.renderer.setAttribute(botonVerificar, 'type', 'button');
    const botonTexto = this.renderer.createText('Verificar');
    this.renderer.appendChild(botonVerificar, botonTexto);

   
    this.renderer.listen(botonVerificar, 'click', () => this.verificarRespuesta());

   
    const botonRecargar = this.renderer.createElement('button');
    this.renderer.addClass(botonRecargar, 'captcha-btn-recargar');
    this.renderer.setAttribute(botonRecargar, 'type', 'button');
    const botonRecargarTexto = this.renderer.createText('🔄 Nuevo');
    this.renderer.appendChild(botonRecargar, botonRecargarTexto);

   
    this.renderer.listen(botonRecargar, 'click', () => this.recargarCaptcha());

   
    const botonesContainer = this.renderer.createElement('div');
    this.renderer.addClass(botonesContainer, 'captcha-botones');
    this.renderer.appendChild(botonesContainer, botonVerificar);
    this.renderer.appendChild(botonesContainer, botonRecargar);


    const mensaje = this.renderer.createElement('div');
    this.renderer.addClass(mensaje, 'captcha-mensaje');
    this.renderer.setAttribute(mensaje, 'id', 'captcha-mensaje');

   
    this.renderer.appendChild(captchaContainer, titulo);
    this.renderer.appendChild(captchaContainer, pregunta);
    this.renderer.appendChild(captchaContainer, this.inputElement);
    this.renderer.appendChild(captchaContainer, botonesContainer);
    this.renderer.appendChild(captchaContainer, mensaje);


    this.renderer.appendChild(hostElement, captchaContainer);
  }

  private verificarRespuesta(): void {
    if (!this.inputElement) {
      console.error('❌ [CaptchaPropio] Input element not found');
      return;
    }

    const respuestaUsuario = parseInt(this.inputElement.value, 10);
    const mensajeElement = document.getElementById('captcha-mensaje');

    if (isNaN(respuestaUsuario)) {
      console.log('⚠️ [CaptchaPropio] Respuesta inválida');
      if (mensajeElement) {
        mensajeElement.textContent = '⚠️ Por favor ingresa un número válido';
        mensajeElement.className = 'captcha-mensaje captcha-error';
      }
      this.captchaError.emit('Por favor ingresa un número válido');
      return;
    }

    if (respuestaUsuario === this.respuestaCorrecta) {
      console.log('✅ [CaptchaPropio] Captcha correcto!');
      if (mensajeElement) {
        mensajeElement.textContent = '✅ ¡Correcto! Verificación exitosa';
        mensajeElement.className = 'captcha-mensaje captcha-exito';
      }
      this.captchaResuelto.emit(true);
      
  
      if (this.inputElement) {
        this.renderer.setAttribute(this.inputElement, 'disabled', 'true');
      }
    } else {
      console.log('❌ [CaptchaPropio] Captcha incorrecto');
      if (mensajeElement) {
        mensajeElement.textContent = '❌ Respuesta incorrecta. Intenta de nuevo';
        mensajeElement.className = 'captcha-mensaje captcha-error';
      }
      this.captchaError.emit('Respuesta incorrecta');
      this.captchaResuelto.emit(false);
    }
  }

  private recargarCaptcha(): void {
    console.log('🔄 [CaptchaPropio] Recargando captcha');
    
   
    const mensajeElement = document.getElementById('captcha-mensaje');
    if (mensajeElement) {
      mensajeElement.textContent = '';
      mensajeElement.className = 'captcha-mensaje';
    }


    if (this.inputElement) {
      this.renderer.removeAttribute(this.inputElement, 'disabled');
      this.inputElement.value = '';
    }

    this.generarCaptcha();

    const preguntaElements = this.el.nativeElement.getElementsByClassName('captcha-pregunta');
    if (preguntaElements && preguntaElements.length > 0) {
      preguntaElements[0].textContent = `¿Cuánto es ${this.num1} ${this.operador} ${this.num2}?`;
    }

    this.captchaResuelto.emit(false);
  }
}
