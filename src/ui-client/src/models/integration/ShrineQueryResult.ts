
export interface ShrineQueryResult {
    id: number;
    updated: string;
    results: ShrineResultsMap;
    user: ShrineResearcher;
}

interface ShrineResultProgress {
    adapterNodeId: number;
    adapterNodeName: string;
    crcInstanceId: number;
    count: number;
    id: number;
    obfuscatingParameters: ShrineResultObfuscatingParameters;
    queryId: number;
}

interface ShrineResultsMap {
    [id: number]: ShrineResultProgress;
}

interface ShrineResearcher {
    id: number;
    userName: string;
    userDomainName: string;
    nodeId: number;
}

interface ShrineResultObfuscatingParameters {
    binSize: number;
    lowLimit: number;
    noiseClamp: number;
    stdDev: number;
}