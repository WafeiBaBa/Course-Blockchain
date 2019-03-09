import React from 'react';
import { Row, Col, Input, Form, Upload, Button } from 'antd';
import { Redirect } from 'react-router-dom';
import { saveImageToIpfs, ipfsPrefix, courseListContract, web3 } from '../config';

const FormItem = Form.Item
class Create extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      toIndex: false,
      name:'',
      content: '',
      img: '',
      target: '',
      fundingPrice: '',
      price: ''
    }
  }

  handleSubmit = async (e)=>{
    console.log(this.state)
    e.preventDefault()
    const [account] = await web3.eth.getAccounts()
    const array = [
      this.state.name,
      this.state.content,
      web3.utils.toWei(this.state.target),
      web3.utils.toWei(this.state.fundingPrice),
      web3.utils.toWei(this.state.price),
      this.state.img
      // this.state.target
    ]

    await courseListContract.methods.createCourse(...array)
                    .send({
                      from: account
                    })
    
    this.setState({
      toIndex: true
    })
  }

  handleUpload = async (file)=>{
    const hash = await saveImageToIpfs(file)
    console.log(hash)
    this.setState({
      img: hash
    })
    return false
  }

  onChange = (e)=>{
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  render(){
    if(this.state.toIndex){
      return <Redirect to="/"></Redirect>
    }

    return(
      <Row 
        type='flex'
        justify='center'
        style={{marginTop:'30px'}}
      >
        <Col span={20}>
          <Form onSubmit={this.handleSubmit}>
            <FormItem label="Course Name">
              <Input name='name' onChange={this.onChange}></Input>
            </FormItem>

            <FormItem label="Course Details">
              <Input.TextArea row={6} name='content' onChange={this.onChange}></Input.TextArea>
            </FormItem>

            <FormItem label="Course Image">
              <Upload 
                beforeUpload={this.handleUpload}
                showUploadList={false}
              >

              {
                this.state.img
                  ? <img height="100px" width="100px" src={`${ipfsPrefix}${this.state.img}`} alt=""/>
                  : (
                    <Button type='primary'>
                      Upload Image
                    </Button>
                    )
              }

              </Upload>
            </FormItem>

            <FormItem label="Crowdfunding Target">
              <Input name='target' onChange={this.onChange}></Input>
            </FormItem>
            <FormItem label="Crowdfunding Price">
              <Input name='fundingPrice' onChange={this.onChange}></Input>
            </FormItem>
            <FormItem label="Course Price">
              <Input name='price' onChange={this.onChange}></Input>
            </FormItem>


            <FormItem>
              <Button type='primary' htmlType="submit">Add Course</Button>
            </FormItem>
          </Form>
        </Col>
      </Row>
    )
  }
}


export default Create