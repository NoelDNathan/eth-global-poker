// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {SelfVerificationRoot} from "@selfxyz/contracts/contracts/abstract/SelfVerificationRoot.sol";
import {ISelfVerificationRoot} from "@selfxyz/contracts/contracts/interfaces/ISelfVerificationRoot.sol";
import {SelfStructs} from "@selfxyz/contracts/contracts/libraries/SelfStructs.sol";
import {BokkyPooBahsDateTimeLibrary} from "./lib/contracts/BokkyPooBahsDateTimeLibrary.sol";

import {IProofOfHuman} from "@thirdweb-dev/contracts/prebuilts/account/utils/IProofOfHuman.sol";

/**
 * @title TestSelfVerificationRoot
 * @notice Test implementation of SelfVerificationRoot for testing purposes
 * @dev This contract provides a concrete implementation of the abstract SelfVerificationRoot
 */
contract ProofOfHuman is SelfVerificationRoot, IProofOfHuman {
    // Storage for testing purposes
    bool public verificationSuccessful;
    ISelfVerificationRoot.GenericDiscloseOutputV2 public lastOutput;
    bytes public lastUserData;
    SelfStructs.VerificationConfigV2 public verificationConfig;
    bytes32 public verificationConfigId;
    address public lastUserAddress;

    /// @notice Reverts when a user identifier is invalid
    error InvalidUserIdentifier();

    /// @notice Reverts when a document is expired
    error DocumentExpired();

    /// @notice Reverts when a user identifier has already been registered
    error UserIdentifierAlreadyRegistered();

    /// @notice Reverts when a nullifier has already been registered
    error RegisteredNullifier();

    // Events for testing
    event VerificationCompleted(
        ISelfVerificationRoot.GenericDiscloseOutputV2 output,
        bytes userData
    );

    mapping(uint256 nullifier => uint256 userIdentifier)
        internal _nullifierToUserIdentifier;

    /// @notice Maps user identifiers to registration status
    mapping(uint256 userIdentifier => bool registered)
        internal _registeredUserIdentifiers;

    mapping(address account => bytes32 passportHash) public accountToPassportHash;

    mapping(address account => string birthday) public accountToBirthday;

    event ExpiryDateEmit(string expiryDate);

    /**
     * @notice Constructor for the test contract
     * @param identityVerificationHubV2Address The address of the Identity Verification Hub V2
     */
    constructor(
        address identityVerificationHubV2Address,
        uint256 scope,
        bytes32 _verificationConfigId
    ) SelfVerificationRoot(identityVerificationHubV2Address, scope) {
        verificationConfigId = _verificationConfigId;
    }

    function isRegistered(uint256 userIdentifier) public view returns (bool) {
        return _registeredUserIdentifiers[userIdentifier];
    }

    /**
     * @notice Implementation of customVerificationHook for testing
     * @dev This function is called by onVerificationSuccess after hub address validation
     * @param output The verification output from the hub
     * @param userData The user data passed through verification
     */
    function customVerificationHook(
        ISelfVerificationRoot.GenericDiscloseOutputV2 memory output,
        bytes memory userData
    ) internal override {
        verificationSuccessful = true;
        lastOutput = output;
        lastUserData = userData;
        lastUserAddress = address(uint160(output.userIdentifier));

        require(output.userIdentifier != 0, "User identifier required");

        // require(!isRegistered(output.userIdentifier), "User identifier already registered");

        emit VerificationCompleted(output, userData);

        require(bytes(output.idNumber).length > 0, "ID number required");

        require(bytes(output.expiryDate).length > 0, "Expiry date required");

        require(output.ofac[0] == true, "OFAC required");
        require(output.ofac[1] == true, "OFAC required");
        require(output.ofac[2] == true, "OFAC required");

        emit ExpiryDateEmit(output.expiryDate);
        // Verify that the document is not expired
        require(!isExpired(output.expiryDate), "Document is expired");

        _nullifierToUserIdentifier[output.nullifier] = output.userIdentifier;
        // _registeredUserIdentifiers[output.userIdentifier] = true;

        bytes32 passportHash = keccak256(abi.encodePacked(
            output.idNumber,
            output.nationality
        ));
        accountToPassportHash[lastUserAddress] = passportHash;

        accountToBirthday[lastUserAddress] = output.dateOfBirth;
    }

    function getPassportHash(
        address account
    ) public view returns (bytes32) {
        return accountToPassportHash[account];
    }

    function isAccountBirthday(address account) public view returns (bool) {
        // Retrieve the stored birthday for the account
        string memory birthdayString = accountToBirthday[account];
        bytes memory birthdayBytes = bytes(birthdayString);

        // Validate the date format for DD-MM-YY
        require(
            birthdayBytes.length == 8,
            "Invalid date format. Expected DD-MM-YY"
        );
        require(
            birthdayBytes[2] == "-" && birthdayBytes[5] == "-",
            "Invalid date format. Expected DD-MM-YY"
        );

        // Extract day and month from the birthday
        uint256 birthDay = _parseUint(birthdayBytes, 0, 2);
        uint256 birthMonth = _parseUint(birthdayBytes, 3, 5);

        // Get the current day, month, and year
        (
            uint256 currentYear,
            uint256 currentMonth,
            uint256 currentDay
        ) = BokkyPooBahsDateTimeLibrary.timestampToDate(block.timestamp);

        // Calculate the birthday timestamp for the current year
        uint256 birthdayTimestamp = BokkyPooBahsDateTimeLibrary
            .timestampFromDate(currentYear, birthMonth, birthDay);

        // Calculate the day before and day after timestamps
        uint256 dayBeforeTimestamp = BokkyPooBahsDateTimeLibrary.addDays(
            birthdayTimestamp,
            uint256(1) - uint256(2)
        );
        uint256 dayAfterTimestamp = BokkyPooBahsDateTimeLibrary.addDays(
            birthdayTimestamp,
            uint256(1)
        );

        // Check if today is within the range of the birthday
        return (block.timestamp >= dayBeforeTimestamp &&
            block.timestamp <= dayAfterTimestamp);
    }

    /**
     * @notice Reset the test state
     */
    function resetTestState() external {
        verificationSuccessful = false;
        lastOutput = ISelfVerificationRoot.GenericDiscloseOutputV2({
            attestationId: bytes32(0),
            userIdentifier: 0,
            nullifier: 0,
            forbiddenCountriesListPacked: [
                uint256(0),
                uint256(0),
                uint256(0),
                uint256(0)
            ],
            issuingState: "",
            name: new string[](3),
            idNumber: "",
            nationality: "",
            dateOfBirth: "",
            gender: "",
            expiryDate: "",
            olderThan: 0,
            ofac: [false, false, false]
        });
        lastUserData = "";
        lastUserAddress = address(0);
    }

    /**
     * @notice Expose the internal _setScope function for testing
     * @param newScope The new scope value to set
     */
    function setScope(uint256 newScope) external {
        _setScope(newScope);
    }

    function setVerificationConfig(
        SelfStructs.VerificationConfigV2 memory config
    ) external {
        verificationConfig = config;
        _identityVerificationHubV2.setVerificationConfigV2(verificationConfig);
    }

    function setVerificationConfigNoHub(
        SelfStructs.VerificationConfigV2 memory config
    ) external {
        verificationConfig = config;
    }

    function setConfigId(bytes32 configId) external {
        verificationConfigId = configId;
    }

    function getConfigId(
        bytes32 destinationChainId,
        bytes32 userIdentifier,
        bytes memory userDefinedData
    ) public view override returns (bytes32) {
        return verificationConfigId;
    }

    /**
     * @notice Test function to simulate calling onVerificationSuccess from hub
     * @dev This function is only for testing purposes to verify access control
     * @param output The verification output
     * @param userData The user data
     */
    function testOnVerificationSuccess(
        bytes memory output,
        bytes memory userData
    ) external {
        // This should fail if called by anyone other than the hub
        onVerificationSuccess(output, userData);
    }

    /**
     * @notice Check if a document is expired based on its expiry date
     * @param expiryDateString The expiry date in format "DD-MM-YY"
     * @return True if the document is expired, false otherwise
     */
    function isExpired(string memory expiryDateString) public returns (bool) {
        // Convert string to bytes for parsing
        bytes memory expiryBytes = bytes(expiryDateString);

        emit ExpiryDateEmit(expiryDateString);

        // Validate the date format for DD-MM-YY
        require(
            expiryBytes.length == 8,
            "Invalid date format. Expected DD-MM-YY"
        );
        require(
            expiryBytes[2] == "-" && expiryBytes[5] == "-",
            "Invalid date format. Expected DD-MM-YY"
        );

        // Extract day, month, and year (assuming 20xx for years)
        uint256 day = _parseUint(expiryBytes, 0, 2);
        uint256 month = _parseUint(expiryBytes, 3, 5);
        uint256 year = _parseUint(expiryBytes, 6, 8) + 2000; // Add 2000 to convert YY to YYYY

        // Validate the date
        require(
            BokkyPooBahsDateTimeLibrary.isValidDate(year, month, day),
            "Invalid date"
        );

        // Convert expiry date to timestamp
        uint256 expiryTimestamp = BokkyPooBahsDateTimeLibrary.timestampFromDate(
            year,
            month,
            day
        );

        // Add one day to expiry date to include the full day
        expiryTimestamp = BokkyPooBahsDateTimeLibrary.addDays(
            expiryTimestamp,
            1
        );

        // Compare with current timestamp
        return block.timestamp >= expiryTimestamp;
    }

    /**
     * @notice Parse a substring of bytes to uint256
     * @param data The byte array to parse
     * @param start The starting index (inclusive)
     * @param end The ending index (exclusive)
     * @return The parsed uint256 value
     */
    function _parseUint(
        bytes memory data,
        uint256 start,
        uint256 end
    ) internal pure returns (uint256) {
        uint256 result = 0;
        for (uint256 i = start; i < end; i++) {
            require(data[i] >= 0x30 && data[i] <= 0x39, "Invalid digit");
            result = result * 10 + (uint256(uint8(data[i])) - 0x30);
        }
        return result;
    }
}
