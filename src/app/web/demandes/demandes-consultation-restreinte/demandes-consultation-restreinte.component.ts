import { Component, Inject, OnInit, ElementRef, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ETAPE } from 'src/app/constantes/referentiel/etape.enum';
import { STATUT } from 'src/app/constantes/referentiel/statut.enum';
import { DemandeRechercheDto } from 'src/app/modeles/dto/demande-recherche-dto.model';
import { OrganismeMiniDto } from 'src/app/modeles/dto/organisme-mini-dto.dto';
import { DemandeRechercheDtoService } from 'src/app/services/crud/mini-dto/demande-recherche-dto-service';
import { DemandeService } from 'src/app/services/crud/demande.service';
import { BirtViewerService } from 'src/app/services/birt-viewer.service';


@Component({
  selector: 'app-demandes-consultation-restreinte',
  templateUrl: './demandes-consultation-restreinte.component.html'
})
export class DemandesConsultationRestreinteComponent implements OnInit {

  // Réferentiels
  organismes: OrganismeMiniDto[];
  public demande: DemandeRechercheDto;
  // Loaders
  loading = true;

  constructor(
    private dialogRef: MatDialogRef<DemandesConsultationRestreinteComponent>,
    private demDtoService: DemandeRechercheDtoService,
    private birtService: BirtViewerService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    // Données modèle
    if (this.data.demandeUuid) {
      this.demDtoService.getByUuidMin(this.data.demandeUuid).subscribe((dem: DemandeRechercheDto) => {
        this.demande = dem;
        this.loading = false;
      });
    } else {
      this.close();
    }
  }

  /** ETAPES */
  public isAInstruire(codeEtape: String): Boolean { return codeEtape === ETAPE.ETP_AIN_CODE; }
  public isInstruite(codeEtape: String): Boolean { return codeEtape === ETAPE.ETP_INS_CODE; }
  public isCloture(codeEtape: String): Boolean { return codeEtape === ETAPE.ETP_CLO_CODE; }

  /** STATUT */
  public isRecevable(codeStatut: String): Boolean { return codeStatut === STATUT.STT_REC_CODE; }
  public isIrrecevable(codeStatut: String): Boolean { return (codeStatut === STATUT.STT_IRR_CODE || codeStatut === STATUT.STT_REF_CODE); }
  public isAccordee(codeStatut: String): Boolean {
    return (codeStatut === STATUT.STT_ACCE_CODE || codeStatut === STATUT.STT_ACCIA_CODE || codeStatut === STATUT.STT_ACCIM_CODE);
  }

  ///// ACTIONS
  // Ferme la pop-up sans rien faire
  close() {
    this.dialogRef.close();
  }
  telechargerSynthese() {
    this.birtService.ouvrirSynthese(this.demande.id);
  }

}
