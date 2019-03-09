const fs = require('fs')
const path = require('path')
const solc = require('solc')


const contractPath = path.resolve(__dirname, '../contracts/Mooc.sol')

const source = fs.readFileSync(contractPath, 'utf-8')

const ret = solc.compile(source)
// console.log(ret)

if(Array.isArray(ret.errors) && ret.errors.length>0){
  console.log(ret.errors[0])
}else{
  Object.keys(ret.contracts).forEach(name=>{
    const contractName = name.slice(1)
    const filePath = path.resolve(__dirname, `../src/compiled/${contractName}.json`)
    fs.writeFileSync(filePath,JSON.stringify(ret.contracts[name]))
    console.log(`${filePath} bingo`)
  })
}
