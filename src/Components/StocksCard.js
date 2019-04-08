// a component to show stocks in a nice table
import React from 'react';
import PlainCard from './PlainCard';
import '../Styles/StocksCard.css';

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

// TODO: change date to date object and extract the data
function SingleStockWithDate(props){
  return(
    <div className='single-stock'>
      <div className='left-info'>
        <div className='left-column right-line date'>
          <div>
            {props.date.month}
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
  makeDefaultStockRow(stockInfo){
    let singleStocks = stockInfo.map((e, i)=>{
      return(
        <SingleStock
          key={`single-stock-${e.name}-${i}`}
          stockName={e.name}
          stockAmount={e.amount}
          price={e.price}/>
      )
    })
    return singleStocks;
  }

  makeDateStockRow(stockInfo){
    let singleStocks = stockInfo.map((e)=>{
      return(
        <SingleStockWithDate
          date={e.date}
          key={`single-stock-${e.name}`}
          stockName={e.name}
          stockAmount={e.amount}
          price={e.price}/>
      )
    })
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
