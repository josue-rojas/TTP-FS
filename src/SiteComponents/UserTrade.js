import React from 'react';
import { TextInput } from '../Components/Inputs';
import { ButtonwLoader } from '../Components/Buttons';
import { hasInput, isWholeNumber, isNumber } from '../Helpers/InputsCheck';
import { checkAllInputs, handleOnChange } from '../Helpers/InputFunctions';
import '../Styles/UserTrade.css';
import { getStockPrice, buyStock } from '../Helpers/endpoints';


export default class UserTrade extends React.Component {
  constructor(props){
    super(props)
    this.state = {
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
      },
      isLoading: false
    }
    this.checkInput = {
      stockName: hasInput,
      stockAmount: isWholeNumber,
      stockValue: isNumber,
    }
    this.onInputChange = this.onInputChange.bind(this);
    this.submitForm = this.submitForm.bind(this);
  }

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

  submitForm(){
    let valuesChange = checkAllInputs(this.checkInput, this.state);
    if(valuesChange){
      this.setState(valuesChange);
      return false;
    }
    this.setState({ isLoading: true });
    let body = JSON.stringify({
      symbol: this.state.stockName.val.toUpperCase(),
      amount: parseInt(this.state.stockAmount.val, 10),
      value: parseFloat(this.state.stockValue.val, 10),
    })
    if(this.props.user){
      this.props.firebase.auth().currentUser.getIdToken(true)
        .then((idToken) => Promise.all([buyStock(idToken, body)]))
        .then((result) => {
          if(result[0].status === 'ok'){
            this.setState({ isLoading: false });
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
        <TextInput
          title='STOCK NAME'
          placeholder='Name of stock'
          autocomplete={false}
          value={this.state.stockName.val}
          hasError={this.state.stockName.hasError}
          onChange={(e) => this.onInputChange(e, 'stockName')}/>
        <TextInput
          title='VALUE'
          placeholder='Value of stock (auto)'
          disabled={true}
          autocomplete={false}
          value={this.state.stockValue.val}
          hasError={this.state.stockValue.hasError}
          onChange={(e) => console.log('nothing here')}/>
        <TextInput
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
