// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./TicketNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title EventFactory
 * @dev Factory contract to deploy instances of TicketNFT dynamically.
 */
contract EventFactory is Ownable {
    address[] public deployedEvents;
    address public marketplace;

    event EventCreated(
        address indexed eventAddress,
        string name,
        string symbol,
        uint256 maxSupply,
        uint256 ticketPrice,
        uint256 resalePriceCap,
        address indexed organizer
    );

    constructor(address _marketplace) Ownable(msg.sender) {
        require(_marketplace != address(0), "Invalid marketplace address");
        marketplace = _marketplace;
    }

    /**
     * @notice Deploy a new TicketNFT contract for an event.
     */
    function createEvent(
        string calldata name,
        string calldata symbol,
        uint256 maxSupply,
        uint256 ticketPrice,
        uint256 resalePriceCap,
        address organizer
    ) external returns (address) {
        TicketNFT newEvent = new TicketNFT(
            name,
            symbol,
            maxSupply,
            ticketPrice,
            resalePriceCap,
            organizer
        );

        // Transfer ownership of TicketNFT to the organizer
        newEvent.transferOwnership(organizer);

        address eventAddress = address(newEvent);
        deployedEvents.push(eventAddress);

        emit EventCreated(
            eventAddress,
            name,
            symbol,
            maxSupply,
            ticketPrice,
            resalePriceCap,
            organizer
        );

        return eventAddress;
    }

    /**
     * @notice Get all deployed event addresses.
     */
    function getDeployedEvents() external view returns (address[] memory) {
        return deployedEvents;
    }
}
