import { SearchRequestDto } from '../modeles/recherche/search-request.dto';

/**
 * @description : Interface à implémenter pour structurer les composants contenant une recherche (grille/liste + pager + formulaire filtres)
 */
export interface IPageRecherche {
    searchRequestItem: SearchRequestDto;
    loading: boolean;
    loadingListe: boolean;
    triColonne(nomColonneTri: string): void;
    getSortIconName(nomColonneTri: string): string;
    rechercher(backToFirstPage: boolean);
}
