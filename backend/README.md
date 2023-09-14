# Hardhat environment

## Setup

This environment is using `yarn` as the package manager

-   install dependencies <br>
    `yarn install` <br>

-   run `yarn hardhat compile` to make sure everything is working

## .env

-   rename `.env.example` to `.env`
-   add all missing keys/ids/urls to the new `.env`

```shell
yarn hardhat help
yarn hardhat compile
yarn hardhat test
yarn hardhat node
```

## Script Order

### Deploy

1. deploy-group-five-token.ts
2. deploy-group-five-collection.ts
3. deploy-token-sale.ts
4. deploy-encode-battles.ts

### Interact

5. testTokenSale_buy_GFT.ts
6. testTokenSale_buy_NFT.ts
7. testEncodeBattles_submit_player1.ts
8. testEncodeBattles_submit_player2.ts

To Do:
testTokenSale_withdraw_eth.ts
testGroupFiveCollection_withdraw_GFT.ts
