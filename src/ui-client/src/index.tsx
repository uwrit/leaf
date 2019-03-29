/* Copyright (c) 2019, UW Medicine Research IT, University of Washington
 * Developed by Nic Dobbins and Cliff Spital, CRIO Sean Mooney
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */ 

import React from 'react';
import ReactDOM from 'react-dom';
import Root from './containers/Root';
import './index.css';
import './polyfills';
import './styles/fonts.css';
import './styles/bootstrap.min.css';
import './styles/LeafButton.css';
import './styles/LeafDropdown.css';
import './styles/LeafInput.css';
import './styles/LeafModal.css';
import './styles/LeafProgressBar.css';

ReactDOM.render(
  <Root />,
  document.getElementById('root') as HTMLElement
);
