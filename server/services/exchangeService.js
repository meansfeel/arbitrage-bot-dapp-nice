const ccxt = require('ccxt');
const logger = require('../utils/logger');
const metrics = require('../utils/metrics');

class ExchangeService {
  constructor() {
    this.exchanges = {
      binance: new ccxt.binance(),
      huobi: new ccxt.huobi(),
      okex: new ccxt.okex(),
      kucoin: new ccxt.kucoin(),
      bitfinex: new ccxt.bitfinex()
    };
  }

  async fetchPrices(symbol) {
    const exchanges = Object.entries(this.exchanges);
    const pricePromises = exchanges.map(async ([name, exchange]) => {
      const end = metrics.exchangeResponseTime.labels(name).startTimer();
      try {
        await exchange.loadMarkets();
        const ticker = await exchange.fetchTicker(symbol);
        logger.info(`从 ${name} 获取 ${symbol} 价格: ${ticker.last}`);
        end();
        return [name, ticker.last];
      } catch (error) {
        end();
        logger.error(`从 ${name} 获取价格时出错:`, error);
        return [name, null];
      }
    });

    const prices = await Promise.all(pricePromises);
    return Object.fromEntries(prices.filter(([, price]) => price !== null));
  }

  async executeTrade(exchange, symbol, side, amount) {
    const end = metrics.exchangeResponseTime.labels(exchange).startTimer();
    try {
      await this.exchanges[exchange].loadMarkets();
      const order = await this.exchanges[exchange].createMarketOrder(symbol, side, amount);
      metrics.tradingVolume.labels(symbol, exchange).inc(amount);
      end();
      return order;
    } catch (error) {
      end();
      logger.error(`在 ${exchange} 执行交易时出错:`, error);
      throw error;
    }
  }

  async getBalance(exchange, currency) {
    const end = metrics.exchangeResponseTime.labels(exchange).startTimer();
    try {
      await this.exchanges[exchange].loadMarkets();
      const balance = await this.exchanges[exchange].fetchBalance();
      end();
      return balance[currency].free;
    } catch (error) {
      end();
      logger.error(`获取 ${exchange} 余额时出错:`, error);
      throw error;
    }
  }
}

module.exports = new ExchangeService();
