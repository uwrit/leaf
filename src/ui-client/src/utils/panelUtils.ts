/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { Panel } from "../models/panel/Panel";
import { SubPanel } from "../models/panel/SubPanel";
import { Concept } from "../models/concept/Concept";
import { PanelFilter } from "../models/panel/PanelFilter";

export const getPanelItemCount = (panels: Panel[]): number => { 
    return panels.filter((p: Panel) => (p.subPanels.filter((s: SubPanel) => s.panelItems.length > 0)).length > 0).length;
};

export const getEmbeddedQueries = (panels: Panel[]): Concept[] => {
    const embedded: Concept[] = [];
    for (const p of panels) {
        for (const sp of p.subPanels) {
            for (const pi of sp.panelItems) {
                if (isEmbeddedQuery(pi.concept.universalId)) {
                    embedded.push(pi.concept);
                }
            }
        }
    }
    return embedded;
};

export const isEmbeddedQuery = (universalId?: string): boolean => {
    const embeddedQueryUrn = 'urn:leaf:query:';
    if (!universalId) {
        return false;
    } else if (universalId!.startsWith(embeddedQueryUrn)) {
        return true;
    }
    return false;
};

export const panelHasErrors = (): boolean => {
    const dateFilterErrors = document.querySelector('.panel-date-filtered .panel-item-not-encounter-based');
    const countFilterErrors = document.querySelector('.panel-count-filtered .panel-item-not-encounter-based');
    const seqFilterErrors = document.querySelector('.panel-sequential-join .panel-item-not-encounter-based');
    if (dateFilterErrors || countFilterErrors || seqFilterErrors) {
        return true;
    }
    return false;
};

export const panelHasLocalOnlyConcepts = (panels: Panel[], panelFilters: PanelFilter[]): boolean => {
    for (const p of panels) {
        for (const sp of p.subPanels) {
            for (const pi of sp.panelItems) {
                if (!pi.concept.universalId) {
                    return true;
                }
            }
        }
    }
    for (const f of panelFilters) {
        if (!f.concept.universalId) {
            return true;
        }
    }
    return false;
};