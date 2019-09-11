import { SortItem, SORT_DIRECTION } from './sort-item';
import { FilterItem } from './filter-item';
import { Pager } from './pager';
import { SearchResponseDto } from './search-response.dto';
import { FormGroup } from '@angular/forms';

enum SORT_ICON_NAME { NO_SORT= 'unfold_more', ASC= 'expand_more', DESC= 'expand_less' }

// CLASSES DTO "RECHERCHE"
export class SearchRequestDto {

    filtres: FilterItem[] = [];
    pager: Pager;
    tris: SortItem[] = [];

    constructor() {
        this.pager = new Pager();
    }

    updateTris(nomColonneTri: string): void {
        if (this.tris.length > 0) {
            const ndxElement = this.tris.findIndex((tri: SortItem) => {
                return tri.propriete === nomColonneTri;
            });
            if (ndxElement !== -1) {
                const elem = this.tris[ndxElement];
                if (elem !== undefined) {
                    if (elem.asc) {
                        elem.asc = false; elem.desc = true;
                    } else if (elem.desc) {
                        this.tris.splice(ndxElement, 1);
                    }
                }
            } else {
                this.tris.push(new SortItem(nomColonneTri, true, false));
            }
        } else {
            this.tris.push(new SortItem(nomColonneTri, true, false));
        }
    }

    getSortIconNameByNomColonneTri(nomColonneTri: string): SORT_ICON_NAME {
        if (this.tris.length > 0) {
            const ndxElement = this.tris.findIndex((tri: SortItem) => {
                return tri.propriete === nomColonneTri;
            });
            if (ndxElement !== -1) {
                const elem = this.tris[ndxElement];
                if (elem !== undefined) {
                    return (elem.asc) ? SORT_ICON_NAME.ASC : SORT_ICON_NAME.DESC;
                }
            }
            return SORT_ICON_NAME.NO_SORT;
        }
        return SORT_ICON_NAME.NO_SORT;
    }

    /** @param optionsOperateur : permet de surcharger les opérateurs de type par défaut.
     * Format : {{'nomFiltre': TYPE_OPERATEUR}, {'nomFiltre': TYPE_OPERATEUR}...}
     * @todo : à implémenter si nécessaire */
    updateFiltresWithFormGroup(fg: FormGroup, backToFirstPage = false, optionsOperateur?: any): void {
        if (fg === undefined) {
            return;
        }
        this.filtres = [];
        const values = fg.getRawValue();
        for (const key in values) {
            if (!values.hasOwnProperty(key)) { continue; }
            if (values[key] === '' || values[key] === undefined || values[key] === null) { continue; }
            this.filtres.push(new FilterItem(key, values[key]));
        }
        if (backToFirstPage) {
            this.pager.firstPage();
        }
    }

    updatePagerFromSearchResponseDto(srDto: SearchResponseDto): void {
        if (this.pager === undefined ) {
            return;
        }
        this.pager.pageNumber = srDto.pageNumber;
        this.pager.numberOfElements = srDto.numberOfElements;
        this.pager.first = srDto.first;
        this.pager.last = srDto.last;
        this.pager.totalPages = srDto.totalPages;
        this.pager.totalElements = srDto.totalElements;
        this.pager.size = srDto.size;
    }

    toURLString(): String {
        let firstParam = true;
        let result = '';
        if (this.filtres !== undefined && this.filtres.length > 0) {
            let firstFiltreParam = true;
            if (firstParam) { result += '/?'; firstParam = false; }
            result += 'filters=';
            this.filtres.forEach((f: FilterItem) => {
                if (firstFiltreParam) { firstFiltreParam = false; } else { result += ','; }
                result += f.propriete + f.operateur + encodeURIComponent(f.valeur);
            });
        }
        if (this.pager !== undefined) {
            if (firstParam) { result += '/?'; firstParam = false; } else { result += '&'; }
            result += ('size=' + this.pager.size);
            result += ('&page=' + this.pager.getCurrentPage());
        }
        if (this.tris !== undefined && this.tris.length > 0) {
            this.tris.forEach((s: SortItem) => {
                if (!s.asc && !s.desc) { return; }
                if (firstParam) { result += '/?'; firstParam = false; } else { result += '&'; }
                result += ('sort=' + s.propriete + ',' + ((s.asc) ? SORT_DIRECTION.ASC : SORT_DIRECTION.DESC));
            });
        }
        // '/?page=0&size=20&filters=identite:a&sort=nom,ASC&sort=prenom,DESC';
        // /?page=0&size=20&filters=identite:a&sort=nom,ASC&sort=prenom,DESC
        return result;
    }

}
