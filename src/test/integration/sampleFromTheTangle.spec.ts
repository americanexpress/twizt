/**
 * Copyright 2019 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */

import {MamProvider, NextRootAndMessages} from '../../main';
import { expect } from 'chai';

describe('fetch an existing message', () => {
    it('should fetch an older message from a known address', async () => { 
        // need to connect to Mainnet
        const provider = new MamProvider<any>('http://localhost:14265')
        const resp = await provider.fetch('KGEQBBXN9HDOBYHGTQ9CZUBJRSTQL9TGGERDJC9NPKT9KKCKG9ZYDCGK9XICF9HNEUXIJRBYOJC9NISCZ');
        expect(resp.messages.length).to.eq(4);
        console.log('Fetch old message returns:', resp.messages);
    });   
});