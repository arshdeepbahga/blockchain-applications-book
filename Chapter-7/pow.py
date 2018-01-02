 # bytes in word
WORD_BYTES = 4  
# width of mix                 
MIX_BYTES = 128
# hash length in bytes 
HASH_BYTES = 64
# number of accesses in hashimoto loop
ACCESSES = 64   

def hashimoto(header, nonce, full_size, dataset_lookup):
    n = full_size // HASH_BYTES
    w = MIX_BYTES // WORD_BYTES
    mixhashes = MIX_BYTES // HASH_BYTES
    s = sha3_512(header + nonce[::-1])
    mix = []
    for _ in range(MIX_BYTES // HASH_BYTES):
        mix.extend(s)
    for i in range(ACCESSES):
        p = fnv(i ^ s[0], mix[i % w]) % (n // mixhashes) * mixhashes
        newdata = []
        for j in range(mixhashes):
            newdata.extend(dataset_lookup(p + j))
        mix = list(map(fnv, mix, newdata))
    cmix = []
    for i in range(0, len(mix), 4):
        cmix.append(fnv(fnv(fnv(mix[i], mix[i + 1]), 
                        mix[i + 2]), mix[i + 3]))
    return {
        "mix digest": serialize_hash(cmix),
        "result": serialize_hash(sha3_256(s + cmix))
    }


def hashimoto_light(block_number, cache, header, nonce):
    return hashimoto(header, nonce, get_full_size(block_number),
                     lambda x: calc_dataset_item(cache, x))


def hashimoto_full(dataset, header, nonce):
    return hashimoto(header, nonce, len(dataset) * HASH_BYTES,
                     lambda x: dataset[x])