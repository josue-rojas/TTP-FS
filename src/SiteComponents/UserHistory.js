import React from 'react';
import PlainCard from '../Components/PlainCard';
import StocksCard from '../Components/StocksCard';
import { getTransactions } from '../Helpers/endpoints';
import '../Styles/UserHistory.sass';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default class UserHistory extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      userHistory: [],
    };
  }

  componentDidMount(){
    if(this.props.user){
      this.props.firebase.auth().currentUser.getIdToken(true)
      .then((idToken) => Promise.all([getTransactions(idToken)]))
      .then( (result) => {
        let stockTransaction = [];
        for(let e in result[0]){
          let date = new Date(result[0][e].datePurchase);
          stockTransaction.push({
            symbol: result[0][e].symbol,
            price: result[0][e].purchasePrice,
            amount: (result[0][e].amount) * (result[0][e].isBought ? 1 : -1),
            isBought: result[0][e].isBought,
            date: {
              year: date.getFullYear(),
              month: MONTHS[date.getMonth()],
              day: date.getDate()
            }
          });
        }
        this.setState({ userHistory: stockTransaction });
      })
    }
  }

  render(){
    return(
      <div className='user-history'>
        <PlainCard className='user-history-title-card'>
          <span>History Transactions</span>
        </PlainCard>
        <StocksCard
          withDate={true}
          stockInfo={this.state.userHistory}/>
      </div>
    )
  }
}
