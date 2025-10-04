// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title PaymentProcessor
 * @dev Handles crypto payments for e-commerce orders
 * @notice Supports native ETH and ERC20 tokens (e.g., USDC)
 */
contract PaymentProcessor is Ownable, ReentrancyGuard, Pausable {
    // Events
    event OrderPaid(
        string indexed orderId,
        address indexed customer,
        address token,
        uint256 amount,
        uint256 timestamp
    );
    
    event FundsWithdrawn(
        address indexed token,
        address indexed to,
        uint256 amount
    );
    
    event PaymentRefunded(
        string indexed orderId,
        address indexed customer,
        address token,
        uint256 amount
    );

    // Order tracking
    struct Order {
        address customer;
        address token;
        uint256 amount;
        uint256 timestamp;
        bool paid;
        bool refunded;
    }
    
    mapping(string => Order) public orders;
    mapping(address => bool) public supportedTokens;
    
    // Merchant wallet
    address public merchantWallet;
    
    // Supported tokens
    address public constant ETH_ADDRESS = address(0);
    
    /**
     * @dev Constructor
     * @param _merchantWallet Address to receive withdrawn funds
     */
    constructor(address _merchantWallet) {
        require(_merchantWallet != address(0), "Invalid merchant wallet");
        merchantWallet = _merchantWallet;
        
        // ETH is always supported
        supportedTokens[ETH_ADDRESS] = true;
    }
    
    /**
     * @dev Add supported ERC20 token
     * @param token Token contract address
     */
    function addSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        supportedTokens[token] = true;
    }
    
    /**
     * @dev Remove supported token
     * @param token Token contract address
     */
    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }
    
    /**
     * @dev Update merchant wallet
     * @param newMerchant New merchant wallet address
     */
    function updateMerchantWallet(address newMerchant) external onlyOwner {
        require(newMerchant != address(0), "Invalid address");
        merchantWallet = newMerchant;
    }
    
    /**
     * @dev Pay for order with native ETH
     * @param orderId Unique order identifier
     */
    function payWithETH(string calldata orderId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        require(msg.value > 0, "Amount must be greater than 0");
        require(!orders[orderId].paid, "Order already paid");
        require(supportedTokens[ETH_ADDRESS], "ETH not supported");
        
        orders[orderId] = Order({
            customer: msg.sender,
            token: ETH_ADDRESS,
            amount: msg.value,
            timestamp: block.timestamp,
            paid: true,
            refunded: false
        });
        
        emit OrderPaid(orderId, msg.sender, ETH_ADDRESS, msg.value, block.timestamp);
    }
    
    /**
     * @dev Pay for order with ERC20 token
     * @param orderId Unique order identifier
     * @param token Token contract address
     * @param amount Amount to pay
     */
    function payWithToken(
        string calldata orderId,
        address token,
        uint256 amount
    ) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(amount > 0, "Amount must be greater than 0");
        require(!orders[orderId].paid, "Order already paid");
        require(supportedTokens[token], "Token not supported");
        require(token != ETH_ADDRESS, "Use payWithETH for native payments");
        
        // Transfer tokens from customer to contract
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        orders[orderId] = Order({
            customer: msg.sender,
            token: token,
            amount: amount,
            timestamp: block.timestamp,
            paid: true,
            refunded: false
        });
        
        emit OrderPaid(orderId, msg.sender, token, amount, block.timestamp);
    }
    
    /**
     * @dev Withdraw ETH to merchant wallet
     * @param amount Amount to withdraw
     */
    function withdrawETH(uint256 amount) external onlyOwner nonReentrant {
        require(amount <= address(this).balance, "Insufficient balance");
        
        (bool success, ) = merchantWallet.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit FundsWithdrawn(ETH_ADDRESS, merchantWallet, amount);
    }
    
    /**
     * @dev Withdraw ERC20 tokens to merchant wallet
     * @param token Token contract address
     * @param amount Amount to withdraw
     */
    function withdrawToken(address token, uint256 amount) 
        external 
        onlyOwner 
        nonReentrant 
    {
        require(token != ETH_ADDRESS, "Use withdrawETH for native token");
        
        IERC20 tokenContract = IERC20(token);
        require(amount <= tokenContract.balanceOf(address(this)), "Insufficient balance");
        
        tokenContract.transfer(merchantWallet, amount);
        
        emit FundsWithdrawn(token, merchantWallet, amount);
    }
    
    /**
     * @dev Refund an order (emergency function)
     * @param orderId Order to refund
     */
    function refundOrder(string calldata orderId) 
        external 
        onlyOwner 
        nonReentrant 
    {
        Order storage order = orders[orderId];
        require(order.paid, "Order not paid");
        require(!order.refunded, "Order already refunded");
        
        order.refunded = true;
        
        if (order.token == ETH_ADDRESS) {
            (bool success, ) = order.customer.call{value: order.amount}("");
            require(success, "Refund failed");
        } else {
            IERC20(order.token).transfer(order.customer, order.amount);
        }
        
        emit PaymentRefunded(orderId, order.customer, order.token, order.amount);
    }
    
    /**
     * @dev Check if order is paid
     * @param orderId Order identifier
     */
    function isOrderPaid(string calldata orderId) external view returns (bool) {
        return orders[orderId].paid && !orders[orderId].refunded;
    }
    
    /**
     * @dev Get order details
     * @param orderId Order identifier
     */
    function getOrder(string calldata orderId) 
        external 
        view 
        returns (
            address customer,
            address token,
            uint256 amount,
            uint256 timestamp,
            bool paid,
            bool refunded
        ) 
    {
        Order memory order = orders[orderId];
        return (
            order.customer,
            order.token,
            order.amount,
            order.timestamp,
            order.paid,
            order.refunded
        );
    }
    
    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Get contract ETH balance
     */
    function getETHBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get contract token balance
     * @param token Token address
     */
    function getTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }
}
