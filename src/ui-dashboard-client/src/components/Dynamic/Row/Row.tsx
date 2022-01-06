import React from 'react';
import { ContentRowConfig } from '../../../models/config/content';
import { DatasetId, DatasetMetadata, PatientData } from '../../../models/state/CohortState';
import { renderDynamicComponent } from '../../../utils/dynamic';
import './Row.css';

interface Props {
    config: ContentRowConfig;
    patient: PatientData;
    metadata: Map<DatasetId, DatasetMetadata>;
}

export default class DynamicRow extends React.Component<Props> {
    private className = 'dynamic-row';

    public render() {
        const { config, patient, metadata } = this.props;
        const c = this.className;

        return (
            <div className={`${c}-container`}>
                {config.content.map((innerContent, i) => renderDynamicComponent(innerContent, patient, metadata, i))}
            </div>
        );
    }
};