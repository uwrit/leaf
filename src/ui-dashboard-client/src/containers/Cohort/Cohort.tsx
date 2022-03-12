import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCohortDatasets } from '../../actions/cohort';
import { MainPageConfig } from '../../models/config/config';
import { CohortState, CohortStateType } from '../../models/state/CohortState';


interface Props {
    cohort?: CohortState;
    config: MainPageConfig;
    cohortId?: string;
    dispatch: any;
}

class Cohort extends React.Component<Props> {
    private className = 'cohort';

    public componentDidUpdate(prevProps: Props) {
        const { cohort, cohortId, dispatch } = this.props;

        if (cohortId && (cohort?.state === CohortStateType.NOT_LOADED || cohortId !== prevProps.cohortId)) {
            dispatch(getCohortDatasets(cohortId));
        }
    }

    public render() {
        const c = this.className;
        const { cohort, cohortId } = this.props;

        if (!cohort) {
            return null;
        }

        return (
            <div className={`${c}-container`}>
                {[ ...(cohort!.data.patients as any).keys() ].map((patId) => {
                    return <Link key={patId} to={`/${cohortId}/patients/${patId}`}>Patient {patId}</Link>
                })}
            </div>
        );
    }
};

const withRouter = (Cohort: any) => (props: Props) => {
    const params = useParams();
    const { cohortId } = params;
    return <Cohort cohort={props.cohort} cohortId={cohortId} dispatch={props.dispatch} />;
};

export default withRouter(Cohort);