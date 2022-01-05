import React from 'react';
import { Col, Row } from 'reactstrap';
import { ContentChecklistConfig, ContentChecklistDatasetConfig } from '../../../models/config/content';
import { PatientData } from '../../../models/state/CohortState';
import { getDynamicColor, getDynamicIcon } from '../../../utils/dynamic';
import DynamicChecklistItem from './ChecklistItem';
import './Checklist.css';
import { PatientListRowDTO } from '../../../models/patientList/Patient';

interface Props {
    config: ContentChecklistConfig;
    patient: PatientData;
}

interface State {
    selectedDatasetConfig?: ContentChecklistDatasetConfig;
}

export default class DynamicChecklist extends React.Component<Props, State> {
    private className = 'dynamic-checklist';
    public constructor(props: Props) {
        super(props);
        this.state = {
            selectedDatasetConfig: props.config.datasets.length
                ? props.config.datasets[0]
                : undefined
        }
    }

    /**
     * Render
     */
    public render() {
        const { config, patient } = this.props;
        const c = this.className;

        return (
            <Col className={`${c}-container`} md={config.width ?? settings.defaultWidth}>
                <div className={`${c}-inner`} style={this.getStyle(config)}>

                    {/* Left column */}
                    <div className={`${c}-inner-left`}>
                        {this.getTitle(config)}
                        {this.getDatasetsSelector(config)}
                    </div>

                    {/* Right column */}
                    <div className={`${c}-inner-right`}>
                        {this.getChecklistItems(patient)}
                    </div>
                </div>
            </Col>
        );
    }

    /**
     * Get style for main checklist element
     */
    private getStyle = (config: ContentChecklistConfig): React.CSSProperties => {
        return {
            backgroundColor: getDynamicColor(config.color, settings.background.transparency),
            border: `${settings.border.size}px solid ${getDynamicColor(config.color, settings.border.transparency)}`
        };
    }

    /**
     * Get title of the checklist
     */
    private getTitle = (config: ContentChecklistConfig): JSX.Element => {
        const c = this.className;
        return (
            <div className={`${c}-title-container`} style={{ backgroundColor: getDynamicColor(config.color, settings.title.transparency) }}>
                {getDynamicIcon(config.icon)}
                <span className={`${c}-title`}>{config.title}</span>
            </div>
        )
    }

    /**
     * Get list of available sub-checklists (ie, datasets) in checklist
     */
    private getDatasetsSelector = (config: ContentChecklistConfig): JSX.Element | null => {
        const { selectedDatasetConfig } = this.state;
        const c = this.className;

        if (!selectedDatasetConfig) { return null; }

        return (
            <div className={`${c}-dataset-selector-container`}>
                {config.datasets.map(ds => {
                    const color = getDynamicColor(config.color);
                    return (
                        <div key={ds.id}>
                            <span 
                                className={`${c}-dataset-selector ${ds === selectedDatasetConfig ? 'selected' : ''}`}
                                style={{ borderLeftColor: color, color }}
                                >
                                {ds.title}
                            </span>
                        </div>
                )})}
            </div>
        )
    }

    /**
     * Get checklist items for currently selected checklist
     */
    private getChecklistItems = (patient: PatientData): JSX.Element | null => {
        const { selectedDatasetConfig } = this.state;
        const className = `${this.className}-item-container`;
        
        if (!selectedDatasetConfig || !patient.datasets.has(selectedDatasetConfig.id)) { return null; }

        const data = patient.datasets.get(selectedDatasetConfig.id);
        const { items, fieldValues } = selectedDatasetConfig;

        // 2 columns if more than 5 elements
        if (items.length > 5) {
            const left = items.slice(0, items.length / 2);
            const right = items.slice(items.length / 2);

            return (
                <Row className={className}>
                    <Col md={6}>
                        {left.map((item, i) => {
                            return <DynamicChecklistItem key={i} data={data} fieldValues={fieldValues} name={item} />
                        })}
                    </Col>
                    <Col md={6}>
                        {right.map((item, i) => {
                            return <DynamicChecklistItem key={i} data={data} fieldValues={fieldValues} name={item} />
                        })}
                    </Col>
                </Row>
            );
        } 
        // Else 1 column
        else {
            return (
                <div className={className}>
                    {selectedDatasetConfig.items.map((item, i) => {
                        return <DynamicChecklistItem key={i} data={data} fieldValues={fieldValues} name={item} />
                    })}
                </div>
            )
        }
    }
};

const settings = {
    background: {
        transparency: 0.05
    },
    border: {
        size: 1,
        transparency: 0.3,
    },
    defaultWidth: 12,
    title: {
        transparency: 0.15
    }
};