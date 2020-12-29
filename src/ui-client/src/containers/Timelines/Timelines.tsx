/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux'
import { Col, Container, Row } from 'reactstrap';
import { Direction, DirectionalSlider } from '../../components/Other/DirectionalSlider/DirectionalSlider';
import { AppState } from '../../models/state/AppState';
import ConceptColumnContainer from '../FindPatients/ConceptColumnContainer';
import './Timelines.css';

interface OwnProps { }
interface StateProps {
}
interface DispatchProps {}
type Props = StateProps & OwnProps & DispatchProps;
interface State {
    showConcepts: boolean;
}

class Timelines extends React.Component<Props, State> {
    private className = 'timelines'

    constructor(props: Props) {
        super(props);
        this.state = {
            showConcepts: true
        }
    }

    public updateDimensions = () => {
    }

    public componentWillMount() {
        this.updateDimensions();
    }

    public componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    public render() {
        const c = this.className;

        return  (
            <div className={`${c}-container scrollable-offset-by-header`}>
                <DirectionalSlider 
                    show={this.state.showConcepts}
                    from={Direction.Left}
                    overlay={false}
                    toggle={this.toggleShowConcepts}>
                    <div>
                        <ConceptColumnContainer />
                    </div>
                </DirectionalSlider>
            </div>
        )
    }

    private toggleShowConcepts = () => {
        this.setState({ showConcepts: !this.state.showConcepts });
    };
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
    return {
    };
};

const mapDispatchToProps = {};

export default connect<StateProps, DispatchProps, OwnProps, AppState>
    (mapStateToProps, mapDispatchToProps)(Timelines)