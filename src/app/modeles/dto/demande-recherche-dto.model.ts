import { JsonObject, JsonProperty } from 'json2typescript';
import { OrganismeMiniDto } from 'src/app/modeles/dto/organisme-mini-dto.dto';
import { Employeur } from 'src/app/modeles/employeur.model';
import { Etape } from 'src/app/modeles/etape.model';
import { Salarie } from 'src/app/modeles/salarie.model';
import { Statut } from 'src/app/modeles/statut.model';
import { DateConverter } from 'src/app/modeles/utils/custom-converters';

// CLASSES DTO "RECHERCHE"
@JsonObject('DemandeRechercheDto')
export class DemandeRechercheDto {
    @JsonProperty('id', Number)
    id: number;
    @JsonProperty('employeur', Employeur, true)
    employeur: Employeur ;
    @JsonProperty('salarie', Salarie, true)
    salarie: Salarie;
    @JsonProperty('etape', Etape, true)
    etape: Etape;
    @JsonProperty('statut', Statut, true)
    statut: Statut;
    @JsonProperty('numero', String)
    numero: string;
    @JsonProperty('uuid', String)
    uuid: String;
    @JsonProperty('organismeAttribution', OrganismeMiniDto, true)
    organismeAttribution: OrganismeMiniDto;
    @JsonProperty('organismeReception', OrganismeMiniDto, true)
    organismeReception: OrganismeMiniDto;
    @JsonProperty('dateTransfert', DateConverter, true)
    dateTransfert: Date = new Date();

    @JsonProperty('dateTeletransmission', DateConverter, true)
    dateTeletransmission: Date = new Date();
    @JsonProperty('dateReception', DateConverter, true)
    dateReception: Date = new Date();
    @JsonProperty('dateDecision', DateConverter, true)
    dateDecision: Date = new Date();
    @JsonProperty('dateFinDelaiInstruction', DateConverter, true)
    dateFinDelaiInstruction: Date = new Date();
    @JsonProperty('dateEnvisageeRupture', DateConverter, true)
    dateEnvisageeRupture: Date = new Date();

    constructor() {
        this.id = undefined;
        this.employeur = undefined;
        this.salarie = undefined;
        this.etape = undefined;
        this.statut = undefined;
        this.numero = undefined;
        this.uuid = undefined;
        this.organismeAttribution = undefined;
        this.organismeReception = undefined;
        this.dateTransfert = undefined;
        this.dateTeletransmission = undefined;
        this.dateReception = undefined;
        this.dateDecision = undefined;
        this.dateFinDelaiInstruction = undefined;
        this.dateEnvisageeRupture = undefined;
    }
}
