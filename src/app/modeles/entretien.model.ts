import { JsonObject, JsonProperty } from 'json2typescript';
import { QualiteAssistant } from 'src/app/modeles/qualite-assistant.model';
import { DateConverter } from 'src/app/modeles/utils/custom-converters';

@JsonObject('Entretien')
export class Entretien {
    @JsonProperty('id', Number, true)
    id: number = undefined;
    @JsonProperty('date', DateConverter, true)
    date: Date = new Date();
    @JsonProperty('employeurAssiste', Boolean, true)
    employeurAssiste: boolean = undefined;
    @JsonProperty('nomAssistantEmployeur', String, true)
    nomAssistantEmployeur: string = undefined;
    @JsonProperty('nomAssistantSalarie', String, true)
    nomAssistantSalarie: string = undefined;
    @JsonProperty('qualiteAssistantEmployeur', QualiteAssistant, true)
    qualiteAssistantEmployeur: QualiteAssistant = undefined;
    @JsonProperty('qualiteAssistantSalarie', QualiteAssistant, true)
    qualiteAssistantSalarie: QualiteAssistant = undefined;
    @JsonProperty('salarieAssiste', Boolean, true)
    salarieAssiste: boolean = undefined;

    public constructor(init?: Partial<Entretien>) {
        Object.assign(this, init);
    }
}
