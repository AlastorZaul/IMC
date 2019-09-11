import { Component, OnInit, Input } from '@angular/core';
import { MESSAGE_IMPORTANCE } from 'src/app/constantes/referentiel/message-importance.enum';
import { FormGroup, ControlContainer, FormGroupDirective, Validators } from '@angular/forms';
import { FormControl } from '@angular/forms/src/model';


@Component({
  selector: 'app-message-information',
  templateUrl: './message-information.component.html',
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective }
  ]
})
export class MessageInformationComponent implements OnInit {

  // FORMULAIRE
  @Input() titreMessage: string;
  @Input() messageInfoFormGroup: FormGroup;
  @Input() parentSubmitted: boolean;
  readonly MESSAGE_IMPORTANCE = MESSAGE_IMPORTANCE;
  private listeValidateurs = {
    'titre': [Validators.required, Validators.maxLength(250)],
    'datePublication': [Validators.required],
    'contenu': [Validators.required],
    'importance': [Validators.required],
  };
  // QUILL editor
  editor_modules = {};

  constructor() { }

  ngOnInit() {
    // Configuration Quill
    this.editor_modules = {
      toolbar: {
        container: [
          ['bold', 'italic', 'underline', 'strike'], ['blockquote', 'code-block'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }], [{ 'script': 'sub' }, { 'script': 'super' }],
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }], ['clean'], ['link']
        ]
      }
    };
    // Mise à jour validateurs selon situation
    this.visibilityChange(false);
  }

  // UTILS
  // Changement de la valeur du bouton radio "visible" (MAJ valeurs + validators)
  public visibilityChange(visibleReinitValue = true): void {
    if (!this.visible.value) {
      this.reinitValues(undefined, undefined);
      for (const key in this.messageInfoFormGroup.controls) {
        if (this.messageInfoFormGroup.controls.hasOwnProperty(key)) {
          this.messageInfoFormGroup.get(key).clearValidators();
          this.messageInfoFormGroup.get(key).updateValueAndValidity();
        }
      }
    } else {
      if (visibleReinitValue) { this.reinitValues(new Date(), MESSAGE_IMPORTANCE.INFO); }
      for (const key in this.messageInfoFormGroup.controls) {
        if (this.messageInfoFormGroup.controls.hasOwnProperty(key)) {
          this.messageInfoFormGroup.get(key).setValidators(this.listeValidateurs[key]);
          this.messageInfoFormGroup.get(key).updateValueAndValidity();
        }
      }
    }
  }
  private reinitValues(dateValue: Date, importanceValue: string) {
    this.setTitre(undefined);
    this.setDatePublication(dateValue);
    this.setContenu(undefined);
    this.setImportance(importanceValue);
  }


  ///// FORMULAIRE - GETTERS
  get titre(): FormControl { return this.messageInfoFormGroup.get('titre') as FormControl; }
  get datePublication(): FormControl { return this.messageInfoFormGroup.get('datePublication') as FormControl; }
  get contenu(): FormControl { return this.messageInfoFormGroup.get('contenu') as FormControl; }
  get visible(): FormControl { return this.messageInfoFormGroup.get('visible') as FormControl; }
  get importance(): FormControl { return this.messageInfoFormGroup.get('importance') as FormControl; }
  hasError(control: FormControl): Boolean {
    return control.invalid && (control.dirty || control.touched || this.parentSubmitted);
  }
  ///// FORMULAIRE - SETTERS
  setTitre(titre: String) { this.titre.setValue(titre); }
  setDatePublication(datePublication: Date) { this.datePublication.setValue(datePublication); }
  setContenu(contenu: String) { this.contenu.setValue(contenu); }
  setImportance(importance: String) { this.importance.setValue(importance); }
}
