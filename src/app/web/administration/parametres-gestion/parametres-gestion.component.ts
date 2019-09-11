import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormArray, FormGroup } from '@angular/forms';
import { ToasterService } from 'angular2-toaster/src/toaster.service';
import { FilArianeItem } from 'src/app/modeles/utils/fil-ariane-item.model';
import { ROUTES } from 'src/app/constantes/routes';
import { MessageInfo } from 'src/app/modeles/message-info.model';
import { MessageInfoService } from 'src/app/services/crud/message-info.service';
import { DateAdapter } from '@angular/material';
import { Router } from '@angular/router';
import { IPreventNavigation } from 'src/app/interfaces/IPreventNavigation';
import { IFilAriane } from 'src/app/interfaces/IFilAriane';
import { CODE_MESSAGE_INFO } from 'src/app/constantes/referentiel/code-message-info.enum';
import { TYPE_TOAST } from 'src/app/constantes/type-toast.enum';


@Component({
  selector: 'app-parametres-gestion',
  templateUrl: './parametres-gestion.component.html'
})
export class ParametresGestionComponent implements OnInit, IFilAriane, IPreventNavigation {

  // IPreventNavigation + IFilAriane
  textModalConfirm: string;
  filAriane: FilArianeItem[];
  // Loaders
  loading = true;
  // Elements locaux
  private titresMessages = [
    {code: CODE_MESSAGE_INFO.CODE_MI_INTRARC_ACCUEIL, titre: `Message d'information - IntraRC (accueil)`},
    {code: CODE_MESSAGE_INFO.CODE_MI_INTRARC_CONNEXION, titre: `Message d'information - IntraRC (page de connexion)`},
    {code: CODE_MESSAGE_INFO.CODE_MI_TELERC_ACCUEIL, titre:  `Message d'information - TéléRC (accueil)`}
  ];
  // Formulaire
  submitting = false;
  submitted = false;
  // FORMULAIRE PRINCIPAL
  public modeleForm: FormGroup = this.fb.group({});

  constructor(
    private router: Router,
    private fb: FormBuilder,
    public toasterService: ToasterService,
    public messageInfoService: MessageInfoService,
    private dateAdapter: DateAdapter<Date>) {
      this.dateAdapter.setLocale('fr');
  }

  ngOnInit() {
    this.initFilAriane();
    this.chargeListeMessages();
  }

  public chargeListeMessages() {
    this.loading = true;
    this.submitting = false;
    this.submitted = false;
    this.messageInfoService.getAll().subscribe((parametresResult: MessageInfo[]) => {
      this.modeleForm = this.fb.group({'messagesInfos' : this.fb.array([])});
      // Ajout dans le formulaire des messages dans l'ordre
      if (parametresResult && parametresResult.length > 0) {
        [CODE_MESSAGE_INFO.CODE_MI_INTRARC_ACCUEIL,
          CODE_MESSAGE_INFO.CODE_MI_INTRARC_CONNEXION,
          CODE_MESSAGE_INFO.CODE_MI_TELERC_ACCUEIL
        ].forEach((code: string) => {
          const mi = parametresResult.find((_mi: MessageInfo) => {
            return _mi.code === code;
          });
          if (mi !== undefined) {
            this.messagesInfos.push(this.fb.group(mi));
          }
        });
      }
      this.loading = false;
    });
  }

  // UTILS
  get messagesInfos(): FormArray { return this.modeleForm.get('messagesInfos') as FormArray; }
  getTitreMessageForElement(mi: MessageInfo) {
    return this.titresMessages.find((elem) => {
      return mi.code === elem.code;
    }).titre;
  }


  ///// ACTIONS
  sortir() {
    this.router.navigate(['/' + ROUTES.ACCUEIL]);
  }

  // Sauvegarde
  save() {
    const messagesToPost: MessageInfo[] = [];
    this.submitted = true;
    if (this.modeleForm.invalid) {
      return false;
    }
    // Créer la liste à poster
    this.submitting = true;
    this.messagesInfos.value.forEach((mi: MessageInfo) => {
      messagesToPost.push(new MessageInfo(mi));
    });
    this.messageInfoService.saveList(messagesToPost).subscribe((messages: MessageInfo[]) => {
      this.toasterService.pop({
        type: TYPE_TOAST.SUCCES, body: `Enregistrement réalisé avec succès.`
      });
      this.chargeListeMessages();
    });
  }


  /** IPreventNavigation + IFilAriane */
  get canNavigate(): boolean { return !this.modeleForm.dirty; }
  initFilAriane() {
    this.filAriane = [
      new FilArianeItem('Administration', undefined, false),
      new FilArianeItem('Paramètres', '/' + ROUTES.ADMINISTRATION + '/' + ROUTES.PARAMETRES)
    ];
  }
  getFilAriane(): FilArianeItem[] {
    return this.filAriane;
  }

}
