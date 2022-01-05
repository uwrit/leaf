import React from 'react';
import { Col, Row } from 'reactstrap';
import { ContentListConfig, RgbValues } from '../../../models/config/content';
import { PatientData } from '../../../models/state/CohortState';
import { dynamicColor } from '../../../utils/dynamicColor';
import './List.css';

interface Props {
    config: ContentListConfig;
    patient: PatientData;
}

export default class DynamicList extends React.Component<Props> {
    private className = 'dynamic-list';
    private defaultColor: RgbValues = [36, 77, 138];

    public render() {
        const { config } = this.props;
        const c = this.className;

        return (
            <Col className={`${c}-container`} md={config.width ?? 12} style={{ backgroundColor: dynamicColor(config.color)}}>
                <div>{config.title}</div>
            </Col>
        );
    }
};