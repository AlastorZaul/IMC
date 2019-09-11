import { ValidatorFn, AbstractControl } from '@angular/forms';

/** Le champ doit respecter le format d'un code SIRET (clé de luhn) */
export function isNumeroSiret(): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    if (!control.value) {
      return null;
    }
    const siret = control.value;
    if ((siret.length !== 14)) {
      return {'isNumeroSiret': true};
    }
    let somme = 0;
    let tmp;
    for (let cpt = 0; cpt < siret.length; cpt++) {
        if ((cpt % 2) === 0) {
          tmp = siret.charAt(cpt) * 2;
          tmp -= (tmp > 9) ? 9 : 0;
        } else {
          tmp = siret.charAt(cpt);
        }
         somme += parseInt(tmp, 10);
    }
    return (somme % 10) === 0 && somme !== 0 ? null : {'isNumeroSiret': true};
  };
}
