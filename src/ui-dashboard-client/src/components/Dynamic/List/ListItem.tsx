import React from 'react';
import Moment from "moment";
import { PatientListDatasetQueryDTO } from '../../../models/patientList/Dataset';
import { PatientListRowDTO } from '../../../models/patientList/Patient';

interface Props {
    data?: PatientListRowDTO[];
    name: string;
    metadata: PatientListDatasetQueryDTO;
}

export default class DynamicListItem extends React.Component<Props> {
    private className = 'dynamic-list-item';

    public render() {
        const { data, name } = this.props;
        const c = this.className;
    
        if (!data) { return null; }

        return (
            <div className={c}>
                <div className={`${c}-left`}>
                    
                </div>
                <div className={`${c}-right`}>
                    
                </div>
            </div>
        );
    }

};