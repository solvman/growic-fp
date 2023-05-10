// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LockBox {
    mapping(address => uint256) public balances;
    mapping(address => uint256) public lockTimes;

    event FundsLocked(
        address indexed depositor,
        uint256 amount,
        uint256 lockDuration
    );
    event FundsRetrieved(address indexed depositor, uint256 amount);

    // Function to lock funds for a certain duration
    function lockFunds(uint256 duration) public payable {
        // Require that the duration and value are greater than zero
        require(duration > 0, "Duration must be greater than zero");
        require(msg.value > 0, "Value must be greater than zero");

        // Add the deposited value to the depositor's balance
        balances[msg.sender] += msg.value;

        // Calculate the lock time for the deposited funds
        lockTimes[msg.sender] = block.timestamp + duration;

        emit FundsLocked(msg.sender, msg.value, duration);
    }

    // Function to retrieve locked funds once the lockup period has passed
    function retrieveFunds() public {
        // Require that the depositor has locked funds
        require(balances[msg.sender] > 0, "No funds to retrieve");

        // Require that the lockup period has passed
        require(
            block.timestamp >= lockTimes[msg.sender],
            "Funds are still locked"
        );

        // Transfer the locked funds back to the depositor
        uint256 amount = balances[msg.sender];
        balances[msg.sender] = 0;
        lockTimes[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit FundsRetrieved(msg.sender, amount);
    }

    // Function to get the balance of the contract
    function getContractBalance() public view returns (uint256) {
        // Return the current balance of the contract
        return address(this).balance;
    }

    // Function to get the remaining lockup time for a depositor's funds
    function getLockTimeRemaining(
        address depositor
    ) public view returns (uint256) {
        // Require that the depositor has locked funds
        require(balances[depositor] > 0, "No funds locked for this address");

        // Calculate the remaining lockup time
        uint256 timeRemaining = lockTimes[depositor] - block.timestamp;
        // If the time remaining is greater than zero, return it
        if (timeRemaining > 0) {
            return timeRemaining;
            // Otherwise, return zero
        } else {
            return 0;
        }
    }

    function getBalance(address depositor) public view returns (uint256) {
        return balances[depositor];
    }
}
