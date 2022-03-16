
import { config as TestConfig } from '../test/mock';
import { DashboardConfig } from '../models/config/config';
import { ConfigAction, SET_DASHBOARD_CONFIG } from '../actions/config';

export function defaultDashboardConfigurationState(): DashboardConfig {
    return {
        main: {
            title: "test!"
        }, 
        patient: {
            content: [],
            search: {
                enabled: false
            }
        }
    };
}

export function config(state: DashboardConfig = defaultDashboardConfigurationState(), action: ConfigAction): DashboardConfig {
    switch (action.type) {
        case SET_DASHBOARD_CONFIG:
            return Object.assign({}, state, action.config);
        default:
            return state;
    }
}
