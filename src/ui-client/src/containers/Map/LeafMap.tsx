/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import { LatLng } from 'leaflet';
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
import { CohortStateType } from '../../models/state/CohortState';
import { CohortState } from '../../models/state/CohortState';
import { Viewport} from '../../models/state/Map';
import { NetworkIdentity } from '../../models/NetworkResponder';
import { CalculateGeodesicLine } from '../../utils/calculateGeodesicLine';
import computeDimensions from '../../utils/computeDimensions';
import 'leaflet/dist/leaflet.css';
import './LeafMap.css'

interface OwnProps {
    tileUrl: string;
}

interface StateProps {
    cohort: CohortState;
    networkResponders: Map<number,NetworkIdentity>;
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
        const { networkResponders, cohort, tileUrl, map } = this.props;
        const { width, height, ref } = this.state;
        const markers: any[] = [];
        const popups: any[] = [];
        const paths: any[] = [];
        const home = networkResponders.get(0)!;
        const responders: NetworkIdentity[] = networkResponders.size > 0 && cohort.networkCohorts.size > 0
            ? [ ...networkResponders.values() ].filter((n: NetworkIdentity) => n.enabled && !n.isGateway && n.latitude && n.longitude)
            : [];

        for (const nr of responders) {
            const netCohort = cohort.networkCohorts.get(nr.id);
            markers.push(<EndpointMarker key={nr.id} position={new LatLng(nr.latitude!, nr.longitude!)} queryState={netCohort!.count.state} />);
            popups.push(<EndpointPopup key={nr.id} id={nr} count={netCohort!.count.value}  />)

            if (home && !home.isGateway && nr.id > 0) {
                const opts = cohort!.count.state === CohortStateType.LOADED ? antPathOptionTypes.RESULT_RECEIVED : antPathOptionTypes.SENDING_QUERY;
                const line = CalculateGeodesicLine([ home.latitude, home.longitude ], [ nr.latitude, nr.longitude ]);
                if (home.enabled) {
                    paths.push(<AntPath key={nr.id} options={opts} positions={line}/>);
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
        networkResponders: state.responders
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