import React from 'react';
import { useParams } from 'react-router-dom';
import { CohortState } from '../../models/state/CohortState';
import { PatientPageConfig } from '../../models/config/config';
import PatientHeaderBar from './PatientHeaderBar/PatientHeaderBar';
import { renderDynamicComponent } from '../../utils/dynamic';


interface Props {
    cohort?: CohortState;
    config?: PatientPageConfig;
    patientId?: string;
}

class Patient extends React.Component<Props> {
    private className = 'patient';

    public render() {
        const c = this.className;
        const { cohort, config, patientId } = this.props;

        console.log(this.props);

        // Bail if no data
        if (!cohort || !config || !patientId) { return null; }
        const patient = cohort.patients.get(patientId);

        // Bail if no patient - TODO(ndobb) should be 404
        if (!patient) { return null; }

        return (
            <div className={`${c}-container`}>

                {/* Name, age, search, etc. */}
                <PatientHeaderBar patient={patient} config={config} />

                {/* Dynamically read & render content */}
                {config.content.map((content, i) => renderDynamicComponent(content, patient, i))}
            </div>
        );
    }
};

const withRouter = (Patient: any) => (props: Props) => {
    const params = useParams();
    const { dashboardId, patientId } = params;

    if (!patientId || !props.cohort || !props.config) { return null; }

    return <Patient patientId={patientId} config={props.config} cohort={props.cohort} />;
};

export default withRouter(Patient);