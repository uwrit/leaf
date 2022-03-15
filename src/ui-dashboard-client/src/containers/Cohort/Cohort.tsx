import React from 'react';
import { useParams } from 'react-router-dom';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { getCohortDatasets } from '../../actions/cohort';
import PatientSearch from '../../components/Patient/Search/PatientSearch';
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
        const { cohort, cohortId, dispatch } = this.props;
        const classes = [ 'leaf-modal' ]

        if (!cohort || !cohortId) {
            return null;
        }

        return (
            <Modal isOpen={true} className={classes.join(' ')} backdrop={true}>
                <ModalHeader>Select Patient</ModalHeader>
                <ModalBody>
                    <PatientSearch />
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
    return <Cohort cohort={props.cohort} cohortId={cohortId} dispatch={props.dispatch} />;
};

export default withRouter(Cohort);