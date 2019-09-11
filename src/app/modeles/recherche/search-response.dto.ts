import { JsonObject, JsonProperty, Any } from 'json2typescript';
import { SortItem } from './sort-item';

// CLASSES DTO "RECHERCHE"
@JsonObject('SearchResponseDto')
export class SearchResponseDto {
    @JsonProperty('content', [Any])
    content: Any[] = [];
    @JsonProperty('first', Boolean)
    first: boolean = undefined;
    @JsonProperty('last', Boolean)
    last: boolean = undefined;
    @JsonProperty('totalPages', Number)
    totalPages: number = undefined;
    @JsonProperty('totalElements', Number)
    totalElements: number = undefined;
    @JsonProperty('numberOfElements', Number)
    numberOfElements: number = undefined;
    @JsonProperty('size', Number)
    size: number = undefined;
    @JsonProperty('number', Number)
    pageNumber: number = undefined;
    @JsonProperty('sort', [SortItem])
    sort: SortItem[] = [];

    constructor() {}
}
