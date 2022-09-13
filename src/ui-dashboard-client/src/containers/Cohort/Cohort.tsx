import React from 'react';
import { useParams } from 'react-router-dom';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { getCohortDatasets } from '../../actions/cohort';
import PatientSearch from '../../components/Patient/Search/PatientSearch';
import { MainPageConfig } from '../../models/config/config';
import { CohortSearch, CohortState, CohortStateType } from '../../models/state/CohortState';


interface Props {
    cohort?: CohortState;
    config: MainPageConfig;
    cohortId?: string;
    dispatch: any;
    search: CohortSearch;
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
        const { cohort, cohortId, dispatch, search } = this.props;
        const classes = [ 'leaf-modal' ]

        if (!cohortId) {
            return <div>You haven't selected a cohort yet!</div>;
        }

        return (
            <Modal isOpen={true} className={classes.join(' ')} backdrop={true}>
                <ModalHeader>Select Patient</ModalHeader>
                <ModalBody>
                    <PatientSearch hints={search.hints} term={search.term} dispatch={dispatch} />
                </ModalBody>
                <ModalFooter>
                    <Button className={`leaf-button leaf-button-primary`}>Select</Button>
                </ModalFooter>
            </Modal>
        );
    }
};

const withRouter = (Cohort: any) => (props: Props) => {
    const params = useParams();
    const { cohortId } = params;
    return <Cohort cohort={props.cohort} cohortId={cohortId} dispatch={props.dispatch} search={props.search} />;
};

export default withRouter(Cohort);