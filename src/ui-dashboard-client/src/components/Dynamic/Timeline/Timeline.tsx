import moment from 'moment';
import React from 'react';
import { XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, ReferenceLine, Dot, ReferenceDot } from 'recharts';
import { WidgetTimelineConfig, WidgetTimelineNumericDatasetConfig, WidgetTimelineEventDatasetConfig } from '../../../models/config/content';
import { PatientListRowDTO } from '../../../models/patientList/Patient';
import { CohortData, DatasetMetadata, PatientData } from '../../../models/state/CohortState';
import { DatasetMetadataColumns, getDatasetMetadataColumns } from '../../../utils/datasetMetadata';
import DynamicTimelineTrendBar from './TimelineTrendBar';
import { AiOutlineCloudDownload } from "react-icons/ai"
import { getDynamicColor } from '../../../utils/dynamic';
import Highlighter from "react-highlight-words";
import DynamicTimelineComparePicker from './TimelineComparePicker';
import './Timeline.css';

interface Props {
    config: WidgetTimelineConfig;
    cohort: CohortData;
    dispatch: any;
    patient: PatientData;
}

interface State {
    chartHeight: number;
    chartWidth: number;
}

export interface TimelineValueSet {
    ds: WidgetTimelineNumericDatasetConfig | WidgetTimelineEventDatasetConfig;
    meta: DatasetMetadata;
    data: PatientListRowDTO[];
    cols: DatasetMetadataColumns;
}

export default class DynamicTimeline extends React.Component<Props, State> {
    private className = 'dynamic-timeline';
    private colors = [
        'rgb(41, 75, 226)',
        'rgb(57, 181, 238)',
        'rgb(153, 18, 194)',
        'rgb(197, 118, 14)',
        'rgb(16, 180, 24)',
        'rgb(192, 31, 45)'
    ];

    constructor(props: Props) {
        super(props);
        const dims = this.getChartDimensions();
        this.state = {
            chartHeight: dims.height,
            chartWidth: dims.width
        }
    }

    public componentDidMount() {
        window.addEventListener('resize', this.updateChartDimensions);
        this.updateChartDimensions();
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.updateChartDimensions);
    }

    public shouldComponentUpdate(nextProps: Props) {
        if (this.state.chartWidth < 1000) {
            return true;
        } else if (this.props.cohort.comparison !== nextProps.cohort.comparison) {
            return true;
        } else if (this.props.patient === nextProps.patient) {
            return false;
        }
        return true;
    }

    private updateChartDimensions = () => {
        const dims = this.getChartDimensions();
        this.setState({ chartHeight: dims.height, chartWidth: dims.width });
    }

    private getChartDimensions = () => {
        const chartElem = document.getElementsByClassName(this.className)
        if (chartElem.length) {
            return {
                width: chartElem[0].getClientRects()[0].width,
                height: chartElem[0].getClientRects()[0].height
            };
        }
        return { width: 800, height: 800 };
    }

    public render() {
        const { config, cohort, dispatch, patient } = this.props;
        const { chartWidth } = this.state;
        const margins = { top: 0, right: 0, bottom: 0, left: 0 };
        const swimlaneHeight = 70;
        const [ numericDatasets, eventDatasets ] = this.getValueSets();
        const bounds = this.getDateBounds(numericDatasets);
        const c = this.className;
        const dateunix = "__dateunix__";

        const verticals: number[] = [];
        const domainDiff = Math.trunc((bounds[1] - bounds[0]) / 12);
        const maxTimeline = this.getMaxTimelineValueSet(eventDatasets);

        let interval = bounds[0];
        while (interval < bounds[1]) {
            interval += domainDiff;
            verticals.push(interval);
        }

        return (
            <div className={c}>

                {/* Header */}
                <div className={`${c}-header-separator`} />
                <div className={`${c}-header-container`}>

                    {/* Title & Export */}
                    <div className={`${c}-title ${c}-header-bubble`}>{config.title}</div>
                    {config.export.enabled && 
                    <div className={`${c}-export ${c}-header-bubble`}>
                        <AiOutlineCloudDownload />
                        <span>Export</span>
                    </div>}

                    {/* Comparison to cohort */}
                    {config.comparison.enabled && config.comparison.filters &&
                    <DynamicTimelineComparePicker 
                        config={config} cohort={cohort} patientId={patient.id} dispatch={dispatch} datasets={numericDatasets}
                    />
                    }
                </div>

                {/* Chart */}
                <div className={`${c}-chart-container`}>

                    {/* Small multiples */}
                    <div className={`${c}-small-multiples-container`} style={{ width: chartWidth-500 }}>
                        {numericDatasets.map((val, i) => {
                            const { ds, data, cols } = val;
                            const color = this.colors[i];

                            return (
                                <LineChart key={ds.id} width={chartWidth-480} height={swimlaneHeight} margin={margins} data={data}>

                                    {/* Grid */}
                                    <CartesianGrid fill={i % 2 === 0 ? 'white' : 'rgb(240,242,245)'} verticalPoints={verticals} />

                                    {verticals.map((v, i) => <ReferenceLine key={`v${i}`} x={v} className={`${c}-grid-line`} />)}

                                    <XAxis type="number" scale="time" dataKey={dateunix} axisLine={true} tick={true} hide={true} 
                                        domain={[ bounds[0] * 0.999, bounds[1] * 0.995 ]} ticks={verticals.slice(0, 11)} tickFormatter={(v) => moment(v).format('MM-DD-YYYY') }
                                        allowDataOverflow={true}
                                    />

                                    {/* Y-axis */}
                                    {cols.fieldValueNumeric && 
                                    <YAxis type="number" dataKey={cols.fieldValueNumeric} width={0} orientation="right"
                                        domain={[dataMin => dataMin <= 1 ? -1 : dataMin * 0.6, dataMax => dataMax <= 1 ? 2 : dataMax * 1.1]}
                                        tick={false} allowDataOverflow={true}
                                    />}

                                    {/* Tooltip */}
                                    <Tooltip cursor={false} wrapperStyle={{ zIndex: 100 }} content={this.renderTooltip.bind(null, val, color)} />

                                    {/* Line */}
                                    <Line type="linear" dataKey={cols.fieldValueNumeric!} stroke={color} dot={true} />

                                </LineChart>
                            );
                        })}

                        {/* Event timeline on bottom */}
                        {eventDatasets.length > 0 && 
                        <LineChart width={chartWidth-500} height={swimlaneHeight * 2} margin={margins} data={eventDatasets[0].data}>

                            {/* Grid */}
                            <CartesianGrid fill={numericDatasets.length % 2 === 0 ? 'white' : 'rgb(240,242,245)'} verticalPoints={verticals} />

                            {verticals.map((v, i) => <ReferenceLine key={`v${i}`} x={v} className={`${c}-grid-line`}  />)}

                            {/* Events */}
                            {eventDatasets.reduce((accum: JSX.Element[], curr: TimelineValueSet) => {
                                const i = accum.length;
                                const stroke = getDynamicColor(curr.ds.color);
                                const pairs = curr.data.map((d, j) => {
                                    const y = this.randRng(60, 100);
                                    return [
                                        <ReferenceLine 
                                            key={`line${i}_${j}_${curr.ds.id}`} 
                                            className={`${c}-chart-event-line`}
                                            segment={[ { x: d.__dateunix__, y: 0 }, { x: d.__dateunix__, y } ]}
                                            label={<TimelineEventBox name={d[curr.cols.fieldValueString!] as string} color={stroke} />} 
                                            style={{ stroke }}
                                        />,
                                        <ReferenceDot 
                                            key={`dot${i}_${j}_${curr.ds.id}`} 
                                            className={`${c}-chart-event-dot`} 
                                            x={d.__dateunix__} y={0.03}
                                            style={{ stroke }}
                                        />
                                    ];
                                });
                                pairs.forEach(p => p.forEach(elem => accum.push(elem)))
                                return accum;
                            }, [])}

                            <YAxis type="number" width={0} orientation="right" domain={[0,100]} tick={false} />

                            <XAxis type="number" scale="time" dataKey={dateunix} axisLine={true} tick={true} hide={false} 
                                domain={[ bounds[0] * 0.999, bounds[1] * 0.995]} ticks={verticals.slice(0, 11)} tickFormatter={(v) => moment(v).format('MM-DD-YYYY') }
                                allowDataOverflow={true}
                            />

                        </LineChart>}
                    </div>

                    {/* Trends box */}
                    <div className={`${c}-trend-container`}>
                        {numericDatasets.map((val, i) => {
                            cohort.comparison.get(val.ds.id)
                            return (
                                <div key={val.ds.id} style={{ height: swimlaneHeight }} className={`${c}-trend`}>
                                    <DynamicTimelineTrendBar 
                                        values={val} color={this.colors[i]} comparison={cohort.comparison.get(val.ds.id)} isNumeric={true} 
                                    />
                                </div>     
                            );
                        })}   
                        {maxTimeline && 
                        <div style={{ height: (swimlaneHeight * 2) - 30 }} className={`${c}-trend`}>
                            <DynamicTimelineTrendBar 
                                values={maxTimeline} color={getDynamicColor(maxTimeline.ds.color)} isNumeric={false} 
                            />
                        </div>}
                    </div>
                </div>
            </div>
        )
    }

    private getMaxTimelineValueSet = (events: TimelineValueSet[]): TimelineValueSet | null => {
        let maxTimeline = null;
        let max = null;

        for (const ev of events) {
            const { data, cols } = ev;
            if (!max && data.length) { max = data[0][cols.fieldDate!] }

            for (const d of data) {
                let val = d[cols.fieldDate!] as any;
                if (val) {
                    if (val >= max!) { 
                        maxTimeline = ev;
                        max = val;
                    }
                }
            }
        }
        return maxTimeline;
    }

    private randRng = (min: number, max: number): number => {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    private getDateBounds = (vals: TimelineValueSet[]): [number,number] => {
        const absmin = moment().subtract(5, 'years').valueOf();
        let min = moment(new Date()).valueOf();
        let max = min;
        for (const v of vals) {
            const { meta, data } = v;
            const cols = getDatasetMetadataColumns(meta);

            if (!cols.fieldValueNumeric) { continue; }

            for (const d of data) {
                let val = d[cols.fieldDate!] as any;
                if (val) {
                    val = moment(val).valueOf();
                    if (val < min) { min = val; }
                    if (val > max) { max = val; }
                }
            }
        }
        
        if (min < absmin) { min = absmin; }
        max = moment().add(6, 'month').valueOf();

        return [ min * 0.999, max * 0.995 ];
    }

    private getValueSets = (): [ TimelineValueSet[], TimelineValueSet[] ] => {
        const { config, patient, cohort } = this.props;
        const zip = (ds: WidgetTimelineEventDatasetConfig | WidgetTimelineNumericDatasetConfig) => {
            const meta = cohort.metadata.get(ds.id)!;
            const data = patient.datasets.get(ds.id) ?? [];
            const cols = getDatasetMetadataColumns(meta);

            return { ds, meta, data, cols };
        }

        const nums = config.numericDatasets.map(zip)
        const evs  = config.eventDatasets.map(zip);

        return [ nums, evs ];
    }

    private renderTooltip = (val: TimelineValueSet, color: string, props: any) => {
        const { active, payload } = props;
        if (active && payload && payload.length) {
            const c = `${this.className}-tooltip`;
            const data = (payload[0] && payload[0].payload) as PatientListRowDTO;
            
            return (
                <div className={c}>
                    <div className={`${c}-body`}>
                        <span className={`${c}-title`}>{val.ds.title}:</span>
                        {val.cols.fieldValueNumeric &&
                        <span className={`${c}-value`} style={{ color }}>{data[val.cols.fieldValueNumeric]}</span>}
                    </div>
                    <div className={`${c}-date`}>{moment(data[val.cols.fieldDate!]).format("MMM DD, YYYY")}</div>
                    {val.ds.context && val.ds.context.fields.map((f,i) => {
                        if (!data[f]) { return null; }
                        return (
                            <div key={i} className={`${c}-context-container`}>
                                <span className={`${c}-context-field`}>{f}:</span>
                                <span className={`${c}-context-value`}>
                                    <Highlighter
                                        highlightClassName='highlight'
                                        searchWords={data[val.cols.fieldValueString!]?.split(',')}
                                        autoEscape={true}
                                        textToHighlight={data[f]}>
                                    </Highlighter>
                                </span>
                            </div>
                        );
                    })}
                </div>
          );
        }
        return null;
    };
};

/**
 * Timeline Event Boxes
 */
interface TimelineEventProps {
    x?: any;
    y?: any;
    color: string;
    name: string;
    viewBox?: any;
}
class TimelineEventBox extends React.PureComponent<TimelineEventProps> {
    public render () {
        const c = 'dynamic-timelines-event-box';
        const { x, y, name, viewBox, color } = this.props;

        return (
            <foreignObject className={c} x={viewBox.x-50} y={viewBox.y}>
                <div style={{ borderColor: color }}>
                    {name}
                </div>
            </foreignObject>
        );
    }
};