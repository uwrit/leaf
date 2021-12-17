/* Copyright (c) 2022, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

export interface ServerStateDTO {
    isUp: boolean;
    downtimeMessage?: string;
    downtimeFrom?: string;
    downtimeUntil?: string;
    notifications: UserNotificationDTO[];
}

export interface ServerState {
    isUp: boolean;
    downtimeMessage?: string;
    downtimeFrom?: Date;
    downtimeUntil?: Date;
    notifications: UserNotification[];
}

export interface UserNotificationDTO {
    id: string;
    message: string;
}

export interface UserNotification extends UserNotificationDTO {}