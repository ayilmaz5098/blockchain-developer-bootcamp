// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {

    address public feeAccount;
    uint256 public feePercent;
    mapping(address => mapping(address => uint256)) public tokens; // using token address we can see how many tokens each individual user has // orders mapping
    mapping(uint256 => _Order) orders;
    mapping(uint256 => bool) public orderCanceled;
    mapping(uint256 => bool) public orderFilled;
    uint256 public orderCount;

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);
    event Order(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive,uint256 timestamp);
    event Cancel(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive,uint256 timestamp);
    event Trade(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, address creator, uint256 timeStamp);
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

    //prevent orders if tokens are not on exhange
    require(balanceOf(_tokenGive, msg.sender) >= _amountGive);

    //CREATE ORDER
    orderCount ++;
    orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive,  _amountGive, block.timestamp);
    // emit event

    emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive,  _amountGive, block.timestamp);
    }

    function cancelOrder(uint256 _id) public {
    //fetch the order   
    _Order storage _order = orders[_id];

    //Ensure the caller of the function is the owner of the order
    require(address(_order.user) == msg.sender);

    // order must exist
    require(_order.id == _id);

    //Cancel the order
    orderCanceled[_id] = true;

    //cancel the order
    emit Cancel(_order.id, msg.sender,_order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, block.timestamp);

    
    }

    //----EXECUTING ORDER
    function fillOrder(uint256 id) public {
    //must be valid orderID
    require(!orderCanceled[id]);
    require(!orderFilled[id]);
    require(id <= orderCount && id > 0);
    //order cant be filled
    //oder cant be cancelled
     //Fetch order
    _Order storage _order = orders[id];


     //Swapping Tokens(trading)
    _trade(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive,_order.amountGive);

    orderFilled[id] = true;

    }

    function _trade(uint256 _orderId, address _user, address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) internal 
    {

    uint256 _feeAmount =(_amountGet*feePercent) / 100;
    // fee is paid by the user who filled the order(msg.sender)
    //msg.sender is the user who filled the order while _user is who created the order
    // do trade inside of here
    tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender] - (_amountGet + _feeAmount) ; // we gave tokenGet, mDAI, deducted it from user2,creator,msg.sender. gave it to user, 
    tokens[_tokenGet][_user] = tokens[_tokenGet][_user] + _amountGet;
    //charge fees
    tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount] + _feeAmount; 
    
    tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender] + _amountGive;
    tokens[_tokenGive][_user] = tokens[_tokenGive][_user] - _amountGive;

    emit Trade(_orderId, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, _user, block.timestamp);

    }






}
