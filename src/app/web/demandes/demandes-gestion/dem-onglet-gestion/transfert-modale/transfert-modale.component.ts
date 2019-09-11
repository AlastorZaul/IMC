import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as moment from 'moment';
import { ETAPE } from 'src/app/constantes/referentiel/etape.enum';
import { OrganismeMiniDtoService } from 'src/app/services/crud/mini-dto/organisme-mini-dto.service';
import { OrganismeMiniDto } from 'src/app/modeles/dto/organisme-mini-dto.dto';
import { Signature } from 'src/app/modeles/signature.model';

@Component({
  selector: 'app-transfert-modale',
  templateUrl: './transfert-modale.component.html'
})
export class TransfertModaleComponent implements OnInit {

  public loading = true;
  public submitting = false;
  public submitted = false;
  public listeOrganisme: OrganismeMiniDto[];
  public listeSignature: Signature[];
  public readonly ETAPE = ETAPE;

  // FormGroup + FormsControl externes utiles
  public transfertFG: FormGroup;
  public organismeAttributionFormControl: FormControl;
  public dateFinDelaiInstruction: FormControl;
  public etape: FormControl;
  public dateTransfert: FormControl;
  public impressionCb = false;
  public envoiCb = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TransfertModaleComponent>,
    private organismeMiniService: OrganismeMiniDtoService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    // FormGroup
    this.transfertFG = this.fb.group({
      'orgAttr': ['', Validators.required],
      'courrielEmployeurAccuse': [undefined, [Validators.maxLength(250), Validators.email]],
      'courrielSalarieAccuse': [undefined, [Validators.maxLength(250), Validators.email]],
      'signature': [undefined],
      'impression': [false],
      'envoi': [false]
    });
    // Gestion FormGroup externes
    if (this.data.organismeAttributionModelForm && this.data.dateFinDelaiInstructionModelForm
      && this.data.etapeModelForm && this.data.dateTransfertModelForm) {
      this.organismeAttributionFormControl = this.data.organismeAttributionModelForm;
      this.listeSignature = this.data.listeSignature;
      this.dateFinDelaiInstruction = this.data.dateFinDelaiInstructionModelForm;
      this.etape = this.data.etapeModelForm;
      this.dateTransfert = this.data.dateTransfertModelForm;
      this.organismeMiniService.getAll().subscribe( (result: OrganismeMiniDto[]) => {
        this.listeOrganisme = result;
        // S'il existe, on retire de la liste l'organisme qui est déjà l'organisme actuel d'attribution
        if (this.organismeAttributionFormControl && this.organismeAttributionFormControl.value) {
          this.listeOrganisme = this.listeOrganisme.filter((org: OrganismeMiniDto) => {
            return org.id !== this.organismeAttributionFormControl.value.id;
          });
        }
        this.loading = false;
      });
    } else {
      // ERREUR
      this.dialogRef.close(false);
    }
  }

  ///// FORMULAIRE - GETTERS - SETTERS
  get orgAttr(): FormControl { return this.transfertFG.get('orgAttr') as FormControl; }
  get courrielEmployeurAccuse(): FormControl {return this.transfertFG.get('courrielEmployeurAccuse') as FormControl; }
  setCourrielEmployeurAccuse(val: any): void { this.courrielEmployeurAccuse.setValue(val); }
  get courrielSalarieAccuse(): FormControl {return this.transfertFG.get('courrielSalarieAccuse') as FormControl; }
  setCourrielSalarieAccuse(val: any): void { this.courrielSalarieAccuse.setValue(val); }
  get signature(): FormControl {return this.transfertFG.get('signature') as FormControl; }
  get impression(): FormControl {return this.transfertFG.get('impression') as FormControl; }
  get envoi(): FormControl {return this.transfertFG.get('envoi') as FormControl; }
    hasError(control: FormControl): Boolean {
      return control.invalid && (control.dirty || control.touched || this.submitted);
    }
  setOrganismeAttribution(val: any): void { this.organismeAttributionFormControl.setValue(val); }
  setDateTransfert(val: any): void { this.dateTransfert.setValue(val); }

  ////// UTILS
  // Vérifier si le délai d'instruction est dépassé
  isDelaiInstructionDepasse() {
    return (this.dateFinDelaiInstruction && this.dateFinDelaiInstruction.value)
      && moment(this.dateFinDelaiInstruction.value).isAfter(moment());
  }

  //// UTILS COURRIEL TRANSFERT
  toggleImpressionCb() {
    this.impressionCb = !this.impressionCb;
    if (!this.impressionCb) {
      this.courrielEmployeurAccuse.setValue(undefined);
      this.courrielSalarieAccuse.setValue(undefined);
      this.courrielsEmpNOTRequired();
      this.courrielsSalNOTRequired();
    }
  }
  toggleEnvoiCb() {
    this.envoiCb = !this.envoiCb;
    if (this.envoiCb) {
      this.courrielEmpAccuseChange(this.courrielEmployeurAccuse.value);
      this.courrielSalAccuseChange(this.courrielSalarieAccuse.value);
    }
  }


  // Au changement de la valeur du courriel d'accusé de l'employeur, si ce dernier n'est pas vide,
  // le courriel d'accusé du salarié devient non obligatoire
  courrielEmpAccuseChange(val: String): void {
    if (this.envoiCb) {
      if (val) {
        this.courrielsEmplRequired();
        this.courrielsSalNOTRequired();
      } else {
        this.courrielsSalRequired();
        if (this.courrielSalarieAccuse.value) {
          this.courrielsEmpNOTRequired();
        }
      }
    }
  }
  // Au changement de la valeur du courriel d'accusé du salarié, si ce dernier n'est pas vide,
  // le courriel d'accusé de l'employeur devient non obligatoire
  courrielSalAccuseChange(val: String): void {
    if (this.envoiCb) {
      if (val) {
        this.courrielsSalRequired();
        this.courrielsEmpNOTRequired();
      } else {
        this.courrielsEmplRequired();
        if (this.courrielEmployeurAccuse.value) {
          this.courrielsSalNOTRequired();
        }
      }
    }
  }

  courrielsEmplRequired(): void {
    this.courrielEmployeurAccuse.setValidators([Validators.required, Validators.maxLength(250), Validators.email]);
    this.courrielEmployeurAccuse.updateValueAndValidity();
  }
  courrielsSalRequired(): void {
    this.courrielSalarieAccuse.setValidators([Validators.required, Validators.maxLength(250), Validators.email]);
    this.courrielSalarieAccuse.updateValueAndValidity();
  }
  courrielsEmpNOTRequired(): void {
    this.courrielEmployeurAccuse.clearValidators();
    this.courrielEmployeurAccuse.setValidators([Validators.maxLength(250), Validators.email]);
    this.courrielEmployeurAccuse.updateValueAndValidity();
  }
  courrielsSalNOTRequired(): void {
    this.courrielSalarieAccuse.clearValidators();
    this.courrielSalarieAccuse.setValidators([Validators.maxLength(250), Validators.email]);
    this.courrielSalarieAccuse.updateValueAndValidity();
  }


  ///// ACTIONS
  // Ferme la pop-up sans rien faire
  close() {
    this.dialogRef.close();
  }

  // Sauvegarde
  save() {
    this.submitted = true;
    if (this.transfertFG.invalid) {
      return false;
    }
    this.submitting = true;
    this.impression.setValue(this.impressionCb);
    this.envoi.setValue(this.envoiCb);
    this.setOrganismeAttribution(this.orgAttr.value);
    this.setDateTransfert(new Date());
    this.dialogRef.close(this.transfertFG.getRawValue());
  }

}
