export const ROUTES_API = {
    ////// SCHEMAS
    SCHEMA_METIER: '/metier',
    SCHEMA_REFERENTIEL: '/referentiel',
    SCHEMA_PARAMETRES: '/parametre',
    ////// TABLES
    // METIER
    DEMANDE: '/demande',
    ORGANISME: '/organisme',
    COMPTE_UTILISATEUR: '/compte-utilisateur',
    SIGNATURES: '/signatures', // route secondaire de l'organisme
    // REFERENTIEL
    REGION: '/region',
    DEPARTEMENT: '/departement',
    PROFIL: '/profil',
    JOUR_CHOME: '/jour-chome',
    JOURS_CHOMES: '/jours-chomes', // Juste pour organisme.joursChomes()
    LOCALISATION: '/localisation',
    PAYS: '/pays',
    ETAPE: '/etape',
    STATUT: '/statut',
    APE: '/ape',
    QUALIFICATION: '/qualification',
    CONVENTION_COLLECTIVE: '/convention-collective',
    QUALITE_ASSISTANT: '/qualite-assistant',
    MOTIF_DECISION: '/motif-decision',
    TYPE_COURRIER: '/type-courrier',
    // PARAMETRES
    ARTICLE: '/article',
    MESSAGE_INFO: '/message-info',
    PARAMETRES: '/parametre',
    VERROU: '/verrou',
    // ACTIONS SPECIFIQUES
    CODE: '/code',
    NUMERO: '/numero',
    UUID: '/uuid',
    MINI: '/min',
    MEDIUM: '/medium',
    ACCES: '/access',
    AUTORISES: '/autorises',
    LISTE: '/list',
    TUILES: '/tuiles',
    TELERC: '/telerc',
    RECHERCHE: '/recherche',
    REINDEXATION: '/reindex',
    EXPORT: '/export',
    EXPORT_EXCEL: '/export/excel',
    ETABLISSEMENT_SIMILAIRE: '/etablissement-similaire',
    ENTREPRISE_SIMILAIRE: '/entreprise-similaire'
};
