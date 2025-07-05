# [1.0.0-rc.29](https://github.com/1inch-community/interface/compare/v1.0.0-rc.28...v1.0.0-rc.29) (2025-05-27)


### Features

* **footer:** add GitHub link with icon to footer ([b91123d](https://github.com/1inch-community/interface/commit/b91123d1ef94ca0fb3eac5978d70edbf17cae77a))

# [1.0.0-rc.28](https://github.com/1inch-community/interface/compare/v1.0.0-rc.27...v1.0.0-rc.28) (2025-05-27)


### Features

* **swap-info-main:** dynamically calculate container height ([2eb44a9](https://github.com/1inch-community/interface/commit/2eb44a965979947010cca2cf415149b4fb4912d9))
* **swap:** fix show swap details without snapshot data. ([1d6b29b](https://github.com/1inch-community/interface/commit/1d6b29bf48a4a6947cca2f9c56a82745bad770f1))

# [1.0.0-rc.27](https://github.com/1inch-community/interface/compare/v1.0.0-rc.26...v1.0.0-rc.27) (2025-05-27)


### Code Refactoring

* **sdk:** improve token and order status handling across strategies ([5435ca0](https://github.com/1inch-community/interface/commit/5435ca07d3ba534a42d5bab2461de6f0113d4d43))


### Features

* **icons:** update logo-full.svg with optimized SVG structure ([41ec134](https://github.com/1inch-community/interface/commit/41ec13469b0e5adfcc38425e81e9b6b8475ffa3e))
* **swap:** fix after merge with dev. ([de77ca3](https://github.com/1inch-community/interface/commit/de77ca33f0aabe9926803b0bd5c763405f77c41a))
* **swap:** linear token preparation before swap. support swap native to wrapped via deposit ([07f1972](https://github.com/1inch-community/interface/commit/07f197296bb0ebc9fb662367966f8cc1b1ca14f9))
* **swap:** support for dynamic properties of different swap strategies ([ef27efe](https://github.com/1inch-community/interface/commit/ef27efe4b1b7447b09678fc94f621d318ced4dac))


### BREAKING CHANGES

* **sdk:** Changes to the `getOrderStatus` and related token handling logic may require updates in dependent modules.

# [1.0.0-rc.26](https://github.com/1inch-community/interface/compare/v1.0.0-rc.25...v1.0.0-rc.26) (2025-05-26)


### Features

* **swap:** additional data for swapped order ([931666b](https://github.com/1inch-community/interface/commit/931666bf566e3d84c0a9b5af79cf4fb54fc77e12))

# [1.0.0-rc.25](https://github.com/1inch-community/interface/compare/v1.0.0-rc.24...v1.0.0-rc.25) (2025-05-22)


### Bug Fixes

* **docs & dependencies:** update README formatting and dependencies ([21db37a](https://github.com/1inch-community/interface/commit/21db37a6abba7094cce54f5d07a5e722285e7314))


### chore

* **dependencies:** clean pnpm-lock.yaml and update dependencies ([adb527c](https://github.com/1inch-community/interface/commit/adb527cd6ed6b5052122b6a590f1441abaef10a3))


### Features

* **examples:** add 1inch-community Angular example app ([cc2f67a](https://github.com/1inch-community/interface/commit/cc2f67a0a96b4d7f016322a5fa1bc33506d5aec1))
* **integration-layer:** add eventemitter3 dependency ([65a1af1](https://github.com/1inch-community/interface/commit/65a1af129ac1e01780181deb44ef8d8b0355e69a))


### BREAKING CHANGES

* **dependencies:** Removed old `pnpm-lock.yaml`. Ensure to regenerate the lock file if required.

# [1.0.0-rc.24](https://github.com/1inch-community/interface/compare/v1.0.0-rc.23...v1.0.0-rc.24) (2025-05-21)


### Features

* **examples/angular:** add Angular example application ([afa6d2e](https://github.com/1inch-community/interface/commit/afa6d2e2b6da5d5b8db6d83748849bba40904886))
* **examples/react:** add React example for 1inch community integration ([6698608](https://github.com/1inch-community/interface/commit/6698608e0aa9ecab593411101a79f5a778b014b5))
* **examples/vue:** add Vue example application for swap form integration ([2af70d3](https://github.com/1inch-community/interface/commit/2af70d30c507b6adbe8b5eb593ebfba27700bfa1))


### BREAKING CHANGES

* **examples/vue:** Example setup requires dependencies present in the `libs` folder.

# [1.0.0-rc.23](https://github.com/1inch-community/interface/compare/v1.0.0-rc.22...v1.0.0-rc.23) (2025-05-21)


### Bug Fixes

* **chain-selector:** improve button behavior and style updates ([363dd05](https://github.com/1inch-community/interface/commit/363dd05c97a1335707bd2b2b68d0a1fc16b5d373))
* **fusion-swap-info-auction-time:** move updateSegments to connectedCallback ([772dd5f](https://github.com/1inch-community/interface/commit/772dd5f9adcd388f0c8a3ebc761078ffb1e9a972))
* **swap-button:** update target binding in inch-text-animate ([2348bc6](https://github.com/1inch-community/interface/commit/2348bc680ed34bf66be2fff63051582a79756c6a))
* **swap-strategy:** use dynamic slippage from quote instead of default ([7895207](https://github.com/1inch-community/interface/commit/78952073f48ad91e3bc3dff2ca1d72ee9769d1b8))
* **swap:** handle cross-chain token mismatch in pair-holder ([d1cd344](https://github.com/1inch-community/interface/commit/d1cd344603f7d32b448cddbd4f6ff9b5df59a2c0))


### Code Refactoring

* **token-rate:** use lazyAppContext and improve rate comparison ([b664fc3](https://github.com/1inch-community/interface/commit/b664fc3afc853009de4d1a7a3fbd1e95a81dae42))


### Features

* **chain-selector:** add `disabled` property and tooltip support ([318731a](https://github.com/1inch-community/interface/commit/318731aae4c1b02d83b4e351f0b33e8b51f32a17))
* **chain-view-config:** add shortName property for chains ([0a22ac0](https://github.com/1inch-community/interface/commit/0a22ac0419e9d4306cec067f9bdcb97319da5e83))
* **chain:** add cross-chain support to wrapper-native-token ([feea6fc](https://github.com/1inch-community/interface/commit/feea6fcf75ecda7b438b60d4c3350d8dea97135a))
* **mapper:** add slippage to fusion-plus-quote mapper ([95f673b](https://github.com/1inch-community/interface/commit/95f673b8ae940ce0b2f73f4123d8ba60e2d4d349))
* **models:** add new observables and property for token support ([00736a8](https://github.com/1inch-community/interface/commit/00736a831af830cce591608cc94e5e178f23421e))
* **models:** add new properties to support extended functionality ([71744b9](https://github.com/1inch-community/interface/commit/71744b914d1a60471979409da0c16107a748d198))
* **number-animation:** enhance transitions with concatMap and text animation ([debb1f0](https://github.com/1inch-community/interface/commit/debb1f06968c0360e19a1abf765490fa85ff61fc))
* **one-inch-dev-portal:** add caching for gas price retrieval ([7a03730](https://github.com/1inch-community/interface/commit/7a037309078d9a5687cd9c8f0effa2a32631de23))
* **select-token:** improve cross-chain support and UI adjustments ([93df69c](https://github.com/1inch-community/interface/commit/93df69c0eab5d29b86f68d1ae185b9d3d074bd76))
* **swap-form:** enhance token selection and max button interactions ([de17bae](https://github.com/1inch-community/interface/commit/de17bae0702f217a0de173dc9421284121d7f54a))
* **swap:** add caching decorator to getDataSnapshot method ([8273d1e](https://github.com/1inch-community/interface/commit/8273d1e08f67038abb776f9509ff7b617660b1f2))
* **token-list:** add support for disabling single-chain tokens ([c2ff6ef](https://github.com/1inch-community/interface/commit/c2ff6efa0a6cfcee016d9dbd628354667fcabd1a))
* **token-list:** improve chain list rendering logic ([d64bae4](https://github.com/1inch-community/interface/commit/d64bae48b5cc6cbdab4c5cedd2a6a13612de9fdf))
* **tokens:** add cross-chain support to token storage ([0963c0d](https://github.com/1inch-community/interface/commit/0963c0d4b07bdc02feb9d54acc15fce422fa7663))
* **tooltip:** add new options for disabling and custom positioning ([8942723](https://github.com/1inch-community/interface/commit/8942723c14341ba4408b1a5aba83796e721fe953))
* **tooltip:** enhance tooltip to support TemplateResult content ([85b0596](https://github.com/1inch-community/interface/commit/85b05961ffc0556e2a80fb57e416f39e09d2ef42))
* **transport:** enhance transport benchmarking and persistence ([c23b758](https://github.com/1inch-community/interface/commit/c23b75834899d9c17483f44dbafb97e95486b595))
* **ui-components:** enhance scene animations with new API methods ([16bf836](https://github.com/1inch-community/interface/commit/16bf836b967f7bf54d6c7fa1fdba4af705dc3601))
* **ui-components:** update Klaytn icon to new design ([c1085fc](https://github.com/1inch-community/interface/commit/c1085fc4e381bfdabaf5d8f16ee10a486e3d3e1e))


### BREAKING CHANGES

* **token-list:** Token components now include a `disabledSingleChainTokens` property that may require updates in related implementations.
* **token-rate:** Modifies how context is set, ensuring compatibility with the updated `lazyAppContext` approach.
* **chain-view-config:** Updates to Klaytn configuration may affect dependent modules.
* **tokens:** Database version updated, requiring migration to `one-inch-token-v3`.
* **chain-selector:** Components relying on `inch-chain-selector` must now handle the `disabled` property properly to avoid unintended interactions.
* **tooltip:** Tooltip `text` property no longer supports string attribute binding; use property binding instead.
* **ui-components:** `preparation` API in animations no longer returns a Promise,
`duration` is now required, and `cleanup` needs to be implemented.

# [1.0.0-rc.22](https://github.com/1inch-community/interface/compare/v1.0.0-rc.21...v1.0.0-rc.22) (2025-05-20)


### Bug Fixes

* **account:** unstable card collapse ([33b2b61](https://github.com/1inch-community/interface/commit/33b2b61fcc259dd275b8fea4fc9221515c19d78c))
* **amount-input:** change logic for collapse account card. ([668f1be](https://github.com/1inch-community/interface/commit/668f1be70866a97d594cd28925442d0d74adddab))


### Features

* **swap:** get status and cancel order implementation ([8048979](https://github.com/1inch-community/interface/commit/8048979a504c1af2872841f1c297a7f411d6e3a5))

# [1.0.0-rc.21](https://github.com/1inch-community/interface/compare/v1.0.0-rc.20...v1.0.0-rc.21) (2025-05-20)


### Bug Fixes

* **swap:** wrap native token before swap flow ([5a9e8fc](https://github.com/1inch-community/interface/commit/5a9e8fc1a1abfc37809d01b50b6c31d86a2e82f8))

# [1.0.0-rc.20](https://github.com/1inch-community/interface/compare/v1.0.0-rc.19...v1.0.0-rc.20) (2025-05-19)


### Bug Fixes

* **amount-input:** input validation and set up the valid token amount ([946a75d](https://github.com/1inch-community/interface/commit/946a75d567512ecf156c6c9ff29db093ef5513bb))
* **amount-input:** support formatted input with decimals ([75e8409](https://github.com/1inch-community/interface/commit/75e840928b2b81a736813fc085396fe6c483d9a0))
* **amount-input:** validate integer part of input ([ea9f52d](https://github.com/1inch-community/interface/commit/ea9f52df9b1ee66f4565dc4541afea4c97e91deb))

# [1.0.0-rc.19](https://github.com/1inch-community/interface/compare/v1.0.0-rc.18...v1.0.0-rc.19) (2025-05-16)


### Features

* **dapp:** improve script loading for external fonts ([354de94](https://github.com/1inch-community/interface/commit/354de9498ccab9cb94b6415a81c2e69476797ce5))
* **dapp:** update favicon and add external font script ([b0cb195](https://github.com/1inch-community/interface/commit/b0cb195c7b8f23c2020b74b3c6a18503d9e1e83f))
* **dapp:** update favicon and add external font script ([66da889](https://github.com/1inch-community/interface/commit/66da8897f8c1df71ac86755f49b0816b76a5d7c1))

# [1.0.0-rc.18](https://github.com/1inch-community/interface/compare/v1.0.0-rc.17...v1.0.0-rc.18) (2025-05-16)


### Bug Fixes

* **swap:** call transfer resolver before confirm swap. ([f8b3a8a](https://github.com/1inch-community/interface/commit/f8b3a8a777f4bfc3c5ce225d70414e37581ea2da))
* **swap:** improvement and simplification of transfer requirement resolver logic ([2e7834d](https://github.com/1inch-community/interface/commit/2e7834da66b7f071ddfed471d01bf25556e9fa4a))

# [1.0.0-rc.17](https://github.com/1inch-community/interface/compare/v1.0.0-rc.16...v1.0.0-rc.17) (2025-05-15)


### Bug Fixes

* **swap:** wrap native token IBigFloat use toWei ([eb89675](https://github.com/1inch-community/interface/commit/eb89675567dd710e3383d0ef74d2ca69b7076ec1))

# [1.0.0-rc.16](https://github.com/1inch-community/interface/compare/v1.0.0-rc.15...v1.0.0-rc.16) (2025-05-15)


### Bug Fixes

* **swap:** api proxy support empty response body ([16f22f9](https://github.com/1inch-community/interface/commit/16f22f97c61cc9adcd35a718acc290b41a3bef75))
* **swap:** code improvements ([69f7f35](https://github.com/1inch-community/interface/commit/69f7f35a22cb23f90d291b7c78e1d89c8ac79f58))
* **swap:** create new permit2 sign  without any preview data about latest permits. ([600e48b](https://github.com/1inch-community/interface/commit/600e48b31cd3696eaba732013e7852321283a0e5))
* **swap:** disable permit2 transfer resolver. ([ad765d2](https://github.com/1inch-community/interface/commit/ad765d240c7a0ba5ca31a759d6b3555e8b2349a3))
* **swap:** estimate fusion order only before swap ([f206c08](https://github.com/1inch-community/interface/commit/f206c08d618795bfedb8528d081a69c780c01213))
* **swap:** fusion(plus) permit2 encode format ([7f345d6](https://github.com/1inch-community/interface/commit/7f345d6e3d9a665d0d08f4c805f375b748905b43))
* **swap:** IBigFloat to wei ([7dac646](https://github.com/1inch-community/interface/commit/7dac6467c8f1648c8acbc99a14ade3f114671508))
* **swap:** logic for prepare valid permit2 calldata for fusion. ([4b8b85c](https://github.com/1inch-community/interface/commit/4b8b85cd23feaf9cec4ba2d9e804d3fc1d39b063))
* **swap:** permit2 throw error ([728e249](https://github.com/1inch-community/interface/commit/728e2496cb65b9dea56a7126ee45f4b388b93e03))
* **swap:** provide strategyName into snapshot ([45ffa63](https://github.com/1inch-community/interface/commit/45ffa63d1124f87cc61e94b00a867f26cc14f9ae))
* **swap:** remove duplicate of chainId as args. ([b746a85](https://github.com/1inch-community/interface/commit/b746a85b110b64fb005f3861561fd77d06a0c4fd))
* **swap:** swap fusion strategy enable estimate ([51bcd5f](https://github.com/1inch-community/interface/commit/51bcd5f64c759b07163fe408d3feb72bc48442a3))
* **swap:** swap fusion strategy fix check balance ([c399ec3](https://github.com/1inch-community/interface/commit/c399ec39cd0f852b398a5c35747d0aca1d946959))
* **swap:** toBigInt change to toWei ([d70ca1a](https://github.com/1inch-community/interface/commit/d70ca1a4bd587890df7c9e7d4a5127b6ec1b6f4c))
* **swap:** transfer requirement check current wallet chain before run transaction ([aa2cf0d](https://github.com/1inch-community/interface/commit/aa2cf0d08d4a8e8bf95b54bce1a6089f63023085))
* **swap:** use IBigFloat in public interfaces. remove unused approveSpenderStep for Permit2 ([5a82918](https://github.com/1inch-community/interface/commit/5a829180f1af9a489d8f14f85f7631b9b0f4c9b1))
* **swap:** use same swap strategy like a in snapshot ([d91a462](https://github.com/1inch-community/interface/commit/d91a4624d99b74c36793ffddca1bae1b6c8f4035))
* **swap:** wait tx finished ([3b3c14b](https://github.com/1inch-community/interface/commit/3b3c14b25336ace406efeff4ddd90dacc4cc4f4b))


### Features

* **swap:** code style improvements ([2e350e3](https://github.com/1inch-community/interface/commit/2e350e31037d16c93e0bf8760545d692cc8a1416))
* **swap:** permit2 adaptive signature for Fusion sdk. ([3b8f912](https://github.com/1inch-community/interface/commit/3b8f912b8ed5aafcf3dd9bd37a2d7032f226d8cb))
* **swap:** permit2/common token approve as token transfer requirements resolvers ([52f6c11](https://github.com/1inch-community/interface/commit/52f6c11190426ee4cdc10ce1af195d95edc1b21e))
* **swap:** token transfer requirement providers code improvements ([95faaa2](https://github.com/1inch-community/interface/commit/95faaa2d8fe0ec527201669f9833aa6d2299ef9a))
* **swap:** transfer requirements resolvers use BigFloat ([d8465b8](https://github.com/1inch-community/interface/commit/d8465b8bd83d1e8d739899b0c4b0783dbabf2f41))
* **swap:** Transfer token requirement resolver (permit2) (WIP) ([acb09ac](https://github.com/1inch-community/interface/commit/acb09ac41c64604f44771c0182d8050b83ef9606))
* **swap:** Transfer token requirement resolver (permit2) (WIP) ([3aab483](https://github.com/1inch-community/interface/commit/3aab483ae6cbf624e8c0de096672ac52ca51f348))

# [1.0.0-rc.15](https://github.com/1inch-community/interface/compare/v1.0.0-rc.14...v1.0.0-rc.15) (2025-05-15)


### Features

* **address-view:** add ENS name resolution with caching ([ff80ff2](https://github.com/1inch-community/interface/commit/ff80ff21203e324d3774b9b41727cc51fa15a41e))

# [1.0.0-rc.14](https://github.com/1inch-community/interface/compare/v1.0.0-rc.13...v1.0.0-rc.14) (2025-05-15)


### Bug Fixes

* **embedded-controllers:** update wallet chain management methods ([561b2a6](https://github.com/1inch-community/interface/commit/561b2a680ffc271205e69d3fe8d83fd99fab4fa6))
* **math:** handle errors in BigFloat.isBigFloat ([95baa61](https://github.com/1inch-community/interface/commit/95baa616b36df4d561bce1ff7fe1060a7a86a330))
* **notifications:** update method for fetching wallet chain ID ([0f55f35](https://github.com/1inch-community/interface/commit/0f55f35fba844204f8d3c70987b33e21e66800ca))
* **text-animate:** prevent concurrent transitions ([53eaeba](https://github.com/1inch-community/interface/commit/53eaeba06a3fdfe69103bcc1df8eaa32f5111ece))


### Code Refactoring

* **wallet:** update and streamline chain ID handling ([788c4ea](https://github.com/1inch-community/interface/commit/788c4eaa454f364225b13079187fe8234bcdc4ba))


### Features

* **cache:** add PersistCache for persistent key-value storage ([7a7ff32](https://github.com/1inch-community/interface/commit/7a7ff32eef7787b5b304efecb8dc938e66dbf419))
* **storage:** add JsonBigFloatParser for parsing BigFloat values ([e5af582](https://github.com/1inch-community/interface/commit/e5af5828f55b494df2104fe6f32988caf762f933))
* **swap-form:** update chain handling and button texts ([68bf26c](https://github.com/1inch-community/interface/commit/68bf26c64f114f4e907ba7c2fcc9c7be35745200))
* **wallet-total-fiat-balance:** add caching for fiat balances ([cab250f](https://github.com/1inch-community/interface/commit/cab250f8cb251cedfa7f3699ea9d9e7ea84c79fe))


### BREAKING CHANGES

* **wallet:** Modifies chain ID retrieval APIs and removes `setChainIds` method, which may require updates in dependent code.

# [1.0.0-rc.13](https://github.com/1inch-community/interface/compare/v1.0.0-rc.12...v1.0.0-rc.13) (2025-05-14)


### Bug Fixes

* **button:** update 'loader' property to not reflect as an attribute ([3920d39](https://github.com/1inch-community/interface/commit/3920d396bf4bb512c8fed337f5c41bc9ec345254))
* **swap-button:** correct balance comparison logic ([f925c1e](https://github.com/1inch-community/interface/commit/f925c1e46a8f88cda7628ccd9945ddd7bc1a17ab))
* **swap-button:** correct balance comparison logic ([b2f82cd](https://github.com/1inch-community/interface/commit/b2f82cdf1e0f14ec0c327500ca0d4ad2c57cbb7b))
* **swap-button:** correct balance comparison logic ([3a93beb](https://github.com/1inch-community/interface/commit/3a93bebc1466b2d7e6bedc7edd74b1923912e568))
* **swap-context:** return null instead of throwing an empty error ([6ecc486](https://github.com/1inch-community/interface/commit/6ecc48661e5a1a4d52dc907527fce4ee316ee4df))
* **tokens:** handle null tokens in isTokensEqual function ([be84491](https://github.com/1inch-community/interface/commit/be84491d381de34a94cede14fa05b3ebb9510d1d))


### Features

* **big-float:** add comparison methods and new utility functions ([a14cdfa](https://github.com/1inch-community/interface/commit/a14cdfa9feb3c08e2a111ce4af6884c157d70ee7))
* **big-float:** add comparison methods to interface ([f541d25](https://github.com/1inch-community/interface/commit/f541d2540b06499ae7ccd55e73dc516a375c4b61))
* **math/big-float:** enhance `BigFloat` tests and interface ([c013969](https://github.com/1inch-community/interface/commit/c01396986d6b2726bc16679b757a4651ebda5fa3))
* **swap-strategy:** add RateSource to rate data in fusion strategies ([6c182d1](https://github.com/1inch-community/interface/commit/6c182d18d107e868877f3fa9162057ca48d5e876))
* **token-price:** add RateSource enum to Rate type ([7a11eb2](https://github.com/1inch-community/interface/commit/7a11eb239c0285abcaef2cfc9e0babe5573806f1))
* **token-rate:** add RateSource to one-inch-oracle-base-rate-adapter ([5177ccf](https://github.com/1inch-community/interface/commit/5177ccf869e5b8f2a78695e31b960aedfeea6bb6))
* **ui-components:** enhance text-animate element and add hover directive ([b924ec9](https://github.com/1inch-community/interface/commit/b924ec95579e2df2ee0da380ec958de709f6b5a9))

# [1.0.0-rc.12](https://github.com/1inch-community/interface/compare/v1.0.0-rc.11...v1.0.0-rc.12) (2025-05-12)


### Code Refactoring

* **big-float:** rename `div` method to `dividedBy` ([d0329cc](https://github.com/1inch-community/interface/commit/d0329cc9a27c2d3ce60d42694892cd17817ae69f))
* **big-float:** rename `lte` to `isLessThanOrEqualTo` ([7512f02](https://github.com/1inch-community/interface/commit/7512f02efd8451044c684703ee85a006f58f5979))
* **core, models:** rename `abs` method to `absoluteValue` ([6b1a9c5](https://github.com/1inch-community/interface/commit/6b1a9c5893d1a43603e96fe653ff7b50c9b9dd8c))
* **core,widgets,sdk,models:** rename `equals` to `isEqualTo` ([913829d](https://github.com/1inch-community/interface/commit/913829d6a70b6ef3796f95ba89ac08aa537eed9b))
* **core:** rename `mul` to `times` in BigFloat ([87c09d4](https://github.com/1inch-community/interface/commit/87c09d433c86e891cce6f23dee4deb7a90605103))
* **core:** rename `toBigInt` to `toWei` in BigFloat ([81523f2](https://github.com/1inch-community/interface/commit/81523f2a90c6528dbc8b9b50b4add7d87346fbec))
* **core:** replace `add` with `plus` in BigFloat API ([5a0b9a9](https://github.com/1inch-community/interface/commit/5a0b9a97f58ae1e49f47757c18a068bf14d36ea6))
* **math:** rename `sub` to `minus` in BigFloat and its usages ([cdc5e4c](https://github.com/1inch-community/interface/commit/cdc5e4c2a7740b8dad940acc846e1d81ae23461d))
* **math:** rename method `gt` to `isGreaterThan` ([476ff28](https://github.com/1inch-community/interface/commit/476ff28ddb732bbe7f96747aaf1941424e41b233))


### Features

* **big-float:** enhance BigFloat functionality and test coverage ([ffb75b0](https://github.com/1inch-community/interface/commit/ffb75b0026bdfc0d174d1b43e515757771810f51))
* **math:** increase BigFloat fixed decimal precision to 50 ([f30e9c9](https://github.com/1inch-community/interface/commit/f30e9c983d16416ffa691d7e8c912d9fecfa5a18))


### BREAKING CHANGES

* **core:** The method `toBigInt` has been replaced by `toWei`, requiring updates in dependent code.
* **big-float:** Modified default `FIXED_DECIMALS` from 50 to 30. This change
affects precision outcomes for arithmetic and representation-related methods.
* **core, models:** The `abs` method has been renamed to `absoluteValue`,
which may require updates in dependent code.
* **math:** The `gt` method is renamed. Code using this method will need to be updated to `isGreaterThan`.
* **big-float:** The `lte` method has been replaced with `isLessThanOrEqualTo`, requiring updates to dependent codebases.
* **core,widgets,sdk,models:** The `equals` method has been replaced with `isEqualTo`. Update all references accordingly.
* **big-float:** This renames the `div` method, which requires changes wherever it is used.
* **core:** This renaming breaks backward compatibility for any external usage of the `mul` method. Update all instances of `mul` to `times` in dependent projects.
* **math:** The `sub` method in BigFloat has been replaced with `minus`. This change requires updating all external references to ensure compatibility.
* **core:** The `add` method has been replaced with `plus`. Any usage of `add` must be updated to `plus`.

# [1.0.0-rc.11](https://github.com/1inch-community/interface/compare/v1.0.0-rc.10...v1.0.0-rc.11) (2025-05-06)


### Bug Fixes

* **scene-wrapper:** set height to 100% instead of fit-content ([7dd3ce8](https://github.com/1inch-community/interface/commit/7dd3ce8d210eb9b9018a9131ea314cfb1f323ede))
* **ui-components:** adjust marquee offset calculation ([c7ee078](https://github.com/1inch-community/interface/commit/c7ee078f05642b97b70d4bb1e9b8ee6a48c50d03))
* **workflows:** add GH_TOKEN to dev-pipeline.yml Release step ([a1c09e8](https://github.com/1inch-community/interface/commit/a1c09e863dd2feb5b28685a93fe924721a1dec96))
* **workflows:** update token configuration in dev-pipeline.yml ([b878349](https://github.com/1inch-community/interface/commit/b87834998aabd6cba6113284802fe802c52d747b))


### Code Refactoring

* **api:** remove CrossChainSDKFacade dependency from adapters ([916d176](https://github.com/1inch-community/interface/commit/916d176412ec98a9e34ea5fcb87e333ce4882b33))
* **math:** remove BigMath utility and update BigFloat interface ([4a7baeb](https://github.com/1inch-community/interface/commit/4a7baeb92c4a1d102d8650453e8f5b3670eabd18))
* **number-animation:** enhance performance with rxjs & lit updates ([5825e18](https://github.com/1inch-community/interface/commit/5825e1847f3349d14f77669dd717045888b20c0e))
* **swap-form:** remove outdated balance components and optimize logic ([59c9cac](https://github.com/1inch-community/interface/commit/59c9cac16693907b7d0a13d620a85c7f646729f3))
* **swap:** migrate to BigFloat for token operations ([60c3dab](https://github.com/1inch-community/interface/commit/60c3dabd7fa7a348cb712ab3625ab43170dfda9c))


### Features

* **balance-view:** add `value` property to token balance elements ([4eddb6b](https://github.com/1inch-community/interface/commit/4eddb6bd3c40351aa654eef8570ae1bc59a89210))
* **button:** replace vibrate with dispatchUiFallback on click ([f6526ab](https://github.com/1inch-community/interface/commit/f6526ab542aee37ed10f70617b28385b811ffc4c))
* **core:** add dispatchUiFallback utility to dom.utils ([72a18a9](https://github.com/1inch-community/interface/commit/72a18a9fc8ba2f974e3c28ecda1ae9ba22fa2f65))
* **decorators:** add `schedule` decorator and improve `debounce-time` ([022ef65](https://github.com/1inch-community/interface/commit/022ef65a052fcaf33973ec6ec15018d4a1e86350))
* **models:** add `value` property to IBigFloat interface ([a9f0790](https://github.com/1inch-community/interface/commit/a9f07907ed9883c6ac2adf1859463a30be99edae))
* **models:** add FusionPlusQuoteReceiveDto and related types ([4ce1013](https://github.com/1inch-community/interface/commit/4ce10130b118bc0ee833192866d5776183535b5e))
* **models:** update token interfaces and add new query filters ([2860d92](https://github.com/1inch-community/interface/commit/2860d92acb31d18bbd9ddda241c1d5ae93575168))
* **schedule:** enhance `Schedule` decorator with async support ([1d9ee6e](https://github.com/1inch-community/interface/commit/1d9ee6e439abf76ac920e11b7c909af19743bf53))
* **sdk:** enhance proxy handling and introduce scheduling logic ([5ed2381](https://github.com/1inch-community/interface/commit/5ed2381374bb54e62dd2f847f193791df9de1337))
* **ui-components, widgets:** add reusable components for animation and inputs ([18ca2f2](https://github.com/1inch-community/interface/commit/18ca2f29821401fb1ebc683a1492a5aafdab2463))
* **ui-components:** add LoaderSkeletonMaskElement component ([0713f3f](https://github.com/1inch-community/interface/commit/0713f3fe3fd7f338f2cec7163db42678d0b84bcf))
* **ui-components:** add scroll-view-paginator-consumer component ([89b6a38](https://github.com/1inch-community/interface/commit/89b6a3810905459783b85750a9bc3f34b5773742))


### BREAKING CHANGES

* **swap-form:** Removed `balance` and `fiat-balance` components, replaced by unified balance calculation logic. Update usage accordingly.
* **number-animation:** This refactor introduces a new reactive data flow, potentially impacting custom implementations depending on the old structure.
* **button:** The `button` component now utilizes `dispatchUiFallback` instead of `vibrate`. Consumers relying on the `vibrate` behavior should update their implementations accordingly.
* **math:** BigMath utility has been removed; migrate to BigFloat or other alternatives.
* **swap:** The migration to `BigFloat` changes the type of token amount-related methods and values, which might break compatibility with existing implementations relying on `bigint`.
* **api:** This change modifies the `getQuote` and related methods,
potentially affecting current integrations.

# [1.0.0-rc.10](https://github.com/1inch-community/interface/compare/v1.0.0-rc.9...v1.0.0-rc.10) (2025-05-06)


### Bug Fixes

* **number-animation:** add non-breaking space before postfix symbol ([6ef9968](https://github.com/1inch-community/interface/commit/6ef99683f6ca21800f9017f895297ae42852981f))
* **swap-form:** adjust maxHeight for selectToken scene ([0274c11](https://github.com/1inch-community/interface/commit/0274c111e578d3acfe1ec60270ba6db11277237a))
* **token-balance:** include symbol in tooltip for balance ([f2d0c90](https://github.com/1inch-community/interface/commit/f2d0c903026b93636143eebb5dfa4249af686545))
* **token-list:** remove leftover debugger statement ([326d1e9](https://github.com/1inch-community/interface/commit/326d1e978003cad63fffebc1b669c5ba22eac30e))
* **token-storage:** remove leftover debugger statement ([bca76b4](https://github.com/1inch-community/interface/commit/bca76b4ff1fbcc34d95c4c71f7ef9376e644d966))
* **wallet-manager:** disconnect wallets ([916238e](https://github.com/1inch-community/interface/commit/916238e3235bbb9307758bcddfb94c93575e83c2))
* **wallet-manager:** don't wait finish animation when change scene ([4d9ea9c](https://github.com/1inch-community/interface/commit/4d9ea9ca41b13d9582e6fb9f82d255afc1ea8ded))
* **wallet-manager:** merge with dev ([8412f4e](https://github.com/1inch-community/interface/commit/8412f4ebba50434cf00a14cd15af1434133be99d))
* **wallet-manager:** qrcode ui improvements ([b450f0a](https://github.com/1inch-community/interface/commit/b450f0af20fa248c7fc2b969e85011059f9f555a))
* **wallet-manager:** re-select active account ([fc6ce11](https://github.com/1inch-community/interface/commit/fc6ce112ac4c055b995d7cb0accede37eeb50eb7))
* **wallet-manager:** show native wallet-connect modal on mobile ([1fab9f4](https://github.com/1inch-community/interface/commit/1fab9f48324779ccee5e9f563bd5278b1bbad9cb))
* **wallet-manager:** support implementation by IWallet interface ([7d1c5b0](https://github.com/1inch-community/interface/commit/7d1c5b0a87c5c5e68b44d5fec7cc7a963f56abfb))
* **wallet-manager:** ui fixes ([aad5700](https://github.com/1inch-community/interface/commit/aad57004c81832ae93f6651be55da789dfe204c0))
* **wallet-manager:** ui improvements ([7074c67](https://github.com/1inch-community/interface/commit/7074c6746438edda68397cc964ed0a9ee85dd7d4))
* **wallet-manager:** ui improvements. ([40851c1](https://github.com/1inch-community/interface/commit/40851c1667db24a66393c89a83718dca1efddd5e))


### Code Refactoring

* **tokens:** improve token handling and update emitter logic ([2bc263e](https://github.com/1inch-community/interface/commit/2bc263e89fe1060a0b5076a5805d5be0e30229cf))


### Features

* **balance-view:** add wallet connection check and skeleton delay ([f44ac38](https://github.com/1inch-community/interface/commit/f44ac385e9799bc44ebce1dac5db170244808e94))
* **dapp:** add constant for Cloudflare Turnstile key in vite config ([f29c54a](https://github.com/1inch-community/interface/commit/f29c54a9e431020e75b58dd7d25581ace353b3fd))
* **swap:** fusion plus swap strategy (WIP) ([976043b](https://github.com/1inch-community/interface/commit/976043b6f0b61af139f5e8e42e6f5787c1731054))
* **swap:** fusion swap strategy (WIP) ([cc6972c](https://github.com/1inch-community/interface/commit/cc6972c9c2da61e286ff0959f35ce110dbc43bb3))
* **swap:** fusion swap strategy (WIP) ([fa81ad0](https://github.com/1inch-community/interface/commit/fa81ad01c7903b6f402a8a172df5ecbbe74c25e6))
* **swap:** fusion+/fusion code improvements. ([d584dbf](https://github.com/1inch-community/interface/commit/d584dbfe08e1eb58730394417519b0d417ea7e67))
* **theme:** enhance scrollbar styling in scrollbar.style.ts ([4ae6383](https://github.com/1inch-community/interface/commit/4ae6383bccd17bfa7b64ba586a7a6352542535be))
* **token-list:** add support for skeleton animation delay by index ([a319adc](https://github.com/1inch-community/interface/commit/a319adc9246ed3c48aa5f714ce93767d7f961bf9))
* **tooltip:** add hover check to openTooltip for better control ([55bcd42](https://github.com/1inch-community/interface/commit/55bcd42af479191ce71dce294a03513a0ed07108))
* **wallet-manager:** custom qr-code page ([c428ec1](https://github.com/1inch-community/interface/commit/c428ec144fc1eef9e4ed60a56842f79e848b3fd2))
* **wallet-manager:** disconnect view ([a2a204c](https://github.com/1inch-community/interface/commit/a2a204c55dbec5a0a177419bd262d6619c93ea44))
* **wallet-manager:** disconnect view (WIP) ([dbd9ce2](https://github.com/1inch-community/interface/commit/dbd9ce2efe721aafbc9040d137cdae3a3373399b))
* **wallet-manager:** redesign (WIP) ([f0c8174](https://github.com/1inch-community/interface/commit/f0c817460a40d98677e961bc95de85f0251f529f))


### BREAKING CHANGES

* **tokens:** Update emitters no longer include the `crossChainTokensBinding` key. Ensure your code aligns with the updated type definitions.

# [1.0.0-rc.9](https://github.com/1inch-community/interface/compare/v1.0.0-rc.8...v1.0.0-rc.9) (2025-04-25)


### Features

* **wallet:** update createClient type and upgrade viem dependency ([5a83852](https://github.com/1inch-community/interface/commit/5a8385206a99f99341c1dc7e9a1b85e206698ede))

# [1.0.0-rc.8](https://github.com/1inch-community/interface/compare/v1.0.0-rc.7...v1.0.0-rc.8) (2025-04-25)


### Bug Fixes

* **transport:** simplify getRPC import in web-fallback ([3d9e901](https://github.com/1inch-community/interface/commit/3d9e9016c4affd52a2ef7008093b3eb985d85730))

# [1.0.0-rc.7](https://github.com/1inch-community/interface/compare/v1.0.0-rc.6...v1.0.0-rc.7) (2025-04-25)


### Bug Fixes

* **chain.manager:** correct block comparison logic in distinctUntilChanged ([b440691](https://github.com/1inch-community/interface/commit/b44069196a16afeccd54009bf82f0c096189205a))
* **package.json:** add access field to publishConfig for packages ([3baa22e](https://github.com/1inch-community/interface/commit/3baa22e3f24985a9865f540af9d6d20542da55e8))
* **swap-form, token-storage:** remove debugger and update method signature ([9a42d36](https://github.com/1inch-community/interface/commit/9a42d36764e15b8fb083b87ebb3ab887828b7831))


### Code Refactoring

* **models:** enhance overlay and token controller typings ([4bdef77](https://github.com/1inch-community/interface/commit/4bdef77024eff61f06c59cb7227b00c9c22a24ef))
* **models:** remove and update favorite token management ([78332de](https://github.com/1inch-community/interface/commit/78332de1998f21eee8019743a91180268e6e0eee))
* **token-list:** restructure and optimize token list components ([207384d](https://github.com/1inch-community/interface/commit/207384d9db710b5793401db388367efc60f80c27))
* **tokens:** standardize token address casing and update filters ([88dfc3a](https://github.com/1inch-community/interface/commit/88dfc3a436d9ef4445ab73a3b4020d63e2a7382f))


### Features

* **balance-view:** add WalletTotalFiatBalanceElement ([e084e9a](https://github.com/1inch-community/interface/commit/e084e9aacb19ba9b15d43e37956df59d9069e530))
* **core:** add observeMutations utility function ([7725c7b](https://github.com/1inch-community/interface/commit/7725c7b5a1328dcd116209a36d9adfdce9186304))
* **decorators:** add debounceTime function ([f71648f](https://github.com/1inch-community/interface/commit/f71648f5bba2e428efd00afa857769ce4d27b439))
* **loader-spinner:** improve styling and add dynamic loader toggle ([09dfeaa](https://github.com/1inch-community/interface/commit/09dfeaaf7aee55ee81ba79af12b6733348b35c85))
* **shared-elements:** add tooltip and animation support ([903e841](https://github.com/1inch-community/interface/commit/903e8411e87c0f1220efa86adbb8b3fc3caf0483))
* **swap-form:** add auto mode support for wallet overlay ([f59a9d6](https://github.com/1inch-community/interface/commit/f59a9d691a5515ad3f00e62baad78979879474c7))
* **token-list:** add support for favorite tokens display ([e86183f](https://github.com/1inch-community/interface/commit/e86183fe27e81c06ac0d8e7e22abfe74adf81044))
* **tokens:** add favorite tokens management ([773bbd1](https://github.com/1inch-community/interface/commit/773bbd12ea19074292e1ba62b446d6c6e518cc60))
* **tokens:** add support for `tokensOnlyWithBalance` filter ([76233e9](https://github.com/1inch-community/interface/commit/76233e9f9a84c31637462bb86333f21da1ca32f7))
* **ui-components:** enhance popup positioning and add number animation ([5679051](https://github.com/1inch-community/interface/commit/5679051d033f295dcbac2ea7692e35a20d6818aa))


### BREAKING CHANGES

* **shared-elements:** Updated method signatures requiring adjustments where balance or tooltip functionalities are used.
* **tokens:** Resets token database schema and updates APIs to require filter objects, which may impact existing integrations.
* **models:** Updated method signatures in `ITokenStorage` and refactored `OverlayViewConfig` typing, which may require updates to dependent code.
* **tokens:** Updated method signatures requiring updated query filter objects.
* **models:** Removes several favorite token-related methods and properties. This refactor impacts any code relying on previous favorite token management logic.
* **token-list:** Token list components have been restructured, affecting existing integrations.

# [1.0.0-rc.6](https://github.com/1inch-community/interface/compare/v1.0.0-rc.5...v1.0.0-rc.6) (2025-04-23)


### Bug Fixes

* disconnect wallet. ([3cec627](https://github.com/1inch-community/interface/commit/3cec6276c209db64c9e5defc96eb733d4f9a97d4))

# [1.0.0-rc.5](https://github.com/1inch-community/interface/compare/v1.0.0-rc.4...v1.0.0-rc.5) (2025-04-18)


### Bug Fixes

* code imporovements ([e5ff898](https://github.com/1inch-community/interface/commit/e5ff898cc5f0e79399bf388ebc87a84f243fba25))
* ui imporovements ([3d5b67e](https://github.com/1inch-community/interface/commit/3d5b67e4efe202d275af3dd82bf5293720459d9f))
* ui improvements ([587293a](https://github.com/1inch-community/interface/commit/587293aef946382fa0270b8da74d6db164fbedc2))


### Features

* wallet account widget (WIP) ([ebb4630](https://github.com/1inch-community/interface/commit/ebb46306a24cb401139416140b41fbc6d90eed2b))
* wallet account widget (WIP) ([fde21dc](https://github.com/1inch-community/interface/commit/fde21dc5d074f927b5c29da2bbed591f64556cfa))
* wallet account widget (WIP) ([7ab9150](https://github.com/1inch-community/interface/commit/7ab9150544e2b0e69f03df9f077bbad9995919f7))
* wallet account widget (WIP) ([acb0873](https://github.com/1inch-community/interface/commit/acb0873592dc50220548bcba799826956924c9f1))
* wallet account widget (WIP) ([49a4439](https://github.com/1inch-community/interface/commit/49a4439c6bfc9c49475be63a6838c2f213f75b6c))

# [1.0.0-rc.4](https://github.com/1inch-community/interface/compare/v1.0.0-rc.3...v1.0.0-rc.4) (2025-04-17)


### Features

* **overlay:** introduce z-index map for overlay components ([4baf9f2](https://github.com/1inch-community/interface/commit/4baf9f21dde7a38c6099ba3ea6d97db4b0d5c74b))
* **setup-environment:** update default Node.js version to 23 ([8b3e7bc](https://github.com/1inch-community/interface/commit/8b3e7bc057c96c03c1786a333efc1d4dcdf34cc9))

# [1.0.0-rc.3](https://github.com/1inch-community/interface/compare/v1.0.0-rc.2...v1.0.0-rc.3) (2025-04-15)


### Bug Fixes

* **core:** add error handling for undefined Turnstile siteKey ([e0aa339](https://github.com/1inch-community/interface/commit/e0aa339d78ad9736cce07b0f44bb362c7d9f65ec))
* **notifications-controller:** log errors with console.error ([aae136c](https://github.com/1inch-community/interface/commit/aae136cb0526bf4c6ba95b42a7b68e44b8e4f65f))
* **one-inch-dev-portal:** replace console.warn with console.error ([06006bc](https://github.com/1inch-community/interface/commit/06006bc672ec4b88b3d3dfa89b2e1691d8068ac7))
* **scene:** prevent pointer events during scene transitions ([31362cd](https://github.com/1inch-community/interface/commit/31362cd98acd94986305f8aff5e6002bf5f47007))
* **storage:** replace console.warn with console.error for error handling ([aea5c33](https://github.com/1inch-community/interface/commit/aea5c3351a842e995f74ca94073df5cd7a4304ad))
* **token-storage:** ensure database updates only if wallet is connected ([3066859](https://github.com/1inch-community/interface/commit/3066859d7350e8dcd4459721c5ce18a50a40f725))
* **transport:** remove leftover debugger statement ([0c1baeb](https://github.com/1inch-community/interface/commit/0c1baeb129325d6d6a815779476c683345f8341b))


### Code Refactoring

* **chain-selector:** simplify components and optimize overlays ([5158c02](https://github.com/1inch-community/interface/commit/5158c0229d56b441c18a392a0c836971c22954dd))
* **core:** reorganize lazy utilities into a dedicated module ([bcdea61](https://github.com/1inch-community/interface/commit/bcdea612422a0debcddd5da0c0be1fe93cd73db5))
* **overlay:** remove overlay-context and improve overlay controllers ([2349fe3](https://github.com/1inch-community/interface/commit/2349fe3f5c5e4e5707036ed07c764b4c43cea605))
* **scroll:** remove mainViewportContext and update context usage ([eafdb7a](https://github.com/1inch-community/interface/commit/eafdb7a8e01766d5b369d664397546153a3bd54a))
* **sdk:** update transport and RPC handling, streamline initialization ([8fb702b](https://github.com/1inch-community/interface/commit/8fb702be2940a7c1948af4d8c6a475419506ec3f))
* **select-token:** add token cross-chain item component ([d34cddf](https://github.com/1inch-community/interface/commit/d34cddf6868091f4286b57e44d5927b077040046))
* **tokens:** modularize token storage and improve TTL handling ([872351c](https://github.com/1inch-community/interface/commit/872351c7d090d40cc0d9925b079e05de0ec4ff34))
* **widget-context:** replace ApplicationContextToken with lazyAppContextConsumer ([c34fe4c](https://github.com/1inch-community/interface/commit/c34fe4cc358785f3994aef656ffd66f7b8ce5540))


### Features

* **api:** add token list for One Inch dev portal ([903286d](https://github.com/1inch-community/interface/commit/903286de2e7b1ad22b43bed97af509c195732df2))
* **api:** enhance cross-chain adapter with context and fallback logic ([090394a](https://github.com/1inch-community/interface/commit/090394a6f4d00bfa90104dcd8731dac2820f3dff))
* **application-context:** add overlay controller to interface ([9e094db](https://github.com/1inch-community/interface/commit/9e094dbde829720ea215c3f10a439f6303a9dc68))
* **card-header:** add `separator` and `mini` styles and properties ([65eaeec](https://github.com/1inch-community/interface/commit/65eaeec17fa612f5f5b3e9a79f91d0dd4f0b0380))
* **chain-selector, select-token:** improve chain filtering and UI ([5348c0d](https://github.com/1inch-community/interface/commit/5348c0d6ae6b06167920308212fc0df63cc041e3))
* **chain-selector:** add throttling to onClick handler ([341df0f](https://github.com/1inch-community/interface/commit/341df0f6c1d5afbe5d35a96599d4e8169600d5da))
* **core:** add overlay controller initialization in application context ([5fdcb50](https://github.com/1inch-community/interface/commit/5fdcb504fdd405202506489feafa97bb52efc415))
* **dapp:** integrate vite-plugin-ngrok for easier development ([bcbd56b](https://github.com/1inch-community/interface/commit/bcbd56b9218bacdc3d2790dff1c0c67326f507ae))
* **decorators:** add throttle decorator ([38eb5b1](https://github.com/1inch-community/interface/commit/38eb5b1f199fd347bf00c37a41e4bf04aed9c3a9))
* **integration-layer:** add overlayFactory for overlay handling ([8e2dc7f](https://github.com/1inch-community/interface/commit/8e2dc7f360bf94ca7e14025e2a8ee778caff4f8e))
* **models:** add chainCount to CrossChainTokensBindingRecord ([b1a8166](https://github.com/1inch-community/interface/commit/b1a8166d99f48828f495292d91b72afece0644b5))
* **models:** enhance overlay controller interface ([f5bbaff](https://github.com/1inch-community/interface/commit/f5bbaffeea738ac66ff00c7a8cb3167c92290723))
* **models:** extend type utilities and ILazyValue interface ([e6d89bd](https://github.com/1inch-community/interface/commit/e6d89bd7b6920f114dc00f8e7a05b0027f1c582e))
* **overlay:** add caching mechanism for open/close methods ([7d0a600](https://github.com/1inch-community/interface/commit/7d0a600bdbf5d3060b2e501c283094625affd53c))
* **scroll:** improve scroll behavior and add state management ([cb52bf7](https://github.com/1inch-community/interface/commit/cb52bf7151c7a17168a1121514e426c87137acd5))
* **theme:** add background overlay color and improve meta color handling ([eda1a55](https://github.com/1inch-community/interface/commit/eda1a55f4bc50feb128e76010ce99412e8057b8e))
* **token-controller:** add filtered symbol data retrieval method ([62733c3](https://github.com/1inch-community/interface/commit/62733c375916e8dcc29177c51f0a3d39bcdb7eff))
* **token:** add chain filtering for cross-chain token operations ([9df2185](https://github.com/1inch-community/interface/commit/9df2185fc5b3295a648346ec9b62e0afa6faa4a3))
* **tokens:** add chain filtering support in token queries ([17ff263](https://github.com/1inch-community/interface/commit/17ff263303cbe3853b0749da7bcf4f2880d82c99))
* **tokens:** enhance cross-chain token binding logic ([5492383](https://github.com/1inch-community/interface/commit/54923835c7c06c5f03c015ebb1279bd1d7f63026))


### BREAKING CHANGES

* **tokens:** Modifications to ICrossChainTokensBindingRecord and related schema may impact compatibility.
* **scroll:** `mainViewportContext` is no longer supported. Refactor dependent code accordingly.
* **widget-context:** The `ApplicationContextToken` is no longer used, which could impact components dependent on the previous implementation.
* **core:** lazy utilities must now be imported from the "core/lazy" module.
* **select-token:** Refactored token context to include chain filtering; API and
dependent components must be updated accordingly.
* **overlay:** Removed `overlayContext` dependency and changed the initialization of overlay controllers to require `targetFactory`.
* **tokens:** `getSymbolData` now requires `chainIds` as the first argument.
* **theme:** Asynchronous behavior added to `setBrowserMetaColorFilter`
and `setBrowserMetaColorColor`, which might affect existing implementations.
* **chain-selector:** Modifications in methods and component structure may require updates in dependent implementations.
* **chain-selector, select-token:** Changes to chain filtering require updates in dependent modules.
* **token-controller:** Refactored methods and components requiring updates
to align with the new filtering capabilities.
* **sdk:** Updated method signatures and transport initialization process. Adjust your integrations accordingly.
* **tokens:** Refactored token storage methods in schema, requiring
updates to integration logic with the controller.

# [1.0.0-rc.2](https://github.com/1inch-community/interface/compare/v1.0.0-rc.1...v1.0.0-rc.2) (2025-04-07)


### Bug Fixes

* chain icon border color ([b78cca9](https://github.com/1inch-community/interface/commit/b78cca93b6579c2137652d995273a2d931e1769b))
* **core:** correct property name in cache-active-promise decorator ([687f235](https://github.com/1inch-community/interface/commit/687f235bc0f6c5082d52334dfc02827c73f8529f))
* overlay id check ([b72901e](https://github.com/1inch-community/interface/commit/b72901e89f31b95a03c023840762823352678224))
* prettier ([a2c8670](https://github.com/1inch-community/interface/commit/a2c86706be0cdfd74f1520b49fe1527ce31bd2fa))
* remove unused hook ([fad7fdf](https://github.com/1inch-community/interface/commit/fad7fdf7445e12a82a07f0b74ce96d2aa6d5a6af))


### Code Refactoring

* **chain-selector:** simplify icon rendering logic ([a86e082](https://github.com/1inch-community/interface/commit/a86e08253d162ea5bb910233326b3aa39086bc0f))
* **overlay:** migrate and enhance overlay controller functionality ([591f10b](https://github.com/1inch-community/interface/commit/591f10ba9eddf9110e5d853619738eee2fd472bc))
* **token-storage:** remove unused methods and variables ([a967de6](https://github.com/1inch-community/interface/commit/a967de6b8a4a5b80527fe8fb0765c59093c31f87))
* **ui-components:** rename and enhance text to text-animate ([2cf833e](https://github.com/1inch-community/interface/commit/2cf833edd92aa0eb1318faf0cdf5f3683d543a82))
* **widgets:** unify `ChainViewInfo` and move to `@1inch-community/models` ([8281851](https://github.com/1inch-community/interface/commit/82818518e9d2276e3e41a82588694fc7d55bfcfd))


### Features

* chain default value ([fe6a27a](https://github.com/1inch-community/interface/commit/fe6a27a28b92be30b635ce5b3d4c7a4e38c1090d))
* ChainViewInfo[] -> ChainId[] ([73823f3](https://github.com/1inch-community/interface/commit/73823f3d1d409028d513ee5425778999c70e1d41))
* ChainViewInfo[] -> ChainId[] ([614f5e1](https://github.com/1inch-community/interface/commit/614f5e1cfecb96dc2f76f0c29fbe953b2855526e))
* currentColor attribute ([40a0b74](https://github.com/1inch-community/interface/commit/40a0b740649423aede1e1c318b1923a58f4b052e))
* mobile view ([bfee83a](https://github.com/1inch-community/interface/commit/bfee83a5589697b5f9f1a5306da2cd4b2678f9e8))
* remove inch-chain-selector from header and footer ([d3bb6d1](https://github.com/1inch-community/interface/commit/d3bb6d10a588bd37e61478e104d08f4dff3eb6fd))
* remove unused handlers ([f5a9833](https://github.com/1inch-community/interface/commit/f5a98330008719526ee7a063a99234c55c355d1a))
* selected chain list for chain selector element and event ([e49420c](https://github.com/1inch-community/interface/commit/e49420cfe021a2b160911e4e24907b65e20d85cb))
* **ui-components:** add new `inch-text` element for text transitions ([2d05783](https://github.com/1inch-community/interface/commit/2d05783b7b2dae075e2469c9abc8c9c36494385f))
* **widgets:** update chain-selector logic for network labels ([aa7174f](https://github.com/1inch-community/interface/commit/aa7174fc29105118b63115da32a39d9c1940dbdc))


### BREAKING CHANGES

* **overlay:** Updates to `IOverlayController` and overlay APIs necessitate migration to new configuration and usage models.
* **ui-components:** Replaces `inch-text` component with `inch-text-animate`. Consumers need to update their code to use the new tag and API.
* **widgets:** `ChainViewInfo` imports and structure have changed.
* **chain-selector:** The previous specific styles and logic for rendering chain icons based on capacity have been replaced with a dynamic calculation, requiring updates if dependent functionality relies on the old styles.
* **token-storage:** Removed `getZeroBalanceChainId` method from `token.schema`.

# 1.0.0-rc.1 (2025-04-01)


### Bug Fixes

* **core, dapp:** remove unused components and simplify Sentry config ([bb5a075](https://github.com/1inch-community/interface/commit/bb5a075d11438bd6d9af298227a87f0edec8878b))
* **deps:** update dependencies across multiple packages ([bdd457f](https://github.com/1inch-community/interface/commit/bdd457f30e9ced99bc93ed6a93ec8218863ad9c0))
* **package.json:** add --esm flag to update-version script ([d49747f](https://github.com/1inch-community/interface/commit/d49747fa9e0ad18a390c409c46f1d6bc5198485e))
* **package.json:** correct publish command for libraries ([2a8fca4](https://github.com/1inch-community/interface/commit/2a8fca4ca44fab09dadef90afff75a2d05dcf634))
* **package.json:** correct script file extension and version regression ([fb725e8](https://github.com/1inch-community/interface/commit/fb725e815e3ad704c25f61f5bd956d5b097741df))
* **package.json:** remove hardcoded version in update-version script ([5c708da](https://github.com/1inch-community/interface/commit/5c708da3ee0e831367b4f13578126ace5edab036))
* **package.json:** update ts-node command for update-version script ([e7c1d64](https://github.com/1inch-community/interface/commit/e7c1d64481684f6620a815781c3d60b62a5e4bc8))
* **scripts:** add ES module flag to update-version script ([4389a25](https://github.com/1inch-community/interface/commit/4389a25dd001e6eea42565833be0c2e97cd2b30d))
* streamline and update methods; improve consistency ([700b350](https://github.com/1inch-community/interface/commit/700b3502d3b21ca11b215e41c08d5179b1cdf7db))
* **workflows:** add condition to deploy step in dev-pipeline ([acdff22](https://github.com/1inch-community/interface/commit/acdff22e629732bd648a05decb81e8180b134d24))
* **workflows:** update dev-pipeline permissions to include issues ([a741f27](https://github.com/1inch-community/interface/commit/a741f27456b975821ed67e8a1a4fc749c4675366))
* **workflows:** update publish script to use publish:libs:all ([b988ec8](https://github.com/1inch-community/interface/commit/b988ec891565d8dc4bc7da8bbf1826a474d0506a))


### chore

* **release:** bump version to 1.0.1 and update configurations ([6c27a2a](https://github.com/1inch-community/interface/commit/6c27a2a59ff7746344520936c58b49dfc2029a90))
* **release:** bump versions to 1.1.1 across packages ([55ee0a3](https://github.com/1inch-community/interface/commit/55ee0a31bd03809730076da3ea0f985cbd2092ea))


### Code Refactoring

* **packages:** reset versions to 1.0.0 and update publish scripts ([2136434](https://github.com/1inch-community/interface/commit/213643466f3479696d1f24a656e0810c3d782441))


### Features

* **actions:** update default Node.js version to 22 ([61b07e2](https://github.com/1inch-community/interface/commit/61b07e2ed5f654881be538be0da3009872e12f4f))
* **actions:** update default pnpm version to 10 ([2deb32d](https://github.com/1inch-community/interface/commit/2deb32d812da46ac6fce7dc8a3454ccc68b57f77))
* **actions:** update default pnpm version to 10.6.0 ([a4dc7a1](https://github.com/1inch-community/interface/commit/a4dc7a1cd6362678a4af0be8dfe998ca44778b31))
* chain selector refactor ([87b7770](https://github.com/1inch-community/interface/commit/87b77706de4899f8a1ea8443b103ba6a6215ce2e))
* **ci:** add publish script and NPM_TOKEN to pipeline ([75974b5](https://github.com/1inch-community/interface/commit/75974b57c895417cfc778076071c3ca0769eae8f))
* **libs:** add README documentation for core libraries ([c644fe5](https://github.com/1inch-community/interface/commit/c644fe5da8a7ab90c341390d0620cc0813ee2e31))
* **overlay:** enhance overlay positioning and add close button ([69245ce](https://github.com/1inch-community/interface/commit/69245ce7c4b740d7048abc0dadf83f04c5529856))
* **releaserc:** enable alpha prerelease configuration ([8586ab1](https://github.com/1inch-community/interface/commit/8586ab135cd0b7a1f2c019f0b0d31507e61f1e7c))


### BREAKING CHANGES

* **overlay:** Updated `OverlayController` constructor to accept a target factory function instead of direct target elements.
* **core, dapp:** Removed `inch-chain-selector` from header and footer components.
* Certain method signatures and expected parameters have been modified across modules.
* **release:** Unified version updates might impact dependency resolutions and CI/CD workflows.
* **packages:** Packages now have a unified version reset to 1.0.0 which might affect dependency resolutions.
* **release:** Adjusted release process and project structures, which may impact CI/CD workflows and package publishing.

# 1.0.0-dev.1 (2025-04-01)


### Bug Fixes

* **core, dapp:** remove unused components and simplify Sentry config ([bb5a075](https://github.com/1inch-community/interface/commit/bb5a075d11438bd6d9af298227a87f0edec8878b))
* **deps:** update dependencies across multiple packages ([bdd457f](https://github.com/1inch-community/interface/commit/bdd457f30e9ced99bc93ed6a93ec8218863ad9c0))
* **package.json:** add --esm flag to update-version script ([d49747f](https://github.com/1inch-community/interface/commit/d49747fa9e0ad18a390c409c46f1d6bc5198485e))
* **package.json:** correct publish command for libraries ([2a8fca4](https://github.com/1inch-community/interface/commit/2a8fca4ca44fab09dadef90afff75a2d05dcf634))
* **package.json:** correct script file extension and version regression ([fb725e8](https://github.com/1inch-community/interface/commit/fb725e815e3ad704c25f61f5bd956d5b097741df))
* **package.json:** remove hardcoded version in update-version script ([5c708da](https://github.com/1inch-community/interface/commit/5c708da3ee0e831367b4f13578126ace5edab036))
* **package.json:** update ts-node command for update-version script ([e7c1d64](https://github.com/1inch-community/interface/commit/e7c1d64481684f6620a815781c3d60b62a5e4bc8))
* **scripts:** add ES module flag to update-version script ([4389a25](https://github.com/1inch-community/interface/commit/4389a25dd001e6eea42565833be0c2e97cd2b30d))
* streamline and update methods; improve consistency ([700b350](https://github.com/1inch-community/interface/commit/700b3502d3b21ca11b215e41c08d5179b1cdf7db))
* **workflows:** add condition to deploy step in dev-pipeline ([acdff22](https://github.com/1inch-community/interface/commit/acdff22e629732bd648a05decb81e8180b134d24))
* **workflows:** update dev-pipeline permissions to include issues ([a741f27](https://github.com/1inch-community/interface/commit/a741f27456b975821ed67e8a1a4fc749c4675366))
* **workflows:** update publish script to use publish:libs:all ([b988ec8](https://github.com/1inch-community/interface/commit/b988ec891565d8dc4bc7da8bbf1826a474d0506a))


### chore

* **release:** bump version to 1.0.1 and update configurations ([6c27a2a](https://github.com/1inch-community/interface/commit/6c27a2a59ff7746344520936c58b49dfc2029a90))
* **release:** bump versions to 1.1.1 across packages ([55ee0a3](https://github.com/1inch-community/interface/commit/55ee0a31bd03809730076da3ea0f985cbd2092ea))


### Code Refactoring

* **packages:** reset versions to 1.0.0 and update publish scripts ([2136434](https://github.com/1inch-community/interface/commit/213643466f3479696d1f24a656e0810c3d782441))


### Features

* **actions:** update default Node.js version to 22 ([61b07e2](https://github.com/1inch-community/interface/commit/61b07e2ed5f654881be538be0da3009872e12f4f))
* **actions:** update default pnpm version to 10 ([2deb32d](https://github.com/1inch-community/interface/commit/2deb32d812da46ac6fce7dc8a3454ccc68b57f77))
* **actions:** update default pnpm version to 10.6.0 ([a4dc7a1](https://github.com/1inch-community/interface/commit/a4dc7a1cd6362678a4af0be8dfe998ca44778b31))
* chain selector refactor ([87b7770](https://github.com/1inch-community/interface/commit/87b77706de4899f8a1ea8443b103ba6a6215ce2e))
* **ci:** add publish script and NPM_TOKEN to pipeline ([75974b5](https://github.com/1inch-community/interface/commit/75974b57c895417cfc778076071c3ca0769eae8f))
* **libs:** add README documentation for core libraries ([c644fe5](https://github.com/1inch-community/interface/commit/c644fe5da8a7ab90c341390d0620cc0813ee2e31))
* **overlay:** enhance overlay positioning and add close button ([69245ce](https://github.com/1inch-community/interface/commit/69245ce7c4b740d7048abc0dadf83f04c5529856))
* **releaserc:** enable alpha prerelease configuration ([8586ab1](https://github.com/1inch-community/interface/commit/8586ab135cd0b7a1f2c019f0b0d31507e61f1e7c))


### BREAKING CHANGES

* **overlay:** Updated `OverlayController` constructor to accept a target factory function instead of direct target elements.
* **core, dapp:** Removed `inch-chain-selector` from header and footer components.
* Certain method signatures and expected parameters have been modified across modules.
* **release:** Unified version updates might impact dependency resolutions and CI/CD workflows.
* **packages:** Packages now have a unified version reset to 1.0.0 which might affect dependency resolutions.
* **release:** Adjusted release process and project structures, which may impact CI/CD workflows and package publishing.

# [1.0.0-alpha.8](https://github.com/1inch-community/interface/compare/v1.0.0-alpha.7...v1.0.0-alpha.8) (2025-03-28)


### Features

* chain selector refactor ([87b7770](https://github.com/1inch-community/interface/commit/87b77706de4899f8a1ea8443b103ba6a6215ce2e))

# [1.0.0-alpha.7](https://github.com/1inch-community/interface/compare/v1.0.0-alpha.6...v1.0.0-alpha.7) (2025-03-20)


### Features

* **overlay:** enhance overlay positioning and add close button ([69245ce](https://github.com/1inch-community/interface/commit/69245ce7c4b740d7048abc0dadf83f04c5529856))


### BREAKING CHANGES

* **overlay:** Updated `OverlayController` constructor to accept a target factory function instead of direct target elements.

# [1.0.0-alpha.6](https://github.com/1inch-community/interface/compare/v1.0.0-alpha.5...v1.0.0-alpha.6) (2025-03-20)


### Bug Fixes

* **workflows:** add condition to deploy step in dev-pipeline ([acdff22](https://github.com/1inch-community/interface/commit/acdff22e629732bd648a05decb81e8180b134d24))

# [1.0.0-alpha.5](https://github.com/1inch-community/interface/compare/v1.0.0-alpha.4...v1.0.0-alpha.5) (2025-03-20)


### Bug Fixes

* **core, dapp:** remove unused components and simplify Sentry config ([bb5a075](https://github.com/1inch-community/interface/commit/bb5a075d11438bd6d9af298227a87f0edec8878b))
* **deps:** update dependencies across multiple packages ([bdd457f](https://github.com/1inch-community/interface/commit/bdd457f30e9ced99bc93ed6a93ec8218863ad9c0))
* streamline and update methods; improve consistency ([700b350](https://github.com/1inch-community/interface/commit/700b3502d3b21ca11b215e41c08d5179b1cdf7db))


### BREAKING CHANGES

* **core, dapp:** Removed `inch-chain-selector` from header and footer components.
* Certain method signatures and expected parameters have been modified across modules.

# [1.0.0-alpha.4](https://github.com/1inch-community/interface/compare/v1.0.0-alpha.3...v1.0.0-alpha.4) (2025-03-13)

### Features

- **libs:** add README documentation for core libraries
  ([c644fe5](https://github.com/1inch-community/interface/commit/c644fe5da8a7ab90c341390d0620cc0813ee2e31))

# [1.0.0-alpha.3](https://github.com/1inch-community/interface/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2025-03-13)

### Bug Fixes

- **package.json:** remove hardcoded version in update-version script
  ([5c708da](https://github.com/1inch-community/interface/commit/5c708da3ee0e831367b4f13578126ace5edab036))

# [1.0.0-alpha.2](https://github.com/1inch-community/interface/compare/v1.0.0-alpha.1...v1.0.0-alpha.2) (2025-03-13)

### Bug Fixes

- **workflows:** update dev-pipeline permissions to include issues
  ([a741f27](https://github.com/1inch-community/interface/commit/a741f27456b975821ed67e8a1a4fc749c4675366))

# 1.0.0-alpha.1 (2025-03-13)

### Bug Fixes

- **package.json:** add --esm flag to update-version script
  ([d49747f](https://github.com/1inch-community/interface/commit/d49747fa9e0ad18a390c409c46f1d6bc5198485e))
- **package.json:** correct publish command for libraries
  ([2a8fca4](https://github.com/1inch-community/interface/commit/2a8fca4ca44fab09dadef90afff75a2d05dcf634))
- **package.json:** correct script file extension and version regression
  ([fb725e8](https://github.com/1inch-community/interface/commit/fb725e815e3ad704c25f61f5bd956d5b097741df))
- **package.json:** update ts-node command for update-version script
  ([e7c1d64](https://github.com/1inch-community/interface/commit/e7c1d64481684f6620a815781c3d60b62a5e4bc8))
- **scripts:** add ES module flag to update-version script
  ([4389a25](https://github.com/1inch-community/interface/commit/4389a25dd001e6eea42565833be0c2e97cd2b30d))
- **workflows:** update publish script to use publish:libs:all
  ([b988ec8](https://github.com/1inch-community/interface/commit/b988ec891565d8dc4bc7da8bbf1826a474d0506a))

### chore

- **release:** bump version to 1.0.1 and update configurations
  ([6c27a2a](https://github.com/1inch-community/interface/commit/6c27a2a59ff7746344520936c58b49dfc2029a90))
- **release:** bump versions to 1.1.1 across packages
  ([55ee0a3](https://github.com/1inch-community/interface/commit/55ee0a31bd03809730076da3ea0f985cbd2092ea))

### Code Refactoring

- **packages:** reset versions to 1.0.0 and update publish scripts
  ([2136434](https://github.com/1inch-community/interface/commit/213643466f3479696d1f24a656e0810c3d782441))

### Features

- **actions:** update default Node.js version to 22
  ([61b07e2](https://github.com/1inch-community/interface/commit/61b07e2ed5f654881be538be0da3009872e12f4f))
- **actions:** update default pnpm version to 10
  ([2deb32d](https://github.com/1inch-community/interface/commit/2deb32d812da46ac6fce7dc8a3454ccc68b57f77))
- **actions:** update default pnpm version to 10.6.0
  ([a4dc7a1](https://github.com/1inch-community/interface/commit/a4dc7a1cd6362678a4af0be8dfe998ca44778b31))
- **ci:** add publish script and NPM_TOKEN to pipeline
  ([75974b5](https://github.com/1inch-community/interface/commit/75974b57c895417cfc778076071c3ca0769eae8f))
- **releaserc:** enable alpha prerelease configuration
  ([8586ab1](https://github.com/1inch-community/interface/commit/8586ab135cd0b7a1f2c019f0b0d31507e61f1e7c))

### BREAKING CHANGES

- **release:** Unified version updates might impact dependency resolutions and CI/CD workflows.
- **packages:** Packages now have a unified version reset to 1.0.0 which might affect dependency
  resolutions.
- **release:** Adjusted release process and project structures, which may impact CI/CD workflows and
  package publishing.

# [1.0.0-dev.59](https://github.com/1inch-community/interface/compare/v1.0.0-dev.58...v1.0.0-dev.59) (2025-03-07)

### Bug Fixes

- Update Electron build command to target all platforms
  ([4530cbb](https://github.com/1inch-community/interface/commit/4530cbb0397ee4c2a93dda13111d88e63fc0a83a))

# [1.0.0-dev.58](https://github.com/1inch-community/interface/compare/v1.0.0-dev.57...v1.0.0-dev.58) (2025-03-07)

### Bug Fixes

- Fix command sequence in Electron app build process
  ([cd7cfd4](https://github.com/1inch-community/interface/commit/cd7cfd496e0aaa0c405c8d053925eaf46459125b))

### Features

- Refactor logging and settings management
  ([844900f](https://github.com/1inch-community/interface/commit/844900fabd6b86843af553552af470eb372e2c17))

# [1.0.0-dev.57](https://github.com/1inch-community/interface/compare/v1.0.0-dev.56...v1.0.0-dev.57) (2025-03-05)

### Bug Fixes

- Enhance caching to include Electron binaries
  ([4a29fe4](https://github.com/1inch-community/interface/commit/4a29fe408a3382826cc59c7d4e42ae30faa6ab49))

# [1.0.0-dev.56](https://github.com/1inch-community/interface/compare/v1.0.0-dev.55...v1.0.0-dev.56) (2025-03-05)

### Features

- Use caching for Electron dependencies in CI pipeline
  ([10582e5](https://github.com/1inch-community/interface/commit/10582e5ab89c088c7b81a47ee241178ee2994525))

# [1.0.0-dev.55](https://github.com/1inch-community/interface/compare/v1.0.0-dev.54...v1.0.0-dev.55) (2025-03-05)

### Bug Fixes

- Refactor WalletConnect storage handling and increase chunk size limit
  ([6727b8a](https://github.com/1inch-community/interface/commit/6727b8ad090f578e8bbfd8e4d2b10ab43ed98c16))
- Update @semantic-release/commit-analyzer to exact version
  ([7a3517f](https://github.com/1inch-community/interface/commit/7a3517f3dbaf6bc84ba0bf088dbd91dcb70776ed))
- Update build command name for CI in project config
  ([14f19e0](https://github.com/1inch-community/interface/commit/14f19e0dc72415eb7299e184de5efe1ad967992d))
- Update build workflow and adjust pnpm-lock dotenv specifier
  ([e169b9c](https://github.com/1inch-community/interface/commit/e169b9c7b435c3450c9fb3e78987a947aa6de29d))
- Update build:cl to build:ci in project configuration
  ([704ed2f](https://github.com/1inch-community/interface/commit/704ed2f568735ded59dada22fdc713c1781035c3))
- Update dependencies in pnpm-lock.yaml
  ([df9a61e](https://github.com/1inch-community/interface/commit/df9a61ed979f9e50849c7bf0a8178e63b864fba3))
- Update release config to include NX reset in prepare steps
  ([96e3ae0](https://github.com/1inch-community/interface/commit/96e3ae0747c2e64392fdd3c46acae8ff5306af6e))
- Update workflow dependencies to improve job execution order
  ([d336045](https://github.com/1inch-community/interface/commit/d336045711901acffa81d5e225b81ce7ac2a849c))

### Features

- Add 'build:dev' target and reformat release configuration
  ([d2806fc](https://github.com/1inch-community/interface/commit/d2806fc18a9f7533894e78deff657f312372722b))
- Refactor build configuration for Electron and dApp projects
  ([322dc92](https://github.com/1inch-community/interface/commit/322dc9243bd7612554adb363beaf74173e07845a))
- Refactor environment handling and streamline build process
  ([6449187](https://github.com/1inch-community/interface/commit/644918744e7da1ff693a3b47ea2e3c8a9ec19f7b))
- release test 3
  ([8565e8f](https://github.com/1inch-community/interface/commit/8565e8f2fa5e9c09d0b7688b91b8ef3fc2db6aa8))

# [1.0.0-dev.54](https://github.com/1inch-community/interface/compare/v1.0.0-dev.53...v1.0.0-dev.54) (2025-03-05)

### Features

- release test 2
  ([c000d2a](https://github.com/1inch-community/interface/commit/c000d2aad0c94e73b7dde8e6fd510e7d19f2f2d1))

# [1.0.0-dev.53](https://github.com/1inch-community/interface/compare/v1.0.0-dev.52...v1.0.0-dev.53) (2025-03-05)

### Features

- release test 1
  ([0e28dbc](https://github.com/1inch-community/interface/commit/0e28dbc4e8668275535de2b00bd8f9102c333fce))

# [1.0.0-dev.52](https://github.com/1inch-community/interface/compare/v1.0.0-dev.51...v1.0.0-dev.52) (2025-03-05)

### Features

- Update build scripts and dependencies for Electron app
  ([75cdefc](https://github.com/1inch-community/interface/commit/75cdefc5e70bca28d726a01726cc7504379a0cc5))

# [1.0.0-dev.51](https://github.com/1inch-community/interface/compare/v1.0.0-dev.50...v1.0.0-dev.51) (2024-10-17)

### Bug Fixes

- Add Sentry initialization check and update dependencies
  ([bb93b45](https://github.com/1inch-community/interface/commit/bb93b4511ba1d1211ccf9cbded78f64c6d7f50a9))

# [1.0.0-dev.50](https://github.com/1inch-community/interface/compare/v1.0.0-dev.49...v1.0.0-dev.50) (2024-09-13)

### Bug Fixes

- Fix dependency specifier format for @sentry/types
  ([c0cf3a1](https://github.com/1inch-community/interface/commit/c0cf3a11a7b48d61bc82f354be9c284fa2d3aea0))
- Refactor SentryController and remove redundant imports
  ([9692c51](https://github.com/1inch-community/interface/commit/9692c51e6453ad8bed8e36f3bbfb6f724210efc6))

### Features

- Add Sentry integration
  ([2573e6f](https://github.com/1inch-community/interface/commit/2573e6fe3d6f3875a1c19da1039e6a51243f7aa2))

# [1.0.0-dev.49](https://github.com/1inch-community/interface/compare/v1.0.0-dev.48...v1.0.0-dev.49) (2024-09-11)

### Bug Fixes

- Update dependency versions in pnpm-lock.yaml
  ([6fa3002](https://github.com/1inch-community/interface/commit/6fa30024546c48027a220c7f31f387829a3004bc))

### Features

- Update dependencies in package.json
  ([4b50bf7](https://github.com/1inch-community/interface/commit/4b50bf75c8522a0f00af8faafc821546918ecfbc))

# [1.0.0-dev.48](https://github.com/1inch-community/interface/compare/v1.0.0-dev.47...v1.0.0-dev.48) (2024-08-23)

### Features

- Add skeleton loading animation to token list stub items
  ([72d3088](https://github.com/1inch-community/interface/commit/72d30885f9a6d3c37615febd7cb8a7b45cac20be))

# [1.0.0-dev.47](https://github.com/1inch-community/interface/compare/v1.0.0-dev.46...v1.0.0-dev.47) (2024-08-23)

### Bug Fixes

- prioritize **environment** values over env
  ([1972284](https://github.com/1inch-community/interface/commit/1972284ab212437c83d4bc2a0bf42ec5f105a2ee))

# [1.0.0-dev.46](https://github.com/1inch-community/interface/compare/v1.0.0-dev.45...v1.0.0-dev.46) (2024-08-21)

### Bug Fixes

- Refactor i18n initialization logic
  ([4c94a8b](https://github.com/1inch-community/interface/commit/4c94a8b3d01432e4a5407cb56d02d6656397c754))

# [1.0.0-dev.45](https://github.com/1inch-community/interface/compare/v1.0.0-dev.44...v1.0.0-dev.45) (2024-08-21)

### Bug Fixes

- Fix translations state management in i18n module
  ([7eb19c3](https://github.com/1inch-community/interface/commit/7eb19c37f0425a87bb24b927c1eeb2bb8debfd77))

# [1.0.0-dev.44](https://github.com/1inch-community/interface/compare/v1.0.0-dev.43...v1.0.0-dev.44) (2024-08-20)

### Bug Fixes

- Enhance translate directive and add logging in config
  ([1d9aa17](https://github.com/1inch-community/interface/commit/1d9aa17fc3dca693aa394a8f635caeab028fbefd))

# [1.0.0-dev.43](https://github.com/1inch-community/interface/compare/v1.0.0-dev.42...v1.0.0-dev.43) (2024-08-20)

### Bug Fixes

- Add skip minification directive and enhance minify logic
  ([0cbb73e](https://github.com/1inch-community/interface/commit/0cbb73e9bf1bd234824a21db078e4786cdf538e9))

# [1.0.0-dev.42](https://github.com/1inch-community/interface/compare/v1.0.0-dev.41...v1.0.0-dev.42) (2024-08-19)

### Bug Fixes

- Fix README links to module documentation
  ([3d10968](https://github.com/1inch-community/interface/commit/3d10968087ab6ab2f676cb5641b593c98d3f0c9d))
- Enable verbose output in dev-pipeline workflow
  ([882e995](https://github.com/1inch-community/interface/commit/882e9951d43091de5979ce86def5e2263574098a))
- Enhance font style handling in theme module
  ([f875044](https://github.com/1inch-community/interface/commit/f875044e7dd5e9aa701daabdba73e286e02eae69))

### Features

- Add embedded controller functionality
  ([0eacce4](https://github.com/1inch-community/interface/commit/0eacce4a219a5d128cafffff372e8f03a5cf36c9))
- Add EventEmitter integration to SwapForm controller
  ([acc89ba](https://github.com/1inch-community/interface/commit/acc89ba7ee9b588651417a8917024a44608afb06))
- Add initial Vue.js example project
  ([ea5ba69](https://github.com/1inch-community/interface/commit/ea5ba6908d98e05dbc3f68106c8f0e5cdbed480e))
- Add new React example app
  ([9c589f7](https://github.com/1inch-community/interface/commit/9c589f73aaf794f7e101c37edfe00a2ecc08b950))
- Add oneInchDevPortal parameter to examples
  ([5cb37fa](https://github.com/1inch-community/interface/commit/5cb37fa0bab6fd50847a894c28461c6537425807))
- Add step to clean NX cache in CI pipeline
  ([3120a77](https://github.com/1inch-community/interface/commit/3120a772817be768eb1513060f4e9ea15d3f82b5))
- Add support for 1inch Dev Portal token configuration
  ([b090644](https://github.com/1inch-community/interface/commit/b090644dbea2c0de2414cf13f8f8e621b879b031))
- Delete Vite config and improve codebase structure
  ([525f354](https://github.com/1inch-community/interface/commit/525f3544af4ac25ee53bac7e392a38a2118bfda8))
- Refactor context initialization and bump versions to 1.0.0
  ([23b99e8](https://github.com/1inch-community/interface/commit/23b99e88287ef581d26d946481659744d76d4e3d))
- Update example app READMEs with integration instructions
  ([12ee0db](https://github.com/1inch-community/interface/commit/12ee0db66e8d77007fa44ed0e6316120a7a58055))

# [1.0.0-dev.42](https://github.com/1inch-community/interface/compare/v1.0.0-dev.41...v1.0.0-dev.42) (2024-08-19)

### Bug Fixes

- Fix README links to module documentation
  ([3d10968](https://github.com/1inch-community/interface/commit/3d10968087ab6ab2f676cb5641b593c98d3f0c9d))
- Enable verbose output in dev-pipeline workflow
  ([882e995](https://github.com/1inch-community/interface/commit/882e9951d43091de5979ce86def5e2263574098a))

### Features

- Add embedded controller functionality
  ([0eacce4](https://github.com/1inch-community/interface/commit/0eacce4a219a5d128cafffff372e8f03a5cf36c9))
- Add EventEmitter integration to SwapForm controller
  ([acc89ba](https://github.com/1inch-community/interface/commit/acc89ba7ee9b588651417a8917024a44608afb06))
- Add initial Vue.js example project
  ([ea5ba69](https://github.com/1inch-community/interface/commit/ea5ba6908d98e05dbc3f68106c8f0e5cdbed480e))
- Add new React example app
  ([9c589f7](https://github.com/1inch-community/interface/commit/9c589f73aaf794f7e101c37edfe00a2ecc08b950))
- Add oneInchDevPortal parameter to examples
  ([5cb37fa](https://github.com/1inch-community/interface/commit/5cb37fa0bab6fd50847a894c28461c6537425807))
- Add step to clean NX cache in CI pipeline
  ([3120a77](https://github.com/1inch-community/interface/commit/3120a772817be768eb1513060f4e9ea15d3f82b5))
- Add support for 1inch Dev Portal token configuration
  ([b090644](https://github.com/1inch-community/interface/commit/b090644dbea2c0de2414cf13f8f8e621b879b031))
- Delete Vite config and improve codebase structure
  ([525f354](https://github.com/1inch-community/interface/commit/525f3544af4ac25ee53bac7e392a38a2118bfda8))
- Refactor context initialization and bump versions to 1.0.0
  ([23b99e8](https://github.com/1inch-community/interface/commit/23b99e88287ef581d26d946481659744d76d4e3d))
- Update example app READMEs with integration instructions
  ([12ee0db](https://github.com/1inch-community/interface/commit/12ee0db66e8d77007fa44ed0e6316120a7a58055))

# [1.0.0-dev.41](https://github.com/1inch-community/interface/compare/v1.0.0-dev.40...v1.0.0-dev.41) (2024-08-09)

### Bug Fixes

- Remove doubling of auction start and end amounts
  ([8c247b6](https://github.com/1inch-community/interface/commit/8c247b6081a23216b0131601595b86fc77c7907d))

# [1.0.0-dev.40](https://github.com/1inch-community/interface/compare/v1.0.0-dev.39...v1.0.0-dev.40) (2024-08-09)

### Bug Fixes

- add loader state and asyncTimeout
  ([0a983bf](https://github.com/1inch-community/interface/commit/0a983bffbd40a18c6d5a3e4f78073b185945eedc))

# [1.0.0-dev.39](https://github.com/1inch-community/interface/compare/v1.0.0-dev.38...v1.0.0-dev.39) (2024-08-07)

### Features

- Add new locales and enhance localization features
  ([47a052d](https://github.com/1inch-community/interface/commit/47a052de8569931e64687ffe8f69940b4304567b))
- Refactor Dexie integration and enhance notifications
  ([75f5ec4](https://github.com/1inch-community/interface/commit/75f5ec42009b95af81c71c709db2e184523e9720))

# [1.0.0-dev.38](https://github.com/1inch-community/interface/compare/v1.0.0-dev.37...v1.0.0-dev.38) (2024-07-24)

### Features

- Add settings functionality and related icons
  ([97fb008](https://github.com/1inch-community/interface/commit/97fb008e1a544323167e5b46ba41468aebb6ce71))

# [1.0.0-dev.37](https://github.com/1inch-community/interface/compare/v1.0.0-dev.36...v1.0.0-dev.37) (2024-07-22)

### Features

- added meta info in package.json libs
  ([a4ccc52](https://github.com/1inch-community/interface/commit/a4ccc52422569600bee73dd1c5ea2da22ca754aa))
- added npm lib release for test
  ([eec503c](https://github.com/1inch-community/interface/commit/eec503cd3d57dca017460f88f3d506228bd43989))
- added npm lib release for test 2
  ([6826616](https://github.com/1inch-community/interface/commit/6826616eb7de0c9f2c1e45af7f4ea99341fb2256))
- added npm lib release for test 3
  ([117e0cd](https://github.com/1inch-community/interface/commit/117e0cd1d23e534b57393e8b5a81717350c1f0c3))

# [1.0.0-dev.36](https://github.com/1inch-community/interface/compare/v1.0.0-dev.35...v1.0.0-dev.36) (2024-07-22)

### Bug Fixes

- Update dev-pipeline workflow dependencies
  ([a0a7cd1](https://github.com/1inch-community/interface/commit/a0a7cd18da7d9ad40d8262e45cf2d189ed087e5e))

# [1.0.0-dev.35](https://github.com/1inch-community/interface/compare/v1.0.0-dev.34...v1.0.0-dev.35) (2024-07-22)

### Bug Fixes

- Refactor import of BrandColors in swap-form elements
  ([116180f](https://github.com/1inch-community/interface/commit/116180ff48196e5abaf3af9250f90b56425648ab))

### Features

- Refactor code for better imports and update service worker registration
  ([1259c0f](https://github.com/1inch-community/interface/commit/1259c0f9744c07f5a38e2909dd7b3a89c82124b1))

# [1.0.0-dev.34](https://github.com/1inch-community/interface/compare/v1.0.0-dev.33...v1.0.0-dev.34) (2024-07-22)

### Features

- Refactor TokenController and application context usage
  ([102d44d](https://github.com/1inch-community/interface/commit/102d44d18873a89b55562ae817451f7115a27342))

# [1.0.0-dev.33](https://github.com/1inch-community/interface/compare/v1.0.0-dev.32...v1.0.0-dev.33) (2024-07-22)

### Bug Fixes

- fixed build
  ([411c4bc](https://github.com/1inch-community/interface/commit/411c4bc42baaee960ec422d72c818a6bdd750535))
- fixed lint
  ([f86799c](https://github.com/1inch-community/interface/commit/f86799ce893f01a7837e9be338a1e7bfd0fcbf67))

# [1.0.0-dev.32](https://github.com/1inch-community/interface/compare/v1.0.0-dev.31...v1.0.0-dev.32) (2024-07-22)

### Bug Fixes

- Optimize balance element's pipe operation
  ([7e96ef2](https://github.com/1inch-community/interface/commit/7e96ef23256593c72e84cea9c3b96c49e78eaa42))
- Update notification system and improve swap error handling
  ([22a1d24](https://github.com/1inch-community/interface/commit/22a1d24f24fb397d68502260b789a342424fa7df))

### Features

- Add mobile media match in notifications base container
  ([6d3c652](https://github.com/1inch-community/interface/commit/6d3c652e06269213a61c79965c1342a1aca7d97a))
- Add new bell icon and update notification functionalities
  ([1bd1108](https://github.com/1inch-community/interface/commit/1bd1108f87ce7f2c9c96061f3eb08f5eb343b2e5))
- **notifications:** added animation opening notification mobile view
  ([642fb38](https://github.com/1inch-community/interface/commit/642fb3814d8ee0d2544b16afb900828b8830bc34))
- **notifications:** added notification mobile view
  ([103e2e4](https://github.com/1inch-community/interface/commit/103e2e450da2ecaf4f51393ad5b3a6bab90d0177))
- **notifications:** completed implementation of notification view for the desktop view
  ([8af30d5](https://github.com/1inch-community/interface/commit/8af30d55cd264da75819626cb33cd9a66409eb3f))
- **notifications:** fixed notifications view bugs
  ([8328d67](https://github.com/1inch-community/interface/commit/8328d6729247223431fea949c353aa525532cd11))
- Redefine notification container behaviour and styles
  ([38c5ffc](https://github.com/1inch-community/interface/commit/38c5ffcdd6dd6960eb75586b9c3a1bb6542ce59d))
- Refactor swap-form element to improve readability and performance
  ([b2d248a](https://github.com/1inch-community/interface/commit/b2d248a70e8c3bbe7366c8ad1abe1a55cad37f11))
- Update interactive touch for mobile notifications
  ([d4dd87b](https://github.com/1inch-community/interface/commit/d4dd87b4077da4b8d773558403c7d708aa8494df))
- Update styles and interaction logic in Wallet and Notifications modules
  ([acb597a](https://github.com/1inch-community/interface/commit/acb597a65b98ee0aadd21d484363dd625988760f))

# [1.0.0-dev.31](https://github.com/1inch-community/interface/compare/v1.0.0-dev.30...v1.0.0-dev.31) (2024-07-04)

### Bug Fixes

- fixed remove empty test files
  ([8dcd541](https://github.com/1inch-community/interface/commit/8dcd54108203eca30af2943f846d19f0203a40c0))

# [1.0.0-dev.30](https://github.com/1inch-community/interface/compare/v1.0.0-dev.29...v1.0.0-dev.30) (2024-07-04)

### Bug Fixes

- builder config
  ([dbdf820](https://github.com/1inch-community/interface/commit/dbdf820518f16c198e7838c552485e1c7d0e99b8))

# [1.0.0-dev.29](https://github.com/1inch-community/interface/compare/v1.0.0-dev.28...v1.0.0-dev.29) (2024-07-03)

### Bug Fixes

- fixed card header style
  ([c7a5413](https://github.com/1inch-community/interface/commit/c7a541361c4a12eb26bd1a94a1a5a44ccf85218f))

# [1.0.0-dev.28](https://github.com/1inch-community/interface/compare/v1.0.0-dev.27...v1.0.0-dev.28) (2024-07-01)

### Bug Fixes

- change average block time
  ([a286ca4](https://github.com/1inch-community/interface/commit/a286ca484c156536bee2d4024f36f64f5e882b06))
- fixed manifest PWA
  ([d81187d](https://github.com/1inch-community/interface/commit/d81187ddaa013a797bd71fda43bbef8a4fa8615c))
- fixed various ui/ux bugs
  ([bd787c1](https://github.com/1inch-community/interface/commit/bd787c197d6542925f6ec272b686fba3e179a693))

### Features

- added confirm swap view
  ([bb3c336](https://github.com/1inch-community/interface/commit/bb3c336e106cc97f4fa8b8149326d3cc174bde76))
- added data updating by new block in swap button and swap balance view
  ([a7d0c32](https://github.com/1inch-community/interface/commit/a7d0c3228cc8daad78e0eef39ba7802c2d39e83a))
- added filtering by token balance before request to the devportal api
  ([0b3e728](https://github.com/1inch-community/interface/commit/0b3e728d353b1808435451618b69124396bfdeaf))
- added i18n system
  ([8c158ba](https://github.com/1inch-community/interface/commit/8c158bafc909d682bcc8baa5e264b4ab4947c0c9))
- added swap algorithm
  ([d94a032](https://github.com/1inch-community/interface/commit/d94a032b8c91141953d207a395bb75d13754c800))
- permit2
  ([f39b6e5](https://github.com/1inch-community/interface/commit/f39b6e56f074dd89f0170d399d2d8a552fd75119))
- permit2 and confirm swap view
  ([ec149ac](https://github.com/1inch-community/interface/commit/ec149ac7a6ee721b37efe331aebaec8d6db159cb))

# [1.0.0-dev.27](https://github.com/1inch-community/interface/compare/v1.0.0-dev.26...v1.0.0-dev.27) (2024-06-11)

### Features

- added PWA
  ([434cbd3](https://github.com/1inch-community/interface/commit/434cbd33777d3efa74587f9a1a5707eb4a7c7d99))
- **swap-form:** optimization ux in swap form
  ([95d3227](https://github.com/1inch-community/interface/commit/95d322776457f6e121613c400853c240ee4ddf9b))

# [1.0.0-dev.26](https://github.com/1inch-community/interface/compare/v1.0.0-dev.25...v1.0.0-dev.26) (2024-06-11)

### Features

- **swap-form:** added min receive view
  ([6b4a49d](https://github.com/1inch-community/interface/commit/6b4a49d0704cbd2976e635b982569bf1e9d6c4ba))
- **swap-form:** changed swap form logic work
  ([189ce4b](https://github.com/1inch-community/interface/commit/189ce4b4c0cb0bde1311b610567cbd1c3f8b79f2))

# [1.0.0-dev.25](https://github.com/1inch-community/interface/compare/v1.0.0-dev.24...v1.0.0-dev.25) (2024-06-10)

### Bug Fixes

- fixed style for ios safari
  ([86e7f3f](https://github.com/1inch-community/interface/commit/86e7f3f2bc62f744ae5a1bf567f378726ef04278))
- global fix scroll behavior
  ([5597585](https://github.com/1inch-community/interface/commit/5597585eb7fa04566c7981685677f75c1f58c135))

# [1.0.0-dev.24](https://github.com/1inch-community/interface/compare/v1.0.0-dev.23...v1.0.0-dev.24) (2024-06-07)

### Bug Fixes

- remove old code and fix scroll behavior
  ([98953cb](https://github.com/1inch-community/interface/commit/98953cbd0105f1c06ff26810bef335d3c54f4bf2))

# [1.0.0-dev.23](https://github.com/1inch-community/interface/compare/v1.0.0-dev.22...v1.0.0-dev.23) (2024-06-07)

### Bug Fixes

- **ui-component/overlay:** fixed event handling
  ([34f0eb6](https://github.com/1inch-community/interface/commit/34f0eb6e05416e679d854244b53504145c5efdef))

### Features

- **ui-component/overlay:** added background move when swipe
  ([6dcdf39](https://github.com/1inch-community/interface/commit/6dcdf39798abbcf31133b6e4cdc1dcf2e0cc9cc3))
- **ui-component/overlay:** optimization swap close logic
  ([13b3bf0](https://github.com/1inch-community/interface/commit/13b3bf09526d1414cf38a79b4034fa1f69533b31))

# [1.0.0-dev.22](https://github.com/1inch-community/interface/compare/v1.0.0-dev.21...v1.0.0-dev.22) (2024-06-06)

### Bug Fixes

- **ui-component/overlay:** fixed swipe closing
  ([ea7a2c0](https://github.com/1inch-community/interface/commit/ea7a2c0eb81f57cf62f3959b2f16bd1199e76587))

# [1.0.0-dev.21](https://github.com/1inch-community/interface/compare/v1.0.0-dev.20...v1.0.0-dev.21) (2024-06-06)

### Features

- **ui-component/overlay:** added closing overlay with a top-down gesture
  ([ca6d674](https://github.com/1inch-community/interface/commit/ca6d6745b81bfffd16bd7c6336472e593c16e3e5))

# [1.0.0-dev.20](https://github.com/1inch-community/interface/compare/v1.0.0-dev.19...v1.0.0-dev.20) (2024-06-06)

### Bug Fixes

- various small view fixes
  ([e9e6c6d](https://github.com/1inch-community/interface/commit/e9e6c6d5de03e0b51031f1f3f0352d8118e1dce8))

# [1.0.0-dev.19](https://github.com/1inch-community/interface/compare/v1.0.0-dev.18...v1.0.0-dev.19) (2024-06-06)

### Bug Fixes

- **ui-components/scroll:** fix calculation viewport size in desktop view
  ([e5b17a2](https://github.com/1inch-community/interface/commit/e5b17a2cc569ad965af092b29084a1906960b408))

### Features

- **widgets/select-token:** added token searching
  ([9317a8b](https://github.com/1inch-community/interface/commit/9317a8b5aecbdd1a4d5f4411b6a2af00cf12f207))

# [1.0.0-dev.18](https://github.com/1inch-community/interface/compare/v1.0.0-dev.17...v1.0.0-dev.18) (2024-06-06)

### Bug Fixes

- **widgets:** fix swap-form and select-token styles
  ([2e1b1bc](https://github.com/1inch-community/interface/commit/2e1b1bcaa81dd818019c3c10097b8196f4165366))

### Features

- **ui-components/overlay:** change overlay style
  ([f6e3c1f](https://github.com/1inch-community/interface/commit/f6e3c1f4a15e1d356378398f27a62c73c720eb23))

# [1.0.0-dev.17](https://github.com/1inch-community/interface/compare/v1.0.0-dev.16...v1.0.0-dev.17) (2024-06-06)

### Bug Fixes

- **widgets/swap-form:** fixed flexible style swap form view in mobile
  ([cde711a](https://github.com/1inch-community/interface/commit/cde711a706365190af9d558b2a254b00bddf0aee))

### Features

- **sdk:** added router v6 contract addresses
  ([8c09f86](https://github.com/1inch-community/interface/commit/8c09f8689e3c261691e4688f9ba7f00db99164e3))
- **widgets/swap-form:** added check chain in swap button
  ([c59dc44](https://github.com/1inch-community/interface/commit/c59dc44ab55e50e803f6e76341467c45b6395b51))

# [1.0.0-dev.16](https://github.com/1inch-community/interface/compare/v1.0.0-dev.15...v1.0.0-dev.16) (2024-06-05)

### Bug Fixes

- **dapp:** fixed swap form size in desktop version
  ([c7506d3](https://github.com/1inch-community/interface/commit/c7506d3790c54ab121d9095626d38b4e9a1399eb))
- **ui-components/overlay:** fixed mobile overlay view
  ([4bafe24](https://github.com/1inch-community/interface/commit/4bafe2455f16c9dcc60ec83ecf355b9afe6b67c4))
- **ui-components/scroll:** fixed virtual scroll view
  ([60bb84c](https://github.com/1inch-community/interface/commit/60bb84cc77da40e992dad3b4e90b9ca0c0d89e86))
- **widgets/swap-form:** fixed font size and view in mobile version
  ([20391ac](https://github.com/1inch-community/interface/commit/20391ac01666ef2bf552dd50c11c7162eefe20ca))

# [1.0.0-dev.15](https://github.com/1inch-community/interface/compare/v1.0.0-dev.14...v1.0.0-dev.15) (2024-06-05)

### Bug Fixes

- **lit:** fixed memory leak
  ([f389b29](https://github.com/1inch-community/interface/commit/f389b29c7884b4117aa80e8fb51a5ff81d63bf65))

# [1.0.0-dev.14](https://github.com/1inch-community/interface/compare/v1.0.0-dev.13...v1.0.0-dev.14) (2024-06-04)

### Features

- **select-token-widget:** added blur header
  ([f229c5c](https://github.com/1inch-community/interface/commit/f229c5ceae1f0d446fa8a857da21fe681983b724))

# [1.0.0-dev.13](https://github.com/1inch-community/interface/compare/v1.0.0-dev.12...v1.0.0-dev.13) (2024-06-04)

### Bug Fixes

- **select-token-widget:** fixed view
  ([76e635e](https://github.com/1inch-community/interface/commit/76e635e2ee0ae328721089a9ee9de8bb9c0edb50))

# [1.0.0-dev.12](https://github.com/1inch-community/interface/compare/v1.0.0-dev.11...v1.0.0-dev.12) (2024-06-04)

### Bug Fixes

- **dapp:** fix audio path
  ([3337518](https://github.com/1inch-community/interface/commit/333751826f7d3ae463ec6a7fc2a3c80eb79f8d35))

# [1.0.0-dev.11](https://github.com/1inch-community/interface/compare/v1.0.0-dev.10...v1.0.0-dev.11) (2024-06-04)

### Bug Fixes

- **dapp:** added preload audio
  ([ba41592](https://github.com/1inch-community/interface/commit/ba4159282162beea0acc72e7f8bbbd560b2fb22f))

# [1.0.0-dev.10](https://github.com/1inch-community/interface/compare/v1.0.0-dev.9...v1.0.0-dev.10) (2024-06-04)

### Bug Fixes

- **sdk:** fixed types in sdk
  ([f1e5bca](https://github.com/1inch-community/interface/commit/f1e5bcac86bae7d304065b7e3c7b232ff4f7d47f))

# [1.0.0-dev.9](https://github.com/1inch-community/interface/compare/v1.0.0-dev.8...v1.0.0-dev.9) (2024-06-04)

### Bug Fixes

- **builder:** fixed automatic build order for dynamic imports
  ([41c9b63](https://github.com/1inch-community/interface/commit/41c9b63b8b39fd6e9feffce2095f040f927dbe00))
- **dapp:** fixed scroll bar
  ([828ffc0](https://github.com/1inch-community/interface/commit/828ffc0df0f2215c3539e1bf1a538c6a3354d29f))
- **dapp:** fixed the bar bottom position when scrolling
  ([53e9c70](https://github.com/1inch-community/interface/commit/53e9c706288d496568ea8f5754fd53425b224340))
- **dapp:** optimization swap form render time
  ([26e4688](https://github.com/1inch-community/interface/commit/26e468829bf64b8a173b666a47422f68b72213fd))
- **model:** change basic swap context model
  ([c04a5fb](https://github.com/1inch-community/interface/commit/c04a5fb47e861a915b8831df57e3515f3a544903))
- optimization rendering scrollable overlays
  ([51f04fc](https://github.com/1inch-community/interface/commit/51f04fc69483c93df292ec6a822c4a7267f6dd6d))
- optimization scene rendering
  ([51065b1](https://github.com/1inch-community/interface/commit/51065b1cbba9d545398947308587da5afab1fb67))
- **packagr:** fix types diagnostic log
  ([baa4474](https://github.com/1inch-community/interface/commit/baa44749340177dca3ba4d595c8286cbf13cb859))
- **sdk:** fix parsing chainId from wallet provider
  ([0204d96](https://github.com/1inch-community/interface/commit/0204d96baa4aba02caab33a5df7336f53bc711ef))
- **sdk:** fixed change active connection in connect wallet module
  ([689a606](https://github.com/1inch-community/interface/commit/689a606fbf940ea0c8bcb6045e8bd6d6efc7650f))
- **sdk:** optimize loading pool data in uniswap v3 rate adapter
  ([4be6a0a](https://github.com/1inch-community/interface/commit/4be6a0a24be6aa4e6beeb0a2b85f7efcab324ac0))
- **sdk:** timings changed in chain clients
  ([63c0ddc](https://github.com/1inch-community/interface/commit/63c0ddc7ce7c33e8e37373aa97c87f5dc18d8c88))
- **swap-form:** fixed rate calculation
  ([88f5f25](https://github.com/1inch-community/interface/commit/88f5f25617fa25274e3ae9a928af82a16b9f5ecc))
- **swap-form:** fixed render artefacts in safari
  ([d603a1e](https://github.com/1inch-community/interface/commit/d603a1eb3b5e6dcda9d675aecb84fbce67198026))
- **swap-form:** fixed render scene in safari
  ([84bc8aa](https://github.com/1inch-community/interface/commit/84bc8aa0acfaad0c46baa26f277ab038c1aa81b4))
- **swap-form:** fixed shadow rendering in safari
  ([95b492b](https://github.com/1inch-community/interface/commit/95b492b1b9183ce5a9588723e84ae4f5a2873419))
- **swap-from:** fixed form overflow
  ([6477a2b](https://github.com/1inch-community/interface/commit/6477a2b8507695120971f1b5043d6f02abf9c640))
- **swap-from:** fixed rate calculation
  ([304ae0f](https://github.com/1inch-community/interface/commit/304ae0f59bc0f0af2add6fba9d32edec6651991c))
- **swap-from:** fixed showing fusion info if user not select token
  ([de3e63c](https://github.com/1inch-community/interface/commit/de3e63cfbca69b1697b0ddd55309345c8d92b6b2))
- **swap-from:** optimize saving tokens persist state
  ([45270c9](https://github.com/1inch-community/interface/commit/45270c91e29fb156869d8258b017f2e141c400ab))
- **theme:** rainbow theme improvements
  ([b084882](https://github.com/1inch-community/interface/commit/b084882d8b8352d0073d118eb80ebf6cc652a449))
- **wallet:** fixed reconnect wallet
  ([d2a4a23](https://github.com/1inch-community/interface/commit/d2a4a23463ee162f80a538c9cb81392b0f1ff266))
- **widgets:** reworking the code for a new swap context model
  ([cba6986](https://github.com/1inch-community/interface/commit/cba6986e8ed55fe7d47e8c5917d5d4677fd01470))

### Features

- **dapp:** added css and html templates minification
  ([438cfad](https://github.com/1inch-community/interface/commit/438cfad849f815bba8b31c668ee8622f79c3dac5))
- **dapp:** added mobile pull-to-refresh data update
  ([bd629d9](https://github.com/1inch-community/interface/commit/bd629d9b2f3601321daae98427bc5dfd9b3baafd))
- **sdk:** added block listener sleep when the tab is not active
  ([bd5294c](https://github.com/1inch-community/interface/commit/bd5294cb92571e3c8fe4809105a052087f056916))
- **sdk:** added linking source token amount and destination token amount
  ([eea7dd3](https://github.com/1inch-community/interface/commit/eea7dd34fde930ff600fbdc200f4180ef93700ef))
- **sdk:** added uniswap v3 adapter
  ([d1795d2](https://github.com/1inch-community/interface/commit/d1795d23a57080f9b2b0636ce9907f0dd465cde1))
- **sdk:** changed logic work long time cache
  ([fb2a459](https://github.com/1inch-community/interface/commit/fb2a459715e207c5784b8e0ed2057c42e3c82aad))
- **swap-form:** added fiat amount view
  ([18be934](https://github.com/1inch-community/interface/commit/18be934873128ba205aec2853e38e1679730f8d3))
- **swap-form:** added fusion swap auction time view
  ([4208626](https://github.com/1inch-community/interface/commit/42086267d177985e26c735ebcc24267e16b5d3f1))
- **swap-form:** added slippage settings view
  ([4ab6be8](https://github.com/1inch-community/interface/commit/4ab6be839edd2a96380e25bd125fe2b02bcf7d78))
- **swap-form:** added sound when update data in mobile
  ([14286bb](https://github.com/1inch-community/interface/commit/14286bb766f2376521ad0d3bdfa39485639b8a3e))
- **swap-from:** added state saving in persist store if user switches pair
  ([2aabd21](https://github.com/1inch-community/interface/commit/2aabd213270374ab37c4b7de37d33eecc60c6518))
- **theme:** added algorithm for automatically make color schema
  ([137bf9c](https://github.com/1inch-community/interface/commit/137bf9c088ff512cbbf73889a02805e3a9ffe6ae))
- **theme:** added pair reset when change chain
  ([ff611dd](https://github.com/1inch-community/interface/commit/ff611dd556a95314e515800e624da3916838979c))
- **theme:** added rainbow color schema
  ([d7dadfd](https://github.com/1inch-community/interface/commit/d7dadfd22e185b916dcb33efbf8c04e0bb2087cc))
- **theme:** added random color schema
  ([85491ac](https://github.com/1inch-community/interface/commit/85491ac2f5a8d1dfa19ed4420cfafc4fa4bd7bed))
- **ui-components:** added showShadow flag in base card
  ([4557fd5](https://github.com/1inch-community/interface/commit/4557fd5172676fc9f71b77de93486e0a7dacac04))
- **widgets-swap-form:** added handling zero amount in swap button
  ([f7dd176](https://github.com/1inch-community/interface/commit/f7dd1764ebd329d926e481e1495b3637db638cb5))

# [1.0.0-dev.8](https://github.com/1inch-community/interface/compare/v1.0.0-dev.7...v1.0.0-dev.8) (2024-05-20)

### Features

- **sdk:** added closing the walletconnect modal window if user changes theme
  ([a0b3885](https://github.com/1inch-community/interface/commit/a0b3885ffcc96138446a467f1b1fd1f9908c98da))

# [1.0.0-dev.7](https://github.com/1inch-community/interface/compare/v1.0.0-dev.6...v1.0.0-dev.7) (2024-05-19)

### Bug Fixes

- remove firebase deps
  ([cfbc8c8](https://github.com/1inch-community/interface/commit/cfbc8c873e30b7a82b80b9116ba9c7c55298ac06))

# [1.0.0-dev.6](https://github.com/1inch-community/interface/compare/v1.0.0-dev.5...v1.0.0-dev.6) (2024-05-19)

### Bug Fixes

- optimize electron building script
  ([d5f9f4d](https://github.com/1inch-community/interface/commit/d5f9f4d55daa95066a1fef30d58eeb859cea3172))

# [1.0.0-dev.5](https://github.com/1inch-community/interface/compare/v1.0.0-dev.4...v1.0.0-dev.5) (2024-05-18)

### Bug Fixes

- fix env for build pages
  ([578f05f](https://github.com/1inch-community/interface/commit/578f05fba7d5b6d2830b065300bb59c7bd6275f6))
- fix env for build pages
  ([ea57c38](https://github.com/1inch-community/interface/commit/ea57c38768e36b569f729c55b4036e8e5916c2e0))

# [1.0.0-dev.4](https://github.com/1inch-community/interface/compare/v1.0.0-dev.3...v1.0.0-dev.4) (2024-05-18)

### Bug Fixes

- fix base href for github pages
  ([19fee30](https://github.com/1inch-community/interface/commit/19fee303e7514a517f6971ab1de87644c5f9ecb0))

# [1.0.0-dev.3](https://github.com/1inch-community/interface/compare/v1.0.0-dev.2...v1.0.0-dev.3) (2024-05-18)

### Features

- added pipeline for deploy project on github pages
  ([395304d](https://github.com/1inch-community/interface/commit/395304d011b482ac8347866d0a21008893be5e15))

# [1.0.0-dev.2](https://github.com/1inch-community/interface/compare/v1.0.0-dev.1...v1.0.0-dev.2) (2024-05-18)

### Bug Fixes

- fix electron building
  ([5814fbd](https://github.com/1inch-community/interface/commit/5814fbd2a0e0ae8f24afd565961d8199da67262b))
- fix vite build
  ([a8647c2](https://github.com/1inch-community/interface/commit/a8647c2444080e3e2828f99966c1ea8e511cd925))

# 1.0.0-dev.1 (2024-05-18)

### Bug Fixes

- added license.txt for build dmg
  ([d0054c0](https://github.com/1inch-community/interface/commit/d0054c0f4ac154680f6dbae8069cc5c220aa7a0e))
- fix common jobs path
  ([e167c2b](https://github.com/1inch-community/interface/commit/e167c2bb7c26c0c094f273b57879fa90e4d7facf))
- fix common jobs path
  ([3c07b7a](https://github.com/1inch-community/interface/commit/3c07b7ae2ad2635004d824235987357071692397))
- fix lint
  ([cf33243](https://github.com/1inch-community/interface/commit/cf33243d5e21b6bd03162edda81826260c9e9d39))

### Features

- added new pipelines
  ([1aabf61](https://github.com/1inch-community/interface/commit/1aabf618d31c04bed27f11b1f8633133aa8381dc))
- added release pipeline for dev branch
  ([b75a575](https://github.com/1inch-community/interface/commit/b75a5753f26845c60ea40da98f1310e1e4b8b081))

## [1.3.2](https://github.com/1inch-community/interface/compare/v1.3.1...v1.3.2) (2024-05-16)

### Bug Fixes

- change electron dapp artifact name
  ([0ef830e](https://github.com/1inch-community/interface/commit/0ef830e0ce89516971a32aa9756442f75fd39187))

## [1.3.1](https://github.com/1inch-community/interface/compare/v1.3.0...v1.3.1) (2024-05-16)

### Bug Fixes

- update release flow
  ([e799408](https://github.com/1inch-community/interface/commit/e79940848f9b9492db03d5007bbd5f359e853f54))

# [1.3.0](https://github.com/1inch-community/interface/compare/v1.2.0...v1.3.0) (2024-05-16)

### Features

- added electron-updater
  ([2c32a16](https://github.com/1inch-community/interface/commit/2c32a16c95807be71c6a77e140f255723893b760))

# [1.2.0](https://github.com/1inch-community/interface/compare/v1.1.0...v1.2.0) (2024-05-16)

### Features

- added app icons for electron dapp
  ([5c70b9b](https://github.com/1inch-community/interface/commit/5c70b9bb9e0f293ff104b1332774bc9a20801316))

# [1.1.0](https://github.com/1inch-community/interface/compare/v1.0.0...v1.1.0) (2024-05-15)

### Features

- added building electron dapp for mac windows and linux platform
  ([4884e58](https://github.com/1inch-community/interface/commit/4884e584cd38726decdc01f2065b12b6e9bd41b1))

# 1.0.0 (2024-05-15)

### Features

- added semantic-release
  ([bc0c9a5](https://github.com/1inch-community/interface/commit/bc0c9a544f8b795818aacab65e4a2162db198a04))
