const { assert } = require('chai')

const Token = artifacts.require('Token')
const EthSwap = artifacts.require('EthSwap')

require('chai')
    .use(require('chai-as-promised'))
    .should()

// function tokens(n) {
//     return new web3.utils.toWei(n, 'ether');
// }

contract('EthSwap', ([deployer, investor]) => {
    let token, ethSwap

    before(async () => {
        token = await Token.new()
        ethSwap = await EthSwap.new(token.address)
        // Transfer all tokens to EthSwap (1 mil)
        await token.transfer(ethSwap.address, web3.utils.toWei('1000000', 'ether'))
    })

    describe('Token deployment', async () => {
        it('contract has a name', async () => {
            const name = await token.name()
            assert.equal(name, 'Jiffy Token')
        })
    })


    describe('EthSwap deployment', async () => {
        it('contract has a name', async () => {
            const name = await ethSwap.name()
            assert.equal(name, 'EthSwap Instant Exchange')
        })

        it('contract has tokens', async () => {
            let balance = await token.balanceOf(ethSwap.address)
            assert.equal(balance.toString(), web3.utils.toWei('1000000', 'ether'))
        })
    })

    describe('buyTokens', async () => {
        let result

        before(async () => {
            // Purchase tokens before each example
            result = await ethSwap.buyTokens({from: investor, value: web3.utils.toWei('1', 'ether')})
        })
        
        it('Allows user to instantly puchase tokens from ethSwap for a fixed price', async () => {
            // Check investor token balance after purchase
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), web3.utils.toWei('100', 'ether'))
            
            // Check ethSwap balance after purchase
            let ethSwapBalance
            ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('999900', 'ether'))
            
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1', 'ether'))

            // Check logs to make sure that the event was emitted with the corrrect data
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), web3.utils.toWei('100', 'ether').toString())
            assert.equal(event.rate.toString(), '100')
        })
    })

    describe('sellTokens', async () => {
        let result

        before(async () => {
            // Investor must approve tokens before the purchase
            await token.approve(ethSwap.address, web3.utils.toWei('100', 'ether'), { from: investor })
            // Investor sells tokens
            result = await ethSwap.sellTokens(web3.utils.toWei('100', 'ether'), { from: investor })
        })
        
        it('Allows user to instantly sell tokens to ethSwap for a fixed price', async () => {
            // Check investor token balance after purchase
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), web3.utils.toWei('0', 'ether'))

             // Check ethSwap balance after purchase
            let ethSwapBalance
            ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1000000', 'ether'))
            
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0', 'ether'))

            // Check logs to make sure that the event was emitted with the corrrect data
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), web3.utils.toWei('100', 'ether').toString())
            assert.equal(event.rate.toString(), '100')

            // FAILURE: investor can't sell more tokens than they have
            await ethSwap.sellTokens(web3.utils.toWei('500', 'ether'), { from: investor }).should.be.rejected;
        })
    })

})