import React from 'react';
import { WidgetRowConfig } from '../../../models/config/content';
import { CohortData, PatientData } from '../../../models/state/CohortState';
import { renderDynamicComponent } from '../../../utils/dynamic';
import './Row.css';

interface Props {
    config: WidgetRowConfig;
    cohort: CohortData;
    patient: PatientData;
}

export default class DynamicRow extends React.Component<Props> {
    private className = 'dynamic-row';

    public render() {
        const { config, cohort, patient } = this.props;
        const c = this.className;

        return (
            <div className={`${c}-container`}>
                {config.content.map((innerContent, i) => renderDynamicComponent(innerContent, cohort, patient, i))}
            </div>
        );
    }
};