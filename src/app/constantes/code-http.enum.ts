export enum CODE_HTTP {
    CODE_ERREUR_INCONNUE = 0,
    CODE_CREATED = 201,
    CODE_NO_CONTENT = 204,
    CODE_PARTIAL_CONTENT = 206,
    CODE_NOT_MODIFIED = 304,
    CODE_NOT_FOUND = 404,
    CODE_ERREUR_MAITRISEE = 406,
    CODE_CONFLICT = 409,
    CODE_ERREUR_VALIDATION = 412, // PRECONDITION FAILED
    CODE_ERREUR_SERVEUR_INCONNUE = 500
}