pragma solidity ^0.8.8;
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract Poker is Ownable {
    // Constants
    uint8 public constant MAXNUMPLAYERS = 6;
    uint8 public constant MINPLAYERS = 2;
    uint256 public constant MINBUYIN = 1000;
    uint256 public constant MAXBUYIN = 10000;

    // Game state
    enum Round {
        PREFLOP, // 0
        FLOP, // 1
        TURN, // 2
        RIVER, // 3
        FINISHED // 4
    }

    struct Player {
        uint256 bet;
        uint8 chair;
        uint256[2] cards;
        uint256 score;
        bool inRoom;
        bool inGame;
        bool isAllin;
        bool isActive;
        bool hasFolded;
    }

    struct GameState {
        Round currentRound;
        uint8 dealerPos;
        uint256 smallBlind;
        uint256 bigBlind;
        uint256 currentBet;
        uint256 pot;
        uint8 numPlayersInGame;
        uint8 turnHolder;
        uint256[5] communityCards;
        bool gameActive;
    }

    // State variables
    GameState public gameState;
    mapping(address => Player) public players;
    mapping(address => uint256) public playerBalance;
    address[MAXNUMPLAYERS] public playersInRoom;
    uint8[] private emptyChairs = [5, 4, 3, 2, 1, 0];

    // Events
    event PlayerJoined(address indexed player, uint8 chair, uint256 buyIn);
    event PlayerLeft(address indexed player);
    event GameStarted();
    event RoundChanged(Round newRound);
    event PlayerBet(address indexed player, uint256 amount);
    event PlayerFolded(address indexed player);
    event PlayerAllIn(address indexed player, uint256 amount);
    event GameEnded(address indexed winner, uint256 amount);
    event CardsDealt(address indexed player, uint256[2] cards);
    event CommunityCardsDealt(uint256[5] cards);

    // Modifiers
    modifier onlyInRoom() {
        require(players[msg.sender].inRoom, "Player not in room");
        _;
    }

    modifier onlyInGame() {
        require(players[msg.sender].inGame, "Player not in game");
        _;
    }

    modifier gameNotActive() {
        require(!gameState.gameActive, "Game is active");
        _;
    }

    modifier gameActive() {
        require(gameState.gameActive, "Game not active");
        _;
    }

    modifier onlyTurn() {
        require(
            playersInRoom[gameState.turnHolder] == msg.sender,
            "Not your turn"
        );
        _;
    }

    constructor() {
        gameState.smallBlind = 10;
        gameState.bigBlind = 20;
        gameState.currentRound = Round.FINISHED;
        gameState.dealerPos = 0;
    }

    // Player management
    function joinRoom() external payable gameNotActive {
        require(
            msg.value >= MINBUYIN && msg.value <= MAXBUYIN,
            "Invalid buy-in amount"
        );
        require(!players[msg.sender].inRoom, "Already in room");
        require(emptyChairs.length > 0, "Room is full");

        uint8 chair = emptyChairs[emptyChairs.length - 1];
        emptyChairs.pop();

        players[msg.sender] = Player({
            bet: 0,
            chair: chair,
            cards: [uint256(0), uint256(0)],
            score: 0,
            inRoom: true,
            inGame: false,
            isAllin: false,
            isActive: true,
            hasFolded: false
        });

        playerBalance[msg.sender] = msg.value;
        playersInRoom[chair] = msg.sender;

        emit PlayerJoined(msg.sender, chair, msg.value);
    }

    function leaveRoom() external onlyInRoom gameNotActive {
        require(playerBalance[msg.sender] > 0, "No balance to withdraw");

        uint256 balance = playerBalance[msg.sender];
        playerBalance[msg.sender] = 0;

        // Return chair to empty chairs
        uint8 chair = players[msg.sender].chair;
        emptyChairs.push(chair);

        // Remove from room
        playersInRoom[chair] = address(0);
        players[msg.sender].inRoom = false;

        payable(msg.sender).transfer(balance);
        emit PlayerLeft(msg.sender);
    }

    // Game management
    function startGame() external onlyOwner gameNotActive {
        uint8 playerCount = 0;
        for (uint8 i = 0; i < MAXNUMPLAYERS; i++) {
            if (playersInRoom[i] != address(0)) {
                playerCount++;
            }
        }
        require(playerCount >= MINPLAYERS, "Not enough players");

        // Initialize game state
        gameState.gameActive = true;
        gameState.currentRound = Round.PREFLOP;
        gameState.pot = 0;
        gameState.currentBet = 0;
        gameState.numPlayersInGame = playerCount;
        gameState.turnHolder = getNextActivePlayer(gameState.dealerPos);

        // Set players in game
        for (uint8 i = 0; i < MAXNUMPLAYERS; i++) {
            if (playersInRoom[i] != address(0)) {
                players[playersInRoom[i]].inGame = true;
                players[playersInRoom[i]].hasFolded = false;
                players[playersInRoom[i]].isAllin = false;
                players[playersInRoom[i]].bet = 0;
            }
        }

        // Post blinds
        postBlinds();

        // Deal cards
        dealPlayerCards();

        emit GameStarted();
    }

    function postBlinds() private {
        uint8 smallBlindPos = getNextActivePlayer(gameState.dealerPos);
        uint8 bigBlindPos = getNextActivePlayer(smallBlindPos);

        // Small blind
        address smallBlindPlayer = playersInRoom[smallBlindPos];
        require(
            playerBalance[smallBlindPlayer] >= gameState.smallBlind,
            "Insufficient balance for small blind"
        );

        playerBalance[smallBlindPlayer] -= gameState.smallBlind;
        players[smallBlindPlayer].bet = gameState.smallBlind;
        gameState.pot += gameState.smallBlind;

        // Big blind
        address bigBlindPlayer = playersInRoom[bigBlindPos];
        require(
            playerBalance[bigBlindPlayer] >= gameState.bigBlind,
            "Insufficient balance for big blind"
        );

        playerBalance[bigBlindPlayer] -= gameState.bigBlind;
        players[bigBlindPlayer].bet = gameState.bigBlind;
        gameState.pot += gameState.bigBlind;
        gameState.currentBet = gameState.bigBlind;

        emit PlayerBet(smallBlindPlayer, gameState.smallBlind);
        emit PlayerBet(bigBlindPlayer, gameState.bigBlind);
    }

    function dealPlayerCards() private {
        for (uint8 i = 0; i < MAXNUMPLAYERS; i++) {
            if (
                playersInRoom[i] != address(0) &&
                players[playersInRoom[i]].inGame
            ) {
                uint256[2] memory cards = generatePlayerCards();
                players[playersInRoom[i]].cards = cards;
                emit CardsDealt(playersInRoom[i], cards);
            }
        }
    }

    function generatePlayerCards() private view returns (uint256[2] memory) {
        // Simplified card generation - in production, use proper randomness
        uint256 card1 = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender, "card1"))
        ) % 52;
        uint256 card2 = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender, "card2"))
        ) % 52;
        return [card1, card2];
    }

    // Betting actions
    function call() external onlyInGame onlyTurn gameActive {
        address player = msg.sender;
        uint256 callAmount = gameState.currentBet - players[player].bet;

        if (callAmount == 0) {
            check();
        } else {
            require(
                playerBalance[player] >= callAmount,
                "Insufficient balance"
            );

            playerBalance[player] -= callAmount;
            players[player].bet += callAmount;
            gameState.pot += callAmount;

            emit PlayerBet(player, callAmount);
        }

        nextTurn();
    }

    function raise(uint256 amount) external onlyInGame onlyTurn gameActive {
        address player = msg.sender;
        uint256 totalBet = players[player].bet + amount;

        require(
            totalBet > gameState.currentBet,
            "Raise must be higher than current bet"
        );
        require(playerBalance[player] >= amount, "Insufficient balance");

        playerBalance[player] -= amount;
        players[player].bet += amount;
        gameState.pot += amount;
        gameState.currentBet = totalBet;

        emit PlayerBet(player, amount);
        nextTurn();
    }

    function fold() external onlyInGame onlyTurn gameActive {
        address player = msg.sender;
        players[player].hasFolded = true;
        players[player].inGame = false;
        gameState.numPlayersInGame--;

        emit PlayerFolded(player);
        nextTurn();
    }

    function allIn() external onlyInGame onlyTurn gameActive {
        address player = msg.sender;
        uint256 allInAmount = playerBalance[player];

        require(allInAmount > 0, "No balance to go all-in");

        playerBalance[player] = 0;
        players[player].bet += allInAmount;
        players[player].isAllin = true;
        gameState.pot += allInAmount;

        if (players[player].bet > gameState.currentBet) {
            gameState.currentBet = players[player].bet;
        }

        emit PlayerAllIn(player, allInAmount);
        nextTurn();
    }

    function check() private {
        // Check action - no bet required
    }

    function nextTurn() private {
        uint8 nextPlayer = getNextActivePlayer(gameState.turnHolder);

        // Check if round is complete
        if (
            nextPlayer == gameState.turnHolder ||
            gameState.numPlayersInGame <= 1
        ) {
            nextRound();
        } else {
            gameState.turnHolder = nextPlayer;
        }
    }

    function nextRound() private {
        if (gameState.currentRound == Round.PREFLOP) {
            gameState.currentRound = Round.FLOP;
            dealCommunityCards(3);
        } else if (gameState.currentRound == Round.FLOP) {
            gameState.currentRound = Round.TURN;
            dealCommunityCards(1);
        } else if (gameState.currentRound == Round.TURN) {
            gameState.currentRound = Round.RIVER;
            dealCommunityCards(1);
        } else if (gameState.currentRound == Round.RIVER) {
            endGame();
            return;
        }

        // Reset betting for new round
        gameState.currentBet = 0;
        for (uint8 i = 0; i < MAXNUMPLAYERS; i++) {
            if (playersInRoom[i] != address(0)) {
                players[playersInRoom[i]].bet = 0;
            }
        }

        gameState.turnHolder = getNextActivePlayer(gameState.dealerPos);
        emit RoundChanged(gameState.currentRound);
    }

    function dealCommunityCards(uint8 numCards) private {
        uint8 startIndex = 0;
        if (gameState.currentRound == Round.FLOP) {
            startIndex = 0;
        } else if (gameState.currentRound == Round.TURN) {
            startIndex = 3;
        } else if (gameState.currentRound == Round.RIVER) {
            startIndex = 4;
        }

        for (uint8 i = 0; i < numCards; i++) {
            gameState.communityCards[startIndex + i] =
                uint256(keccak256(abi.encodePacked(block.timestamp, i))) %
                52;
        }

        emit CommunityCardsDealt(gameState.communityCards);
    }

    function getNextActivePlayer(
        uint8 currentPos
    ) private view returns (uint8) {
        uint8 nextPos = (currentPos + 1) % MAXNUMPLAYERS;
        while (nextPos != currentPos) {
            if (
                playersInRoom[nextPos] != address(0) &&
                players[playersInRoom[nextPos]].inGame &&
                !players[playersInRoom[nextPos]].hasFolded
            ) {
                return nextPos;
            }
            nextPos = (nextPos + 1) % MAXNUMPLAYERS;
        }
        return currentPos;
    }

    function endGame() private {
        address winner = determineWinner();
        uint256 winnings = gameState.pot;

        playerBalance[winner] += winnings;
        gameState.pot = 0;
        gameState.gameActive = false;
        gameState.currentRound = Round.FINISHED;

        // Reset player states
        for (uint8 i = 0; i < MAXNUMPLAYERS; i++) {
            if (playersInRoom[i] != address(0)) {
                players[playersInRoom[i]].inGame = false;
                players[playersInRoom[i]].hasFolded = false;
                players[playersInRoom[i]].isAllin = false;
                players[playersInRoom[i]].bet = 0;
            }
        }

        emit GameEnded(winner, winnings);
    }

    function determineWinner() private view returns (address) {
        address winner = address(0);
        uint256 bestScore = 0;

        for (uint8 i = 0; i < MAXNUMPLAYERS; i++) {
            if (
                playersInRoom[i] != address(0) &&
                players[playersInRoom[i]].inGame &&
                !players[playersInRoom[i]].hasFolded
            ) {
                uint256 score = calculateHandScore(
                    players[playersInRoom[i]].cards
                );
                if (score > bestScore) {
                    bestScore = score;
                    winner = playersInRoom[i];
                }
            }
        }

        return winner;
    }

    function calculateHandScore(
        uint256[2] memory playerCards
    ) private view returns (uint256) {
        // Simplified hand scoring - in production, implement proper poker hand evaluation
        uint256 score = 0;

        // Basic scoring based on card values
        for (uint8 i = 0; i < 2; i++) {
            score += (playerCards[i] % 13) + 1; // Card value (1-13)
        }

        // Add community cards to score
        for (uint8 i = 0; i < 5; i++) {
            if (gameState.communityCards[i] != 0) {
                score += (gameState.communityCards[i] % 13) + 1;
            }
        }

        return score;
    }

    // View functions
    function getPlayerInfo(
        address player
    ) external view returns (Player memory) {
        return players[player];
    }

    function getGameState() external view returns (GameState memory) {
        return gameState;
    }

    function getPlayersInRoom()
        external
        view
        returns (address[MAXNUMPLAYERS] memory)
    {
        return playersInRoom;
    }

    function getEmptyChairs() external view returns (uint8[] memory) {
        return emptyChairs;
    }

    function pauseGame() external onlyOwner gameActive {
        gameState.gameActive = false;
    }
}
