
import { config as TestConfig } from '../test/mock';
import { DashboardConfig } from '../models/config/config';

export function defaultDashboardConfigurationState(): DashboardConfig {
    return TestConfig;
}

const setDashboardConfig = (state: DashboardConfig, config: DashboardConfig) => {
    return Object.assign({}, state, {
        config
    })
}

export function config(state: DashboardConfig = defaultDashboardConfigurationState(), action: any): DashboardConfig {
    switch (action.type) {
        default:
            return state;
    }
}
