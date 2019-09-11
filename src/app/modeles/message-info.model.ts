import { JsonObject, JsonProperty } from 'json2typescript';
import { MESSAGE_IMPORTANCE } from '../constantes/referentiel/message-importance.enum';
import { DateConverter } from 'src/app/modeles/utils/custom-converters';

@JsonObject('MessageInfo')
export class MessageInfo {
    @JsonProperty('id', Number)
    id: number = undefined;
    @JsonProperty('code', String)
    code: string = undefined;
    @JsonProperty('titre', String, true)
    titre: string = undefined;
    @JsonProperty('datePublication', DateConverter, true)
    datePublication: Date = new Date();
    @JsonProperty('contenu', String, true)
    contenu: string = undefined;
    @JsonProperty('visible', Boolean)
    visible = false;
    @JsonProperty('importance', String, true)
    importance = MESSAGE_IMPORTANCE.INFO;

    public constructor(init?: Partial<MessageInfo>) {
        Object.assign(this, init);
    }
}
