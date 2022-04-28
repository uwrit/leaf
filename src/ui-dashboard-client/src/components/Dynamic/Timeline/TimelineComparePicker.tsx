import React from 'react';
import { getTimelineComparisonValues } from '../../../actions/cohort';
import { WidgetTimelineComparisonEntryConfig, WidgetTimelineConfig } from '../../../models/config/content';
import { CohortData } from '../../../models/state/CohortState';
import { TimelineValueSet } from './Timeline';

interface Props {
    config: WidgetTimelineConfig;
    cohort: CohortData;
    datasets: TimelineValueSet[];
    dispatch: any;
    patientId: string;
}

interface State {
    filters: FilterConfig[];
}

interface FilterConfig extends WidgetTimelineComparisonEntryConfig {
    enabled: boolean;
}

export default class DynamicTimelineComparePicker extends React.Component<Props, State> {
    private className = 'dynamic-timeline-comparison';

    public constructor(props: Props) {
        super(props);
        this.state = {
            filters: []
        }
    }

    public componentDidMount() {
        const { filters } = this.state;
        const { dispatch, patientId, datasets } = this.props;

        dispatch(getTimelineComparisonValues(filters, datasets, patientId));
    }

    public render() {
        const { config, cohort } = this.props;
        const { filters } = this.state;
        const c = this.className;

        return (
            <div className={`${c}-container`}>
                <div className={`${c}-title-outer`}>
                    <div className={`${c}-title-inner`}>{config.comparison.title}</div>
                </div>
                <div onClick={this.handleClick} className={`${c}-all-patients-text`}>
                    {filters.length === 0 ? 'All Patients' : `${filters.length} Filters`}
                </div>
            </div>
        );
    }

    public getFilterPopup = () => {
        const { config, cohort } = this.props;

        for (const x of config.comparison.filters!) {

        }
    }

    public handleClick = () => {
        const { filters } = this.state;
        const { dispatch, patientId, datasets } = this.props;

        dispatch(getTimelineComparisonValues(filters, datasets, patientId));
    }
};