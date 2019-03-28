/* Copyright (c) 2019, UW Medicine Research IT
 * Developed by Nic Dobbins and Cliff Spital
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { LatLng, LatLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React from 'react';
import { Map as LeafletMap, TileLayer } from 'react-leaflet';
import AntPath from 'react-leaflet-ant-path';
import { Dispatch } from 'redux';
import { connect } from 'react-redux'
import { setViewport } from '../../actions/map';
import { antPathOptionTypes } from '../../components/Map/AntPathTypes';
import EndpointMarker from '../../components/Map/EndpointMarker';
import EndpointPopup from '../../components/Map/EndpointPopup';
import { AppState, MapState } from '../../models/state/AppState';
import { CohortStateType, NetworkCohortState } from '../../models/state/CohortState';
import { CohortState } from '../../models/state/CohortState';
import { Viewport} from '../../models/state/Map';
import { NetworkIdentity } from '../../models/NetworkRespondent';
import { CalculateGeodesicLine } from '../../utils/calculateGeodesicLine';
import computeDimensions from '../../utils/computeDimensions';
import './LeafMap.css'

interface OwnProps {
    tileUrl: string;
}

interface StateProps {
    cohort: CohortState;
    networkRespondents: Map<number,NetworkIdentity>;
    map: MapState;
}

interface DispatchProps {
    setViewport: (v: Viewport) => void;
}

type Props = StateProps & OwnProps & DispatchProps;

interface State {
    height: number;
    ref: any;
    width: number;
}

// Default the map frame to the US for now
const defaultBounds = [ [47.6062, -122.3321], [25.7617, -80.1918] ];
let internalViewport: any = {
    bounds: null,
    center: null,
    zoom: 0
}

export class LeafMap extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            height: 0,
            ref: React.createRef(),
            width: 0
        };
    }

    public onViewportChanged: any = (v: Viewport) => {
        if (!this.state.ref.current) {
            return;
        }
        v.bounds = this.state.ref.current.leafletElement.getBounds();
        internalViewport = v;
    }

    public updateDimensions = () => {
        const dimensions = computeDimensions();
        this.setState({ height: dimensions.height, width: dimensions.contentWidth });
    }

    public componentWillMount() {
        this.updateDimensions();
    }

    public componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
    }

    public componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    public render() {
        const { networkRespondents, cohort, tileUrl, map } = this.props;
        const { width, height, ref } = this.state;
        const markers: any[] = [];
        const popups: any[] = [];
        const paths: any[] = [];

        /*
        const respondents: NetworkIdentity[] = [
            { abbreviation: '', isHomeNode: true, latitude: 47.6062, longitude: -122.3321, primaryColor: '#4B2E83', secondaryColor: '', id: 0, name: 'University of Example1', address: '', enabled: true },
            { abbreviation: '', isHomeNode: false, latitude: 41.8781, longitude: -87.6298, primaryColor: '#800000', secondaryColor: '', id: 1, name: 'University of Example2', address: '' },
            { abbreviation: '', isHomeNode: false, latitude: 30.2672, longitude: -97.7431, primaryColor: '#BF5700', secondaryColor: '', id: 2, name: 'University of Example3', address: '' },
        ];
        const cohorts = new Map<number, any>();
        cohorts.set(0, { count: { value: 262, state: CohortStateType.LOADED } })
        cohorts.set(1, { count: { value: 308, state: CohortStateType.LOADED } })
        cohorts.set(2, { count: { value: 801, state: CohortStateType.LOADED } })
        const home: NetworkIdentity = respondents[0];
        */

        const home: NetworkIdentity = networkRespondents.get(0)!;
        const respondents: NetworkIdentity[] = networkRespondents.size > 0 && cohort.networkCohorts.size > 0
            ? Array
                .from(networkRespondents.keys())
                .map((k: number) => networkRespondents.get(k)!)
                .filter((n: NetworkIdentity) => n.enabled)
            : [];
        
        
        for (const nr of respondents) {
            const netCohort = cohort.networkCohorts.get(nr.id);
            // const cohort = cohorts.get(nr.id);
            markers.push(<EndpointMarker key={nr.id} position={new LatLng(nr.latitude, nr.longitude)} queryState={netCohort!.count.state} />);
            popups.push(<EndpointPopup key={nr.id} id={nr} count={netCohort!.count.value}  />)

            if (nr.id > 0) {
                const opts = cohort!.count.state === CohortStateType.LOADED ? antPathOptionTypes.RESULT_RECEIVED : antPathOptionTypes.SENDING_QUERY;
                if (home.enabled) {
                    paths.push(
                        <AntPath 
                            key={nr.id} 
                            options={opts} 
                            positions={CalculateGeodesicLine([ home.latitude, home.longitude ], [ nr.latitude, nr.longitude ])} 
                        />
                    )
                }
            }
        }
    
        return (
            <LeafletMap 
                ref={ref}
                animate={false} 
                minZoom={4} 
                maxZoom={10}
                style={{ height, width }}
                onViewportChanged={this.onViewportChanged}
                bounds={map.viewport.bounds}
                zoom={map.viewport.zoom}>
                <TileLayer
                    attribution='&copy; <a href="http={true}://osm.org/copyright">OpenStreetMap</a> contributors'
                    url={tileUrl}
                />
                {popups}
                {markers}
                {paths}
            </LeafletMap>
        );
    }
}

const mapStateToProps = (state: AppState, ownProps: OwnProps): StateProps => {
    return { 
        cohort: state.cohort,
        map: state.map,
        networkRespondents: state.respondents
    };
}

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps) : DispatchProps => {
    return { 
        setViewport: (viewport: Viewport) => {
            dispatch(setViewport(viewport))
        }
    };
}

export default connect<StateProps, DispatchProps, OwnProps, AppState>
    (mapStateToProps, mapDispatchToProps)(LeafMap)