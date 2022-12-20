// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {

    address public feeAccount;
    uint256 public feePercent;
    mapping(address => mapping(address => uint256)) public tokens; // using token address we can see how many tokens each individual user has // orders mapping
    mapping(uint256 => _Order) orders;
    uint256 public orderCount = 0;

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);
    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp

    );
                        //way to model the order
    struct _Order {    //attributes of an order
    uint256 id;         //unique identifier for order
    address user;       //user who made order
    address tokenGet;   //address of token they receive
    uint256 amountGet;  //amount they receive
    address tokenGive;  //address of token they give
    uint256 amountGive; //amount they give
    uint256 timestamp;
    }
    constructor (address _feeAccount, uint256 _feePercent) {

        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function  depositToken(address _token, uint256 _amount) public {
        //transfers token to the exchange account from the address of person who is making the deposit
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;   
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256  amount) public {

        require(tokens[_token][msg.sender] >= amount);
        Token(_token).transfer(msg.sender, amount);
        tokens[_token][msg.sender] = tokens[_token][msg.sender] - amount;
        emit Withdraw(_token, msg.sender, amount, tokens[_token][msg.sender]);
    }

    function balanceOf(address _token, address _user) public view returns (uint256)
    {
        return(tokens[_token][_user]);
    }

    //-----MAKE&&CANCEL ORDERS
    //Token Give- token they want to spend---whick token and how much
    //Token get--token they want to receive--whick token and how much
 
    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public 
    {          
        //CREATE ORDER
        orderCount ++;
        orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive,  _amountGive, block.timestamp);
        // emit event

        emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive,  _amountGive, block.timestamp);
     }





}
