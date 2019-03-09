import React from 'react';
import { Form, Row, Col, Input, Button, message, Comment, Badge, Modal } from 'antd';
import { saveJsonToIpfs, courseListContract, web3, readJsonFromIpfs } from '../config';


const FormItem = Form.Item
class QAndA extends React.Component{

  constructor(props){
    super(props)
    this.state = {
      questions: [],
      title: '',
      content: '',
      account: '',
      isShowModal: false,
      answerIndex: 0,
      answer: ''
    }
    this.init()
    // console.log(this.state.questions)
  }

  async init(){
    let [account] = await web3.eth.getAccounts()
    const qas = await courseListContract.methods.getQa().call({
      from:account
    })
    console.log(qas)
    let res = []
    for (let i = 0; i < qas.length; i+=2) {
      res.push(readJsonFromIpfs(qas[i], qas[i+1]))
    }
    const questions = await Promise.all(res)
    console.log(questions)
    this.setState({
      account,
      questions
    })
  }

  handleChange = (e)=>{
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleSubmit = async (e)=>{
    e.preventDefault()

    const obj = {
      title: this.state.title,
      content: this.state.content,
      answers: []
    }

    const hide = message.loading("Questioning", 0)

    const hash = await saveJsonToIpfs(obj)

    const hash1 = hash.slice(0, 23)
    const hash2 = hash.slice(23)

    let [account] = await web3.eth.getAccounts()
    await courseListContract.methods.createQa(
      web3.utils.asciiToHex(hash1),
      web3.utils.asciiToHex(hash2)
    ).send({
      from:account,
      gas:'6000000'
    })
    this.setState({
      title: '',
      content: ''
    })
    hide()
  }

  showInfoModal(i){
    this.setState({
      answerIndex: i,
      isShowModal: true
    })
  }

  handleAnsChange = (e)=>{
    this.setState({
      answer: e.target.value
    })
  }

  handleOk = async (e)=>{
    const item = this.state.questions[this.state.answerIndex]
    item.answers.push({
      text: this.state.answer
    })
    const hash = await saveJsonToIpfs(item)
    const hash1 = web3.utils.asciiToHex(hash.slice(0, 23)) 
    const hash2 = web3.utils.asciiToHex(hash.slice(23)) 
    await courseListContract.methods
      .updateQa(this.state.answerIndex, hash1, hash2)
      .send({
        from: this.state.account,
        gas: '5000000'
      })
      this.init()
      this.setState({
        isShowModal: false,
        answer: ''
      })

  }
  
  handleCancel= (e)=>{
    this.setState({
      isShowModal:false,
      answer: ''
    })
  }



  render(){
    return (
      <Row justify='center' type='flex'>
        <Col span={20}>

        {
          this.state.questions.map((item, index)=>{
            return (
              <Comment
                key={item.title}
                actions = {[<span onClick={()=>this.showInfoModal(index)}>Reply</span>]}
                author = {item.title}
                content = {item.content}
                avatar = {<Badge count={index+1}></Badge>}
              >
                {item.answers.map((ans, i)=>{
                  return <Comment
                    key={ans.text}
                    content={ans.text}
                  >

                  </Comment>
                })}
              </Comment>
            )
          })
        }
          <Form onSubmit={this.handleSubmit} style={{marginTop:"20px"}}>
            <FormItem label="Title">
              <Input value={this.state.title} name="title" onChange={this.handleChange}></Input>
            </FormItem>
            <FormItem label="Question Content">
              <Input.TextArea 
                rows={6} 
                value={this.state.content} 
                name='content'
                onChange={this.handleChange}>
              </Input.TextArea>
            </FormItem>

            <FormItem>
              <Button type='primary' htmlType='submit'>Add Question</Button>
            </FormItem>
          </Form>
        </Col>

        <Modal 
          title="Reply"
          visible={this.state.isShowModal}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <Input value={this.state.answer} onChange={this.handleAnsChange}></Input>
        </Modal>
      </Row>
    )
  }
}

export default QAndA