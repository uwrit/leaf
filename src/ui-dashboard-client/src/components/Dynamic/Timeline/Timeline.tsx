import moment from 'moment';
import React from 'react';
import { XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, ReferenceLine, Dot, ReferenceDot } from 'recharts';
import { WidgetTimelineConfig, WidgetTimelineDatasetConfig } from '../../../models/config/content';
import { PatientListRowDTO } from '../../../models/patientList/Patient';
import { DatasetId, DatasetMetadata, PatientData } from '../../../models/state/CohortState';
import { DatasetMetadataColumns, getDatasetMetadataColumns } from '../../../utils/datasetMetadata';
import DynamicTimelineTrendBar from './TimelineTrendBar';
import { AiOutlineCloudDownload } from "react-icons/ai"
import './Timeline.css';

interface Props {
    config: WidgetTimelineConfig;
    patient: PatientData;
    metadata: Map<DatasetId, DatasetMetadata>;
}

interface State {
    chartHeight: number;
    chartWidth: number;
}

export interface TimelineValueSet {
    ds: WidgetTimelineDatasetConfig;
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
        const { config } = this.props;
        const { chartWidth } = this.state;
        const margins = { top: 0, right: 10, bottom: 0, left: 0 };
        const swimlaneHeight = 70;
        const vals = this.getValueSets();
        const bounds = this.getDateBounds(vals);
        const c = this.className;
        const lastIdx = vals.length-1;

        const verticals: number[] = [];
        const domainDiff = Math.trunc((bounds[1] - bounds[0]) / 14);
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
                    {config.comparison.enabled && 
                    <div className={`${c}-comparison-container`}>
                        <div className={`${c}-comparison-title-outer`}>
                            <div className={`${c}-comparison-title-inner`}>{config.comparison.title}</div>
                        </div>
                        <div className={`${c}-comparison-all-patients-text`}>{config.comparison.columnText}</div>
                    </div>
                    }
                </div>

                {/* Chart */}
                <div className={`${c}-chart-container`}>

                    {/* Small multiples */}
                    <div className={`${c}-small-multiples-container`} style={{ width: chartWidth-500 }}>
                        {vals.map((val, i) => {
                            const { ds, meta, data } = val;
                            const cols = getDatasetMetadataColumns(meta!);
                            const _data = data.map(d => ({ ...d, [cols.fieldDate!]: moment(d[cols.fieldDate!]).valueOf() }));

                            return (
                                <LineChart key={ds.id} width={chartWidth-500} height={i !== 5 ? swimlaneHeight : swimlaneHeight * 2} margin={margins} data={_data}>

                                    {/* Grid */}
                                    <CartesianGrid fill={i % 2 === 0 ? 'white' : 'rgb(240,242,245)'} verticalPoints={verticals} />

                                    {verticals.map(v => <ReferenceLine x={v} className={`${c}-grid-line`} />)}

                                    {/* X-axis */}
                                    <XAxis type="number" scale="time" dataKey={cols.fieldDate} axisLine={true} tick={true} hide={i !== lastIdx} 
                                        domain={[ bounds[0] * 0.999, bounds[1] * 0.995]} ticks={verticals.slice(0, 11)} tickFormatter={(v) => moment(v).format('MM-DD-YYYY') }
                                        allowDataOverflow={true}
                                    />

                                    {/* Y-axis */}
                                    {cols.fieldValueNumeric && 
                                    <YAxis type="number" dataKey={cols.fieldValueNumeric} width={0} orientation="right"
                                        domain={[dataMin => dataMin * 0.6, dataMax => dataMax * 1.1]}
                                        tick={false} allowDataOverflow={true}
                                    />}

                                    {!cols.fieldValueNumeric && 
                                    <YAxis type="number" width={0} orientation="right" domain={[0,1]} tick={false}
                                    />}

                                    {/* Tooltip */}
                                    <Tooltip cursor={false} wrapperStyle={{ zIndex: 100 }} />

                                    {/* Line */}
                                    <Line type="linear" dataKey={cols.fieldValueNumeric!} stroke={this.colors[i]} dot={true} />

                                    {!cols.fieldValueNumeric && 
                                    _data.map(d => {
                                            return <ReferenceLine className={`${c}-chart-event-line`} x={d[cols.fieldDate!]} label={<TimelineEventBox name={d[cols.fieldValueString!] as string} />} />
                                        })
                                    }

                                    {!cols.fieldValueNumeric && 
                                    _data.map(d => <ReferenceDot className={`${c}-chart-event-dot`} x={d[cols.fieldDate!]} y={0.03} />)
                                    }

                                </LineChart>
                            );
                        })}
                    </div>

                    {/* Trends box */}
                    <div className={`${c}-trend-container`}>
                        {vals.map((val, i) => {
                            return (
                                <div key={val.ds.id} style={{ height: i !== lastIdx ? swimlaneHeight : (swimlaneHeight * 2) - 30 }} className={`${c}-trend`}>
                                    <DynamicTimelineTrendBar values={val} color={this.colors[i]} comparison={config.comparison.enabled} />
                                </div>     
                            );
                        })}      
                    </div>
                </div>
            </div>
        )
    }

    private getDateBounds = (vals: TimelineValueSet[]): [number,number] => {
        let min = moment(new Date()).valueOf();
        let max = min;
        for (const v of vals) {
            const { ds, meta, data } = v;
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
        return [ min, max ];
    }

    private getValueSets = (): TimelineValueSet[] => {
        const { config, patient, metadata } = this.props;
        return config.datasets.map(ds => {
            const meta = metadata.get(ds.id)!;
            const data = patient.datasets.get(ds.id) ?? [];
            const cols = getDatasetMetadataColumns(meta);

            return { ds, meta, data, cols };
        });
    }
};

/**
 * Timeline Event Boxes
 */
 interface TimelineEventProps {
    x?: any;
    y?: any;
    name: string;
    viewBox?: any;
}
class TimelineEventBox extends React.PureComponent<TimelineEventProps> {
    public render () {
        const c = 'dynamic-timelines-event-box';
        const { x, y, name, viewBox } = this.props;

        return (
            <foreignObject className={c} x={viewBox.x-50} y={viewBox.y}>
                <div>
                    {name}
                </div>
            </foreignObject>
        );
    }
};