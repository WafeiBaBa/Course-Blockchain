const path = require('path')
const Web3 = require('web3')
const fs = require('fs')

const HdWalletProvider = require('truffle-hdwallet-provider')


const contractPath = path.resolve(__dirname, '../src/compiled/CourseList.json')
const {
	interface,
	bytecode
} = require(contractPath)

const provider = new HdWalletProvider(
	"bachelor orient woman knock snow quarter devote deer ketchup example bunker perfect",
	"https://ropsten.infura.io/v3/2430e7304a5d473f90e4bc693430881c"
	
)

const web3 = new Web3(provider);

(async () => {
	console.log('self called.')
	const accounts = await web3.eth.getAccounts()
	console.log('accounts deployed: ', accounts)

	console.time('deploy time!')
	const result = await new web3.eth.Contract(JSON.parse(interface))
		.deploy({
			data: bytecode
		})
		.send({
			from: accounts[0],
			gas: '5000000'
		})
	console.timeEnd('deploy time!')

	const contractAddress = result.options.address
	console.log('deploy success!', contractAddress)
	console.log('check the address!', `https://ropsten.etherscan.io/address/${contractAddress}`)

	const addressFile = path.resolve(__dirname, '../src/address.js')
	fs.writeFileSync(addressFile, "export default " + JSON.stringify(contractAddress))
	console.log("write success!", addressFile)
})()

