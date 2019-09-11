import { JsonObject, JsonProperty } from 'json2typescript';

export enum SORT_DIRECTION { ASC= 'ASC', DESC= 'DESC' }
// export enum SORT_NULL_HANDLING { NATIVE= 'NATIVE' }

// CLASSES DTO "RECHERCHE"
@JsonObject('SortItem')
export class SortItem {
    // @JsonProperty('direction', String)
    // direction: string = undefined;
    @JsonProperty('property', String)
    propriete: string = undefined;
    @JsonProperty('ignoreCase', Boolean)
    ignoreCase = true;
    // @JsonProperty('nullHandling', String)
    // nullHandling: string = undefined;
    @JsonProperty('ascending', Boolean)
    asc = false;
    @JsonProperty('descending', Boolean)
    desc = false;

    constructor(propriete: string, asc: boolean, desc: boolean, ignoreCase: boolean = true ) {
        this.propriete = propriete;
        this.asc = asc;
        this.desc = desc;
        this.ignoreCase = ignoreCase;
    }
}
