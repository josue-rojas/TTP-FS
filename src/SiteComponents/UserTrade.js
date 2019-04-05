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
      stockPrice: {
        val: '',
        hasError: false,
      },
      isLoading: false
    }
    this.checkInput = {
      stockName: hasInput,
      stockPrice: hasInput,
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
          title='STOCK PRICE'
          placeholder='Price to buy'
          val={this.state.stockPrice.val}
          hasError={this.state.stockPrice.hasError}
          onChange={(e) => this.onInputChange(e, 'stockPrice')}/>
        <Button
          text='Send'
          onClick={this.submitForm}/>
        </form>
      </div>
    )
  }
}
