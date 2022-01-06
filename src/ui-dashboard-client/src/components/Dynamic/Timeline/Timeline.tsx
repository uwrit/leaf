import moment from 'moment';
import React from 'react';
import { XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line } from 'recharts';
import { ContentTimelineConfig, ContentTimelineDatasetConfig } from '../../../models/config/content';
import { PatientListRowDTO } from '../../../models/patientList/Patient';
import { DatasetId, DatasetMetadata, PatientData } from '../../../models/state/CohortState';
import { DatasetMetadataColumns, getDatasetMetadataColumns } from '../../../utils/datasetMetadata';
import './Timeline.css';
import DynamicTimelineTrendBar from './TimelineTrendBar';

interface Props {
    config: ContentTimelineConfig;
    patient: PatientData;
    metadata: Map<DatasetId, DatasetMetadata>;
}

interface State {
    chartHeight: number;
    chartWidth: number;
}

export interface TimelineValueSet {
    ds: ContentTimelineDatasetConfig;
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
        const { chartWidth } = this.state;
        const margins = { top: 0, right: 10, bottom: 0, left: 0 };
        const swimlaneHeight = 80;
        const vals = this.getValueSets();
        const bounds = this.getDateBounds(vals);
        const c = this.className;

        return (
            <div className={c}>

                {vals.map((val, i) => {
                    const { ds, meta, data } = val;
                    const cols = getDatasetMetadataColumns(meta!);
                    const _data = data.map(d => ({ ...d, [cols.fieldDate!]: moment(d[cols.fieldDate!]).valueOf() }));

                    return (
                        <LineChart key={ds.id} width={chartWidth} height={swimlaneHeight} margin={margins} data={_data}>

                            {/* Grid */}
                            <CartesianGrid fill={i % 2 === 0 ? 'rgb(240,240,240)': 'white'} horizontal={false} vertical={true} />

                            {/* X-axis */}
                            <XAxis type="number" scale="time" dataKey={cols.fieldDate} axisLine={true} tick={false} hide={true} 
                                domain={[ bounds[0] * 0.999, 0 ]}
                            />

                            {/* Y-axis */}
                            <YAxis type="number" dataKey={cols.fieldValueNumeric} axisLine={false} width={500} orientation="right"
                                domain={[dataMin => dataMin * 0.8, dataMax => dataMax * 1.1]}
                                tick={false}
                            />

                            {/* Tooltip */}
                            <Tooltip cursor={false} wrapperStyle={{ zIndex: 100 }} />

                            {/* Line */}
                            <Line type="linear" dataKey={cols.fieldValueNumeric!} stroke={this.colors[i]} dot={false} />

                        </LineChart>
                    );
                })}

                <div className={`${c}-trend-container`}>
                    {vals.map((val, i) => {
                        return (
                            <div key={val.ds.id} style={{ height: swimlaneHeight }} className={`${c}-trend`}>
                                <DynamicTimelineTrendBar values={val} color={this.colors[i]} />
                            </div>     
                        );
                    })}      
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
        return [min,max];
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