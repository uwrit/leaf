import { CancelTokenSource } from 'axios';
import { DashboardConfig, DashboardConfigDTO } from '../models/config/config';
import { AppState } from '../models/state/AppState';
import { baseUrl, HttpFactory } from './HttpFactory';

 export const fetchDashboardConfigurations = async (state: AppState): Promise<DashboardConfig[]> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const request = await http.get(`${baseUrl}/api/config/dashboards`);
    const dtos = request.data as DashboardConfigDTO[];

    return dtos.map(dto => JSON.parse(dto.jsonConfig) as DashboardConfig);
};