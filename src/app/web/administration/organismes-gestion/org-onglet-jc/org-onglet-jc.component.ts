import { Component, OnInit, Input } from '@angular/core';
import { ControlContainer, FormGroupDirective, FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { JourChome } from 'src/app/modeles/jour-chome.model';
import { PROFILS } from 'src/app/constantes/referentiel/profils.enum';
import { Utilisateur } from 'src/app/modeles/dto/utilisateur.dto';
import { SessionUtilisateurService } from 'src/app/services/session-utilisateur.service';

@Component({
  selector: 'app-org-onglet-jc',
  templateUrl: './org-onglet-jc.component.html',
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective }
  ]
})
export class OrgOngletJcComponent implements OnInit {
  @Input() submitted: boolean;
  @Input() listeJc: JourChome[];
  public currentUser: Utilisateur;
  private parentForm: FormGroup;
  isAdminNational = false;

  constructor(
    private parent: FormGroupDirective,
    private sessionUtilisateurSvc: SessionUtilisateurService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    // Admin national ?
    this.isAdminNational = this.getLoggedUser().is(PROFILS.ADMINISTRATEUR_NATIONAL);
    // Initialisation du formulaire
    this.parentForm = this.parent.form;
    this.parentForm.addControl('joursChomes', this.fb.array([]));
  }

  ///// FORMULAIRE - GETTERS
  get joursChomes(): FormArray { return this.parentForm.get('joursChomes') as FormArray; }


  // FILTRES + ACTIONS D'AJOUT/RETRAIT
  pipeNational(jc: JourChome) {
    return jc.national && jc.actif;
  }
  pipeNonNational(jc: JourChome) {
    return !jc.national && jc.actif;
  }

  isInArray(jc: JourChome) {
    return this.findIndexInArray(jc) !== -1;
  }
  private findIndexInArray(jc: JourChome): number {
    return this.joursChomes.value.findIndex((_jc: JourChome) => {
      return jc.id === _jc.id;
    });
  }
  pushOrRemoveFromArray(value: boolean, jc: JourChome) {
    if (value) {
      this.joursChomes.push(this.fb.control(jc));
    } else {
      const indx = this.findIndexInArray(jc);
      if (indx !== -1) {
        this.joursChomes.removeAt(indx);
      }
    }
    this.parentForm.markAsDirty();
  }

  // UTILS
  getLoggedUser(): Utilisateur {
    if (!this.currentUser) { this.currentUser = this.sessionUtilisateurSvc.getStorableUser(); }
    return this.currentUser;
  }

}
