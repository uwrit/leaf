import React from 'react';
import { getTimelineComparisonValues } from '../../../actions/cohort';
import { WidgetTimelineComparisonEntryConfig, WidgetTimelineConfig } from '../../../models/config/content';
import { CohortData } from '../../../models/state/CohortState';
import { TimelineValueSet } from './Timeline';
import { FiPlus } from 'react-icons/fi'
import CheckboxSlider from '../../Other/CheckboxSlider/CheckboxSlider';
import { Col, Container, Row } from 'reactstrap';

interface Props {
    config: WidgetTimelineConfig;
    cohort: CohortData;
    datasets: TimelineValueSet[];
    dispatch: any;
    patientId: string;
}

interface State {
    filters: FilterConfig[];
    showPicker: boolean;
}

interface FilterConfig extends WidgetTimelineComparisonEntryConfig {
    enabled: boolean;
}

export default class DynamicTimelineComparePicker extends React.Component<Props, State> {
    private className = 'dynamic-timeline-comparison';

    public constructor(props: Props) {
        super(props);
        this.state = {
            filters: [],
            showPicker: false
        }
    }

    public componentDidMount() {
        const { filters } = this.state;
        const { dispatch, patientId, datasets } = this.props;

        dispatch(getTimelineComparisonValues(filters, datasets, patientId));
    }

    public render() {
        const { config, cohort } = this.props;
        const { filters, showPicker } = this.state;
        const c = this.className;

        return (
            <div className={`${c}-container`}>
                <div className={`${c}-title-outer`}>
                    <div className={`${c}-title-inner`}>{config.comparison.title}</div>
                </div>
                <div className={`${c}-filter-container`}>
                    <div className={`${c}-add-filter`}>
                        <FiPlus onClick={this.toggleShowPicker} />
                    </div>
                    <div onClick={this.handleClick} className={`${c}-all-patients-text`}>
                        <span>Mean over all </span>
                        <br/>
                        {`(${filters.length} filters)`}
                    </div>
                    <div className={`${c}-filters-picker ${showPicker ? 'shown' : ''}`}>
                        {this.getFilterPopup()}
                    </div>
                </div>
            </div>
        );
    }

    public toggleShowPicker = () => {
        this.setState({ showPicker: !this.state.showPicker });
    }

    public getFilterPopup = () => {
        const c = this.className;
        const { config } = this.props;

        return (
            config.comparison.filters!.map(f => (
                <Container className={`${c}-filter-picker-container`}>
                    <Row>
                        <Col md={8} className={`${c}-filter-picker-row`}>{f.column}</Col>
                        <Col md={4} className={`${c}-filter-picker-check`}>
                            <CheckboxSlider onClick={this.dummy} checked={false} />
                        </Col>
                    </Row>
                </Container>
            ))
        );
    }

    public dummy = () => null;

    public handleClick = () => {
        const { filters } = this.state;
        const { dispatch, patientId, datasets } = this.props;

        dispatch(getTimelineComparisonValues(filters, datasets, patientId));
    }
};