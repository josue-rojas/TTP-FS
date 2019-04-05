import React, { Component } from 'react';
import './Styles/App.css';
import TwoPanelMain from './SiteComponents/TwoPanelMain';
import { BrowserRouter as Router, Route, Redirect, Switch } from "react-router-dom";

export default class App extends Component {
  constructor(props){
    super(props);
    this.redirectComponent = this.redirectComponent.bind(this);
  }

  redirectComponent(){
    return(
      <Redirect to={{
        pathname: '/',
        state: { from: this.props.location }
      }}/>
    )
  }

  render() {
    return (
      <Router basename={process.env.PUBLIC_URL}>
        <Switch>
          <Route path="/(|signup|signin)/"  exact component={TwoPanelMain}/>
          <Route component={this.redirectComponent} />
        </Switch>
      </Router>
    );
  }
}
