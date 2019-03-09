import React from 'react';
import { ipfsPrefix, courseListContract, web3, getCourseContract } from '../config';
import { Row, Col, Badge, Button, Switch } from 'antd';
import { Link } from 'react-router-dom';



class Course extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      detailList: [],
      addressList: [],
      account: '',
      isAdmin: false,
      isShowAll: true
    }
    this.init()

  }

  async init(){
    const [account] = await web3.eth.getAccounts()
    const isAdmin = await courseListContract.methods.isAdmin().call({
      from:account
    })
    const addressList = await courseListContract.methods.getCourse().call({
      from:account
    })
    
    const detailList = await Promise.all(
      addressList.map(address=>{
        return getCourseContract(address).methods.getDetail().call({
          from:account
        })
      })
    )

    this.setState({
      detailList,
      addressList,
      account,
      isAdmin
    })

    console.log(isAdmin)

  }

  async remove(index){
    console.log(this.state.account)
    await courseListContract.methods.removeCourse(index).send({
      from: this.state.account,
      gas: '5000000'
    })
    this.init()
  }

  onChangeSwitch = async (value)=>{
    this.setState({
      isShowAll: value
    })
  }

  render(){

    return(

      <Row style={{marginTop:"30px"}} gutter={16}>

        <Col span={20}>
          <Switch onChange={this.onChangeSwitch}
           checkedChildren="All" 
           unCheckedChildren="Online"
           defaultChecked>
           
          </Switch>
        </Col>
        {this.state.detailList.map((detail, index)=>{
          
          const address = this.state.addressList[index]
          let [name, content, target, fundingPrice, 
            price, image, video, count, isOnline, role] = Object.values(detail)
          if (!this.state.isShowAll && !isOnline) {
              return null
          }
          target = web3.utils.fromWei(target)
          fundingPrice = web3.utils.fromWei(fundingPrice)
          price = web3.utils.fromWei(price)
          let buyPrice = isOnline ? price : fundingPrice

          return(
            <Col key={image} span={6}>

              <div className="content">
                <p>
                  <span>{name}</span>
                  <span>{isOnline
                          ? <Badge count="Online" style={{backgroundColor:"#52c41a"}}></Badge>
                          : <Badge count="Crowdfunding"></Badge>}
                  </span>
                </p>

                <img className="item" src={`${ipfsPrefix}${image}`} alt=""></img>

                <div className="center">
                  <p>
                    {`Target Money: ${target} ether, Now have ${count} people support.`}
                  </p>

                  <p>
                    <span>{name}</span>
                    <span>{isOnline
                            ? <Badge count={`Online Price ${price} ether`} style={{backgroundColor:"#52c41a"}}></Badge>
                            : <Badge count={`Funding Price ${fundingPrice} ether`}></Badge>}
                    </span>
                  </p>

                  <Button type="primary" block style={{marginBottom:"10px"}}>
                    <Link to={`/detail/${address}`}>
                      Check details
                    </Link>
                  </Button>


                  {
                    this.state.isAdmin
                      ? <Button onClick={ ()=>{this.remove(index)} }  type="primary" block>Delete</Button>
                      : null
                  }

                </div>

              </div>
            </Col>
          )
        })}
      </Row>
    )
  }
}


export default Course