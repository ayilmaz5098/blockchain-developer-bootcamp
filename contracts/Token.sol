// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "hardhat/console.sol";

contract Token{

    string public name ;
    string public symbol;
    uint256 public decimals = 18;
    uint256 public totalSupply = 1000000*(10**decimals);

    mapping (address => uint256) public balanceOf;
    mapping (address => mapping (address => uint256)) public allowance;
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

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
        _transfer(msg.sender, _to, _value);

        return true;
    }
    
    function _transfer(address _from, address _to, uint256 _value) internal {

        require(_to != address(0));
        balanceOf[_from] = balanceOf[_from] - _value;
        balanceOf[_to] = balanceOf[_to] + _value;
        emit Transfer(_from, _to, _value);
        

    }

    function approve(address _spender, uint256 _value) public returns(bool success) {

            require(_spender != address(0));
            allowance[msg.sender][_spender] = _value;
            emit Approval(msg.sender, _spender, _value);
            return true;
            
    }
    
    function transferFrom(
        address _from,
        address _to, 
        uint256 _value
    ) 
        public
        returns(bool success)
        {   
            require(_value <= allowance[_from][msg.sender]);
            require(_value <= balanceOf[_from]);
            
            allowance[_from][msg.sender] = allowance[_from][msg.sender] - _value;
            _transfer(_from, _to, _value);
            return true;

        }
}

