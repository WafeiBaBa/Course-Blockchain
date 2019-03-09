import IpfsAPI from 'ipfs-api';
// import ipfsClient from "ipfs-http-client";
import { notification, message } from 'antd';
import Web3 from 'web3';

import CourseList from '../src/compiled/CourseList.json';
import Course from '../src/compiled/Course.json';
import address from './address';


// let ipfs = ipfsClient({
//   host: 'ipfs.infura.io',
//   port: 5001,
//   protocol: 'https'
// })
let ipfs = IpfsAPI("ipfs.infura.io", "5001", {"protocol": "https"})


// let ipfsPrefix = "https://ipfs.infura.io:5001/api/v0/block/get?arg="
let ipfsPrefix = "https://ipfs.infura.io:5001/api/v0/cat?arg="
// let ipfsPrefix = "https://ipfs.infura.io:5001/ipfs/"


let web3
if (window.web3) {
  web3 = new Web3(window.web3.currentProvider)
}else{
  notification.error({
    message: 'No ethereum plugin',
    description: 'Please install metamask'
  })
}

let courseListContract = new web3.eth.Contract(JSON.parse(CourseList.interface), address)
let getCourseContract = (addr) => new web3.eth.Contract(JSON.parse(Course.interface), addr)

function saveImageToIpfs(file){
  const hide = message.loading('Uploading...')
  return new Promise((resolve, reject)=>{
    let reader = new FileReader()
    reader.readAsArrayBuffer(file)
    reader.onloadend = async ()=>{
      const buffer = Buffer.from(reader.result, 'utf-8')
      const res = await ipfs.add(buffer)
      console.log(res)
      hide()
      resolve(res[0].hash)
    }
    
    
    // {
    //   const buffer = Buffer.from(reader.result)
    //   ipfs.add(buffer).then(res=>{
    //     console.log(res)
    //     resolve(res[0].hash)
    //   })
    // }
  })
}

function saveJsonToIpfs(json){
  return new Promise(async (resolve, reject)=>{
    const buffer = Buffer.from(JSON.stringify(json))
    const res = await ipfs.add(buffer)
    console.log(res)
    resolve(res[0].hash)
  })

}

function readJsonFromIpfs(hash1, hash2) {
  return new Promise(async (resolve, reject)=>{
    const hash = web3.utils.hexToAscii(hash1) + web3.utils.hexToAscii(hash2)
    const value = await ipfs.cat(hash)
    const result = new TextDecoder('utf-8').decode(value)
    resolve(JSON.parse(result))
  })
}

export {ipfs, ipfsPrefix, saveImageToIpfs, saveJsonToIpfs,readJsonFromIpfs,
        web3, courseListContract, getCourseContract}