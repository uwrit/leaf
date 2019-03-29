/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import Axios from 'axios';
import { IdTokenDTO } from '../models/IdTokenDTO';

export const login = async (username: string, password: string): Promise<IdTokenDTO> => {
    const resp = await Axios.post('/api/user/login', {
        username,
        password
    });
    const token = resp.data as IdTokenDTO;
    return token;
}