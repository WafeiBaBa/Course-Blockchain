import React from 'react'
import { Menu, Layout } from 'antd';

import { Link, withRouter } from 'react-router-dom';

const Header = Layout.Header
class HeadComp extends React.Component {
	render() {

		console.log(this.props)
		return (

			<Header>
				<div className="logo">
					Course-Blockchain
					{/* <img src="/mooc.png" alt=""></img> */}
				</div>

				<Menu 
					theme='dark' 
					mode='horizontal' 
					style={{lineHeight:'64px'}}
					defaultSelectedKeys={[this.props.location.pathname]}
				>
					<Menu.Item key="/">
						<Link to="/">Home Page</Link>
					</Menu.Item>
					<Menu.Item key="/qa">
						<Link to="/qa">Q&A</Link>
					</Menu.Item>
					<Menu.Item key="/create">
						<Link to="/create">Create Course (Crowdfunding)</Link>
					</Menu.Item>
				</Menu>
			</Header>
		)
	}
}

export default withRouter(HeadComp)