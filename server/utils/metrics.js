const client = require('prom-client');

const arbitrageOpportunitiesCounter = new client.Counter({
  name: 'arbitrage_opportunities_total',
  help: 'Total number of arbitrage opportunities found'
});

const successfulTradesCounter = new client.Counter({
  name: 'successful_trades_total',
  help: 'Total number of successful trades'
});

const failedTradesCounter = new client.Counter({
  name: 'failed_trades_total',
  help: 'Total number of failed trades'
});

const profitGauge = new client.Gauge({
  name: 'total_profit',
  help: 'Total profit from arbitrage trades'
});

const exchangeResponseTime = new client.Histogram({
  name: 'exchange_response_time_seconds',
  help: 'Response time of exchanges',
  labelNames: ['exchange']
});

const tradingVolume = new client.Counter({
  name: 'trading_volume_total',
  help: 'Total trading volume',
  labelNames: ['symbol', 'exchange']
});

module.exports = {
  arbitrageOpportunitiesCounter,
  successfulTradesCounter,
  failedTradesCounter,
  profitGauge,
  exchangeResponseTime,
  tradingVolume
};
