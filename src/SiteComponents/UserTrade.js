import React from 'react';
import Button from '../Components/Buttons';
import { TextInput } from '../Components/Inputs';
import Loader from '../Components/Loader';
import { hasInput } from '../Helpers/InputsCheck';
import { checkAllInputs, handleOnChange } from '../Helpers/InputFunctions';
import '../Styles/UserTrade.css';


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
      isLoading: false
    }
    this.checkInput = {
      stockName: hasInput,
      stockAmount: hasInput,
    }
    this.onInputChange = this.onInputChange.bind(this);
    this.submitForm = this.submitForm.bind(this);
  }

  onInputChange(e, inputKey){
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
          val={this.state.stockName.val}
          hasError={this.state.stockName.hasError}
          onChange={(e) => this.onInputChange(e, 'stockName')}/>
        <TextInput
          title='AMOUNT'
          placeholder='Amount to buy'
          val={this.state.stockAmount.val}
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
