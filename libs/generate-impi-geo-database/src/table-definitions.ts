export interface IFieldDefinition {
    Name: string,
    Type: string
}

export interface IIndexDefinition {
    Name: string,
    Fields: String[]
}

export interface ITableDefinition {
    TableName: string,
    Fields: IFieldDefinition[],
    Indexes: IIndexDefinition[] | null
}


export const VersionTable: ITableDefinition = {
    TableName: "VERSION",
    Fields: [
        { Name: "version", Type: "TEXT" },
        { Name: "period_from", Type: "TEXT" },
        { Name: "period_to", Type: "TEXT" }
    ],
    Indexes: null
}

export const CenterStreetsTable: ITableDefinition = {
    TableName: "CENTERSTREETS",
    Fields: [
        { Name: "zip_code", Type: "INTEGER" },
        { Name: "community", Type: "TEXT" },
        { Name: "street", Type: "TEXT" },
        { Name: "egid", Type: "INTEGER" }
    ],
    Indexes: [{ Name: "I_CENTERSTREETS", Fields: ["street", "zip_code", "community"] }]
}

export const CenterCommunitiesTable: ITableDefinition = {
    TableName: "CENTERCOMMUNITIES",
    Fields: [
        { Name: "zip_code", Type: "INTEGER" },
        { Name: "community", Type: "TEXT" },
        { Name: "egid", Type: "INTEGER" }
    ],
    Indexes: [{ Name: "I_CENTERCOMMUNITIES", Fields: ["zip_code", "community"] }]
}

export const AdditionalCommunitiesTable: ITableDefinition = {
    TableName: "ADDITIONALCOMMUNITIES",
    Fields: [
        { Name: "Original", Type: "INTEGER" },
        { Name: "Alternativ", Type: "INTEGER" }
    ],
    Indexes: [{ Name: "I_ADDITIONALCOMMUNITIES", Fields: ["Original", "Alternativ"] }]
}

export const BuildingsTable: ITableDefinition = {
    TableName: "BUILDINGS",
    Fields: [
        { Name: "egid", Type: "INTEGER" },
        { Name: "street", Type: "TEXT" },
        { Name: "street_number", Type: "TEXT" },
        { Name: "zip_code", Type: "INTEGER" },
        { Name: "community", Type: "TEXT" },
        { Name: "canton", Type: "INTEGER" },
        { Name: "major_statistical_region", Type: "INTEGER" },
        { Name: "community_type", Type: "INTEGER" },
        { Name: "second_appartement_quota", Type: "INTEGER" },
        { Name: "tax_burden", Type: "INTEGER" },
        { Name: "travel_time_to_centers", Type: "INTEGER" },
        { Name: "public_transport_quality", Type: "INTEGER" },
        { Name: "noise_exposure", Type: "INTEGER" },
        { Name: "slope", Type: "INTEGER" },
        { Name: "exposure", Type: "INTEGER" },
        { Name: "lake_view", Type: "INTEGER" },
        { Name: "mountain_view", Type: "INTEGER" },
        { Name: "distance_to_lakes", Type: "INTEGER" },
        { Name: "distance_to_rivers", Type: "INTEGER" },
        { Name: "distance_to_highvoltage_powerlines", Type: "INTEGER" },
        { Name: "year_of_construction", Type: "INTEGER" },
    ],
    Indexes: [{ Name: "I_BUILDINGS", Fields: ["street", "street_number", "zip_code", "community"] }]
}









