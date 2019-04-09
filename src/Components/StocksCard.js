// a component to show stocks in a nice table
import React from 'react';
import PlainCard from './PlainCard';
import '../Styles/StocksCard.css';
import { TextInput } from './Inputs';
import Button from './Buttons';
import { isWholeNumber } from '../Helpers/InputsCheck';
import { checkAllInputs, handleOnChange } from '../Helpers/InputFunctions';
import { sellStock  } from '../Helpers/endpoints';
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
      },
      isFocus: false,
    }
    this.checkInput = {
      amount: isWholeNumber
    }
    this.onInputChange = this.onInputChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.submitForm = this.submitForm.bind(this);
    this.setWrapperRef = this.setWrapperRef.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleFocus);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleFocus);
  }

  onInputChange(e, inputKey){
    let inputState = handleOnChange(e, inputKey, this.state, this.checkInput);
    this.setState({
      [inputKey]: inputState
    });
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
    this.setState({ isLoading: true });
    let body = JSON.stringify({
      symbol: this.props.stockName.toUpperCase(),
      amount: parseInt(this.state.amount.val, 10),
      value: parseFloat(this.props.price, 10),
    })
    if(this.props.user){
      this.props.firebase.auth().currentUser.getIdToken(true)
        .then((idToken) => Promise.all([sellStock(idToken, body)]))
        .then((result) => {
          if(result[0].status === 'ok'){
            this.setState({ isLoading: false });
            // should have a callback to notify parent components
          }
          else{
            console.log(result);
            this.setState({ isLoading: false });
            // handle error
          }
        })
        .catch((err) => console.log(err));
    }
  }

  setWrapperRef(node) {
    this.SingleStock = node;
  }

  render(){
    return(
      <div
        style={{position: 'relative'}}
        onClick={(()=> this.setState({ isFocus: true }) )}
        ref={this.setWrapperRef}
        className={`single-stock isExpandable ${this.state.isFocus ? 'focus' : ''}`}>
        <Loader isLoading={this.state.isLoading}/>
        <div className='left-info'>
          <div className='stock-name'>
            {this.props.stockName}
          </div>
          <div className='amount'>
            {this.props.stockAmount} Shares
          </div>
        </div>
        <div className='right-info'>
          <span>{this.props.price}</span>
        </div>
        <div className='expand-box'>
          <form>
            <TextInput
              className='inverse'
              title='Amount'
              placeholder='Amount to sell'
              autocomplete={false}
              value={this.state.amount.val}
              hasError={this.state.amount.hasError}
              onChange={(e) => this.onInputChange(e, 'amount')}/>
            <Button
              className='inverse'
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

  makeDefaultStockRow(stockInfo){
    let singleStocks = stockInfo.map((e, i)=>{
      return(
        <SingleStockDynamic
          key={`single-stock-${e.symbol}-${i}`}
          stockName={e.symbol}
          stockAmount={e.amount}
          price={e.price}
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

  makeDateStockRow(stockInfo){
    let singleStocks = stockInfo.map((e, i)=>{
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
      <PlainCard className='stock-card'>
        {this.props.withDate ?
          this.makeDateStockRow(this.props.stockInfo || []):
          this.makeDefaultStockRow(this.props.stockInfo || [])
        }
      </PlainCard>
    )
  }
}
