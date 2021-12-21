/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import { useParams } from 'react-router-dom';


interface Props {
    patientId?: string;
}

class Patient extends React.Component<Props> {
    private className = 'patient';

    public render() {
        const c = this.className;
        console.log("props!", this.props);

        return (
            <div className={`${c}-container`}>
            </div>
        );
    }
};

const withRouter = (Patient: any) => (props: Props) => {
    const params = useParams();
    const { patientId } = params;
    return <Patient patientId={patientId} />;
};

export default withRouter(Patient);