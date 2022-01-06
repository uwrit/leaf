import React from 'react';
import { PatientListRowDTO } from '../../../models/patientList/Patient';
import { FiCheck } from 'react-icons/fi';
import { DatasetMetadataColumns } from '../../../utils/datasetMetadata';

interface Props {
    data?: PatientListRowDTO[];
    cols: DatasetMetadataColumns;
    name: string;
}

export default class DynamicChecklistItem extends React.Component<Props> {
    private className = 'dynamic-checklist-item';

    public render() {
        const { data, cols, name } = this.props;
        const c = this.className;
    
        if (!data) { return null; }

        const checked = cols && cols.fieldValueString && data.find(d => d[cols.fieldValueString!] === name);

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