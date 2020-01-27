# Twizt: A high-level Masked Authentication-based Messaging framework

This mini-framework, based on the MAM Client JS Library, makes it possible to publish transactions to the Tangle that contain only messages, with no value. It hides all IOTA-related paradigms, thus making it as easy as possible for anyone to write to or read from the tangle. Additionally, it caches responses. For example, if data from a particular root has been fetched once, the second time it will not invoke the provider API to fetch it. 

## Installation

```sh
# install
git clone <repo-url>
cd twizt
yarn install

# full test suite
yarn test
```

## Usage

First, one needs to decide whether to connect to a remote public node, or run a local IRI. In case of latter, 
do the following:

```sh
docker pull iotaledger/iri:latest
docker run --name iri iotaledger/iri:latest --remote true -p 14265
```

Example use to publish to Tangle and fetch from it respectively, follow the example use in 
the [Test script](./test/index.spec.js) file.

1. Sender does the following:

```javascript
/// iota node address. For example, if you have installed a local IRI node:
const PROVIDER = 'http://localhost:14265';

// alternately, you can connect to one of the public nodes on either testnet or mainnet
// create MamProvider object. Publisher shall not use same seed across sessions, 
// but rather let the framework generate one each time
// option exists to provide own seed

interface Fruit {
    name: string;
};

const publisherMam = new MamProvider<Fruit>(PROVIDER);

// publish to tangle any arbitrary JSON object. for example. 
// Optionally, one can use symmentric encryption to "hide" the message from public (see docs)

const root = await publisherMam.publish({ fruit: 'MELLON' }); 

// above method returns root address. 
// For example: `CGBMNLLPXNUSSGZBGHTHCOLQTKJKFVKNWQUBLWKCMNPLSREMMFZDVYISXOBYOUPQ9JR9GMBJXGIAG99SG`
```

2. Sender communicates `root` string to reader. If message is encrypted, encryption key (a.k.a. side key) 
also communicated.

3. Reader runs the code below:

```javascript
// the seed of the reader. For example:
const readerMam = new MamProvider<Fruit>(PROVIDER);

// fetch from tangle
// returns next root, while printing messages. Side key also passed, if message encrypted.

const resp = await readerMam.fetch(root); 
console.log('nextRoot:', resp.nextRoot, ' messages:', resp.messages);
```
In fact, you can fetch a specific message we placed on to the "live" tangle, by running the below.

```javascript
const resp = await new MamProvider<any>('<live net url>')
    .fetch('KGEQBBXN9HDOBYHGTQ9CZUBJRSTQL9TGGERDJC9NPKT9KKCKG9ZYDCGK9XICF9HNEUXIJRBYOJC9NISCZ');
```

## Building

Run `yarn build` .

## Contributing

We welcome Your interest in the American Express Open Source Community on Github. Any Contributor to any Open Source
Project managed by the American Express Open Source Community must accept and sign an Agreement indicating agreement to
the terms below. Except for the rights granted in this Agreement to American Express and to recipients of software
distributed by American Express, You reserve all right, title, and interest, if any, in and to Your Contributions.
Please [fill out the Agreement](https://cla-assistant.io/americanexpress/twizt).

Please feel free to open pull requests and see `CONTRIBUTING.md` for commit formatting details.

## License

Any contributions made under this project will be governed by the [Apache License 2.0](LICENSE).

## Code of Conduct

This project adheres to the [American Express Community Guidelines](CODE_OF_CONDUCT.md). 
By participating, you are expected to honor these guidelines.
