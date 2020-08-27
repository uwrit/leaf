/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { Col, Container, Input } from 'reactstrap';
import './SidebarHelp.css';

export class SidebarHelp extends React.PureComponent {
    
    public render() {
        return (
            <Container fluid={true}>
                <Input className="sidebar-help-searchbar" type="text" name="help-search" id="help-search" placeholder="Search..." bsSize="lg" />    
            </Container>
        );
    }
}

export default SidebarHelp;