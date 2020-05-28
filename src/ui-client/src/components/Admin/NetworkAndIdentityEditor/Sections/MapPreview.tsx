/* Copyright (c) 2020, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { LatLng } from 'leaflet';
import { connect } from 'react-redux';
import React from 'react';
import { Map as LeafletMap, TileLayer } from 'react-leaflet';
import { NetworkIdentity } from '../../../../models/NetworkResponder';
import { AppState } from '../../../../models/state/AppState';
import EndpointMarker from '../../../Map/EndpointMarker';
import { CohortStateType } from '../../../../models/state/CohortState';
import EndpointPopup from '../../../Map/EndpointPopup';

interface OwnProps {
    identity: NetworkIdentity;
}

interface DispatchProps {

}

interface StateProps {
    tileUrl: string;
}

interface State {
    ref: any;
}

type Props = OwnProps & StateProps;

export class MapPreview extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            ref: React.createRef()
        }
    }

    public render() {
        const { identity, tileUrl } = this.props;
        const { ref } = this.state;
        const latLng = this.getLatLng();

        if (!tileUrl || !latLng || !latLng.lat || !latLng.lng ) { return null; }
    
        return (
            <LeafletMap 
                ref={ref}
                animate={false} 
                minZoom={1} 
                maxZoom={10}
                style={{ height: 130, width: 250 }}
                bounds={latLng.toBounds(2000)}
                zoom={10}
                zoomControl={false}
                >
                <TileLayer url={tileUrl} />
                <EndpointMarker position={latLng} queryState={CohortStateType.LOADED} />
                <EndpointPopup id={{ ...identity, latitude: latLng.lat, longitude: latLng.lng }} count={1000} />
            </LeafletMap>
        );
    }

    private getLatLng = () => {
        const { identity } = this.props;
        let lat = identity.latitude;
        let lng = identity.longitude;

        if (!lat) { lat = 0; } 
        else { lat = +lat; }

        if (!lng) { lng = 0; }
        else {
            lng = +lng;
            if (lng > 0) { lng = -lng; }
        } 

        return new LatLng(lat, lng);
    }
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
    return { 
        tileUrl: state.auth.config!.client.map.tileURI
    };
}

const mapDispatchToProps = (dispatch: any, ownProps: OwnProps): any => {
    return {};
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>
    (mapStateToProps, mapDispatchToProps)(MapPreview)