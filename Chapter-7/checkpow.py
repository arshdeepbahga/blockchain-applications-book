def check_pow(block_number, header_hash, mixhash, nonce, difficulty):
  """Check if the proof-of-work of the block is valid.
  :param nonce: if given the proof of work function will be evaluated
          with this nonce instead of the one already present in
          the header
  :returns: `True` or `False`"""
  log.debug('checking pow', block_number=block_number)
  if len(mixhash) != 32 or len(header_hash) != 32 or len(nonce) != 8:
    return False

  # Grab current cache
  cache = get_cache(block_number)
  mining_output = hashimoto_light(block_number, cache, 
                                    header_hash, nonce)
  if mining_output[b'mix digest'] != mixhash:
    return False
  return utils.big_endian_to_int(mining_output[b'result']) <= 
                                                2**256 // (difficulty or 1)