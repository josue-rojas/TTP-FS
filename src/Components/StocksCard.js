// a component to show stocks in a nice table
import React from 'react';
import PlainCard from './PlainCard';
import '../Styles/StocksCard.css';
import { TextInputWithTooltip } from './Inputs';
import { ButtonwLoader } from '../Components/Buttons';
import { isWholeNumber } from '../Helpers/InputsCheck';
import { checkAllInputs, onInputChangeTooltip } from '../Helpers/InputFunctions';
import { sellStock  } from '../Helpers/endpoints';
import { clearPrevTooltip } from '../Helpers/tooltipHelpers';
import Loader from './Loader';

function SingleStock(props){
  return(
    <div className='single-stock'>
      <div className='left-info'>
        <div className='stock-name'>
          {props.stockName}
        </div>
        <div className='amount'>
          {props.stockAmount} Shares
        </div>
      </div>
      <div className='right-info'>
        <span>{props.price}</span>
      </div>
    </div>
  )
}

// a singlestock but with more features
// able to sell stock
// todo: add charts
class SingleStockDynamic extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      amount: {
        val: '',
        hasError: false,
        tooltip: '',
      },
      isFocus: false,
      isLoading: false,
      previousTooltip: '',
    }
    this.checkInput = {
      amount: isWholeNumber
    }
    this.onInputChange = this.onInputChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.submitForm = this.submitForm.bind(this);
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.clearTooltipTimer = null;
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleFocus);
  }

  componentWillUnmount() {
    clearTimeout(this.clearTooltipTimer);
    document.removeEventListener('mousedown', this.handleFocus);
  }

  onInputChange(e, inputKey){
    onInputChangeTooltip(e, inputKey, this);
  }

  handleFocus(event){
    if (this.SingleStock && !this.SingleStock.contains(event.target)) {
      this.setState({ isFocus: false });
    }
  }

  submitForm(){
    let valuesChange = checkAllInputs(this.checkInput, this.state);
    if(valuesChange){
      this.setState(valuesChange);
      return false;
    }
    let amount = parseInt(this.state.amount.val, 10);
    let symbol = this.props.stockName.toUpperCase();
    let value = parseFloat(this.props.price, 10);
    this.setState({ isLoading: true });
    let body = JSON.stringify({
      symbol: symbol,
      amount: amount,
      value: value,
    })
    if(this.props.user){
      this.props.firebase.auth().currentUser.getIdToken(true)
        .then((idToken) => Promise.all([sellStock(idToken, body)]))
        .then((result) => {
          if(result[0].status === 'ok'){
            this.setState({
              amount: {
                val: '',
                hasError: false,
                tooltip: '',
              },
              isLoading: false,
              isFocus: false
            });
            this.props.refreshCallback(symbol, amount, value);
            // should have a callback to notify parent components
          }
          else{
            let amount = { ...this.state.amount };
            amount.tooltip = result[0].message || 'Something went wrong';
            clearTimeout(this.clearTooltipTimer);
            this.setState({
              amount: amount,
              isLoading: false,
              previousTooltip: 'amount'
            });
            if(this.state.previousTooltip){
              clearPrevTooltip(this);
            }
          }
        })
        .catch((err) => console.log(err));
    }
  }

  setWrapperRef(node) {
    this.SingleStock = node;
  }

  render(){
    let textColor = '';
    if(this.props.openPrice > this.props.price) textColor = 'red-text';
    else if(this.props.openPrice < this.props.price) textColor = 'green-text';
    return(
      <div
        style={{position: 'relative'}}
        onClick={(()=> this.setState({ isFocus: true }) )}
        ref={this.setWrapperRef}
        className={`single-stock isExpandable ${this.state.isFocus ? 'focus' : ''}`}>
        <div className='left-info'>
          <div className='stock-name'>
            {this.props.stockName}
          </div>
          <div className='amount'>
            {this.props.stockAmount} Shares
          </div>
        </div>
        <div className={`right-info ${textColor}`}>
          <span>{this.props.price}</span>
        </div>
        <div className='expand-box'>
          <form>
            <TextInputWithTooltip
              tooltipMessage={this.state.amount.tooltip}
              className='inverse'
              title='Amount'
              placeholder='Amount to sell'
              autocomplete={false}
              value={this.state.amount.val}
              hasError={this.state.amount.hasError}
              onChange={(e) => this.onInputChange(e, 'amount')}/>
            <ButtonwLoader
              className='inverse'
              inverse={true}
              isLoading={this.state.isLoading}
              text='Sell'
              onClick={this.submitForm}/>
          </form>
        </div>
      </div>
    )
  }

}

// TODO: change date to date object and extract the data
function SingleStockWithDate(props){
  return(
    <div className='single-stock'>
      <div className='left-info'>
        <div className='left-column right-line date'>
          <div>
            {props.date.month} {props.date.day}
          </div>
          <div>
            {props.date.year}
          </div>
        </div>
        <div className='left-column'>
          <div className='stock-name'>
            {props.stockName}
          </div>
          <div className='amount'>
            {props.stockAmount} Shares
          </div>
        </div>
      </div>
      <div className='right-info'>
        <span>{props.price}</span>
      </div>
    </div>
  )
}

export default class StocksCard extends React.Component {
  constructor(props){
    super(props);
    this.makeDefaultStockRow = this.makeDefaultStockRow.bind(this);
  }

  makeDefaultStockRow(stockInfo, order){
    // reverse backwards in one line
    // https://stackoverflow.com/a/52824441/6332768
    let singleStocks = stockInfo.map((el, i)=>{
      let e = order === 'desc' ? stockInfo[stockInfo.length - 1 - i] : el;
      return(
        <SingleStockDynamic
          refreshCallback={this.props.refreshCallback}
          key={`single-stock-${e.symbol}-${i}`}
          stockName={e.symbol}
          stockAmount={e.amount}
          price={e.price}
          openPrice={e.openPrice}
          firebase={this.props.firebase}
          user={this.props.user}/>
      )
    })
    if(singleStocks.length === 0){
      return (
        <div style={{textAlign: 'center', padding: '7px'}}>
          Not holding anything. Buy some to see your account grow!
        </div>)
    }
    return singleStocks;
  }

  makeDateStockRow(stockInfo, order){
    let singleStocks = stockInfo.map((el, i)=>{
      let e = order === 'desc' ? stockInfo[stockInfo.length - 1 - i] : el;
      return(
        <SingleStockWithDate
          date={e.date}
          key={`single-stock-${e.symbol}-${i}`}
          stockName={e.symbol}
          stockAmount={e.amount}
          price={e.price}/>
      )
    })
    if(singleStocks.length === 0){
      return (
        <div style={{textAlign: 'center', padding: '7px', whiteSpace: 'normal'}}>
          Not transactions found. Buy some to see your account grow!
        </div>)
    }
    return singleStocks;
  }

  render(){
    return(
      <PlainCard
        className={`stock-card ${this.props.className || ''} ${this.props.initialLoad ? 'initialLoad' : ''}`}
        style={{position: 'relative'}}>
        {this.props.isLoading ?
          <div className={`blur-background ${this.props.isLoading ? 'isLoading' : ''}`}></div> :
          ''
        }
        {this.props.isLoading ?
          <Loader inverse={true} isLoading={this.props.isLoading}/> :
          ''
        }
        {this.props.withDate ?
          this.makeDateStockRow((this.props.stockInfo || []), 'desc'):
          this.makeDefaultStockRow((this.props.stockInfo || []), 'asc')
        }
      </PlainCard>
    )
  }
}
