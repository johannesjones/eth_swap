pragma solidity ^0.5.0;

import "./Token.sol";

contract EthSwap {
    string public name = 'EthSwap Instant Exchange';
    Token public token;
    uint public rate = 100;

    event TokensPuchased(
        address account,
        address token,
        uint amount,
        uint rate
    );

    event TokensSold(
        address account,
        address token,
        uint amount,
        uint rate
    );

    constructor(Token _token) public {
        token = _token;
    }

    function buyTokens() public payable {
        // Calculate number of tokens to buy
        uint tokenAmount = msg.value * rate;

        // Require that EthSwap has enough tokens
        require(token.balanceOf(address(this)) >= tokenAmount);

        // Transfer tokens to the user
        token.transfer(msg.sender, tokenAmount);

        // Emit an event
        emit TokensPuchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint _amount) public {
        // Users can't sell more tokens than they have
        require(token.balanceOf(msg.sender) >= _amount);

        // Calculte amount of ether to redeem
        uint etherAmount = _amount / rate;

         // Require that EthSwap has enough Ether
        require(address(this).balance >= etherAmount);

        // Perform sale
        token.transferFrom(msg.sender, address(this), _amount);
        msg.sender.transfer(etherAmount);

        // Emit an event
        emit TokensSold(msg.sender, address(token), _amount, rate);
    }

}

