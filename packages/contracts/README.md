# Robin Staking Vaults

## What this project does

This system lets people **stake Polymarket YES/NO outcome tokens** to earn passive yield. When you deposit, the vault pairs equal amounts of YES and NO, converts them into USD (USDC), and supplies that USD to a lending protocol (e.g., Aave) to earn interest.

Before a market is resolved, you can withdraw your outcome tokens at any time. After resolution:

- the system **freezes** everyone’s “time in the pool,”
- **drains** funds back from the lending protocol (in batches if needed),
- lets winners **redeem** their winning outcome tokens for USD, and
- lets everyone **harvest** their fair share of the earned yield (minus an optional protocol fee).

Each Polymarket market gets its **own vault**, so funds and accounting are isolated per market.

---

## How it works (at a glance)

1. **Deposit:** Users deposit YES or NO tokens for a specific market. The vault pairs YES and NO 1:1, merges to USDC on Polymarket, and supplies USDC to a yield strategy.
2. **Score tracking:** While staked, users accrue a **time-weighted score** based on how much and how long they’ve supplied.
3. **Withdraw (pre-resolution):** Users can withdraw YES/NO. If needed, the vault pulls USDC back and splits into YES/NO on Polymarket to fulfill withdrawals.
4. **Finalize:** When the market resolves, the vault records the winner and **freezes scores** at that instant.
5. **Unlock (progressive drain):** The vault **drains** the strategy (may take multiple calls if liquidity is tight). Once fully drained, it computes total yield and any protocol fee.
6. **Post-resolution:**
   - **Redeem winners:** Users redeem their winning tokens for USDC (subject to on-hand liquidity if still draining).
   - **Harvest yield:** After draining completes, users harvest yield pro-rata to their frozen scores.

---

## Contracts and how they relate

### Building block

- **`TimeWeighedScorer` (abstract)**  
  Tracks each user’s **time-weighted balance** and the global aggregate, then freezes them at market resolution so yield can be split fairly.

### The abstract vault

- **`RobinStakingVault` (abstract)**  
  Core logic for a single market’s vault:
  - Handles **deposits/withdrawals** (pre-finalization),
  - Pairs and **merges** outcome tokens to USDC, supplies to the **yield strategy**,
  - **Finalizes** on betting market resolution and starts **unlocking** yield (progressive draining),
  - Enables **yield harvest** after draining completes,
  - Lets users **redeem winning tokens for USDC**,
  - Applies optional **protocol fee** on yield,
  - Leaves prediction-market and strategy operations **abstract** via hooks.

> Think of this as the “vault brain” without chain-specific wiring.

### Prediction market adapter

- **`PolymarketStakingVault` (abstract; extends `RobinStakingVault`)**  
  Implements the prediction-market hooks for **Polymarket** (Conditional Tokens / ERC-1155):
  - Take/give YES/NO,
  - **Merge** (YES+NO → USDC) and **Split** (USDC → YES+NO),
  - Check **on-chain resolution** and determine the winning outcome token,
  - Optionally redeem leftover vault-held winning tokens into USDC.

### Yield strategy Adapter

- **`AaveStakingVault` (abstract; extends `RobinStakingVault`)**  
  Implements the yield strategy hooks for **Aave v3 (Polygon)**:
  - Supply, withdraw, and exit USDC,
  - Read current strategy balance,
  - Optional view for current APY (bps).

### Concrete vault (clone target)

- **`PolymarketAaveStakingVault` (concrete)**  
  Composes **`PolymarketStakingVault` + `AaveStakingVault` + `RobinStakingVault`** to form a deployable vault for one Polymarket market with Aave as the yield source.  
  This is the **implementation** the manager clones per Polymarket market `conditionId`.

### Manager / factory (upgradeable)

- **`RobinVaultManager` (UUPS-upgradeable)**  
  Factory & registry that:
  - **Permissionlessly** creates a new vault clone for a given Poylamrket `conditionId` (one per market),
  - Enforces **one vault per `conditionId`**,
  - Stores global config (protocol fee, CTF address, USDC, Aave pool/data provider, etc.),
  - Deploys clones via **EIP-1167 minimal proxies**,
  - **Owns** each created vault (so protocol fees are harvested via the manager),
  - Lets the manager owner **claim protocol fees** from vaults,
  - Manages **pausing** of vault functionalities,
  - Is **UUPS-upgradeable** for future improvements.

---

## Relationship diagram

              ┌───────────────────────┐
              │   RobinVaultManager   │   (UUPS proxy)
              └───────────┬───────────┘
                          │ clones (EIP-1167, one per conditionId)
                          ▼
          ┌──────────────────────────────┐
          │ PolymarketAaveStakingVault   │  (implementation logic of each clone)
          │  = PolymarketStakingVault +  │
          │    AaveStakingVault +        │
          │    RobinStakingVault         │
          └─────┬───────────────────┬────┘
                │                   │
      (Polymarket adapter)     (Yield strategy)
                │                   │
        ConditionalTokens      Aave v3 Pool
         (YES/NO & USDC)       (USDC lending)

---

## Notes

- **Per-market isolation:** Each vault handles exactly one Polymarket market (`conditionId`).
- **Fairness via time:** Yield allocation is based on **time-weighted stake**, frozen at resolution time.
- **Progressive unlock:** If the lending market can’t repay everything at once, the vault drains in **batches**; redemptions may be first-come-first-served until fully drained.
- **Protocol fee:** A configurable share of yield can be taken and later **claimed via the manager**.
- **Ownership & roles:** The **manager** owns each vault; the **manager owner** controls config, upgrades, and protocol-fee claims. There is a separata PAUSER_ROLE that can pause new vault creations and has control over pausing functionalities of specific vaults via the manager.
