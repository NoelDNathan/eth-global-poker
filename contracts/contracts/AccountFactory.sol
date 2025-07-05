// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

// Utils
import "@thirdweb-dev/contracts/prebuilts/account/utils/BaseAccountFactory.sol";
import "@thirdweb-dev/contracts/prebuilts/account/utils/BaseAccount.sol";
import "@thirdweb-dev/contracts/external-deps/openzeppelin/proxy/Clones.sol";

// Extensions
import "@thirdweb-dev/contracts/extension/upgradeable/PermissionsEnumerable.sol";
import "@thirdweb-dev/contracts/extension/upgradeable/ContractMetadata.sol";

// Interface
import "@thirdweb-dev/contracts/prebuilts/account/interface/IEntrypoint.sol";

// Smart wallet implementation
import { Account } from "@thirdweb-dev/contracts/prebuilts/account/non-upgradeable/Account.sol";

//   $$\     $$\       $$\                 $$\                         $$\
//   $$ |    $$ |      \__|                $$ |                        $$ |
// $$$$$$\   $$$$$$$\  $$\  $$$$$$\   $$$$$$$ |$$\  $$\  $$\  $$$$$$\  $$$$$$$\
// \_$$  _|  $$  __$$\ $$ |$$  __$$\ $$  __$$ |$$ | $$ | $$ |$$  __$$\ $$  __$$\
//   $$ |    $$ |  $$ |$$ |$$ |  \__|$$ /  $$ |$$ | $$ | $$ |$$$$$$$$ |$$ |  $$ |
//   $$ |$$\ $$ |  $$ |$$ |$$ |      $$ |  $$ |$$ | $$ | $$ |$$   ____|$$ |  $$ |
//   \$$$$  |$$ |  $$ |$$ |$$ |      \$$$$$$$ |\$$$$$\$$$$  |\$$$$$$$\ $$$$$$$  |
//    \____/ \__|  \__|\__|\__|       \_______| \_____\____/  \_______|\_______/

contract AccountFactory is BaseAccountFactory, ContractMetadata, PermissionsEnumerable {
    /*///////////////////////////////////////////////////////////////
                            Constructor
    //////////////////////////////////////////////////////////////*/

    address public proofOfHumanContract;

    event log(string message, address _addres);
    constructor(
        address _defaultAdmin,
        IEntryPoint _entrypoint,
        address _proofOfHumanContract
    ) BaseAccountFactory(address(new Account(_entrypoint, address(this))), address(_entrypoint)) {
        _setupRole(DEFAULT_ADMIN_ROLE, _defaultAdmin);  

        proofOfHumanContract = _proofOfHumanContract;
    }


    function setProofOfHumanContract(address _proofOfHumanContract) external onlyRole(DEFAULT_ADMIN_ROLE) {
        proofOfHumanContract = _proofOfHumanContract;
    }
    /*///////////////////////////////////////////////////////////////
                        Internal functions
    //////////////////////////////////////////////////////////////*/

    /// @dev Called in `createAccount`. Initializes the account contract created in `createAccount`.
    function _initializeAccount(address _account, address _admin, bytes calldata _data) internal override {
        Account(payable(_account)).initialize(_admin, proofOfHumanContract, _data);
    }

    /// @dev Returns whether contract metadata can be set in the given execution context.
    function _canSetContractURI() internal view virtual override returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @notice Returns the sender in the given execution context.
    function _msgSender() internal view override(Multicall, Permissions) returns (address) {
        return msg.sender;
    }
}
