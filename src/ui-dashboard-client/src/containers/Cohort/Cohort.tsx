import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { MainPageConfig } from '../../models/config/config';
import { CohortState } from '../../models/state/CohortState';


interface Props {
    cohort?: CohortState;
    config: MainPageConfig;
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

        return (
            <div className={`${c}-container`}>
                {[ ...(cohort!.patients as any).keys() ].map((patId) => {
                    return <Link key={patId} to={`/${dashboardId}/patients/${patId}`}>{patId}</Link>
                })}
            </div>
        );
    }
};

const withRouter = (Cohort: any) => (props: Props) => {
    const params = useParams();
    const { dashboardId } = params;
    return <Cohort cohort={props.cohort} dashboardId={dashboardId} />;
};

export default withRouter(Cohort);