import React from 'react';
import { getTimelineComparisonValues } from '../../../actions/cohort';
import { WidgetTimelineComparisonEntryConfig, WidgetTimelineConfig } from '../../../models/config/content';
import { CohortData } from '../../../models/state/CohortState';
import { TimelineValueSet } from './Timeline';
import { FiPlus } from 'react-icons/fi'
import CheckboxSlider from '../../Other/CheckboxSlider/CheckboxSlider';
import { Col, Container, Input, InputGroup, Row } from 'reactstrap';

interface Props {
    config: WidgetTimelineConfig;
    cohort: CohortData;
    datasets: TimelineValueSet[];
    dispatch: any;
    filters: WidgetTimelineComparisonEntryConfig[];
    filterClickHandler: (filters: WidgetTimelineComparisonEntryConfig[]) => any;
    patientId: string;
}

interface State {
    showPicker: boolean;
    stringPickerOpts: Map<number, StringPickerOption[]>;
}

export default class DynamicTimelineComparePicker extends React.PureComponent<Props, State> {
    private className = 'dynamic-timeline-comparison';

    public constructor(props: Props) {
        super(props);
        const stringPickerOpts = new Map();

        for (let i = 0; i < props.filters.length; i++) {
            const f = props.filters[i];
            if (f.args && f.args.string) {
                const opts = this.deriveStringOptions(f);
                stringPickerOpts.set(i, opts);
            }
        }

        this.state = {
            showPicker: false,
            stringPickerOpts
        };
    }

    public componentDidMount() {
        const { filters, dispatch, patientId, datasets } = this.props;
        dispatch(getTimelineComparisonValues(filters, datasets, patientId));
    }

    public render() {
        const { config, filters } = this.props;
        const { showPicker } = this.state;
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
                        {`(${filters.filter(f => f.enabled).length} filters)`}
                    </div>
                    <div className={`${c}-filters-picker ${showPicker ? 'shown' : ''}`}>
                        <div className={`${c}-filter-picker-close`} onClick={this.toggleShowPicker}>×</div>
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
        const { stringPickerOpts } = this.state;
        const { filters } = this.props;

        return (
            filters.map((f,i) => {
                const enabled = typeof f.enabled !== 'undefined' && f.enabled;
                const text = f.text ? f.text : f.column;
                return (
                    <Container className={`${c}-filter-picker-container`} key={f.column}>
                        <Row>
                            <Col md={8} className={`${c}-filter-picker-row`}>{text}</Col>
                            <Col md={4} className={`${c}-filter-picker-check`}>
                                <CheckboxSlider onClick={this.handleFilterClick.bind(null, i)} checked={enabled} />
                            </Col>
                        </Row>

                        {/* Numeric padding input */}
                        {f.args && f.args.numeric &&
                        <Row>
                            <InputGroup>    
                            <div>
                                +/-
                            </div>

                            {/* Increment */}
                            <Input
                                className={`${c}-number leaf-input`} 
                                pattern={'0-9+'}
                                onChange={this.handleFilterNumPadChange.bind(null, i)}
                                placeholder="number" 
                                value={isNaN(f.args.numeric.pad!) ? '' : f.args.numeric.pad} 
                            />
                            </InputGroup>
                        </Row>}

                        {/* String matching options */}
                        {f.args && f.args.string && 
                        <Row>
                            {stringPickerOpts.get(i)!.map(opt => {
                                return (
                                    <Row>
                                        <Col md={8} className={`${c}-filter-picker-row`}>{opt.display}</Col>
                                        <Col md={4} className={`${c}-filter-picker-check`}>
                                            <CheckboxSlider onClick={this.handleFilterClick.bind(null, i)} checked={opt.enabled} />
                                        </Col>
                                    </Row>
                                )
                            })}
                        </Row>}
                    </Container>
            )})
        );
    }

    private deriveStringOptions = (filter: WidgetTimelineComparisonEntryConfig): StringPickerOption[] => {
        const { datasets } = this.props;
        const { pickerDisplayColumn } = filter.args?.string!;
        const data = datasets.find(ds => ds.ds.id === filter.datasetId);
        const output: StringPickerOption[] = [];
        const seen: Set<string> = new Set();
        const matchLimit = 10;

        if (!data) {
            return output;
        }
        
        for (const row of data.data) {
            const value = row[filter.column];
            if (value && !seen.has(value)) {
                seen.add(value);
                let display = value;
                if (pickerDisplayColumn && row[pickerDisplayColumn]) {
                    display = row[pickerDisplayColumn];
                }
                output.push({ value, display, enabled: false });
                if (output.length >= matchLimit) {
                    return output;
                }
            }
        }

        return output;
    }

    private handleFilterNumPadChange = (idx: number, e: React.FormEvent<HTMLInputElement>) => {
        const pad = parseInt(e.currentTarget.value);
        const { filterClickHandler, filters, dispatch, datasets, patientId } = this.props;
        const newFilters = filters.slice();

        newFilters[idx] = { ...newFilters[idx], args: { numeric: { pad } } };
        dispatch(getTimelineComparisonValues(newFilters, datasets, patientId));
        filterClickHandler(newFilters);
    }

    private handleFilterClick = (idx: number) => {
        const { filterClickHandler, filters, dispatch, datasets, patientId } = this.props;
        const newFilters = filters.slice();

        newFilters[idx] = { ...newFilters[idx], enabled: !newFilters[idx].enabled }
        dispatch(getTimelineComparisonValues(newFilters, datasets, patientId));
        filterClickHandler(newFilters);
    };

    private handleStringPickerToggle = (filterIdx: number, optIdx: number) => {
        const { filterClickHandler, filters, dispatch, datasets, patientId } = this.props;
        const { stringPickerOpts } = this.state;
        const newOpts = new Map(stringPickerOpts);
        const newFilters = filters.slice();
        // newOpts.set(filterIdx, )

        // newFilters[filterIdx] = { ...newFilters[filterIdx], args: { string: { matchOn: } } }
        dispatch(getTimelineComparisonValues(newFilters, datasets, patientId));
        filterClickHandler(newFilters);
    }

    private handleClick = () => {
        const { config, dispatch, patientId, datasets } = this.props;
        dispatch(getTimelineComparisonValues(config.comparison.filters!, datasets, patientId));
    }
};