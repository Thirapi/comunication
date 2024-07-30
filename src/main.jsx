import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './index.css';

const App = () => {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Switch>
        <Route path="/login">
          <LoginPage setUser={setUser} />
        </Route>
        <Route path="/register">
          <RegisterPage />
        </Route>
        <Route path="/">
          {user ? <Home user={user} /> : <Redirect to="/login" />}
        </Route>
      </Switch>
    </Router>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
