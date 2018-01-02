def create_contract(ext, msg):
  log_msg.debug('CONTRACT CREATION')
  sender = decode_hex(msg.sender) if len(msg.sender) == 40 
                                  else msg.sender
  code = msg.data.extract_all()
  if ext._block.number >= ext._block.config['METROPOLIS_FORK_BLKNUM']:
    msg.to = mk_metropolis_contract_address(msg.sender, code)
    if ext.get_code(msg.to):
      if ext.get_nonce(msg.to) >= 2 ** 40:
        ext.set_nonce(msg.to, 
                    (ext.get_nonce(msg.to) + 1) % 2 ** 160)
        msg.to = normalize_address(
                (ext.get_nonce(msg.to) - 1) % 2 ** 160)
      else:
        ext.set_nonce(msg.to, 
                    (big_endian_to_int(msg.to) + 2) % 2 ** 160)
        msg.to = normalize_address(
                (ext.get_nonce(msg.to) - 1) % 2 ** 160)
  else:
    if ext.tx_origin != msg.sender:
      ext._block.increment_nonce(msg.sender)
    nonce = utils.encode_int(ext._block.get_nonce(msg.sender) - 1)
    msg.to = mk_contract_address(sender, nonce)
  b = ext.get_balance(msg.to)
  if b > 0:
    ext.set_balance(msg.to, b)
    ext._block.set_nonce(msg.to, 0)
    ext._block.set_code(msg.to, b'')
    ext._block.reset_storage(msg.to)
  msg.is_create = True
  msg.data = vm.CallData([], 0, 0)
  snapshot = ext._block.snapshot()
  res, gas, dat = _apply_msg(ext, msg, code)
  assert utils.is_numeric(gas)

  if res:
    if not len(dat):
      return 1, gas, msg.to
    gcost = len(dat) * opcodes.GCONTRACTBYTE
    if gas >= gcost:
      gas -= gcost
    else:
      dat = []
      log_msg.debug('CONTRACT CREATION OOG', have=gas, 
            want=gcost, block_number=ext._block.number)
      if ext._block.number >= ext._block.config['HOMESTEAD_FORK_BLKNUM']:
        ext._block.revert(snapshot)
        return 0, 0, b''
    ext._block.set_code(msg.to, b''.join(map(ascii_chr, dat)))
    return 1, gas, msg.to
  else:
    return 0, gas, b''