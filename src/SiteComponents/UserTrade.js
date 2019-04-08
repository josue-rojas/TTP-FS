import React from 'react';
import Button from '../Components/Buttons';
import { TextInput } from '../Components/Inputs';
import Loader from '../Components/Loader';
import { hasInput } from '../Helpers/InputsCheck';
import { checkAllInputs, handleOnChange } from '../Helpers/InputFunctions';
import '../Styles/UserTrade.css';
import { getStockPrice } from '../Helpers/endpoints';


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
      stockAmount: hasInput,
      stockValue: hasInput,
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
    return console.log('ummm not implemented...')
    this.setState({ isLoading: true });
  }

  render(){
    return(
      <div style={{position: 'relative'}} className='trade-form'>
        <Loader isLoading={this.state.isLoading}/>
        <form className={this.state.isLoading ? 'inactive': ''}>
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
        <Button
          text='Buy'
          onClick={this.submitForm}/>
        </form>
      </div>
    )
  }
}
