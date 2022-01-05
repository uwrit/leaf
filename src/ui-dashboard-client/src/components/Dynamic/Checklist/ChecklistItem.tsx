import React from 'react';
import { Col, Row } from 'reactstrap';
import { PatientListRowDTO } from '../../../models/patientList/Patient';
import { FiCheck } from 'react-icons/fi';

interface Props {
    data?: PatientListRowDTO[];
    fieldValues: string;
    name: string;
}

export default class DynamicChecklistItem extends React.Component<Props> {
    private className = 'dynamic-checklist-item';

    public render() {
        const { data, fieldValues, name } = this.props;
        const c = this.className;
    
        if (!data) { return null; }

        const checked = data.find(d => d[fieldValues] === name);

        return (
            <div className={c}>
                <div className={`${c}-left`}>
                    <span className={`${c}-name ${checked ? 'checked' : ''}`}>{name}</span>
                </div>
                <div className={`${c}-right`}>
                    {checked && <FiCheck />}
                </div>
            </div>
        );
    }

};