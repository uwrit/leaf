/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux'
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { attestAndLoadSession } from '../../actions/session';
import AttestationContent from '../../components/Attestation/AttestationContent';
import AttestationFooter from '../../components/Attestation/AttestationFooter';
import { AppState, AuthorizationState } from '../../models/state/AppState';
import { Attestation as AttestationModel, DocumentationApproval, SessionType } from '../../models/Session';
import { UserContext, AppConfig } from '../../models/Auth';
import { getBrowser } from '../../utils/browser';
import { setBrowser } from '../../actions/generalUi';
import { Browser } from '../../models/state/GeneralUiState';
import BrowserError from '../../components/Attestation/BrowserError';
import moment from 'moment';
import pkg from '../../../package.json'
import CustomAttestationConfirmation from '../../components/Attestation/CustomAttestationConfirmation';
import StandardAttestationConfirmation from '../../components/Attestation/StandardAttestationConfirmation';
import { ServerState } from '../../models/state/ServerState';
import { IoMdConstruct } from 'react-icons/io';
import './Attestation.css';

interface DispatchProps {
    dispatch: any;
}
interface StateProps {
    auth: AuthorizationState;
    browser?: Browser;
    config?: AppConfig;
    hasAttested: boolean;
    hasUserIdToken: boolean;
    isSubmittingAttestation: boolean;
    serverState?: ServerState,
    sessionError?: boolean;
    sessionLoadDisplay: string;
    sessionLoadProgressPercent: number;
    userContext?: UserContext;
}
interface OwnProps {}
type Props = StateProps & DispatchProps & OwnProps;

export interface State {
    attestation: AttestationModel;
    documentationStatusSelected: boolean;
    documentationExpDateString: string;
    hasApprovedQi: boolean;
    hasApprovedIrb: boolean;
    identificationTypeSelected: boolean;
    sessionTypeSelected: boolean;
}

class Attestation extends React.PureComponent<Props, State> {
    private attestSkipStarted = false;
    private className = 'attestation';
    private defaultDocumentation: DocumentationApproval = {
        institution: '',
        title: ''
    }

    constructor(props: Props) {
        super(props);
        this.state = {
            attestation: {
                documentation: this.defaultDocumentation,
                isIdentified: false,
                sessionType: SessionType.Research
            },
            documentationExpDateString: '',
            documentationStatusSelected: false,
            hasApprovedIrb: false,
            hasApprovedQi: false,
            identificationTypeSelected: false,
            sessionTypeSelected: false
        }
    }

    public getSnapshotBeforeUpdate(prevProps: Props): any {
        const { config, isSubmittingAttestation, userContext, hasAttested } = this.props;
        if (hasAttested || isSubmittingAttestation || this.attestSkipStarted) { return null; }
        if (userContext && config) {
            if (!config.attestation.enabled) {
                this.attestSkipStarted = true;
                this.setState({ 
                    sessionTypeSelected: true, 
                    documentationStatusSelected: true, 
                    identificationTypeSelected: true,
                    attestation: { ...this.state.attestation, isIdentified: !config.cohort.deidentificationEnabled }
                }, () => this.skipAttestationAndLoadSession());
            } else if (config.attestation.skipModeSelection) {
                this.attestSkipStarted = true;
                this.setState({ 
                    sessionTypeSelected: true, 
                    documentationStatusSelected: true, 
                    identificationTypeSelected: true,
                    attestation: { ...this.state.attestation, isIdentified: !config.cohort.deidentificationEnabled }
                });
            }
        }
        return null;
    }

    public componentDidUpdate() { }

    public componentDidMount() {
        const { dispatch } = this.props;
        dispatch(setBrowser(getBrowser()));
    }

    public render() {
        const { sessionTypeSelected, documentationStatusSelected, identificationTypeSelected, attestation } = this.state;
        const { 
            sessionLoadProgressPercent, hasAttested, isSubmittingAttestation, hasUserIdToken, auth, 
            sessionError, sessionLoadDisplay, userContext, browser, config, serverState
        } = this.props;
        const browserError = browser && browser.error;
        const c = this.className;
        const showConfirmation = sessionTypeSelected && documentationStatusSelected && identificationTypeSelected;
        const showContent = !showConfirmation;
        const progressBarClasses = [ 'leaf-progressbar', 'animate', 'attestation-progressbar' ];
        const showDowntime = serverState && !serverState.isUp && auth && auth.userContext && !auth.userContext.isAdmin;
        
        /**
         * Show progress bar if waiting on data from server
         */
        if (isSubmittingAttestation || !hasUserIdToken || !serverState) {
            progressBarClasses.push('show');
            if (!hasUserIdToken) {
                progressBarClasses.push('slow');
            }
        }
        
        return (
            <Modal 
                backdrop={true}
                className={`${c}-modal`} 
                isOpen={!hasAttested} 
                fade={true}
                keyboard={false}
                size="lg"
                wrapClassName={`${c}-modal-wrap`}>
                <ModalHeader className={`${c}-header`}>

                    {/* Top logo row (Leaf, ITHS, CD2H) */}
                    <div className={`${c}-leaf-logo-wrapper`}>
                        <img alt='leaf-logo' className={`${c}-leaf-logo`} src={process.env.PUBLIC_URL + '/images/logos/apps/leaf.svg'} />
                        <div className={`${c}-title`}>
                            leaf
                            <span className={`${c}-leaf-version`}>v{pkg.version}</span>
                        </div>
                    </div>
                    <div className={`${c}-iths-logo-wrapper`}>
                        <img alt='iths-logo' className={`${c}-iths-logo`} src={process.env.PUBLIC_URL + '/images/logos/orgs/iths.png'} />
                    </div>
                    <div className={`${c}-cd2h-logo-wrapper`}>
                        <img alt='cd2h-logo' className={`${c}-cd2h-logo`} src={process.env.PUBLIC_URL + '/images/logos/orgs/cd2h.png'} />
                    </div>

                    {/* Optional instance logo row */}
                    {config && config.attestation.credits.enabled &&
                    <div className={`${c}-custom-credits`}>
                        {config.attestation.credits.logos &&
                        config.attestation.credits.logos.map(l => {
                            return (
                                <div key={l} className={`${c}-custom-credits-logo-wrapper`}>
                                    <img alt={`'${l}' not found`} className={`${c}-custom-logo`} src={process.env.PUBLIC_URL + l} />
                                </div>
                            );
                        })
                        }
                        <div className={`${c}-custom-credits-text`}>
                            <span>
                                {config.attestation.credits.text}
                            </span>
                        </div>
                    </div>
                    }

                </ModalHeader>

                <div className={progressBarClasses.join(' ')} style={{ width: `${sessionLoadProgressPercent}%` }} />
                {userContext && !userContext.isPhiOkay && 
                <div className={`${c}-deidentonly`}>
                    <p>Patient data restricted to De-Identified mode only</p>
                </div>
                }
                <ModalBody className={`${c}-body`}>
                    {auth.error && 
                    <div className={`${c}-error-text`}>
                        <p>{auth.error}</p>
                    </div>
                    }
                    {sessionError && 
                    <div className={`${c}-error-text`}>
                        <p>{sessionLoadDisplay}</p>
                    </div>
                    }
                    {showDowntime && 
                    <div className={`${c}-downtime-text`}>
                        <div><IoMdConstruct/></div>
                        {serverState.downtimeMessage && 
                            <p>{serverState.downtimeMessage}</p>
                        }
                        {!serverState.downtimeMessage &&
                            <div>
                                <p>The Leaf server is currently down for maintenance. Please check back again soon, or email your Leaf Administrator for more information.</p>
                                <p>Thank you and we apologize for the inconvenience.</p>
                            </div>
                        }
                    </div>
                    }
                    {browserError && 
                    <BrowserError />
                    }
                    {hasUserIdToken && !sessionError && !browserError && !showDowntime && [   
                    (<AttestationContent 
                        allowPhiIdentified={this.allowPhiIdentified}
                        parentState={this.state}
                        className={this.className}
                        handleApprovalTypeClick={this.handleApprovalTypeClick}
                        handleDocumentationExpDateChange={this.handleDocumentationExpDateChange}
                        handleDocumentationTitleChange={this.handleDocumentationTitleChange}
                        handleDocumentationInstitutionChange={this.handleDocumentationInstitutionChange}
                        handlePhiTypeClick={this.handleIdentificationTypeClick}
                        handleUseTypeClick={this.handleSessionTypeClick}
                        key='1'
                        show={showContent}
                        userContext={userContext}/>),

                    this.getAttestationConfirmation(
                        config, hasAttested, attestation.isIdentified, isSubmittingAttestation, showConfirmation, 
                        sessionLoadDisplay, attestation.sessionType)
                    ]}
                </ModalBody>
                <AttestationFooter />
            </Modal>
        );
    }

    private getAttestationConfirmation = (
            config: AppConfig,
            hasAttested: boolean,
            isIdentified: boolean,
            isSubmittingAttestation: boolean,
            show: boolean,
            sessionLoadDisplay: string,
            sessionType: SessionType
        ) => {
        const className = this.className;
        const handleGoBackClick = this.handleConfirmGoBackClick;
        const handleIAgreeClick = this.handleConfirmIAgreeClick;

        const props = { 
            className, config, handleGoBackClick, handleIAgreeClick, hasAttested, 
            isIdentified, isSubmittingAttestation, show, sessionLoadDisplay, sessionType
        };
        
        if (config.attestation.text && config.attestation.text.length > 0) {
            return <CustomAttestationConfirmation key="2" {...props} />
        }
        return <StandardAttestationConfirmation key="2" {...props} />;
    };
    
    private handleSessionTypeClick = (sessionType: SessionType) => {
        this.setState({ 
            attestation: { ...this.state.attestation, sessionType },
            documentationStatusSelected: false,
            hasApprovedIrb: false,
            hasApprovedQi: false,
            identificationTypeSelected: false,
            sessionTypeSelected: true
        });
    }

    private handleApprovalTypeClick = (approved: boolean) => {
        if (this.state.attestation.sessionType === SessionType.QualityImprovement) {
            this.setState({ 
                documentationStatusSelected: true,
                hasApprovedIrb: false,
                hasApprovedQi: approved,
                identificationTypeSelected: false
            });
        }
        else {
            this.setState({ 
                documentationStatusSelected: true,
                hasApprovedIrb: approved,
                hasApprovedQi: false,
                identificationTypeSelected: false
            });
        }
    }

    private handleIdentificationTypeClick = (isIdentified: boolean) => {
        const { userContext } = this.props;

        if (isIdentified && (!userContext || !userContext.isPhiOkay)) { return; }

        if (!isIdentified || this.allowPhiIdentified()) {
            this.setState({ 
                attestation: { ...this.state.attestation, isIdentified },
                identificationTypeSelected: true
            });
        }
    }

    private handleConfirmGoBackClick = () => {
        this.setState({ 
            documentationStatusSelected: false,
            identificationTypeSelected: false,
            sessionTypeSelected: false,
        });
        setTimeout(() => {
            this.setState({ sessionTypeSelected: true });
            setTimeout(() => {
                this.setState({ documentationStatusSelected: true });
            }, 500);
        }, 500);
    }

    private skipAttestationAndLoadSession = () => {
        const { dispatch } = this.props;
        dispatch(attestAndLoadSession(this.state.attestation));
    }

    private handleConfirmIAgreeClick = () => {
        const { dispatch } = this.props;
        const { documentationStatusSelected, sessionTypeSelected, identificationTypeSelected } = this.state;
        if (documentationStatusSelected && sessionTypeSelected && identificationTypeSelected) {
            dispatch(attestAndLoadSession(this.state.attestation));
        }
    }

    private handleDocumentationTitleChange = (e: any) => {
        const title = e.currentTarget.value;
        this.setState({ 
            attestation: {
                ...this.state.attestation,
                documentation: {
                    ...this.state.attestation.documentation,
                    title
                }
            }
        });
    }

    private handleDocumentationExpDateChange = (e: any) => {
        const expirationDate = e.currentTarget.value;
        const split = expirationDate.split('/');
        const dateTest = moment(expirationDate);
        let expDate: any;

        if (dateTest.isValid() && dateTest > moment() && split.length === 3 && split[2].length === 4) {
            expDate = dateTest.toDate();
        } 

        this.setState({ 
            attestation: {
                ...this.state.attestation,
                documentation: {
                    ...this.state.attestation.documentation,
                    expirationDate: expDate
                }
            },
            documentationExpDateString: expirationDate
        });
    }

    private handleDocumentationInstitutionChange = (e: any) => {
        const institution = e.currentTarget.value;
        this.setState({ 
            attestation: {
                ...this.state.attestation,
                documentation: {
                    ...this.state.attestation.documentation,
                    institution
                }
            }
        });
    }

    private allowPhiIdentified = () => {
        const { attestation, documentationStatusSelected, hasApprovedIrb, hasApprovedQi } = this.state;

        if (documentationStatusSelected && 
            (hasApprovedIrb || hasApprovedQi) &&
            attestation.documentation.expirationDate &&
            attestation.documentation.institution.trim() !== '' &&
            attestation.documentation.title.trim() !== ''
        ) {
            return true;
        }
        return false;
    }
}

const mapStateToProps = (state: AppState): StateProps => {
    const { auth, session } = state;
    return { 
        auth: auth,
        browser: state.generalUi.browser,
        config: state.auth.config,
        hasAttested: session.hasAttested,
        hasUserIdToken: !!auth.userContext,
        isSubmittingAttestation: session.isSubmittingAttestation,
        serverState: state.auth.serverState,
        sessionError: session.error,
        sessionLoadDisplay: session.loadingDisplay,
        sessionLoadProgressPercent: session.loadingProgressPercent,
        userContext: auth.userContext
    };
}

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps) : DispatchProps => {
    return { 
        dispatch
    };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>
    (mapStateToProps, mapDispatchToProps)(Attestation);