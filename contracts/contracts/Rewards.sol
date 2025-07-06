// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

// Minimal interface for ProofOfHuman
interface IProofOfHuman {
    function isAccountBirthday(address account) external view returns (bool);
}

/**
 * @title Rewards
 * @notice Simple contract to allow users to claim rewards for their birthday or for completing poker missions.
 */
contract Rewards {
    IProofOfHuman public proofOfHuman;

    // Mapping to track if a user has claimed their birthday reward for the current year
    mapping(address => uint256) public lastBirthdayClaimedYear;

    // Mapping to track if a user has claimed poker mission rewards
    mapping(address => bool) public winRewardClaimed;
    mapping(address => bool) public straightRewardClaimed;
    // Add more missions as needed

    // Events for reward claims
    event BirthdayRewardClaimed(address indexed user, uint256 year);
    event WinRewardClaimed(address indexed user);
    event StraightRewardClaimed(address indexed user);

    /**
     * @notice Constructor for Rewards contract
     * @param proofOfHumanAddress The address of the ProofOfHuman contract
     */
    constructor(address proofOfHumanAddress) {
        proofOfHuman = IProofOfHuman(proofOfHumanAddress);
    }

    // Internal function to get the current year from block.timestamp
    function _getCurrentYear() internal view returns (uint256) {
        // Unix timestamp to year conversion (UTC)
        uint256 SECONDS_PER_DAY = 24 * 60 * 60;
        uint256 DAYS_PER_YEAR = 365;
        uint256 ORIGIN_YEAR = 1970;
        uint256 daysSinceEpoch = block.timestamp / SECONDS_PER_DAY;
        uint256 year = ORIGIN_YEAR + daysSinceEpoch / DAYS_PER_YEAR;
        return year;
    }

    /**
     * @notice Returns true if the user has claimed their birthday reward this year
     */
    function hasClaimedBirthdayReward(address user) external view returns (bool) {
        uint256 year = _getCurrentYear();
        return lastBirthdayClaimedYear[user] == year;
    }

    /**
     * @notice Returns true if the user has claimed the win reward
     */
    function hasClaimedWinReward(address user) external view returns (bool) {
        return winRewardClaimed[user];
    }

    /**
     * @notice Returns true if the user has claimed the straight reward
     */
    function hasClaimedStraightReward(address user) external view returns (bool) {
        return straightRewardClaimed[user];
    }

    /**
     * @notice Claim a reward if today is the user's birthday and not already claimed this year
     */
    function claimBirthdayReward() external {
        require(
            proofOfHuman.isAccountBirthday(msg.sender),
            "Not your birthday"
        );
        uint256 year = _getCurrentYear();
        require(
            lastBirthdayClaimedYear[msg.sender] < year,
            "Birthday reward already claimed this year"
        );
        lastBirthdayClaimedYear[msg.sender] = year;
        emit BirthdayRewardClaimed(msg.sender, year);
        // Add reward logic here (e.g., token transfer, points, etc.)
    }

    /**
     * @notice Claim a reward for winning a poker game (simulated)
     */
    function claimWinReward() external {
        require(!winRewardClaimed[msg.sender], "Win reward already claimed");
        winRewardClaimed[msg.sender] = true;
        emit WinRewardClaimed(msg.sender);
        // Add reward logic here
    }

    /**
     * @notice Claim a reward for winning with a straight (simulated)
     */
    function claimStraightReward() external {
        require(
            !straightRewardClaimed[msg.sender],
            "Straight reward already claimed"
        );
        straightRewardClaimed[msg.sender] = true;
        emit StraightRewardClaimed(msg.sender);
        // Add reward logic here
    }

    // Add more mission claim functions as needed, following the same pattern
}
