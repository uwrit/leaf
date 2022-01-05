import React from 'react';
import { Col } from 'reactstrap';
import { ContentChecklistConfig, RgbValues } from '../../../models/config/content';
import { PatientData } from '../../../models/state/CohortState';
import { dynamicColor } from '../../../utils/dynamicColor';
import './Checklist.css';

interface Props {
    config: ContentChecklistConfig;
    patient: PatientData;
}

export default class DynamicChecklist extends React.Component<Props> {
    private className = 'dynamic-checklist';
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