import React from 'react';
import { Col, Row } from 'reactstrap';
import { PatientData } from '../../../models/state/CohortState';
import { PatientPageConfig } from '../../../models/config/config';
import PatientSearch from '../../../components/Patient/Search/PatientSearch';
import './PatientHeaderBar.css';

interface Props {
    patient: PatientData;
    config: PatientPageConfig;
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
                        {config.search.enabled &&
                        <PatientSearch />
                        }
                    </Col>
                </Row>
            </div>
        );
    }
};