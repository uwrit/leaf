import React from 'react';
import { useParams } from 'react-router-dom';
import { CohortState, CohortStateType } from '../../models/state/CohortState';
import { PatientPageConfig } from '../../models/config/config';
import PatientHeaderBar from '../../components/Patient/PatientHeaderBar/PatientHeaderBar';
import { renderDynamicComponent } from '../../utils/dynamic';
import { getCohortDatasets } from '../../actions/cohort';
import './Patient.css';

interface Props {
    cohortId?: string;
    cohort?: CohortState;
    config?: PatientPageConfig;
    patientId?: string;
    dispatch: any;
}

class Patient extends React.Component<Props> {
    private className = 'patient';

    public componentDidUpdate(prevProps: Props) {
        const { cohort, cohortId, dispatch } = this.props;

        if (cohortId && (cohort?.state === CohortStateType.NOT_LOADED || cohortId !== prevProps.cohortId)) {
            dispatch(getCohortDatasets(cohortId));
        }
    }

    public render() {
        const c = this.className;
        const { cohort, config, patientId, dispatch } = this.props;

        // Bail if no data
        if (!cohort || !config || !patientId) { return null; }
        const patient = cohort.data.patients.get(patientId);

        // Bail if no patient - TODO(ndobb) should be 404
        if (!patient) { return null; }

        return (
            <div className={`${c}-container`}>

                {/* Name, age, search, etc. */}
                <PatientHeaderBar patient={patient} config={config} />

                {/* Dynamically read & render content */}
                <div className={`${c}-content-container`}>
                    {config.content.map((content, i) => renderDynamicComponent(content, cohort.data, patient, dispatch, i))}
                </div>
            </div>
        );
    }
};

const withRouter = (Patient: any) => (props: Props) => {
    const params = useParams();
    const { cohortId, patientId } = params;

    if ( !cohortId || !patientId || !props.cohort || !props.config) { return null; }

    return <Patient patientId={patientId} cohortId={cohortId} config={props.config} cohort={props.cohort} dispatch={props.dispatch} />;
};

export default withRouter(Patient);