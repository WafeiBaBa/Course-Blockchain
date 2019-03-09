const path = require('path')
const assert = require('assert')
const Web3 = require('web3')
const ganache = require('ganache-cli')
const BigNumber = require('bignumber.js')


const web3 = new Web3(ganache.provider())

const CourseList = require(path.resolve(__dirname, '../src/compiled/CourseList.json'))
const Course = require(path.resolve(__dirname, '../src/compiled/Course.json'))


let accounts
let courseList
let course
describe("test mocha", ()=>{
    
    before(async ()=>{
        accounts = await web3.eth.getAccounts()
        console.log(accounts)
        courseList = await new web3.eth.Contract(JSON.parse(CourseList.interface))
            .deploy({data:CourseList.bytecode})
            .send({
                // the account 9 is the deployer
                from:accounts[9],
                gas:'5000000'
            })
    })

    it('test if deployed', ()=>{
        assert.ok(courseList.options.address)
    })

    it('test createCourse', async ()=>{
        let address = await courseList.methods.getCourse().call()
        assert.equal(address.length, 0)
        await courseList.methods.createCourse(
            'Course One',
            'React',
            web3.utils.toWei('8'),
            web3.utils.toWei('2'),
            web3.utils.toWei('4'),
            "hash of image"
            )
                .send({
                    from:accounts[0],
                    gas:'5000000'
                })

        address = await courseList.methods.getCourse().call()
        assert.equal(address.length, 1)
    })

    it('test add attribute', async ()=>{
        const address = await courseList.methods.getCourse().call()

        course = await new web3.eth.Contract(JSON.parse(Course.interface), address[0])
        const name = await course.methods.name().call()
        const content = await course.methods.content().call()
        const target = await course.methods.target().call()
        const fundingPrice = await course.methods.fundingPrice().call()
        const price = await course.methods.price().call()
        const image = await course.methods.image().call()
        const video = await course.methods.video().call()
        const count = await course.methods.count().call()
        const isOnline = await course.methods.isOnline().call()

        assert.equal(name, "Course One")
        assert.equal(content, "React")
        assert.equal(target, web3.utils.toWei('8'))
        assert.equal(fundingPrice, web3.utils.toWei('2'))
        assert.equal(price, web3.utils.toWei('4'))
        assert.equal(image, "hash of image")
        assert.equal(video, "")
        assert.equal(count, 0)
        assert.ok(!isOnline)

    })

    it('test removeCourse', async ()=>{
        await courseList.methods.createCourse(
            "Course Two",
            'Vue',
            web3.utils.toWei('8'),
            web3.utils.toWei('2'),
            web3.utils.toWei('4'),
            "hash of image"
            )
                .send({
                    from:accounts[0],
                    gas:'5000000'
                })
        const address = await courseList.methods.getCourse().call()
        assert.equal(address.length, 2)

        // try {
        //     await courseList.methods.removeCourse(0)
        //     .send({
        //         from:accounts[1],
        //         gas:'5000000'
        //     })
        // } catch (error) {
        //     assert.equal(error.name, "RuntimeError")
        // }

        // try {
        //     await courseList.methods.removeCourse(1)
        //     .send({
        //         from:accounts[9],
        //         gas:'5000000'
        //     })
        // } catch (error) {
        //     assert.equal(error.name, "RuntimeError")
        // }

        await courseList.methods.removeCourse(1).send({
            from:accounts[9],
            gas:'5000000'
        })
        const address1 = await courseList.methods.getCourse().call()
        assert.equal(address1.length, 1)

    })

    it('test isAdmin', async ()=>{
        const isAdmin1 = await courseList.methods.isAdmin().call({
            from:accounts[9]
        })

        const isAdmin2 = await courseList.methods.isAdmin().call({
            from:accounts[1]
        })

        assert.ok(isAdmin1)
        assert.ok(!isAdmin2)
    })

    it('money transform', ()=>{
        assert.equal(web3.utils.toWei('2'), '2000000000000000000')
    })

    it('test buy', async ()=>{
        await course.methods.buy().send({
            from:accounts[2],
            value:web3.utils.toWei('2')
        })

        const value = await course.methods.users(accounts[2]).call()
        const count = await course.methods.count().call()
        assert.equal(value, web3.utils.toWei('2'))
        assert.equal(count, 1)

        const detail_1 = await course.methods.getDetail().call({
            from:accounts[0]
        })
        assert.equal(detail_1[9], 0)

        const detail_2 = await course.methods.getDetail().call({
            from:accounts[2]
        })
        assert.equal(detail_2[9], 1)

        const detail_3 = await course.methods.getDetail().call({
            from:accounts[3]
        })
        assert.equal(detail_3[9], 2)
    })

    it('if not yet online, can not have income', async()=>{
        const oldBalance = new BigNumber(await web3.eth.getBalance(accounts[0]))
        await course.methods.buy().send({
            from:accounts[3],
            value:web3.utils.toWei('2')
        })

        const newBalance = new BigNumber(await web3.eth.getBalance(accounts[0]))
        const diff = newBalance.minus(oldBalance)
        assert.equal(diff, 0)
    })

    it('if not yet online, can not add video', async()=>{
        // try{
        //     await course.methods.addVideo('video hash').send({
        //         from:accounts[0],
        //         gas:'5000000'
        //     })
        //     assert.ok(false)
        // }catch(e){
        //     // assert.equal(, "RuntimeError")
        // }

    })

    it('can not buy again', async()=>{
        // await course.methods.buy().send({
        //     from:accounts[2],
        //     value:web3.utils.toWei('2')
        // })
        // assert.ok(false)
    })

    it('must be funding price', async()=>{
        // await course.methods.buy().send({
        //     from:accounts[3],
        //     value:web3.utils.toWei('2')
        // })
        // assert.ok(false)
    })

    it('when the course is online, the funding will be income', async()=>{
        const oldBalance = new BigNumber(await web3.eth.getBalance(accounts[0]))
        await course.methods.buy().send({
            from:accounts[4],
            value:web3.utils.toWei('2')
        })

        await course.methods.buy().send({
            from:accounts[5],
            value:web3.utils.toWei('2')
        })

        const newBalance = new BigNumber(await web3.eth.getBalance(accounts[0]))
        const diff = newBalance.minus(oldBalance)

        const count = await course.methods.count().call()
        const isOnline = await course.methods.isOnline().call()
        assert.equal(count, 4)
        assert.ok(isOnline)
        assert.equal(diff, web3.utils.toWei('8'))
    })

    it('when the course is online, the price is 4 ether', async()=>{
        await course.methods.buy().send({
            from:accounts[6],
            value:web3.utils.toWei('4')
        })
        const count = await course.methods.count().call()
        assert.equal(count, 5)

    })

    it('when the course is bought by others, the owner can get the reward', async()=>{

        const oldAdminBalance = new BigNumber(await web3.eth.getBalance(accounts[9]))
        const oldOwnerBalance = new BigNumber(await web3.eth.getBalance(accounts[0]))
        await course.methods.buy().send({
            from:accounts[7],
            value:web3.utils.toWei('4')
        })
        
        const newAdminBalance = new BigNumber(await web3.eth.getBalance(accounts[9]))
        const newOwnerBalance = new BigNumber(await web3.eth.getBalance(accounts[0]))

        const diffAdmin = newAdminBalance.minus(oldAdminBalance)
        const diffOwner = newOwnerBalance.minus(oldOwnerBalance)

        assert.equal(diffAdmin, web3.utils.toWei('0.4'))
        assert.equal(diffOwner, web3.utils.toWei('3.6'))
    })

    it('can add video', async()=>{
        await course.methods.addVideo('hash of video').send({
            from:accounts[0],
            gas:'5000000'
        })
        const video = await course.methods.video().call()
        assert.equal(video, 'hash of video')
    })

    it('test 1+1 == 2', ()=>{
        assert.equal(1+1, 2)
    })
})