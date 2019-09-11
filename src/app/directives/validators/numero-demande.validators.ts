import { ValidatorFn, AbstractControl } from '@angular/forms';

/** Le champ doit respecter le format d'un numéro de demande Public : <AAAA><MM><compteur sur 6 position><P> */
export function isNumeroDemandePublic(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    const masqueDemande = /20[0-9]{2}(0[1-9]|1[0-2])[0-9]{6}P/.test(control.value);
    return masqueDemande ? null : {'isNumeroDemandePublic': true};
  };
}

/** Le champ doit respecter le format d'un numéro de demande : <AAAA><MM><compteur sur 6 position><P, A ou I> */
export function isNumeroDemande(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    const masqueDemande = /20[0-9]{2}(0[1-9]|1[0-2])[0-9]{6}[PAI]/.test(control.value);
    return masqueDemande ? null : {'isNumeroDemande': {value: control.value}};
  };
}

/** Le champ doit respecter le format d'un numéro de demande : <AAAA><MM><compteur sur 6 position><A, I> */
export function isNumeroDemandeIntra(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    const masqueDemande = /20[0-9]{2}(0[1-9]|1[0-2])[0-9]{6}[AI]/.test(control.value);
    return masqueDemande ? null : {'isNumeroDemandeIntra': {value: control.value}};
  };
}
