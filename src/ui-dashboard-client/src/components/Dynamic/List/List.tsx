import React from 'react';
import { Col } from 'reactstrap';
import { ContentListConfig } from '../../../models/config/content';
import { PatientData } from '../../../models/state/CohortState';
import { getDynamicColor } from '../../../utils/dynamic';
import './List.css';

interface Props {
    config: ContentListConfig;
    patient: PatientData;
}

export default class DynamicList extends React.Component<Props> {
    private className = 'dynamic-list';

    public render() {
        const { config } = this.props;
        const c = this.className;

        return (
            <Col className={`${c}-container`} md={config.width ?? 12}>
                <div className={`${c}-inner`} style={this.getStyle(config)}>
                    {config.title}
                </div>
            </Col>
        );
    }

    private getStyle = (config: ContentListConfig): React.CSSProperties => {
        return {
            backgroundColor: getDynamicColor(config.color, 0.2),
            border: `2px solid ${getDynamicColor(config.color, 0.5)}`
        };
    } 
};