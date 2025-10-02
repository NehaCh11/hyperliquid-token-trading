// WebSocket polyfill for Node.js environment
global.WebSocket = require('ws');

const { expect } = require("chai");
const sinon = require("sinon");
require("dotenv").config();

const { TokenTrader } = require("../scripts/trade-sdk");

describe("TokenTrader SDK", function () {
  let trader;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    
    // Initialize with dummy private key for testing
    trader = new TokenTrader("0x" + "11".repeat(32), true);

    // Stub PublicClient methods
    sandbox.stub(trader.publicClient, "spotMeta").resolves({
      universe: [
        { name: "TOKEN", index: 1 },
        { name: "USDC", index: 0 }
      ]
    });

    sandbox.stub(trader.publicClient, "spotClearinghouseState").resolves({
      balances: [
        { coin: "USDC", token: { total: "1000", hold: "0" } },
        { coin: "TOKEN", token: { total: "500", hold: "100" } }
      ]
    });

    sandbox.stub(trader.publicClient, "l2Book").resolves({
      levels: [
        [ { px: "0.9", sz: "100" }, { px: "0.8", sz: "200" } ],
        [ { px: "1.1", sz: "150" }, { px: "1.2", sz: "250" } ]
      ]
    });

    sandbox.stub(trader.publicClient, "openOrders").resolves([
      {
        coin: "TOKEN",
        side: "buy",
        limitPx: "1.0",
        sz: "10",
        oid: "123"
      }
    ]);

    // Stub WalletClient methods
    sandbox.stub(trader.client, "order").resolves({
      status: "ok",
      response: { type: "order", data: { statuses: [{ resting: { oid: 123 } }] } }
    });

    sandbox.stub(trader.client, "cancel").resolves({
      status: "ok",
      response: { type: "cancel", data: { statuses: ["success"] } }
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should fetch available spot tokens", async () => {
    const meta = await trader.getSpotTokens();
    expect(meta).to.exist;
    expect(meta.universe).to.be.an('array');
    expect(meta.universe[0].name).to.equal("TOKEN");
  });

  it("should fetch user balances", async () => {
    const state = await trader.getBalances();
    expect(state).to.exist;
    expect(state.balances).to.be.an('array');
    expect(state.balances[0].coin).to.equal("USDC");
  });

  it("should fetch order book", async () => {
    const book = await trader.getOrderBook("TOKEN");
    expect(book).to.exist;
    expect(book.levels[0][0].px).to.equal("0.9");
  });

  it("should place a buy order", async () => {
    const result = await trader.placeBuyOrder("TOKEN", 1.0, 10);
    expect(result).to.exist;
    expect(result.status).to.equal("ok");
  });

  it("should place a sell order", async () => {
    const result = await trader.placeSellOrder("TOKEN", 2.0, 5);
    expect(result).to.exist;
    expect(result.status).to.equal("ok");
  });

  it("should fetch open orders", async () => {
    const orders = await trader.getOpenOrders();
    expect(orders).to.be.an('array');
    expect(orders[0].oid).to.equal("123");
  });

  it("should cancel an order", async () => {
    const result = await trader.cancelOrder("TOKEN", "123");
    expect(result).to.exist;
    expect(result.status).to.equal("ok");
  });
});