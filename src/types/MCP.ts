export interface MCPStrategySegmentGroup {
    criterion: string;         
    value: string;             
    clientIds: string[];       
    reason: string;            
}

export interface MCPStrategyResponse {
    coverage: number;                 
    totalClients: number;           
    selectedClients: string[];      
    segmentGroups: MCPStrategySegmentGroup[];
    message?: string;
}
