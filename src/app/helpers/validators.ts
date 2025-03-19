import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Jelszó megerősítésének validátora.
 * Ellenőrzi, hogy a megadott jelszó és a megerősítő mező értéke megegyezik-e.
 */
export function passwordConfirmValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent) {
      return null;
    }

    const password = control.parent.get('password')?.value;
    const passwordConfirm = control.value;

    return password !== passwordConfirm ? { passwordConfirm: true } : null;
  };
}

/**
 * E-mail cím validátora.
 * Ellenőrzi, hogy a megadott érték egy érvényes e-mail cím formátum-e.
 */
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!control.value) {
      return null;
    }

    return emailRegEx.test(control.value) ? null : { invalidEmail: true };
  };
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase() // Kisbetűsre alakítja
    .replace(/[áéíóöőúüű]/g, (match) => {
      // Ékezetek eltávolítása
      const replacements: Record<string, string> = {
        á: 'a',
        é: 'e',
        í: 'i',
        ó: 'o',
        ö: 'o',
        ő: 'o',
        ú: 'u',
        ü: 'u',
        ű: 'u',
      };
      return replacements[match] || match;
    })
    .replace(/\s+/g, '-') // A szóközöket kötőjellel helyettesíti
    .replace(/[^\w-]+/g, '') // Eltávolítja a nem alfanumerikus karaktereket
    .replace(/--+/g, '-') // Többszörös kötőjeleket egyetlenre csökkenti
    .replace(/^-+/, '') // A kezdő kötőjelet eltávolítja
    .replace(/-+$/, '') // Az utolsó kötőjelet eltávolítja
    .replace(/^\s+|\s+$/g, '');
}
