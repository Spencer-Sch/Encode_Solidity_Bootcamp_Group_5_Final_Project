// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

// Imports
import './interfaces/IGroupFiveToken.sol';
import './interfaces/IGroupFiveCollection.sol';

// Interfaces

// Libraries

// Contracts
contract EncodeBattles {
    // Types
    enum BattleState {
        open,
        closed,
        completed
    }

    // struct BattleResult {
    //     address winnerAddress;
    //     address loserAddress;
    // }
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
        BattleState state;
        uint256 timestamp_open;
        uint256 timestamp_closed;
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
    IGroupFiveCollection private immutable i_nftContract;
    uint256 s_battleIdCounter;
    uint256 s_queueFirst = 1;
    uint256 s_queueLast = 0;

    // BattleState.open => s_queueFirst => Battle struct (as a queue)
    // BattleState.closed => battleId => Battle struct
    // BattleState.completed => battleId => Battle struct
    mapping(BattleState => mapping(uint256 => Battle)) internal s_battles;

    Battle[] public s_battleHistory;

    // Events
    event BattleOpened(address player1, uint256 timestamp);
    event BattleClosed(address player1, address player2, uint256 timestamp);
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
    constructor(
        uint256 _winnerRewardAmount,
        uint256 _loswerRewardAmount,
        address _paymentToken,
        address _nftContract
    ) {
        i_winnerRewardAmount = _winnerRewardAmount;
        i_loserRewardAmount = _loswerRewardAmount;
        i_paymentToken = IGroupFiveToken(_paymentToken);
        i_nftContract = IGroupFiveCollection(_nftContract);
        s_battleIdCounter = 1;
    }

    // Receive function
    // fallback function
    // external functions
    function submitForBattle(uint256 _tokenId, uint256 _tokenPower) external {
        // assuming nft will be verified before submitting to this function
        bool reply = isOpenBattles();
        if (!reply) {
            // no current open battles - create one
            openNewBattle(msg.sender, _tokenId, _tokenPower);
            return;
        }
        // there is an open battle - join it
        Battle memory closedBattle = fillOpenBattle(msg.sender, _tokenId, _tokenPower);
        // Process the battle to decide the winner/loser
        BattleResult result = calculateWinner(closedBattle);
        // store the result
        closedBattle.battleResult = result;
        // set the remaining battle properties
        Battle memory completedBattle = completeBattle(closedBattle);
        // Add battle battleHistory
        addToBattleHistory(completedBattle);
        // Award winner/loser with rewards
        sendRewards(completedBattle);
    }

    // public functions
    // internal functions
    function isOpenBattles() internal view returns (bool) {
        uint256 length = _openBattleQueuelength();
        if (length == 0) {
            return false;
        }
        return true;
    }

    function openNewBattle(address _player1, uint256 _tokenId, uint256 _tokenPower) internal {
        Battle memory newBattle = Battle({
            battleId: s_battleIdCounter,
            state: BattleState.open,
            timestamp_open: block.timestamp,
            timestamp_closed: 0,
            timestamp_completed: 0,
            player1: _player1,
            player2: address(0),
            nft1Id: _tokenId,
            nft2Id: 0,
            nft1Power: _tokenPower,
            nft2Power: 0,
            battleResult: BattleResult.undecided,
            battleRewards: BattleRewards(i_winnerRewardAmount, i_loserRewardAmount)
        });
        s_battleIdCounter += 1;
        _enqueue(newBattle);
        emit BattleOpened(_player1, block.timestamp);
    }

    function fillOpenBattle(
        address _player2,
        uint256 _tokenId,
        uint256 _tokenPower
    ) internal returns (Battle memory) {
        Battle memory _battle = _dequeue();
        // uint256 _battleId = _battle.battleId;
        _battle.state = BattleState.closed;
        _battle.timestamp_closed = block.timestamp;
        _battle.player2 = _player2;
        _battle.nft2Id = _tokenId;
        _battle.nft2Power = _tokenPower;

        updateBattleStorage(_battle, BattleState.open, BattleState.closed);
        emit BattleClosed(_battle.player1, _battle.player2, block.timestamp);
        return _battle;
    }

    function calculateWinner(Battle memory _battle) internal pure returns (BattleResult) {
        if (_battle.nft1Power == _battle.nft2Power) {
            return BattleResult.tie;
        }
        if (_battle.nft1Power > _battle.nft2Power) {
            return BattleResult.player1Wins;
        }
        return BattleResult.player2Wins;
    }

    function completeBattle(Battle memory _battle) internal returns (Battle memory) {
        _battle.state = BattleState.completed;
        _battle.timestamp_completed = block.timestamp;
        Battle memory _battle_ = calculateRewards(_battle);
        updateBattleStorage(_battle_, BattleState.closed, BattleState.completed);
        emit BattleCompleted(
            _battle_.battleId,
            _battle_.player1,
            _battle_.player2,
            _battle_.nft1Power,
            _battle_.nft2Power,
            _battle_.battleResult,
            block.timestamp
        );
        return _battle_;
    }

    function addToBattleHistory(Battle memory _battle) internal {
        s_battleHistory.push(_battle);
    }

    function updateBattleStorage(
        Battle memory _battle,
        BattleState _prevState,
        BattleState _newState
    ) internal {
        // if updating from closed to completed
        // need to delete battle from closed mapping
        if (_prevState == BattleState.closed) {
            s_battles[_newState][_battle.battleId] = _battle;
            delete s_battles[_prevState][_battle.battleId];
            return;
        }
        // if updating from open to closed
        // no need to delete battle from open mapping
        // _dequeue takes care of that
        s_battles[_newState][_battle.battleId] = _battle;
    }

    function calculateRewards(Battle memory _battle) internal view returns (Battle memory) {
        // check BattleResult
        // If tie - send both players half i_winnerRewardAmount
        if (_battle.battleResult == BattleResult.tie) {
            _battle.battleRewards.winnerReward = i_winnerRewardAmount / 2;
            _battle.battleRewards.loserReward = i_winnerRewardAmount / 2;
            return _battle;
        }
        // if still undecided
        if (_battle.battleResult == BattleResult.undecided) {
            revert EncodeBattles__BattleStillUndecided();
        }
        // if player1Wins || player2Wins
        return _battle;
    }

    function sendRewards(Battle memory _battle) internal {
        address winner;
        address loser;
        if (_battle.battleResult == BattleResult.player2Wins) {
            winner = _battle.player2;
            loser = _battle.player1;
        } else {
            winner = _battle.player1;
            loser = _battle.player2;
        }

        i_paymentToken.mint(winner, _battle.battleRewards.winnerReward);
        i_paymentToken.mint(loser, _battle.battleRewards.loserReward);
    }

    function _enqueue(Battle memory _battle) internal {
        s_queueLast += 1;
        s_battles[BattleState.open][s_queueLast] = _battle;
    }

    function _dequeue() internal returns (Battle memory) {
        Battle memory openBattle;
        require(s_queueLast >= s_queueFirst);
        openBattle = s_battles[BattleState.open][s_queueFirst];
        delete s_battles[BattleState.open][s_queueFirst];
        s_queueFirst += 1;
        return openBattle;
    }

    function _openBattleQueuelength() internal view returns (uint256) {
        return (s_queueLast - s_queueFirst) + 1;
    }
    // private functions
}
