/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Concept, ResourceRef, ConceptSpecialization, ExtensionConcept } from '../concept/Concept';
import { NumericFilter } from './NumericFilter';
import { RecencyFilterType } from './RecencyFilter';
import { isEmbeddedQuery } from '../../utils/panelUtils';

export interface BasePanelItem {
    hidden?: boolean;
    index: number;
    numericFilter: NumericFilter;
    recencyFilter: RecencyFilterType;
    subPanelIndex: number;
    panelIndex: number;
    specializations: ConceptSpecialization[];
}

export interface PanelItemDTO {
    resource: ResourceRef;
    id: string;
    index: number;
    numericFilter: NumericFilter;
    recencyFilter: RecencyFilterType;
    specializations: ConceptSpecialization[];
}

export interface PanelItem extends BasePanelItem {
    concept: Concept;
    id: string;
}

export const panelItemToDto = (panelItem: PanelItem): PanelItemDTO => {
    return {
        resource: {
            id: isEmbeddedQuery(panelItem.concept.universalId) 
                ? (panelItem.concept as ExtensionConcept).extensionId
                : panelItem.concept.id,
            universalId: panelItem.concept.universalId!,
            uiDisplayName: panelItem.concept.uiDisplayName
        },
        id: panelItem.id,
        index: panelItem.index,
        numericFilter: panelItem.numericFilter,
        recencyFilter: panelItem.recencyFilter,
        specializations: panelItem.specializations
    }
}
