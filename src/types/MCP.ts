export interface MCPStrategySegmentGroup {
    criterion: string;         // Ej: "firstName", "birthDate"
    value: string;             // Ej: "Carlos", "Month-8"
    clientIds: string[];       // IDs de los clientes que pertenecen a este grupo
    reason: string;            // Texto explicando por qué se segmentaron (usado en UI)
}

export interface MCPStrategyResponse {
    coverage: number;                 // Porcentaje de cobertura total (0 a 1)
    totalClients: number;            // Cantidad total de clientes en el sistema
    selectedClients: string[];       // Todos los IDs que forman parte de la estrategia
    segmentGroups: MCPStrategySegmentGroup[];  // Subgrupos segmentados por criterio
}
