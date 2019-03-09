import React, { Component } from 'react';
import './App.css';
import { BrowserRouter, Route, Link } from 'react-router-dom'
import { Button, Layout } from 'antd';
import Header from './components/Header'
import Create from './pages/Create';
import Course from './pages/Course';
import Detail from './pages/Detail';
import QAndA from './pages/QAndA';


const { Footer, Content } = Layout

class App extends Component {
  render() {
    return (
      <BrowserRouter className="App">

      <Layout>
        <Header></Header>
        <Content>
          <Route path="/" exact component={Course}></Route>
          <Route path="/qa" component={QAndA}></Route>
          <Route path="/create" component={Create}></Route>
          <Route path="/detail/:address" component={Detail}></Route>
        </Content>

      </Layout>
      {/* <div> */}
        {/* <ul>
        <li>
            <Link to="/">Course</Link>
          </li>
          <li>
            <Link to="/qa">Q&A</Link>
          </li>
          <li>
            <Link to="/create">Create</Link>
          </li>
        </ul>
     */}
      {/* </div> */}

      </BrowserRouter>
    );
  }
}

export default App;
