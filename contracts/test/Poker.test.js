const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Poker Contract", function () {
  let Poker;
  let poker;
  let owner;
  let player1;
  let player2;
  let player3;
  let player4;
  let player5;
  let player6;
  let addrs;

  beforeEach(async function () {
    [owner, player1, player2, player3, player4, player5, player6, ...addrs] =
      await ethers.getSigners();

    Poker = await ethers.getContractFactory("Poker");
    poker = await Poker.deploy();
    await poker.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await poker.owner()).to.equal(owner.address);
    });

    it("Should have correct initial game state", async function () {
      const gameState = await poker.getGameState();
      expect(gameState.smallBlind).to.equal(10);
      expect(gameState.bigBlind).to.equal(20);
      expect(gameState.currentRound).to.equal(4); // FINISHED
      expect(gameState.gameActive).to.equal(false);
    });

    it("Should have correct constants", async function () {
      expect(await poker.MAXNUMPLAYERS()).to.equal(6);
      expect(await poker.MINPLAYERS()).to.equal(2);
      expect(await poker.MINBUYIN()).to.equal(1000);
      expect(await poker.MAXBUYIN()).to.equal(10000);
    });
  });

  describe("Room Management", function () {
    it("Should allow players to join room with valid buy-in", async function () {
      const buyIn = ethers.utils.parseEther("1");

      await expect(poker.connect(player1).joinRoom({ value: buyIn }))
        .to.emit(poker, "PlayerJoined")
        .withArgs(player1.address, 5, buyIn);

      const playerInfo = await poker.getPlayerInfo(player1.address);
      expect(playerInfo.inRoom).to.equal(true);
      expect(playerInfo.chair).to.equal(5);

      const balance = await poker.playerBalance(player1.address);
      expect(balance).to.equal(buyIn);
    });

    it("Should reject join with insufficient buy-in", async function () {
      const lowBuyIn = ethers.utils.parseEther("0.5"); // 500 wei

      await expect(poker.connect(player1).joinRoom({ value: lowBuyIn })).to.be.revertedWith(
        "Invalid buy-in amount"
      );
    });

    it("Should reject join with excessive buy-in", async function () {
      const highBuyIn = ethers.utils.parseEther("15"); // 15000 wei

      await expect(poker.connect(player1).joinRoom({ value: highBuyIn })).to.be.revertedWith(
        "Invalid buy-in amount"
      );
    });

    it("Should reject duplicate join", async function () {
      const buyIn = ethers.utils.parseEther("1");

      await poker.connect(player1).joinRoom({ value: buyIn });

      await expect(poker.connect(player1).joinRoom({ value: buyIn })).to.be.revertedWith(
        "Already in room"
      );
    });

    it("Should reject join when room is full", async function () {
      const buyIn = ethers.utils.parseEther("1");

      // Fill the room
      await poker.connect(player1).joinRoom({ value: buyIn });
      await poker.connect(player2).joinRoom({ value: buyIn });
      await poker.connect(player3).joinRoom({ value: buyIn });
      await poker.connect(player4).joinRoom({ value: buyIn });
      await poker.connect(player5).joinRoom({ value: buyIn });
      await poker.connect(player6).joinRoom({ value: buyIn });

      // Try to join with 7th player
      await expect(poker.connect(addrs[0]).joinRoom({ value: buyIn })).to.be.revertedWith(
        "Room is full"
      );
    });

    it("Should allow players to leave room and withdraw balance", async function () {
      const buyIn = ethers.utils.parseEther("1");
      const initialBalance = await player1.getBalance();

      await poker.connect(player1).joinRoom({ value: buyIn });
      await poker.connect(player1).leaveRoom();

      const finalBalance = await player1.getBalance();
      expect(finalBalance).to.be.closeTo(initialBalance, ethers.utils.parseEther("0.01")); // Account for gas

      const playerInfo = await poker.getPlayerInfo(player1.address);
      expect(playerInfo.inRoom).to.equal(false);
    });

    it("Should reject leave when no balance", async function () {
      await expect(poker.connect(player1).leaveRoom()).to.be.revertedWith("Player not in room");
    });

    it("Should reject leave during active game", async function () {
      const buyIn = ethers.utils.parseEther("1");

      await poker.connect(player1).joinRoom({ value: buyIn });
      await poker.connect(player2).joinRoom({ value: buyIn });

      await poker.startGame();

      await expect(poker.connect(player1).leaveRoom()).to.be.revertedWith("Game is active");
    });
  });

  describe("Game Management", function () {
    beforeEach(async function () {
      const buyIn = ethers.utils.parseEther("1");
      await poker.connect(player1).joinRoom({ value: buyIn });
      await poker.connect(player2).joinRoom({ value: buyIn });
    });

    it("Should allow owner to start game with enough players", async function () {
      await expect(poker.startGame()).to.emit(poker, "GameStarted");

      const gameState = await poker.getGameState();
      expect(gameState.gameActive).to.equal(true);
      expect(gameState.currentRound).to.equal(0); // PREFLOP
      expect(gameState.numPlayersInGame).to.equal(2);
    });

    it("Should reject start game with insufficient players", async function () {
      // Remove one player
      await poker.connect(player2).leaveRoom();

      await expect(poker.startGame()).to.be.revertedWith("Not enough players");
    });

    it("Should reject start game by non-owner", async function () {
      await expect(poker.connect(player1).startGame()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Should reject start game when already active", async function () {
      await poker.startGame();

      await expect(poker.startGame()).to.be.revertedWith("Game is active");
    });

    it("Should post blinds correctly", async function () {
      await poker.startGame();

      const gameState = await poker.getGameState();
      expect(gameState.pot).to.equal(30); // small blind (10) + big blind (20)

      const player1Info = await poker.getPlayerInfo(player1.address);
      const player2Info = await poker.getPlayerInfo(player2.address);

      // One player should have small blind, other should have big blind
      expect(player1Info.bet + player2Info.bet).to.equal(30);
    });

    it("Should deal cards to players", async function () {
      await poker.startGame();

      const player1Info = await poker.getPlayerInfo(player1.address);
      const player2Info = await poker.getPlayerInfo(player2.address);

      expect(player1Info.cards[0]).to.not.equal(0);
      expect(player1Info.cards[1]).to.not.equal(0);
      expect(player2Info.cards[0]).to.not.equal(0);
      expect(player2Info.cards[1]).to.not.equal(0);
    });
  });

  describe("Betting Actions", function () {
    beforeEach(async function () {
      const buyIn = ethers.utils.parseEther("1");
      await poker.connect(player1).joinRoom({ value: buyIn });
      await poker.connect(player2).joinRoom({ value: buyIn });
      await poker.startGame();
    });

    it("Should allow player to call", async function () {
      // Player 1 should be able to call the big blind
      await expect(poker.connect(player1).call()).to.emit(poker, "PlayerBet");
    });

    it("Should allow player to raise", async function () {
      const raiseAmount = ethers.utils.parseEther("0.1");

      await expect(poker.connect(player1).raise(raiseAmount)).to.emit(poker, "PlayerBet");
    });

    it("Should reject raise below current bet", async function () {
      const lowRaise = ethers.utils.parseEther("0.01");

      await expect(poker.connect(player1).raise(lowRaise)).to.be.revertedWith(
        "Raise must be higher than current bet"
      );
    });

    it("Should allow player to fold", async function () {
      await expect(poker.connect(player1).fold()).to.emit(poker, "PlayerFolded");

      const playerInfo = await poker.getPlayerInfo(player1.address);
      expect(playerInfo.hasFolded).to.equal(true);
      expect(playerInfo.inGame).to.equal(false);
    });

    it("Should allow player to go all-in", async function () {
      await expect(poker.connect(player1).allIn()).to.emit(poker, "PlayerAllIn");

      const playerInfo = await poker.getPlayerInfo(player1.address);
      expect(playerInfo.isAllin).to.equal(true);
    });

    it("Should reject actions from non-active players", async function () {
      await poker.connect(player1).fold();

      await expect(poker.connect(player1).call()).to.be.revertedWith("Player not in game");
    });

    it("Should reject actions out of turn", async function () {
      // Player 2 tries to act when it's player 1's turn
      await expect(poker.connect(player2).call()).to.be.revertedWith("Not your turn");
    });
  });

  describe("Round Progression", function () {
    beforeEach(async function () {
      const buyIn = ethers.utils.parseEther("1");
      await poker.connect(player1).joinRoom({ value: buyIn });
      await poker.connect(player2).joinRoom({ value: buyIn });
      await poker.startGame();
    });

    it("Should progress through rounds correctly", async function () {
      // Complete preflop round
      await poker.connect(player1).call();
      await poker.connect(player2).call();

      let gameState = await poker.getGameState();
      expect(gameState.currentRound).to.equal(1); // FLOP

      // Complete flop round
      await poker.connect(player1).call();
      await poker.connect(player2).call();

      gameState = await poker.getGameState();
      expect(gameState.currentRound).to.equal(2); // TURN

      // Complete turn round
      await poker.connect(player1).call();
      await poker.connect(player2).call();

      gameState = await poker.getGameState();
      expect(gameState.currentRound).to.equal(3); // RIVER

      // Complete river round
      await poker.connect(player1).call();
      await poker.connect(player2).call();

      gameState = await poker.getGameState();
      expect(gameState.currentRound).to.equal(4); // FINISHED
      expect(gameState.gameActive).to.equal(false);
    });

    it("Should deal community cards correctly", async function () {
      // Complete preflop to get to flop
      await poker.connect(player1).call();
      await poker.connect(player2).call();

      const gameState = await poker.getGameState();
      expect(gameState.communityCards[0]).to.not.equal(0);
      expect(gameState.communityCards[1]).to.not.equal(0);
      expect(gameState.communityCards[2]).to.not.equal(0);
    });
  });

  describe("Game End and Winner Determination", function () {
    beforeEach(async function () {
      const buyIn = ethers.utils.parseEther("1");
      await poker.connect(player1).joinRoom({ value: buyIn });
      await poker.connect(player2).joinRoom({ value: buyIn });
      await poker.startGame();
    });

    it("Should end game when all players fold except one", async function () {
      await poker.connect(player1).fold();

      const gameState = await poker.getGameState();
      expect(gameState.gameActive).to.equal(false);
      expect(gameState.currentRound).to.equal(4); // FINISHED
    });

    it("Should determine winner correctly", async function () {
      // Complete the game
      await poker.connect(player1).call();
      await poker.connect(player2).call();
      await poker.connect(player1).call();
      await poker.connect(player2).call();
      await poker.connect(player1).call();
      await poker.connect(player2).call();
      await poker.connect(player1).call();
      await poker.connect(player2).call();

      const gameState = await poker.getGameState();
      expect(gameState.gameActive).to.equal(false);
      expect(gameState.pot).to.equal(0); // Pot should be distributed
    });
  });

  describe("Edge Cases and Error Handling", function () {
    it("Should handle insufficient balance for actions", async function () {
      const buyIn = ethers.utils.parseEther("0.1"); // Small buy-in
      await poker.connect(player1).joinRoom({ value: buyIn });
      await poker.connect(player2).joinRoom({ value: buyIn });
      await poker.startGame();

      // Try to raise more than balance
      const largeRaise = ethers.utils.parseEther("0.2");
      await expect(poker.connect(player1).raise(largeRaise)).to.be.revertedWith(
        "Insufficient balance"
      );
    });

    it("Should handle all players going all-in", async function () {
      const buyIn = ethers.utils.parseEther("0.1");
      await poker.connect(player1).joinRoom({ value: buyIn });
      await poker.connect(player2).joinRoom({ value: buyIn });
      await poker.startGame();

      await poker.connect(player1).allIn();
      await poker.connect(player2).allIn();

      const gameState = await poker.getGameState();
      expect(gameState.gameActive).to.equal(false);
    });
  });

  describe("View Functions", function () {
    it("Should return correct player information", async function () {
      const buyIn = ethers.utils.parseEther("1");
      await poker.connect(player1).joinRoom({ value: buyIn });

      const playerInfo = await poker.getPlayerInfo(player1.address);
      expect(playerInfo.inRoom).to.equal(true);
      expect(playerInfo.chair).to.equal(5);
    });

    it("Should return correct game state", async function () {
      const gameState = await poker.getGameState();
      expect(gameState.smallBlind).to.equal(10);
      expect(gameState.bigBlind).to.equal(20);
      expect(gameState.gameActive).to.equal(false);
    });

    it("Should return correct players in room", async function () {
      const buyIn = ethers.utils.parseEther("1");
      await poker.connect(player1).joinRoom({ value: buyIn });
      await poker.connect(player2).joinRoom({ value: buyIn });

      const playersInRoom = await poker.getPlayersInRoom();
      expect(playersInRoom[5]).to.equal(player1.address);
      expect(playersInRoom[4]).to.equal(player2.address);
    });

    it("Should return correct empty chairs", async function () {
      const emptyChairs = await poker.getEmptyChairs();
      expect(emptyChairs.length).to.equal(6);
      expect(emptyChairs).to.include(0);
      expect(emptyChairs).to.include(5);
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to pause game", async function () {
      const buyIn = ethers.utils.parseEther("1");
      await poker.connect(player1).joinRoom({ value: buyIn });
      await poker.connect(player2).joinRoom({ value: buyIn });
      await poker.startGame();

      await poker.pauseGame();

      const gameState = await poker.getGameState();
      expect(gameState.gameActive).to.equal(false);
    });

    it("Should reject pause game by non-owner", async function () {
      await expect(poker.connect(player1).pauseGame()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("Should allow owner to emergency withdraw", async function () {
      const buyIn = ethers.utils.parseEther("1");
      await poker.connect(player1).joinRoom({ value: buyIn });

      const initialBalance = await owner.getBalance();
      await poker.emergencyWithdraw();
      const finalBalance = await owner.getBalance();

      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should reject emergency withdraw by non-owner", async function () {
      await expect(poker.connect(player1).emergencyWithdraw()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
  });

  describe("Advanced Poker Contract Tests", function () {
    it("Should allow a 4-player game with correct round progression and winner", async function () {
      const buyIn = ethers.utils.parseEther("1");
      await poker.connect(player1).joinRoom({ value: buyIn });
      await poker.connect(player2).joinRoom({ value: buyIn });
      await poker.connect(player3).joinRoom({ value: buyIn });
      await poker.connect(player4).joinRoom({ value: buyIn });
      await poker.startGame();
      // All players call in turn for each round
      for (let round = 0; round < 4; round++) {
        for (let i = 0; i < 4; i++) {
          const current = [player1, player2, player3, player4][i];
          await poker.connect(current).call();
        }
        const gameState = await poker.getGameState();
        expect(gameState.currentRound).to.equal(round < 3 ? round + 1 : 4);
      }
      // Game should be finished
      const gameState = await poker.getGameState();
      expect(gameState.gameActive).to.equal(false);
      expect(gameState.pot).to.equal(0);
    });

    it("Should allow a 6-player game and handle multiple folds", async function () {
      const buyIn = ethers.utils.parseEther("1");
      await poker.connect(player1).joinRoom({ value: buyIn });
      await poker.connect(player2).joinRoom({ value: buyIn });
      await poker.connect(player3).joinRoom({ value: buyIn });
      await poker.connect(player4).joinRoom({ value: buyIn });
      await poker.connect(player5).joinRoom({ value: buyIn });
      await poker.connect(player6).joinRoom({ value: buyIn });
      await poker.startGame();
      // 4 players fold, 2 remain
      await poker.connect(player1).fold();
      await poker.connect(player2).fold();
      await poker.connect(player3).fold();
      await poker.connect(player4).fold();
      // Remaining players call
      await poker.connect(player5).call();
      await poker.connect(player6).call();
      // Game should continue with 2 players
      const gameState = await poker.getGameState();
      expect(gameState.numPlayersInGame).to.equal(2);
    });

    it("Should emit all relevant events during a full game", async function () {
      const buyIn = ethers.utils.parseEther("1");
      await expect(poker.connect(player1).joinRoom({ value: buyIn })).to.emit(
        poker,
        "PlayerJoined"
      );
      await expect(poker.connect(player2).joinRoom({ value: buyIn })).to.emit(
        poker,
        "PlayerJoined"
      );
      await expect(poker.startGame()).to.emit(poker, "GameStarted");
      await expect(poker.connect(player1).call()).to.emit(poker, "PlayerBet");
      await expect(poker.connect(player2).raise(ethers.utils.parseEther("0.2"))).to.emit(
        poker,
        "PlayerBet"
      );
      await expect(poker.connect(player1).fold()).to.emit(poker, "PlayerFolded");
    });

    it("Should allow join with exact MINBUYIN and MAXBUYIN", async function () {
      const minBuyIn = await poker.MINBUYIN();
      const maxBuyIn = await poker.MAXBUYIN();
      await expect(poker.connect(player1).joinRoom({ value: minBuyIn })).to.emit(
        poker,
        "PlayerJoined"
      );
      await expect(poker.connect(player2).joinRoom({ value: maxBuyIn })).to.emit(
        poker,
        "PlayerJoined"
      );
    });

    it("Should revert if not in room or not in game for restricted actions", async function () {
      await expect(poker.connect(player1).call()).to.be.revertedWith("Player not in game");
      const buyIn = ethers.utils.parseEther("1");
      await poker.connect(player1).joinRoom({ value: buyIn });
      await poker.connect(player2).joinRoom({ value: buyIn });
      await poker.startGame();
      await poker.connect(player1).fold();
      await expect(poker.connect(player1).call()).to.be.revertedWith("Player not in game");
    });

    it("Should reset all state after multiple games", async function () {
      const buyIn = ethers.utils.parseEther("1");
      await poker.connect(player1).joinRoom({ value: buyIn });
      await poker.connect(player2).joinRoom({ value: buyIn });
      for (let i = 0; i < 3; i++) {
        await poker.startGame();
        await poker.connect(player1).call();
        await poker.connect(player2).call();
        await poker.connect(player1).call();
        await poker.connect(player2).call();
        await poker.connect(player1).call();
        await poker.connect(player2).call();
        await poker.connect(player1).call();
        await poker.connect(player2).call();
        const gameState = await poker.getGameState();
        expect(gameState.gameActive).to.equal(false);
        expect(gameState.currentRound).to.equal(4);
        // Players should be able to start a new game
      }
    });
  });
});
