import React from 'react';
import { Col, Row } from 'reactstrap';
import { CohortSearch, PatientData } from '../../../models/state/CohortState';
import { PatientPageConfig } from '../../../models/config/config';
import PatientSearch from '../Search/PatientSearch';
import { AppState } from '../../../models/state/AppState';
import { connect } from 'react-redux';
import './PatientHeaderBar.css';

interface OwnProps {
    patient: PatientData;
    config: PatientPageConfig;
}
interface DispatchProps {
    dispatch: any;
}
interface StateProps {
    search: CohortSearch;
}

type Props = StateProps & DispatchProps & OwnProps;

class PatientHeaderBar extends React.Component<Props> {
    private className = 'patient-header-bar';

    public render() {
        const { patient, config, search, dispatch } = this.props;
        const c = this.className;
        const d = patient.demographics;

        return (
            <div className={`${c}-container`}>
                <Row>
                    <Col md={8} sm={12} className={`${c}-container-left`}>
                        <div className={`${c}-name`}><span>{d.name}</span></div>
                        <div className={`${c}-separator`} />
                        <div className={`${c}-age`}><span>{d.age} years old, </span></div>
                        <div className={`${c}-gender`}><span>{d.gender}</span></div>
                    </Col>
                    <Col md={4} sm={12} className={`${c}-container-right`}>
                        {config.search.enabled &&
                        <PatientSearch hints={search.hints} term={search.term} dispatch={dispatch} />
                        }
                    </Col>
                </Row>
            </div>
        );
    }
};

const mapStateToProps = (state: AppState) => {
    return { search: state.cohort.search };
};

const mapDispatchToProps = (dispatch: any) => {
    return { dispatch };
};

export default connect<StateProps, DispatchProps, OwnProps, AppState>
    (mapStateToProps, mapDispatchToProps)(PatientHeaderBar);