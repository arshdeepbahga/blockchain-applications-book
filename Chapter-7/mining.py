def mine(full_size, dataset, header, difficulty):
    from random import randint
    nonce = randint(0, 2**64)
    while decode_int(hashimoto_full(full_size, 
            dataset, header, nonce)) < difficulty:
        nonce += 1
        nonce %= 2**64
    return nonce