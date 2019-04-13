import React from 'react';
import { TextInputWithTooltip } from '../Components/Inputs';
import { ButtonwLoader } from '../Components/Buttons';
import { hasInput, isWholeNumber, isNumber } from '../Helpers/InputsCheck';
import { checkAllInputs, handleOnChange } from '../Helpers/InputFunctions';
import '../Styles/UserTrade.css';
import { getStockPrice, buyStock } from '../Helpers/endpoints';
import { clearAllTimeOut }  from '../Helpers/timerFunctions';

export default class UserTrade extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      stockName: {
        val: '',
        hasError: false,
        tooltop: '',
      },
      stockAmount: {
        val: '',
        hasError: false,
        tooltop: '',
      },
      stockValue: {
        val: '',
        hasError: false,
        tooltop: '',
      },
      isLoading: false
    }
    this.checkInput = {
      stockName: hasInput,
      stockAmount: isWholeNumber,
      stockValue: isNumber,
    }
    // this.tooltipTimers = [];
    this.onInputChange = this.onInputChange.bind(this);
    this.submitForm = this.submitForm.bind(this);
    // this.clearAllToolTips = this.clearAllToolTips.bind(this);
  }

  // componentWillUnmount(){
  //   clearAllTimeOut(this.tooltipTimers);
  // }

  // clearAllToolTips(){
  //   // clear tooltips so they won't appear again if there are no errors
  //   let copyState = { ...this.state };
  //   let tooltips = ['stockName', 'stockAmount', 'stockValue'];
  //   for(let i in tooltips){
  //     copyState[tooltips[i]].tooltip = '';
  //   }
  //   this.tooltipTimers.push(
  //     setTimeout(()=>{
  //       this.setState({ copyState });
  //     }, 2300)
  //   );
  // }

  onInputChange(e, inputKey){
    // fetch values everytime user changes input
    if(inputKey === 'stockName'){
      let stockValue = { ...this.state.stockValue };
      if(e.target.value.length < 1){
        stockValue.val = '';
        this.setState({ stockValue: stockValue });
      }
      else{
        let symbol = e.target.value.toUpperCase();
        getStockPrice(symbol)
        .then((r)=>{
          if(r[symbol]){
            stockValue.val = r[symbol].price+'';
          }
          else stockValue.val = 'Stock doesnt exist';
          this.setState({ stockValue: stockValue });

        })
        .catch((err)=>{
          stockValue.val = 'error';
          this.setState({ stockValue: stockValue });
        })
      }
    }
    let inputState = handleOnChange(e, inputKey, this.state, this.checkInput);
    this.setState({
      [inputKey]: inputState
    });
  }

  // just return an object of input values when reser (default values)
  resetForm(){
    return {
      stockName: {
        val: '',
        hasError: false,
      },
      stockAmount: {
        val: '',
        hasError: false,
      },
      stockValue: {
        val: '',
        hasError: false
      }
    }
  }

  submitForm(){
    let valuesChange = checkAllInputs(this.checkInput, this.state);
    if(valuesChange){
      this.setState(valuesChange);
      return false;
    }
    let body = JSON.stringify({
      symbol: this.state.stockName.val.toUpperCase(),
      amount: parseInt(this.state.stockAmount.val, 10),
      value: parseFloat(this.state.stockValue.val, 10),
    })
    if(this.props.user){
      this.setState({ isLoading: true });
      this.props.firebase.auth().currentUser.getIdToken(true)
        .then((idToken) => Promise.all([buyStock(idToken, body)]))
        .then((result) => {
          if(result[0].status === 'ok'){
            let inputState = this.resetForm();
            inputState.isLoading = false;
            this.setState( inputState );
            this.props.refreshCallback();
            // should have a callback to notify parent components
          }
        })
        .catch((err) => console.log(err));
    }
  }



  render(){
    return(
      <div style={{position: 'relative'}} className='trade-form'>
        <form>
        <TextInputWithTooltip
          tooltipMessage={this.state.stockName.tooltip}
          title='STOCK NAME'
          placeholder='Name of stock'
          autocomplete={false}
          value={this.state.stockName.val}
          hasError={this.state.stockName.hasError}
          onChange={(e) => this.onInputChange(e, 'stockName')}/>
        <TextInputWithTooltip
          tooltipMessage={this.state.stockValue.tooltip}
          title='VALUE'
          placeholder='Value of stock (auto)'
          disabled={true}
          autocomplete={false}
          value={this.state.stockValue.val}
          hasError={this.state.stockValue.hasError}
          onChange={(e) => console.log('nothing here')}/>
        <TextInputWithTooltip
          tooltipMessage={this.state.stockValue.tooltip}
          title='AMOUNT'
          placeholder='Amount to buy'
          autocomplete={false}
          value={this.state.stockAmount.val}
          hasError={this.state.stockAmount.hasError}
          onChange={(e) => this.onInputChange(e, 'stockAmount')}/>
        <ButtonwLoader
          inverse={true}
          isLoading={this.state.isLoading}
          text='Buy'
          onClick={this.submitForm}/>
        </form>
      </div>
    )
  }
}
