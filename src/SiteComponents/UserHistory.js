import React from 'react';
import PlainCard from '../Components/PlainCard';
import StocksCard from '../Components/StocksCard';
import '../Styles/UserHistory.sass';

// sample data for now
let stockInfo = [
  {name: 'AAPL', price: '100', amount: '10', date: {month: 'Aug 10', year: '2018'}},
  {name: 'SNAP', price: '10', amount: '100', date: {month: 'Aug 12', year: '2018'}},
  {name: 'NERV', price: '9', amount: '14', date: {month: 'Sep 5', year: '2018'}},
  {name: 'BPMX', price: '.009', amount: '1004', date: {month: 'Jun 20', year: '2008'}},
];


export default class UserHistory extends React.Component {
  render(){
    return(
      <div className='user-history'>
        <PlainCard className='user-history-title-card'>
          <span>History Transactions</span>
        </PlainCard>
        <StocksCard
          withDate={true}
          stockInfo={stockInfo}/>
      </div>
    )
  }
}
