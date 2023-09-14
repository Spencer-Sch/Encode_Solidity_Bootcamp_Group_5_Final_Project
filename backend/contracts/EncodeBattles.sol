// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

// Imports
import './interfaces/IGroupFiveToken.sol';

// import './interfaces/IGroupFiveCollection.sol';

// Interfaces

// Libraries

// Contracts
contract EncodeBattles {
    // Types
    enum BattleResult {
        undecided,
        player1Wins,
        player2Wins,
        tie
    }

    struct BattleRewards {
        uint256 winnerReward;
        uint256 loserReward;
    }

    struct Battle {
        uint256 battleId;
        uint256 timestamp_open;
        uint256 timestamp_completed;
        address player1;
        address player2;
        uint256 nft1Id;
        uint256 nft2Id;
        uint256 nft1Power;
        uint256 nft2Power;
        BattleResult battleResult;
        BattleRewards battleRewards;
    }
    // State Vars
    uint256 public immutable i_winnerRewardAmount;
    uint256 public immutable i_loserRewardAmount;
    IGroupFiveToken private immutable i_paymentToken;
    uint256 public s_battleIdCounter;
    uint256 private s_queueFirst = 1;
    uint256 private s_queueLast = 1;

    // a queue structure | s_queueFirst => Battle
    mapping(uint256 => Battle) internal s_openBattles;

    Battle[] public s_battleHistory;

    // Events
    event BattleOpened(address player1, uint256 timestamp);
    event BattleCompleted(
        uint256 battleId,
        address player1,
        address player2,
        uint256 player1Power,
        uint256 player2Power,
        BattleResult,
        uint256 timestamp
    );

    // Errors
    error EncodeBattles__BattleStillUndecided();

    // Modifiers
    // All Functions
    // Constructor
    constructor(uint256 _winnerRewardAmount, uint256 _loserRewardAmount, address _paymentToken) {
        i_winnerRewardAmount = _winnerRewardAmount;
        i_loserRewardAmount = _loserRewardAmount;
        i_paymentToken = IGroupFiveToken(_paymentToken);
        s_battleIdCounter = 1;
    }

    // Receive function
    // fallback function
    // external functions
    function submitForBattle(uint256 _tokenId, uint256 _tokenPower) public {
        // assuming nft will be verified before submitting to this function
        bool reply = isOpenBattles();
        if (!reply) {
            // no current open battles - create one - fill player1 portion
            openNewBattle(msg.sender, _tokenId, _tokenPower);
            return;
        }
        // there is an open battle
        joinAndCompleteBattle(msg.sender, _tokenId, _tokenPower);
    }

    // public functions
    // internal functions
    function isOpenBattles() internal view returns (bool) {
        uint256 length = _openBattlesQueuelength();
        if (length == 0) {
            return false;
        }
        return true;
    }

    function openNewBattle(address _player1, uint256 _tokenId, uint256 _tokenPower) internal {
        // create a new battle struct and populate initial properties
        Battle memory newBattle;
        newBattle.battleId = s_battleIdCounter;
        newBattle.timestamp_open = block.timestamp;
        newBattle.player1 = _player1;
        newBattle.nft1Id = _tokenId;
        newBattle.nft1Power = _tokenPower;
        newBattle.battleRewards = BattleRewards(i_winnerRewardAmount, i_loserRewardAmount);

        // increment battle id
        s_battleIdCounter += 1;

        // add new battle to s_openBattles queue
        _enqueue(newBattle);
        emit BattleOpened(_player1, block.timestamp);
    }

    function joinAndCompleteBattle(address _player2, uint256 _tokenId, uint _tokenPower) internal {
        // move open battle out of queue
        Battle memory _battle = _dequeue();

        // set player2 and final timestamp properties
        _battle.player2 = _player2;
        _battle.nft2Id = _tokenId;
        _battle.nft2Power = _tokenPower;
        _battle.timestamp_completed = block.timestamp;

        // Process the battle to decide the winner/loser
        BattleResult result = calculateWinner(_battle.nft1Power, _battle.nft2Power);
        _battle.battleResult = result;

        // calculate rewards
        (bool updateRewards, BattleRewards memory rewards) = calculateRewards(
            _battle.battleResult
        );
        if (updateRewards) {
            _battle.battleRewards = rewards;
        }

        // emit event
        emit BattleCompleted(
            _battle.battleId,
            _battle.player1,
            _battle.player2,
            _battle.nft1Power,
            _battle.nft2Power,
            _battle.battleResult,
            block.timestamp
        );

        // Award winner/loser with rewards
        sendRewards(_battle.battleResult, _battle.player1, _battle.player2, _battle.battleRewards);

        // Add battle battleHistory
        addToBattleHistory(_battle);
    }

    function calculateWinner(
        uint256 _nft1Power,
        uint256 _nft2Power
    ) internal pure returns (BattleResult) {
        if (_nft1Power == _nft2Power) {
            return BattleResult.tie;
        }
        if (_nft1Power > _nft2Power) {
            return BattleResult.player1Wins;
        }
        return BattleResult.player2Wins;
    }

    function addToBattleHistory(Battle memory _battle) internal {
        s_battleHistory.push(_battle);
    }

    function calculateRewards(
        BattleResult _battleResult
    ) internal view returns (bool, BattleRewards memory) {
        BattleRewards memory _rewards;
        // check BattleResult
        // If tie - send both players half i_winnerRewardAmount
        if (_battleResult == BattleResult.tie) {
            _rewards.winnerReward = i_winnerRewardAmount / 2;
            _rewards.loserReward = i_winnerRewardAmount / 2;
            return (true, _rewards);
        }
        // if still undecided
        if (_battleResult == BattleResult.undecided) {
            revert EncodeBattles__BattleStillUndecided();
        }
        // if player1Wins || player2Wins
        // default rewards remain in Battle struct
        return (false, _rewards);
    }

    function sendRewards(
        BattleResult _result,
        address _player1,
        address _player2,
        BattleRewards memory _rewards
    ) internal {
        address winner;
        address loser;
        if (_result == BattleResult.player2Wins) {
            winner = _player2;
            loser = _player1;
        } else {
            winner = _player1;
            loser = _player2;
        }

        i_paymentToken.mint(winner, _rewards.winnerReward);
        i_paymentToken.mint(loser, _rewards.loserReward);
    }

    function _enqueue(Battle memory _battle) internal {
        s_queueLast += 1;
        s_openBattles[s_queueLast] = _battle;
    }

    function _dequeue() internal returns (Battle memory) {
        require(s_queueLast >= s_queueFirst);
        Battle memory _battle = s_openBattles[s_queueFirst];
        delete s_openBattles[s_queueFirst];
        s_queueFirst += 1;
        return _battle;
    }

    function _openBattlesQueuelength() internal view returns (uint256) {
        return (s_queueLast - s_queueFirst) + 1;
    }
    // private functions
}
