import React from 'react';
import { FiCornerUpLeft } from 'react-icons/fi';
import { Col, Row } from 'reactstrap';
import { PatientData } from '../../../models/state/CohortState';
import { PatientPageConfig } from '../../../models/config/config';
import './PatientHeaderBar.css';

interface Props {
    patient: PatientData;
    config?: PatientPageConfig;
    search?: boolean;
}

export default class PatientHeaderBar extends React.Component<Props> {
    private className = 'patient-header-bar';

    public render() {
        const { patient, config } = this.props;
        const c = this.className;
        const d = patient.demographics;

        return (
            <div className={`${c}-container`}>
                <Row>
                    <Col md={6} className={`${c}-container-left`}>
                        <div className={`${c}-name`}><span>{d.name}</span></div>
                        <div className={`${c}-separator`} />
                        <div className={`${c}-age`}><span>{d.age} years old, </span></div>
                        <div className={`${c}-gender`}><span>{d.gender}</span></div>
                    </Col>
                    <Col md={6} className={`${c}-container-right`}>
                        <div className={`${c}-backto-dashboard`}>
                            <FiCornerUpLeft/>
                            <span>To Clinic Dashboard</span>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
};