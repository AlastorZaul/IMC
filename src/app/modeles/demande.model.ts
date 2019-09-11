import { JsonObject, JsonProperty } from 'json2typescript';
import { Employeur } from 'src/app/modeles/employeur.model';
import { Salarie } from 'src/app/modeles/salarie.model';
import { Etape } from 'src/app/modeles/etape.model';
import { Statut } from 'src/app/modeles/statut.model';
import { DateConverter } from 'src/app/modeles/utils/custom-converters';
import { Entretien } from 'src/app/modeles/entretien.model';
import { Remuneration } from 'src/app/modeles/remuneration.model';
import { Courrier } from 'src/app/modeles/courrier.model';
import { MotifDecision } from 'src/app/modeles/motif-decision.model';
import { OrganismeMiniDto } from 'src/app/modeles/dto/organisme-mini-dto.dto';

// CLASSES DTO "DEMANDE"
@JsonObject('Demande')
export class Demande {
    @JsonProperty('id', Number, true)
    id: number = undefined;
    @JsonProperty('autresClauses', String, true)
    autresClauses: String = undefined;
    @JsonProperty('commentaire', String, true)
    commentaire: String = undefined;
    @JsonProperty('courrielContact', String, true)
    courrielContact: String = undefined;

    @JsonProperty('dateCloture', DateConverter, true)
    dateCloture: Date = undefined;
    @JsonProperty('dateCreation', DateConverter, true)
    dateCreation: Date = undefined;
    @JsonProperty('dateDecision', DateConverter, true)
    dateDecision: Date = undefined;
    @JsonProperty('dateDecisionImpression', DateConverter, true)
    dateDecisionImpression: Date = undefined;
    @JsonProperty('dateEnvisageeRupture', DateConverter, true)
    dateEnvisageeRupture: Date = undefined;
    @JsonProperty('dateFinDelaiInstruction', DateConverter, true)
    dateFinDelaiInstruction: Date = undefined;
    @JsonProperty('dateFinDelaiRetractation', DateConverter, true)
    dateFinDelaiRetractation: Date = undefined;
    @JsonProperty('dateImpression', DateConverter, true)
    dateImpression: Date = undefined;
    @JsonProperty('dateReception', DateConverter, true)
    dateReception: Date = undefined;
    @JsonProperty('dateSignature', DateConverter, true)
    dateSignature: Date = undefined;
    @JsonProperty('dateTeletransmission', DateConverter, true)
    dateTeletransmission: Date = undefined;
    @JsonProperty('dateTransfert', DateConverter, true)
    dateTransfert: Date = undefined;

    @JsonProperty('decisionMotifAutre', String, true)
    decisionMotifAutre: String = undefined;
    @JsonProperty('documentFormulaireDemande', String, true)
    documentFormulaireDemande: String = undefined;

    @JsonProperty('etape', Etape, true)
    etape: Etape = undefined;
    @JsonProperty('numero', String, true)
    numero: string = undefined;
    @JsonProperty('remarqueEntretiens', String, true)
    remarqueEntretiens: string = undefined;
    @JsonProperty('statut', Statut, true)
    statut: Statut = undefined;
    @JsonProperty('uuid', String, true)
    uuid: string = undefined;
    @JsonProperty('courriers', [Courrier], true)
    courriers: Courrier[] = undefined;
    @JsonProperty('employeur', Employeur, true)
    employeur: Employeur = undefined;
    @JsonProperty('organismeAttribution', OrganismeMiniDto, true)
    organismeAttribution: OrganismeMiniDto = undefined;
    @JsonProperty('organismeReception', OrganismeMiniDto, true)
    organismeReception: OrganismeMiniDto = undefined;
    @JsonProperty('remuneration', Remuneration, true)
    remuneration: Remuneration = undefined;
    @JsonProperty('salarie', Salarie, true)
    salarie: Salarie = undefined;
    @JsonProperty('entretiens', [Entretien], true)
    entretiens: Entretien[] = undefined;
    @JsonProperty('motifsDecision', [MotifDecision], true)
    motifsDecision: MotifDecision[] = undefined;

    public constructor(init?: Partial<Demande>) {
        Object.assign(this, init);
        if (this.employeur) {
            this.employeur = new Employeur(this.employeur);
        }
        if (this.salarie) {
            this.salarie = new Salarie(this.salarie);
        }
        if (this.remuneration) {
            this.remuneration = new Remuneration(this.remuneration);
        }
        if (this.entretiens && this.entretiens.length > 0) {
            this.entretiens = this.entretiens.map((entr: Entretien) => {
                return new Entretien(entr);
            });
        }
    }


    /** @description: nettoyage de l'objet en vue d'une duplication */
    cleanPourDuplication() {
        // Infos de base
        this.id = undefined;
        this.uuid = undefined;
        this.numero = undefined;
        this.courrielContact = undefined;
        this.organismeAttribution = undefined;
        this.organismeReception = undefined;
        this.etape = undefined;
        this.statut = undefined;
        // Employeur
        this.employeur.id = undefined;
        if (this.employeur.adresse) { this.employeur.adresse.id = undefined; }
        if (this.employeur.adresseCorrespondance) { this.employeur.adresseCorrespondance.id = undefined; }
        // Salarié
        this.salarie.id = undefined;
        if (this.salarie.adresse) { this.salarie.adresse.id = undefined; }
        // Entretiens
        if (this.entretiens && this.entretiens.length > 0) {
            this.entretiens.forEach(entretien => entretien.id = undefined);
        }
        // Remuneration
        this.remuneration.id = undefined;
        // Dates
        this.dateCloture = undefined;
        this.dateCreation = undefined;
        this.dateDecision = undefined;
        this.dateDecisionImpression = undefined;
        this.dateEnvisageeRupture = undefined;
        this.dateFinDelaiInstruction = undefined;
        this.dateFinDelaiRetractation = undefined;
        this.dateImpression = undefined;
        this.dateReception = undefined;
        this.dateSignature = undefined;
        this.dateTeletransmission = undefined;
        this.documentFormulaireDemande = undefined;
        this.dateTransfert = undefined;
        // Decision
        this.decisionMotifAutre = undefined;
        this.motifsDecision = undefined;
        // Courriers
        this.courriers = undefined;
    }
}
