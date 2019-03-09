import React from 'react';
import { web3, getCourseContract, saveImageToIpfs, ipfsPrefix } from '../config';
import { Row, Col, Form, Button, Badge, Upload, Switch } from 'antd';


const FormItem = Form.Item

class Detail extends React.Component{

  constructor(props){
    super(props)
    this.state = {
      address: this.props.match.params.address
    }
    this.init()
  }

  async init(){
    const [account] = await web3.eth.getAccounts()
    const contract = getCourseContract(this.state.address)
    const detail = await contract.methods.getDetail().call({
      from:account
    })

    let [name, content, target, fundingPrice, 
      price, image, video, count, isOnline, role] = Object.values(detail)
    
    this.setState({
      account,name, content, image, 
      video, count, isOnline, role, 
      target: web3.utils.fromWei(target),
      fundingPrice: web3.utils.fromWei(fundingPrice),
      price: web3.utils.fromWei(price)
    })
  }


  buy = async ()=>{
    const contract = getCourseContract(this.state.address)
    const buyPrice = this.state.isOnline ? this.state.price : this.state.fundingPrice
    await contract.methods.buy().send({
      from: this.state.account,
      value: web3.utils.toWei(buyPrice),
      gas: '6000000'
    })

    this.init()
  }


  handleUpload = async (file)=>{
    const hash = await saveImageToIpfs(file)
    const contract = getCourseContract(this.state.address)
    await contract.methods.addVideo(hash).send({
      from: this.state.account,
      gas: '6000000'
    })

    this.init()
  }




  render(){

    const formItemLayout = {
      labelCol:{
        span:6
      },
      wrapperCol:{
        span:10
      }
    }
    return(
      <Row type='flex' justify="center" style={{marginTop:"30px"}}>
        <Col span={20}>
          <Form>
            <FormItem {...formItemLayout} label="Course Name">
              {this.state.name}
            </FormItem>
            <FormItem {...formItemLayout} label="Course Content">
              {this.state.content}
            </FormItem>
            <FormItem {...formItemLayout} label="Crowdfunding Target">
              {this.state.target} ether
            </FormItem>
            <FormItem {...formItemLayout} label="Funding Price">
              {this.state.fundingPrice} ether
            </FormItem>
            <FormItem {...formItemLayout} label="Online Price">
              {this.state.price} ether
            </FormItem>
            <FormItem {...formItemLayout} label="The Number of Support People">
              {this.state.count}
            </FormItem>
            <FormItem {...formItemLayout} label="Status">
              {this.state.isOnline
                ? <Badge count="Now Online"></Badge>
                : <Badge count="Now Crowdfunding"></Badge>}
            </FormItem>
            <FormItem {...formItemLayout} label="Role">
              {
                this.state.role === '0' && <Upload beforeUpload={this.handleUpload} showUploadList={false}>
                  <Button type='primary'>Upload Video</Button>
                </Upload>
              }
                            
              {
                this.state.role === '1' && "Have fun!"
              }
              
              {
                this.state.role === '2' && "Buy Now!"
              }
            </FormItem>

            <FormItem {...formItemLayout} label="Video Status">
              {
                this.state.video
                ? (this.state.role === '2' ? "Already Uploaded" : <video controls width="300px" src={`${ipfsPrefix}${this.state.video}`}></video>)
                : "Wait for uploading..."
              }
            </FormItem>

            <FormItem {...formItemLayout} label="Buy">
              {
                this.state.role === '2' && (
                  <Button type='primary' onClick={this.buy}>
                    Support {this.state.isOnline ? this.state.price : this.state.fundingPrice} ether
                  </Button>
                )
              }
            </FormItem>
          </Form>
        </Col>
      </Row>
    )
  }
}

export default Detail