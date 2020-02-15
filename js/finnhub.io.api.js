/**
 * @brief Returns quote URL.
 * https://finnhub.io/docs/api#quote
 *
 * Response Attributes:
 * o - Open price
 * h - High price
 * l - Low price
 * c - Current price
 * pc - Previous close price
 *
 * @param {String} token The token.
 * @param {String} symbol The symbol.
 * @return {String} Quote URL.
 */
function getQuoteUrl(token, symbol) {
	return "https://finnhub.io/api/v1/quote?symbol=" + symbol
	+ "&token=" + token;
}

/**
 * @brief Get candlestick data for stocks.
 * https://finnhub.io/docs/api#stock-candles
 *
 * Response Attributes:
 * o - List of open prices for returned candles.
 * h - List of high prices for returned candles.
 * l - List of low prices for returned candles.
 * c - List of close prices for returned candles.
 * v - List of volume data for returned candles.
 * t - List of timestamp for returned candles.
 * s - Status of the response. This field can either be ok or no_data.
 *
 * @param {String} token      The token.
 * @param {String} symbol     The symbol.
 * @param {String} resolution The resolution. Supported resolution includes 1, 5, 15, 30, 60, D, W, M .
 *                            Some timeframes might not be available depending on the exchange.
 * @param {String} count      Shortcut to set to=Unix.Now and from=Unix.Now - count * resolution_second.
 *                            With small resolution such as 1, This option might result in no_data over the weekend.
 * @return {String} Candlestick data for forex symbols.
 */
function getStockCandleUrl(token, symbol, resolution, count) {
	// https://finnhub.io/api/v1/stock/candle?symbol=AAPL&resolution=1&from=1572651390&to=1572910590&token=bp0jbknrh5r90eafrea0
	return "https://finnhub.io/api/v1/stock/candle?symbol=" + symbol
	+ "&resolution=" + resolution
	+ "&count=" + count
	+ "&token=" + token;
}