def validate_transaction(block, tx):

  def rp(what, actual, target):
    return '%r: %r actual:%r target:%r' % (tx, what, actual, target)

  # (1) The transaction signature is valid;
  # sender is set and validated on Transaction initialization
  if not tx.sender:  
    if block.number >= config.default_config["METROPOLIS_FORK_BLKNUM"]:
      tx._sender = normalize_address(
                    config.default_config["METROPOLIS_ENTRY_POINT"])
    else:
      raise UnsignedTransaction(tx)
  if block.number >= config.default_config["HOMESTEAD_FORK_BLKNUM"]:
      tx.check_low_s()

  # (2) the transaction nonce is valid (equivalent to the
  #   sender account's current nonce);
  acctnonce = block.get_nonce(tx.sender)
  if acctnonce != tx.nonce:
    raise InvalidNonce(rp('nonce', tx.nonce, acctnonce))

  # (3) the gas limit is no smaller than the intrinsic gas,
  # g0, used by the transaction;
  if tx.startgas < tx.intrinsic_gas_used:
    raise InsufficientStartGas(rp('startgas', 
                tx.startgas, tx.intrinsic_gas_used))

  # (4) the sender account balance contains at least the
  # cost, v0, required in up-front payment.
  total_cost = tx.value + tx.gasprice * tx.startgas
  if block.get_balance(tx.sender) < total_cost:
    raise InsufficientBalance(rp('balance', 
                block.get_balance(tx.sender), total_cost))

  # check block gas limit
  if block.gas_used + tx.startgas > block.gas_limit:
    raise BlockGasLimitReached(rp('gaslimit', 
                block.gas_used + tx.startgas, block.gas_limit))

  return True