import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  
  // Validador para DNI argentino (7-8 dígitos)
  static dniValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const dni = control.value;
      if (!dni) return null;
      
      const dniRegex = /^\d{7,8}$/;
      if (!dniRegex.test(dni)) {
        return { dniInvalido: true };
      }
      return null;
    };
  }

  // Validador para edad (entre 0 y 120 años)
  static edadValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const edad = control.value;
      if (!edad) return null;
      
      if (edad < 0 || edad > 120) {
        return { edadInvalida: true };
      }
      return null;
    };
  }

  // Validador para contraseña (mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número)
  static passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;
      if (!password) return null;
      
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        return { passwordInvalida: true };
      }
      return null;
    };
  }

  // Validador para confirmar contraseña
  static confirmPasswordValidator(passwordControl: AbstractControl): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const confirmPassword = control.value;
      const password = passwordControl.value;
      
      if (!confirmPassword || !password) return null;
      
      if (confirmPassword !== password) {
        return { passwordNoCoincide: true };
      }
      return null;
    };
  }

  // Validador para email
  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.value;
      if (!email) return null;
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { emailInvalido: true };
      }
      return null;
    };
  }
} 