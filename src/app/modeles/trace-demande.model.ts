import { JsonObject, JsonProperty } from 'json2typescript';
import { DateConverter } from 'src/app/modeles/utils/custom-converters';
import { Any } from 'json2typescript/src/json2typescript/any';

@JsonObject('TraceDemande')
export class TraceDemande {
    @JsonProperty('id', Number)
    id: number;
    @JsonProperty('actionEffectuee', String)
    actionEffectuee: string;
    @JsonProperty('dateHeureTrace', DateConverter)
    dateHeureTrace: Date = new Date();
    @JsonProperty('empreinteDemande', String)
    empreinteDemande: string;
    @JsonProperty('erreurHorodatage', Boolean)
    erreurHorodatage: boolean ;

    @JsonProperty('fichierTraceDepot', Any)
    fichierTraceDepot: any;
    @JsonProperty('jetonHorodatage', Any)
    jetonHorodatage: any;
    @JsonProperty('loginUtilisateur', String)
    loginUtilisateur: string;
    @JsonProperty('numDemande', String)
    numDemande: string;

    constructor() {
        this.id = undefined;
        this.actionEffectuee = undefined;
        this.dateHeureTrace = undefined;
        this.empreinteDemande = undefined;
        this.erreurHorodatage = undefined;
        this.fichierTraceDepot = undefined;
        this.jetonHorodatage = undefined;
        this.loginUtilisateur = undefined;
        this.numDemande = undefined;
    }
}
