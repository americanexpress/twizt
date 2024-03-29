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

const keyGen = require('secure-iota-seed-generator');

/**
 * generates single IOTA key
 */

export function generateKey():string {
    return keyGen.generateSeed();
}

/**
 * Generate array `count` keys of `length` size each
 * 
 * @param count - number of keys
 * @param length - size of array
 */
export async function arrayKeyGen(count: number): Promise<Array<string>> {
    let keys:Array<string> = [];

    let i: number;
    for (i = 0; i < count; i++) {
        keys.push(generateKey());
    }

    return keys;
}