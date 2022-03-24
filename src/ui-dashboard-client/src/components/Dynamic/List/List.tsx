import moment from 'moment';
import React from 'react';
import { Row, Col, Container } from 'reactstrap';
import { WidgetListConfig } from '../../../models/config/content';
import { DatasetId, DatasetMetadata, PatientData } from '../../../models/state/CohortState';
import { getDatasetMetadataColumns } from '../../../utils/datasetMetadata';
import { getDynamicColor, getDynamicIcon } from '../../../utils/dynamic';
import './List.css';

interface Props {
    config: WidgetListConfig;
    patient: PatientData;
    metadata: Map<DatasetId, DatasetMetadata>;
}

export default class DynamicList extends React.Component<Props> {
    private className = 'dynamic-list';

    /**
     * Render
     */
    public render() {
        const { config, patient, metadata } = this.props;
        const c = this.className;
        const meta = metadata.get(config.datasetId);

        if (!meta) { return null; }

        return (
            <Container className={`${c}-container`} style={{ width: `${config.width ?? settings.defaultWidth}%`, color: this.getStyle().color }}>
                {this.getTitle()}

                <div className={`${c}-inner`} style={this.getStyle()}>
                    <div className={`${c}-inner-background`}>
                        {this.getItems()}
                    </div>
                </div>
            </Container>
        );
    }

    /**
     * Get style for main checklist element
     */
     private getStyle = (): React.CSSProperties => {
        const { config } = this.props;
        return {
            backgroundColor: getDynamicColor(config.color, settings.background.transparency),
            border: `${settings.border.size}px solid ${getDynamicColor(config.color, settings.border.transparency)}`
        };
    }

    /**
     * Get title of the list
     */
    private getTitle = (): JSX.Element => {
        const { config } = this.props;
        const c = this.className;
        return (
            <div className={`${c}-title-container`} style={{ backgroundColor: getDynamicColor(config.color, settings.title.transparency) }}>
                {getDynamicIcon(config.icon)}
                <span className={`${c}-title`}>{config.title}</span>
            </div>
        )
    }

    /**
     * Get items
     */
    private getItems = (): JSX.Element | null => {
        const { config, patient, metadata } = this.props;
        const meta = metadata.get(config.datasetId);
        const data = patient.datasets.get(config.datasetId);
        const c = this.className;

        if (!meta || !data) { return null; }

        const cols = getDatasetMetadataColumns(meta!);
        const containerClass = `${c}-item-container`;
        const valClass = `${c}-item-value`;
        const dateClass = `${c}-item-date`;
        const datediffClass = `${c}-item-datediff`;
        const parenClass = `${c}-item-paren`;
        
        return (
            <div>
                {data.map((d, i) => {
                    const val = d[cols.fieldValueString!];
                    const date = (d[cols.fieldDate!] as any) as Date;
                    let dateStr = '';
                    let diffStr = '';

                    if (date) {
                        const now = moment(new Date());
                        const then = moment(date);
                        dateStr = then.format('MMM YYYY');

                        for (const pair of [['years','yr'],['months','mo'],['days','dy']]) {
                            const [ unit, abbr ] = pair;
                            const diff = now.diff(then, unit as any);
                            if (diff >= 1) {
                                diffStr = `${diff} ${abbr}`;
                                break;
                            }
                        }
                    }
                    
                    return (
                        <Row key={i} className={containerClass}>
                            <Col md={6} className={valClass}>
                                <span>{val}</span>
                            </Col>
                            <Col md={6} className={dateClass}>
                                <span>{dateStr}</span>
                                <span className={parenClass}> (</span>
                                <span className={datediffClass}>{diffStr}</span>
                                <span className={parenClass}>)</span>
                            </Col>
                        </Row>
                    );
                })}
            </div>
        );
    }
};

const settings = {
    background: {
        transparency: 0.05
    },
    border: {
        size: 1,
        transparency: 0.3,
    },
    defaultWidth: 100,
    title: {
        transparency: 0.1
    }
};