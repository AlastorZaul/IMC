import { Component, OnInit, Input } from '@angular/core';
import { ControlContainer, FormGroupDirective, FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { Organisme } from 'src/app/modeles/organisme.model';
import { MatDialog } from '@angular/material';
import { OrganismeMiniDto } from 'src/app/modeles/dto/organisme-mini-dto.dto';
import { AjoutEnfantModaleComponent } from './ajout-enfant-modale/ajout-enfant-modale.component';

@Component({
  selector: 'app-org-onglet-fils',
  templateUrl: './org-onglet-fils.component.html',
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective }
  ]
})
export class OrgOngletFilsComponent implements OnInit {
  @Input() submitted: boolean;
  @Input() canEdit = false;
  @Input() currentOrganismeId: number;
  @Input() listeOrg: OrganismeMiniDto[];
  private parentForm: FormGroup;
  private openedOrganismes: number[] = [];

  constructor(
    private parent: FormGroupDirective,
    private fb: FormBuilder,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    // Initialisation du formulaire
    this.parentForm = this.parent.form;
    this.parentForm.addControl('enfants', this.fb.array([]));
  }


  ///// FORMULAIRE - GETTERS
  get enfants(): FormArray { return this.parentForm.get('enfants') as FormArray; }
  get firstItem(): FormControl { return ((this.enfants.length > 0) ? this.enfants.at(0) : undefined) as FormControl; }


  // ACTIONS D'AJOUT/RETRAIT
  ajoutEnfant() {
    this.dialog.open(AjoutEnfantModaleComponent, {
      disableClose : true,
      minWidth: 500,
      data : {
        currentOrganismeId: this.currentOrganismeId,
        listeOrganismes: this.listeOrg,
        enfantsArray: this.enfants
      }
    }).afterClosed().subscribe((res) => {
      if (res) { this.parentForm.markAsDirty(); }
    });
  }
  dissocierEnfant(enf: Organisme, indexOrg: number) {
    if (!this.canEdit) { return false; }
    this.removeFromArrayWithIndex(indexOrg);
    this.changeAccordeon(enf.id, false);
    this.parentForm.markAsDirty();
  }


  // UTILS
  isOuvert(idOrg: number) {
    return this.openedOrganismes.find(_idOrg =>  _idOrg === idOrg);
  }
  changeAccordeon(idOrg: number, ouvrir: boolean) {
    if (ouvrir) {
      this.openedOrganismes.push(idOrg);
    } else {
      const ndxElem = this.openedOrganismes.findIndex(ndx => ndx === idOrg);
      if (ndxElem !== -1) {
        this.openedOrganismes.splice(ndxElem, 1);
      }
    }
  }

  removeFromArrayWithIndex(index: number) {
    this.enfants.removeAt(index);
  }

}
