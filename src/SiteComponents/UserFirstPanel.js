import React from 'react';
import Button from '../Components/Buttons';
import MenuIcon from '../Components/MenuIcon';
import StocksCard from '../Components/StocksCard';
import PlainCard from '../Components/PlainCard';
import { getUserMoney, getStocksHolding, getStocksBatch } from '../Helpers/endpoints';
import { withRouter } from "react-router-dom";
import '../Styles/UserFirstPanel.css';
import Logo from './Logo';
import { connectIEXLast, removeSubscriptionLast, socketRemoveListeners } from '../Helpers/socketAPI.js';
import { clearAllTimeOut } from '../Helpers/timerFunctions';

// one of the props include the user so we won't have to send another request
class UserFirstPanel extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      userMoney: 0,
      investmentMoney: 0,
      initialInvestmentMoney: 0,
      userStockInfo: [],
      initialLoad: false,
      isLoadingHolding: true,
      //make it easier to edit an array, but might need to update more frequent and more carefully
      indexStockLocation: {},
      // socketio stuff
      listeners: [],
      socket: null,
    }
    this.errorFetchTryAgain = this.errorFetchTryAgain.bind(this);
    this.fetchAttempTimer = [];
    this.updateStockPrice = this.updateStockPrice.bind(this);
    this.signout = this.signout.bind(this);
    this.refreshCallback = this.refreshCallback.bind(this);
  }

  componentWillMount(){
    if(this.props.user){
      // spaguetties fetches.....
      this.props.firebase.auth().currentUser.getIdToken(true)
        .then((idToken) => Promise.all([getUserMoney(idToken), getStocksHolding(idToken)]))
        .then((result) => {
          let stocksHolding = [];
          let investmentMoney = 0;
          let indexStockLocation = {};
          let symbolsOnly = []; //used later to subscribe and fetch open price
          let errorFetch = false;
          if(result[0].status){
            errorFetch = true; // used to trigger fetch for money if no money found
          }
          if(!result[1].status){
            // in the for loop we get
            // index location for each stock (index in the user holding data),
            // array of symbols to be able to later fetch/subscribeto data easier
            // and stocksHolding whihc is the object with data needed for each row in the card
            let i = 0;
            for(let e in result[1]){
              indexStockLocation[result[1][e].symbol] = i++;
              symbolsOnly.push(result[1][e].symbol);
              investmentMoney += result[1][e].amount * result[1][e].averagePrice
              stocksHolding.push({
                symbol: result[1][e].symbol,
                amount: result[1][e].amount,
                price: result[1][e].averagePrice
              });
            }
          }
          this.setState({
            userMoney: result[0].money || 0,
            investmentMoney: investmentMoney,
            initialInvestmentMoney: investmentMoney,
            userStockInfo: stocksHolding,
            initialLoad: true,
            indexStockLocation: indexStockLocation
           });
           // we return the symbols to be handled later
           // and the open stock prices
           return Promise.all([
             symbolsOnly,
             getStocksBatch({ symbols: symbolsOnly, types:['ohlc'] }),
             errorFetch
           ]);
        })
        .then((promiseData)=>{
          // with the symbolsonly we can subscribe and be able to update the prices
          let symbolsToSubscribe = promiseData[0];
          let socket = connectIEXLast({ symbols: symbolsToSubscribe });
          socket.on('message', (message) => {
            let data = JSON.parse(message);
            this.updateStockPrice(data);
          });
          // finally we set the open price for each stock
          let openPriceData = promiseData[1];
          let userStockInfo = [ ...this.state.userStockInfo ];
          for(let symbol in openPriceData){
            // to update a stock in an array we get the index and easily change or add info
            let stockIndex = this.state.indexStockLocation[symbol];
            userStockInfo[stockIndex].openPrice = openPriceData[symbol].ohlc.open.price;
          }
          this.setState({
            socket: socket,
            isLoadingHolding: promiseData[2],
            userStockInfo: userStockInfo,
            listeners: ['message', 'connect'],
          });
          if(promiseData[2]) this.errorFetchTryAgain(0);
        })
        .catch((err) => console.log('err', err));
    }
  }

  errorFetchTryAgain(attemptNum){
    let attemtsTimeOut = [100, 2000, 5000]; //try three times with those timers
    if(attemptNum > attemtsTimeOut.length){
      console.log('error fetching money')
      return this.setState({ userMoney: 'Error fetching money' });
    }
    this.fetchAttempTimer.push(setTimeout(()=>{
      if(this.props.user){
        this.props.firebase.auth().currentUser.getIdToken(true)
          .then((idToken) => Promise.all([getUserMoney(idToken)]))
          .then((result) => {
            console.log('attempfetch', attemptNum);
            if(result[0].status){
              // try again (might need to redo to avoid recursion)
              this.errorFetchTryAgain(++attemptNum);
            }
            else {
              this.setState({
                userMoney: result[0].money || 0,
                isLoadingHolding: false
               });
            }
          })
      }
    }, attemtsTimeOut[attemptNum]));
  }

  formatMoney(num){
    if(typeof num === 'number'){
      return num.toFixed(2);
    }
    return '0.00';
  }

  componentDidMount(){
    // try to avoid if somehow user is not sign in and access this page
    // redirect to signin
    if(!this.props.user){
      this.props.history.push('/signin');
      return '';
    }
  }

  componentWillUnmount(){
    socketRemoveListeners(this.state.socket, this.state.listeners);
    clearAllTimeOut(this.fetchAttempTimer);
  }


  // used in socket subscribe to update prices
  updateStockPrice(data){
    let singleStockIndex = this.state.indexStockLocation[data.symbol];
    if(typeof singleStockIndex === 'number'){
      let allstockData = [ ...this.state.userStockInfo ];
      let singleStockData = { ...allstockData[singleStockIndex] };
      // first change the total
      let previusStockValue = singleStockData.amount * singleStockData.price;
      let newStockValue = singleStockData.amount * data.price;
      let investmentMoney = this.state.investmentMoney + (newStockValue - previusStockValue);
      // then change the price on the object
      singleStockData.price = data.price;
      allstockData[singleStockIndex] = singleStockData;
      this.setState({
        userStockInfo: allstockData,
        investmentMoney: investmentMoney,
       });
    }
  }

  removeStockFromList(symbol){
    return removeSubscriptionLast(this.state.socket, [symbol]);
  }

  signout(){
    this.props.firebase.auth()
      .signOut()
      .then(()=> console.log('Sign Out'))
      .catch((error)=> console.log('error signout', error))
  }

  refreshCallback(symbol, amount, value){
    // should update stock info here
    // add/delete subscription
    let userStockInfo = [ ...this.state.userStockInfo ];
    let indexStockLocation = { ...this.state.indexStockLocation };
    let symbolStockLocation = indexStockLocation[symbol];
    let currentAmount = userStockInfo[symbolStockLocation].amount;
    let newAmount = currentAmount - amount;
    let cashEarn = amount * value;
    // if sold all stock remove subscription, indexlocation, and userStockInfo(for the table)
    // and finally add to the cash
    if(newAmount === 0){
      userStockInfo.splice(symbolStockLocation, 1);
      delete indexStockLocation[symbol];
      removeSubscriptionLast(this.state.socket, [symbol]);
    }
    else {
      userStockInfo[symbolStockLocation].amount = newAmount;
    }
    this.setState({
      userStockInfo: userStockInfo,
      indexStockLocation: indexStockLocation,
      investmentMoney: this.state.investmentMoney - cashEarn,
      userMoney: this.state.userMoney + cashEarn,
    })
    this.props.refreshCallback();
  }

  render() {
    if(!this.props.user) return '...'
    let textColor = '';
    // not sure if it makes sense to switch color of investment...
    // if(this.state.initialInvestmentMoney > this.state.investmentMoney) textColor = 'red-text';
    // else if(this.state.initialInvestmentMoney < this.state.investmentMoney) textColor = 'green-text';
    return(
      <div className='user-panel panel-content'>
        <div className='top-header'>
          <Logo onClick={this.props.altColorToggle}/>
          <MenuIcon
            isActive={this.props.sActive}
            onClick={this.props.toggleSPanel}/>
        </div>
        <div className='content-wrapper'>
          <PlainCard className='user-info'>
            <div className='plain-card-row'>
              <div>Cash</div>
              <div className='total'>{this.formatMoney(this.state.userMoney)}</div>
            </div>
            <div className='plain-card-row'>
              <div>Investments</div>
              <div className='total'>{this.formatMoney(this.state.investmentMoney)}</div>
            </div>
            <div className='plain-card-row bold'>
              <div>Total</div>
              <div className={`total ${textColor}`}>{this.formatMoney(this.state.userMoney + this.state.investmentMoney)}</div>
            </div>
          </PlainCard>
          <div className='user-card'>
            <StocksCard
              refreshCallback={this.refreshCallback}
              isLoading={this.state.isLoadingHolding}
              initialLoad={this.state.initialLoad}
              firebase={this.props.firebase}
              user={this.props.user}
              withDate={false}
              stockInfo={this.state.userStockInfo}/>
          </div>
        </div>
        <div className='button-wrapper' id='#signout'>
          <Button
            className='inverse'
            onClick={this.signout}
            text='Sign Out'/>
        </div>
      </div>
    )
  }
}

export default withRouter(UserFirstPanel);
