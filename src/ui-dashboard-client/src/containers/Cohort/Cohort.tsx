import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CohortState } from '../../models/state/CohortState';


interface Props {
    cohort?: CohortState;
    dashboardId?: string;
}

class Cohort extends React.Component<Props> {
    private className = 'cohort';

    public render() {
        const c = this.className;
        const { cohort, dashboardId } = this.props;
        if (!cohort) {
            return null;
        }
        const pats = [ ...(cohort!.cohort.data as any).keys() ];

        return (
            <div className={`${c}-container`}>
                {pats.map((patId) => {
                    return <Link key={patId} to={`/dashboards/${dashboardId}/patients/${patId}`}>{patId}</Link>
                })
                }
            </div>
        );
    }
};

const withRouter = (Cohort: any) => (props: Props) => {
    const params = useParams();
    const dashboardId = { params };
    return <Cohort cohort={props.cohort} dashboardId={dashboardId} />;
};

export default withRouter(Cohort);