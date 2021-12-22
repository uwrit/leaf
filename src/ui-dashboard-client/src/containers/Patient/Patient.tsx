import React from 'react';
import { useParams } from 'react-router-dom';
import { CohortDataMap } from '../../models/cohortData/cohortData';


interface Props {
    cohort?: CohortDataMap;
    patientId?: string;
}

class Patient extends React.Component<Props> {
    private className = 'patient';

    public render() {
        const c = this.className;
        const { cohort } = this.props;

        return (
            <div className={`${c}-container`}>
                patient data
            </div>
        );
    }
};

const withRouter = (Patient: any) => (props: Props) => {
    const params = useParams();
    const { dashboardId, patientId } = params;
    console.log(dashboardId, patientId);
    return <Patient patientId={patientId} cohort={props.cohort} />;
};

export default withRouter(Patient);