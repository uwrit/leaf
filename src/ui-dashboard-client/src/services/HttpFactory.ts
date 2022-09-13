/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import Axios, { AxiosInstance } from 'axios';

export const HttpFactory = {
    authenticated(token?: string): AxiosInstance {
        return Axios.create({
            headers: {
                'authorization': `Bearer ${token}`
            }
        });
    }
};

export const baseUrl = `${window.location.protocol}//${window.location.host}/${window.location.pathname.split('/')[0]}`;