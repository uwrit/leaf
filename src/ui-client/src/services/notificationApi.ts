/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 
import { HttpFactory } from './HttpFactory';
import { UserInquiryState } from '../models/state/GeneralUiState';
import { AppState } from '../models/state/AppState';

export const sendUserInquiry = async (state: AppState, inquiry: UserInquiryState): Promise<boolean> => {
    const { token } = state.session.context!;
    const http = HttpFactory.authenticated(token);
    const request = await http.post('/api/notification/inquiry', { 
        associatedQueryId: inquiry.associatedQuery ? inquiry.associatedQuery.universalId : null,
        emailAddress: inquiry.email,
        type: inquiry.type,
        text: inquiry.text
    });
    return request.data as boolean;
};
