def init_from_parent(cls, parent, coinbase, nonce=b'', extra_data=b'',
                         timestamp=int(time.time()), uncles=[], env=None):
    """Create a new block based on a parent block.

    The block will not include any transactions and will not be finalized.
    """
    header = BlockHeader(prevhash=parent.hash,
                         uncles_hash=utils.sha3(rlp.encode(uncles)),
                         coinbase=coinbase,
                         state_root=parent.state_root,
                         tx_list_root=trie.BLANK_ROOT,
                         receipts_root=trie.BLANK_ROOT,
                         bloom=0,
                         difficulty=calc_difficulty(parent, timestamp),
                         mixhash='',
                         number=parent.number + 1,
                         gas_limit=calc_gaslimit(parent),
                         gas_used=0,
                         timestamp=timestamp,
                         extra_data=extra_data,
                         nonce=nonce)
    block = Block(header, [], uncles, env=env or parent.env,
                  parent=parent, making=True)
    block.ancestor_hashes = [parent.hash] + parent.ancestor_hashes
    block.log_listeners = parent.log_listeners
    return block