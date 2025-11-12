import { Directive, Input, TemplateRef, ViewContainerRef, OnInit } from '@angular/core';
import { RegistroService } from '../services/registro.service';

@Directive({
  selector: '[appPermiso]',
  standalone: true
})
export class PermisoDirective implements OnInit {
  @Input() appPermiso: string[] = []; // ['administrador', 'especialista']
  
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private registroService: RegistroService
  ) {}

  async ngOnInit() {
    const session = await this.registroService.getSesionActual();
    const userId = session?.data?.session?.user?.id;
    
    if (userId) {
      const perfil = await this.registroService.getPerfilPorUserId(userId);
      
      if (perfil && this.appPermiso.includes(perfil.tipo)) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    } else {
      this.viewContainer.clear();
    }
  }
}

