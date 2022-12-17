// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "hardhat/console.sol";

contract Token{

    string public name ;
    string public symbol;
    uint256 public decimals = 18;
    uint256 public totalSupply = 1000000*(10**decimals);

    mapping (address => uint256) public balanceOf;
    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {

       name = _name;
       symbol = _symbol;
       totalSupply = _totalSupply * (10**decimals);

       balanceOf[msg.sender] = totalSupply; //assigns
    }
    
    function transfer(address _to, uint256 _value)  public returns (bool success)
     {
        //deduct tokens from spender
        //credit tokens to receiver
        require(balanceOf[msg.sender] >= _value);
        require(_to != address(0));
        balanceOf[msg.sender] = balanceOf[msg.sender] - _value ; //reads;
        balanceOf[_to] = balanceOf[_to] + _value;
        //emit event
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
}

