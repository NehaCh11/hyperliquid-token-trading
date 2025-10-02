// WebSocket polyfill for Node.js
global.WebSocket = require('ws');

const { HttpTransport, WalletClient, PublicClient } = require('@nktkas/hyperliquid');
const { privateKeyToAccount } = require('viem/accounts');
require('dotenv').config();

class TokenTrader {
  constructor(privateKey, isTestnet = true) {
    const url = isTestnet 
      ? 'https://api.hyperliquid-testnet.xyz'
      : 'https://api.hyperliquid.xyz';
    
    this.transport = new HttpTransport({ url });
    this.account = privateKeyToAccount(privateKey);
    this.client = new WalletClient({ 
      wallet: this.account, 
      transport: this.transport,
      isTestnet: isTestnet 
    });
    this.publicClient = new PublicClient({ transport: this.transport });
    this.walletAddress = this.account.address;
    
    console.log('Wallet:', this.walletAddress);
    console.log('Network:', isTestnet ? 'Testnet' : 'Mainnet');
  }

  async getSpotTokens() {
    try {
      const meta = await this.publicClient.spotMeta();
      console.log('\nAvailable Spot Tokens:');
      meta.universe.forEach((token, i) => {
        console.log(`   ${i}. ${token.name}`);
      });
      return meta;
    } catch (error) {
      console.error('Error:', error.message);
      return null;
    }
  }

  async getBalances() {
    try {
      const state = await this.publicClient.spotClearinghouseState({ 
        user: this.walletAddress 
      });
      console.log('\nYour Balances:');
      
      if (state.balances && state.balances.length > 0) {
        state.balances.forEach(bal => {
          const total = parseFloat(bal.token.total);
          const hold = parseFloat(bal.token.hold);
          if (total > 0) {
            console.log(`   ${bal.coin}: ${total} (Available: ${total - hold})`);
          }
        });
      } else {
        console.log('   No balances found');
      }
      
      return state;
    } catch (error) {
      console.error('Error:', error.message);
      return null;
    }
  }

  async getOrderBook(tokenName) {
    try {
      const book = await this.publicClient.l2Book({ coin: tokenName });
      console.log(`\nOrder Book for ${tokenName}:`);
      
      console.log('\n   Top Bids:');
      book.levels[0].slice(0, 5).forEach((bid, i) => {
        console.log(`   ${i + 1}. Price: ${bid.px} | Size: ${bid.sz}`);
      });
      
      console.log('\n   Top Asks:');
      book.levels[1].slice(0, 5).forEach((ask, i) => {
        console.log(`   ${i + 1}. Price: ${ask.px} | Size: ${ask.sz}`);
      });
      
      return book;
    } catch (error) {
      console.error('Error:', error.message);
      return null;
    }
  }

  async placeBuyOrder(tokenName, price, size) {
    try {
      console.log(`\nPlacing BUY order for ${tokenName}`);
      
      const result = await this.client.order({
        orders: [{
          a: 10000, // Spot asset index (update based on your token)
          b: true,
          p: price.toString(),
          s: size.toString(),
          r: false,
          t: { limit: { tif: 'Gtc' } }
        }],
        grouping: 'na'
      });
      
      console.log('Order placed:', result);
      return result;
    } catch (error) {
      console.error('Error:', error.message);
      return null;
    }
  }

  async placeSellOrder(tokenName, price, size) {
    try {
      console.log(`\nPlacing SELL order for ${tokenName}`);
      
      const result = await this.client.order({
        orders: [{
          a: 10000, // Spot asset index
          b: false,
          p: price.toString(),
          s: size.toString(),
          r: false,
          t: { limit: { tif: 'Gtc' } }
        }],
        grouping: 'na'
      });
      
      console.log('Order placed:', result);
      return result;
    } catch (error) {
      console.error('Error:', error.message);
      return null;
    }
  }

  async getOpenOrders() {
    try {
      const orders = await this.publicClient.openOrders({ 
        user: this.walletAddress 
      });
      console.log('\nOpen Orders:', orders);
      return orders;
    } catch (error) {
      console.error('Error:', error.message);
      return null;
    }
  }

  async cancelOrder(tokenName, orderId) {
    try {
      const result = await this.client.cancel({
        cancels: [{ a: 10000, o: orderId }]
      });
      console.log('Order canceled:', result);
      return result;
    } catch (error) {
      console.error('Error:', error.message);
      return null;
    }
  }
}

module.exports = { TokenTrader };