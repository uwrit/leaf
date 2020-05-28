/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { arc } from '../bundled/arc';

export function CalculateGeodesicLine (from, to) {
    /*
     * Convert array of points to xy object
     * expected by arc.js
     */
    const arrayToXY = coord => ({
        x: coord[1],
        y: coord[0]
    });

    /* 
     * Simple heuristic for getting a visually
     * reasonable-looking number of vertices based on 
     * euclidian distance between two lat|long points
     */
    const calculateVertices = (p1, p2) => {
        const d1 = Math.abs(p1[0] - p2[0]);
        const d2 = Math.abs(p1[1] - p2[1]);
        return Math.round((d1 + d2) / 4);
    }
    const vertexCount = calculateVertices(from, to);

    // No need to calculate arc if it's a straight line
    if (vertexCount === 1) {
        return [from, to];
    }
    // Else calculate the arc for computed vertex count
    else {
        const generator = new arc.GreatCircle(arrayToXY(from), arrayToXY(to));
        const arcLine = generator.Arc(vertexCount);

        // Switch lat and long
        return arcLine.geometries[0].coords.map(e => { return [e[1], e[0]]; });
    }
}

