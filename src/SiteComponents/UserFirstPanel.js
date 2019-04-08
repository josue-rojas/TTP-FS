import React from 'react';
import Button from '../Components/Buttons';
import MenuIcon from '../Components/MenuIcon';
import StocksCard from '../Components/StocksCard';
import PlainCard from '../Components/PlainCard';
import { getUserMoney, getStocksHolding } from '../Helpers/endpoints';
import { withRouter } from "react-router-dom";
import '../Styles/UserFirstPanel.css';
import Logo from './Logo';

// sample data for now
let stockInfo = [
  {name: 'AAPL', price: '100', amount: '10', date: {month: 'Aug 10', year: '2018'}},
  {name: 'SNAP', price: '10', amount: '100', date: {month: 'Aug 12', year: '2018'}},
  {name: 'NERV', price: '9', amount: '14', date: {month: 'Sep 5', year: '2018'}},
  {name: 'BPMX', price: '.009', amount: '1004', date: {month: 'Jun 20', year: '2008'}},
];

// one of the props include the user so we won't have to send another request
class UserFirstPanel extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      userMoney: 0,
      userStockInfo: [],
    }
    this.signout = this.signout.bind(this);
  }

  componentWillMount(){
    if(this.props.user){
      this.props.firebase.auth().currentUser.getIdToken(true)
        .then((idToken) => Promise.all([getUserMoney(idToken), getStocksHolding(idToken)]))
        .then((result) => {
          let stocksHolding = [];
          for(let e in result[1]){
            stocksHolding.push({
              symbol: result[1][e].symbol,
              amount: result[1][e].amount,
              price: result[1][e].averagePrice
            });
          }
          this.setState({
            userMoney: result[0].money,
            userStockInfo: stocksHolding,
           });
        })
        .catch((err) => console.log('err', err));
    }
  }

  componentDidMount(){
    // try to avoid if somehow user is not sign in and access this page
    // redirect to signin
    if(!this.props.user){
      this.props.history.push('/signin');
      return '';
    }
  }

  signout(){
    this.props.firebase.auth()
      .signOut()
      .then(()=> console.log('Sign Out'))
      .catch((error)=> console.log('error signout', error))
  }

  render() {
    if(!this.props.user) return '...'
    return(
      <div className='user-panel panel-content'>
        <div className='top-header'>
          <Logo/>
          <MenuIcon
            isActive={this.props.sActive}
            onClick={this.props.toggleSPanel}/>
        </div>
        <div className='content-wrapper'>
          <PlainCard className='user-info'>
            <div>Total</div>
            <div className='total'>{this.state.userMoney}</div>
          </PlainCard>
          <div className='user-card'>
            <StocksCard
              withDate={false}
              stockInfo={this.state.userStockInfo}/>
          </div>
        </div>
        <div className='button-wrapper' id='#signout'>
          <Button
            className='inverse'
            onClick={this.signout}
            text='Sign Out'/>
        </div>
      </div>
    )
  }
}

export default withRouter(UserFirstPanel);
