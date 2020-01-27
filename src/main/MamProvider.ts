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

 // @ts-check

const Mam = require('mam.client.js');
import IOTA from 'iota.lib.js';
import * as utils from './utils'
const PUBLIC = 'public';
const RESTRICTED = 'restricted';

type Callback<T> = (result: T) => void;

/**
 * Structure for returning data from a `fetch` invocation
 */

export interface NextRootAndMessages<T> {
  nextRoot: string;
  messages: Array<T>;
};

/**
 * @MamProvider<T> is the main class encapsulating the messaging with the tangle. It greatly simplifies
 * interaction with the DLT, while also caching data locally, so that not all calls are translated
 * into actual API invocations.
 * 
 * Generic <T> is for the data type to be published (e.g. an Interface). You can set it to <any> when
 * working with multiple data types.
 */

export class MamProvider<T> {
  private iota: IOTA;
  private depth: number;
  private mwm: number;
  private cache: Map<string, any>;
  private mamState: any;

  /**
   * Creates an instance of MamProvider.
   * @param {string} provider - address and port of an iota node
   * @param {string} seed [keyGen(81)] - seed. Automatically generates one, if not provided
   * @param {number} security [2] - When generating an address, you have the option to choose between 
   * 3 security models (1..3)
   * @param {number} depth [4] - the starting point for the random walk. the higher the value, the farther 
   * back in the tangle the RW will start. and the longer runtime of the RW. 
   * @param {number} mwm [14] - Min Weight Magnitude (MWM) - the amount of Work that will be carried out 
   * in the PoW stage. 
   * @param {any} nextRoot - Next root (optional)
   */

  constructor(provider: string, seed = utils.generateKey(), security = 2, 
      depth = 4, mwm = 14, nextRoot:string = null) {

    this.iota = new IOTA({ provider: provider });
    this.depth = depth;
    this.mwm = mwm;
    this.cache = new Map();
    this.mamState = Mam.init(this.iota, seed, security);
    this.mamState.channel.next_root = nextRoot;
  }

  /** 
   *  @name getSeed
   *  Returns the seed associated with the current instance of the class
   *  @returns {string} - The current seed.
   */

  public getSeed() : string {
    return this.mamState.seed;
  }

  /** 
    *  @name generateSeeds
    *  @param {any} count - Number of seeds to generate
    *  @returns {array} - array of seeds
    */

  public async generateSeeds(count: number) : Promise<string[]> {
    return await utils.arrayKeyGen(count);
  }

  /** 
   *  @name generateSideKeys
   *  creates encryption keys
   *  @param {any} count - number of side keys to generate
   *  @returns {array} - array of side keys
   */

  public async generateSideKeys(count: number) : Promise<string[]> {
    return await utils.arrayKeyGen(count);
  }

  private isNullOrUndefined(param: any) : boolean {
    if(param === null || param === undefined) {
      return true;
    }

    return false;
  }

  /** 
    *  @name publish
    *  Allows a given seed to publish a message to the tangle
    *  @param {string} packet - The string to be attached. 
    *  @param {string} sideKey - Encryption key (symmetric). Public by default, if not present.
    *  @returns {promise} - Returns the root hash, when resolved
    */

  public async publish(packet: T, sideKey: string = null): Promise<string> {
    if (this.isNullOrUndefined(sideKey)) {
      Mam.changeMode(this.mamState, PUBLIC);
    } else {
      Mam.changeMode(this.mamState, RESTRICTED, sideKey);
    }

    const trytes = this.iota.utils.toTrytes(JSON.stringify(packet));
    const message = Mam.create(this.mamState, trytes);
    this.mamState = message.state;
    console.log('state after creating message:', this.mamState);
    await Mam.attach(message.payload, message.address, this.depth, this.mwm);
    return message.root;
  }

  /**
   *  @name _fetch
   *  Fetch the message at a given root. Will return all prior messages to that point.
   *  sideKey must be passed to receive encrypted messages. 
   *  @param {string} root - the root hash to fetch from
   *  @param {string} sideKey - the symmetric key. needed if message is encrypted
   *  @param {function} callback - since there could be multiple messages, it is called 
   *  sequentially as messages are fetched
   *  @returns {promise} - resolves to the next root in the linked chain
   */

  private async _fetch(root: string, sideKey: string, callback: Callback<T>) : Promise<string> {
    var dataArray:Array<T> = [];

    if (this.cache.has(root)) {
      var cached = this.cache.get(root);
      cached.data.forEach(function (element: T) {
        callback(element);
      });
      return cached.nextRoot;
    }
    const getTrytes = (data: T) => {
      const parsedDataFromTrytes = JSON.parse(this.iota.utils.fromTrytes(data.toString()));
      dataArray.push(parsedDataFromTrytes);
      callback(parsedDataFromTrytes);
    }

    const mode = this.isNullOrUndefined(sideKey) ? PUBLIC : RESTRICTED;

    const resp = await Mam.fetch(root, mode, sideKey, getTrytes);
    if(resp !== null && resp.message !== undefined) {
      throw Error(resp.message);
    }

    this.cache.set(root, Object.assign({ data: dataArray }, resp));

    return this.isNullOrUndefined(resp) ?  null : resp.nextRoot;
  }

  /**
   *  Fetch the message at a given root. Will return all prior messages to that point.
   *  sideKey must be passed to receive encrypted messages. 
   * 
   *  @param {string} root - the root hash to fetch from
   *  @param {string} sideKey - the symmetric key. needed if message is encrypted
   *  @param {function} callback - since there could be multiple messages, it is called sequentially as messages are fetched
   *  @returns {promise} - returns JSON: 
   * {
   *    nextRoot: <next root or null>, 
   *    messages: <array of messages>}
   */

  async fetch(root: string, sideKey: string = null): Promise<NextRootAndMessages<T>> {
    const messages:Array<any> = [];

    const nextRoot = await this._fetch(root, sideKey, (record) => {
      messages.push(record);
    });

    return {
      nextRoot: nextRoot,
      messages: messages
    };
  }
}

