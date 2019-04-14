import React from 'react';
import { TextInputWithTooltip } from '../Components/Inputs';
import { ButtonwLoader } from '../Components/Buttons';
import { hasInput, isWholeNumber, isNumber } from '../Helpers/InputsCheck';
import { checkAllInputs, onInputChangeTooltip } from '../Helpers/InputFunctions';
import '../Styles/UserTrade.css';
import { getStockPrice, buyStock } from '../Helpers/endpoints';
import { clearPrevTooltip } from '../Helpers/tooltipHelpers';

export default class UserTrade extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      stockName: {
        val: '',
        hasError: false,
        tooltip: '',
      },
      stockAmount: {
        val: '',
        hasError: false,
        tooltip: '',
      },
      stockValue: {
        val: '',
        hasError: false,
        tooltip: '',
      },
      isLoading: false,
      previousTooltip: '',
    }
    this.checkInput = {
      stockName: hasInput,
      stockAmount: isWholeNumber,
      stockValue: isNumber,
    }
    this.onInputChange = this.onInputChange.bind(this);
    this.submitForm = this.submitForm.bind(this);
    this.clearTooltipTimer = null;
  }

  componentWillUnmount(){
    clearTimeout(this.clearTooltipTimer);
  }

  onInputChange(e, inputKey){
    // fetch values everytime user changes input
    // might be slow if you type really fast (setState is not updated right away: need fix)
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
    onInputChangeTooltip(e, inputKey, this);
  }

  // just return an object of input values when reser (default values)
  resetForm(){
    return {
      stockName: {
        val: '',
        hasError: false,
        tooltip: '',
      },
      stockAmount: {
        val: '',
        hasError: false,
        tooltip: '',
      },
      stockValue: {
        val: '',
        hasError: false,
        tooltip: '',
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
          }
          else if(result[0].status !== '200'){
            // i think the only error for now was not having money to buy
            // should add later stock doesnt exist in back end
            let stockAmount = { ...this.state.stockAmount };
            stockAmount.tooltip = result[0].message || 'Something went wrong.';
            clearTimeout(this.clearTooltipTimer);
            this.setState({
              stockAmount: stockAmount,
              isLoading: false,
              previousTooltip: 'stockAmount',
            });
            if(this.state.previousTooltip){
              clearPrevTooltip(this);
            }
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
          tooltipMessage={this.state.stockAmount.tooltip}
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
