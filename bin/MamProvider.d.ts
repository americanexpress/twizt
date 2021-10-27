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
/**
 * Structure for returning data from a `fetch` invocation
 */
export interface NextRootAndMessages<T> {
    nextRoot: string;
    messages: Array<T>;
}
/**
 * @MamProvider<T> is the main class encapsulating the messaging with the tangle. It greatly simplifies
 * interaction with the DLT, while also caching data locally, so that not all calls are translated
 * into actual API invocations.
 *
 * Generic <T> is for the data type to be published (e.g. an Interface). You can set it to <any> when
 * working with multiple data types.
 */
export declare class MamProvider<T> {
    private iota;
    private depth;
    private mwm;
    private cache;
    private mamState;
    /**
     * Creates an instance of MamProvider.
     * @param {string} provider - address and port of an iota node
     * @param {string} seed [keyGen(81)] - seed. Automatically generates one, if not provided
     * @param {number} security [2] - When generating an address, you have the option to choose between
     * 3 security models (1..3)
     * @param {number} depth [4] - the starting point for the random walk. the higher the value, the farther
     * back in the tangle the RW will start. and the longer runtime of the RW.
     * @param {number} mwm [9] - Min Weight Magnitude (MWM) - the amount of Work that will be carried out
     * in the PoW stage.
     * @param {any} nextRoot - Next root (optional)
     */
    constructor(provider: string, seed?: string, security?: number, depth?: number, mwm?: number, nextRoot?: string);
    /**
     *  @name getSeed
     *  Returns the seed associated with the current instance of the class
     *  @returns {string} - The current seed.
     */
    getSeed(): string;
    /**
      *  @name generateSeeds
      *  @param {any} count - Number of seeds to generate
      *  @returns {array} - array of seeds
      */
    generateSeeds(count: number): Promise<string[]>;
    /**
     *  @name generateSideKeys
     *  creates encryption keys
     *  @param {any} count - number of side keys to generate
     *  @returns {array} - array of side keys
     */
    generateSideKeys(count: number): Promise<string[]>;
    private isNullOrUndefined;
    /**
      *  @name publish
      *  Allows a given seed to publish a message to the tangle
      *  @param {string} packet - The string to be attached.
      *  @param {string} sideKey - Encryption key (symmetric). Public by default, if not present.
      *  @returns {promise} - Returns the root hash, when resolved
      */
    publish(packet: T, sideKey?: string): Promise<string>;
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
    private _fetch;
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
    fetch(root: string, sideKey?: string): Promise<NextRootAndMessages<T>>;
}
