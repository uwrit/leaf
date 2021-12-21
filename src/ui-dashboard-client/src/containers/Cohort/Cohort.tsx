import React from 'react';
import { useParams } from 'react-router-dom';


interface Props {
    patientId?: string;
}

class Cohort extends React.Component<Props> {
    private className = 'patient';

    public render() {
        const c = this.className;
        console.log("props!", this.props);

        return (
            <div className={`${c}-container`}>
            </div>
        );
    }
};

const withRouter = (Cohort: any) => (props: Props) => {
    const params = useParams();
    const { dashboardId, patientId } = params;
    console.log(dashboardId, patientId);
    return <Cohort patientId={patientId} />;
};

export default withRouter(Cohort);