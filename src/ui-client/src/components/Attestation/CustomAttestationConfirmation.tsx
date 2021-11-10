/* Copyright (c) 2021, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Button, Row, Col } from 'reactstrap';
import { SessionType } from '../../models/Session'
import { AppConfig, CustomAttestationType } from '../../models/Auth';
import TextareaAutosize from 'react-textarea-autosize';

interface Props {
    config?: AppConfig;
    className: string;
    handleGoBackClick: () => void;
    handleIAgreeClick: () => void;
    hasAttested: boolean;
    isIdentified: boolean;
    isSubmittingAttestation: boolean;
    show: boolean;
    sessionLoadDisplay: string;
    sessionType: SessionType;
}

export default class CustomAttestationConfirmation extends React.PureComponent<Props> {
    public render() {
        const c = this.props.className;
        const { show, handleGoBackClick, handleIAgreeClick, isIdentified, sessionType, sessionLoadDisplay, hasAttested, isSubmittingAttestation, config } = this.props;
        const confirmationClass = `${c}-confirmation-container ${show ? 'show' : ''}`
        const useDisplay = sessionType === SessionType.Research ? 'Research' : 'Quality Improvement';
        const phiDisplay = isIdentified ? 'Identified' : 'Deidentified';
        const showText = config && config.attestation.enabled;
        const useHtml = config.attestation.type && config.attestation.type === CustomAttestationType.Html;

        return  (
            <div className={confirmationClass}>
                {showText &&
                
                <div>
                    <Row className={`${c}-confirmation-settings`} key='1'>
                        <Col md={6} className="left">
                            {useDisplay} - {phiDisplay}
                        </Col>
                        {!(isSubmittingAttestation || hasAttested) &&
                        <Col md={6} className="right">
                            <Button 
                                onClick={handleIAgreeClick} 
                                tabIndex={-1}
                                className="leaf-button leaf-button-primary">
                                I Agree
                            </Button>
                            <Button 
                                onClick={handleGoBackClick} 
                                tabIndex={-1}
                                className="leaf-button">
                                Go Back
                            </Button>
                        </Col>
                        }
                        {(isSubmittingAttestation || hasAttested) &&
                        <Col md={6} className="right">
                            <div className={`${c}-session-load-display-container`}>
                                <div className={`${c}-session-load-display`}>
                                    <span>...{sessionLoadDisplay}</span>
                                </div>
                            </div>
                        </Col>
                        }
                    </Row>

                    <div>

                        {/* Else use custom text */}
                        {useHtml &&
                        <div className={`${c}-custom-html`} dangerouslySetInnerHTML={ {__html: config.attestation.text.join("")} }></div>
                        }

                        {!useHtml &&
                        <div className={`${c}-custom-text-container`}>
                            {config.attestation.text.map((t,i) => {
                                return <TextareaAutosize key={i} className={`${c}-custom-text`} defaultValue={t} readOnly={true} />;
                            })}
                        </div>
                        }
                    </div>
                </div>
                }
            </div>
        );
    }
}