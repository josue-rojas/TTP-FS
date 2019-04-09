// a collection of endpoints for easier acess
const dbURL = 'https://us-central1-ttp-fs-20c6a.cloudfunctions.net/app';
// const dbURL = 'http://localhost:5000/ttp-fs-20c6a/us-central1/app';
const stocksURL = 'https://api.iextrading.com/1.0';

// returns promise with results
function fetchGET(url, idToken){
  let options = {
    headers: new Headers({
      'Authorization': idToken ? `Bearer ${idToken}` : '',
      'Content-Type': 'application/json',
    }),
    method: 'GET',
  };
  if(!idToken) options = {};
  return new Promise((resolve, reject) => {
    fetch(url, options)
    .then((result) => resolve(result.json()))
    .catch((err) => reject(err));
  });
}

// returns promise with results
function fetchPOST(url, idToken, body){
  const headers = new Headers({
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json',
  });
  return new Promise((resolve, reject) => {
    fetch(url, {
      headers: headers,
      method: 'POST',
      body: body,
    })
    .then((result) => resolve(result.json()))
    .catch((err) => reject(err));
  });
}

export function getUserMoney(idToken){
  return fetchGET(`${dbURL}/user/money`, idToken);
}

export function getStocksHolding(idToken){
  return fetchGET(`${dbURL}/user/holding`, idToken);
}

export function getTransactions(idToken){
  return fetchGET(`${dbURL}/user/transactions`, idToken)
}

// body = {
//   symbol: STRING
//   amount: number
// }
export function buyStock(idToken, body){
  return fetchPOST(`${dbURL}/user/transactions/buy`, idToken, body);
}

export function sellStock(idToken, body){
  return fetchPOST(`${dbURL}/user/transactions/sell`, idToken, body);
}

// single stocks price
// https://api.iextrading.com/1.0/stock/market/batch?symbols=${symbol}&types=price
export function getStockPrice(symbol){
  return fetchGET(`${stocksURL}/stock/market/batch?symbols=${symbol.toUpperCase()}&types=price`);
    // not using https://api.iextrading.com/1.0/stock/${symbol}/price to have data consistent with json
  // return fetchGET(`${stocksURL}/stocks/${symbol}/price`);
}

// batch request
// https://api.iextrading.com/1.0/stock/market/batch?symbols=${symbols}&types=price
export function getStocksList(symbols){
  return fetchGET(`${stocksURL}/stock/market/batch?symbols=${symbols.join(',').toUpperCase()}&types=price`);
}
