/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { connect } from 'react-redux'
import { AppState, AuthorizationState } from '../../models/state/AppState';
import { CohortState, CohortStateType } from '../../models/state/CohortState';
import { NetworkResponderMap } from '../../models/NetworkResponder';
import computeDimensions from '../../utils/computeDimensions';
import CohortTooLargeBox from '../../components/Other/CohortTooLargeBox/CohortTooLargeBox';
import { BasicDemographicsVisualization } from '../../components/Visualize/BasicDemographics/BasicDemographics';
import VisualizationPage from '../../components/Visualize/Custom/VisualizationPage';
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import { FaChevronDown } from 'react-icons/fa';
import './Visualize.css';
import { setCurrentVisualizationPage } from '../../actions/cohort/visualize';

interface OwnProps { }
interface StateProps {
    auth: AuthorizationState;
    cohort: CohortState;
    responders: NetworkResponderMap;
}
interface DispatchProps {
    dispatch: any;
}
type Props = StateProps & OwnProps & DispatchProps;
interface State {
    width: number;
    pageDropdownOpen: boolean;
    responderDropdownOpen: boolean;
}

interface ErrorBoundaryState {
    errored: boolean;
}

class VisualizeErrorBoundary extends React.Component<Props, ErrorBoundaryState> {
    constructor(props: Props) {
        super(props);
        this.state = { 
            errored: false
        };
    }

    public static getDerivedStateFromError(error: any) {
        return { errored: true };
    }
    
    public componentDidCatch(error: any, errorInfo: any) {    
        console.log(error, errorInfo);
    }

    public render() {
        if (this.state.errored) {
            return (
                <div className={`visualize-error`}>
                    <p>
                        Whoops! An error occurred while creating patient visualizations. We are sorry for the inconvenience. 
                        Please contact your Leaf administrator if this error continues.
                    </p>
                </div>
            );
        }

        return <Visualize {...this.props} />;
    }
}

class Visualize extends React.Component<Props, State> {
    private className = 'visualize';

    constructor(props: Props) {
        super(props);
        this.state = { 
            width: 1000,
            pageDropdownOpen: false,
            responderDropdownOpen: false
        };
    }

    public updateDimensions = () => {
        const dimensions = computeDimensions();
        this.setState({ width: dimensions.contentWidth });
    }

    public componentWillMount() {
        window.addEventListener('resize', this.updateDimensions);
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    public render() {
        const c = this.className;
        const { cohort, auth, responders } = this.props;
        const { cacheLimit } = auth.config!.cohort;

        /**
         * If too many patients for caching, let user know.
         */
        if (cohort.networkCohorts.size === 1 && cohort.count.value > cacheLimit) {
            return <CohortTooLargeBox cacheLimit={cacheLimit} />
        }
        /**
         * Show a loading spinner if no responders have completed yet.
         */
        if (cohort.visualization.state === CohortStateType.IN_ERROR) {
            return (
                <div className={`${c}-error`}>
                    <p>
                        Whoops! An error occurred while loading patient visualizations. We are sorry for the inconvenience. 
                        Please contact your Leaf administrator if this error continues.
                    </p>
                </div>
            );
        }

        return (
            <div className={`${c}-container`}>

                {/* Visualization Page and/or Responder selection dropdowns */}
                {(cohort.visualization.pages.size || responders.size) &&
                <div className={`${c}-top-row`}>
                    {this.getDropdowns()}
                </div>
                }

                {/* Visualization content */}
                <div className={`${c}-main`}>
                    {this.getVisualizationContent()}
                </div>

            </div>
        )
    }

    private getDropdowns = () => {
        const c = this.className;
        const { cohort, responders } = this.props;
        const { currentPageId, pages, showBasicDemographics } = cohort.visualization;
        const { responderDropdownOpen, pageDropdownOpen } = this.state;
        let pageSelector = null;
        let responderSelector = null;

        /**
         * Visualization pages
         */
        if (pages.size) {
            const pageElems: any[] = [];
            const displayText = showBasicDemographics ? 'Basic Demographics' : pages.get(currentPageId).pageName;

            /**
             * Sort pages and transform to dropdown elements
             */
             const sortedPages = [ ...pages.values() ].sort((a,b) => {
                if (!a.category) return 0;
                else if (a.category && !b.category) return 1;
                else if (a.category === b.category) return a.pageName < b.pageName ? 0 : 1;
                return a.category < b.category ? 0 : 1;
            });

            let prevCat;
            for (const page of sortedPages) {
                if (page.category && page.category !== prevCat) {
                    pageElems.push(
                        <DropdownItem>
                            <div className={`${c}-page-option-category`}>{page.category}</div>
                        </DropdownItem>
                    );
                }
                pageElems.push(
                    <DropdownItem onClick={this.handlePageDropdownItemClick.bind(null, page.id)}>
                        <div className={`${c}-page-option ${page.id === currentPageId ? 'selected' : ''}`}>{page.pageName}</div>
                    </DropdownItem>
                );
            }

            pageSelector = (
                <Dropdown key={0} isOpen={pageDropdownOpen} toggle={this.togglePageSelectorOpen}>
                    <DropdownToggle>
                        <div>
                            {displayText} 
                            <FaChevronDown className={`${c}-dropdown-chevron`}/>
                        </div>
                    </DropdownToggle>
                    <DropdownMenu>

                        {/* Basic Demographics */}
                        <DropdownItem onClick={this.handleBasicDemographicsDropdownItemClick.bind(null)}>
                            <div className={`${c}-page-option ${showBasicDemographics ? 'selected' : ''}`}>Basic Demographics</div>
                        </DropdownItem>
                        <DropdownItem divider={true} />

                        {/* Custom pages */}
                        <div className={`${c}-dropdown-item-container`}>
                            {pageElems}
                        </div>
                    </DropdownMenu>
                </Dropdown>
            );
        }

        /**
         * Responders
         */
        if (responders.size) {
            const displayText = 'Overall';

            responderSelector = (
                <Dropdown key={1} isOpen={responderDropdownOpen} toggle={this.toggleResponderSelectorOpen}>
                    <DropdownToggle>
                        <div>
                            {displayText} 
                            <FaChevronDown className={`${c}-dropdown-chevron`}/>
                        </div>
                    </DropdownToggle>
                    <DropdownMenu>
                        <div className={`${c}-dropdown-item-container`}>

                            {/* Overall */}
                            <DropdownItem onClick={this.handleBasicDemographicsDropdownItemClick.bind(null)}>
                                <div className={`${c}-page-option ${showBasicDemographics ? 'selected' : ''}`}>Basic Demographics</div>
                            </DropdownItem>
                            <DropdownItem divider={true} />

                            {/* By Responder */}
                            {[ ...responders.values() ].map(r => {
                                return (
                                    <DropdownItem onClick={this.handleResponderDropdownItemClick.bind(null, r.id)}>
                                        <div className={`${c}-page-option `}>{r.name}</div>
                                    </DropdownItem>
                                )
                            })}
                        </div>
                    </DropdownMenu>
                </Dropdown>
            );
        }

        return [ pageSelector, responderSelector ];
    }

    private handleBasicDemographicsDropdownItemClick = () => {
        const { dispatch } = this.props;
    }

    private handleOverallDropdownItemClick = () => {
        const { dispatch } = this.props;
    }

    private handlePageDropdownItemClick = (id: string) => {
        const { dispatch } = this.props;
        dispatch(setCurrentVisualizationPage(id));
    }

    private handleResponderDropdownItemClick = (id: number) => {
        const { dispatch } = this.props;
    }

    private togglePageSelectorOpen = () => {
        this.setState({ pageDropdownOpen: !this.state.pageDropdownOpen });
    }

    private toggleResponderSelectorOpen = () => {
        this.setState({ responderDropdownOpen: !this.state.responderDropdownOpen });
    }

    private getVisualizationContent = () => {
        const { cohort, auth, responders } = this.props;
        const { showBasicDemographics, currentPageId, pages, datasets } = cohort.visualization;
        const { width } = this.state;

        /**
         * Show basic demographics
         */
         if (showBasicDemographics) {
            return <BasicDemographicsVisualization auth={auth} cohort={cohort} responders={responders} width={width} />

        /**
         * Else if there is a custom current page, show that
         */
        } else if (currentPageId && pages.has(currentPageId)) {
            return <VisualizationPage datasets={datasets} page={pages.get(currentPageId)} width={width} />
        }

        return null;
    }
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
    return { 
        auth: state.auth,
        cohort: state.cohort,
        responders: state.responders
    };
};

const mapDispatchToProps = (dispatch: any) => {
    return {
        dispatch
    };
};

export default connect<StateProps, DispatchProps, OwnProps, AppState>
    (mapStateToProps, mapDispatchToProps)(VisualizeErrorBoundary)