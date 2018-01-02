# Size of the dataset relative to the cache
CACHE_BYTES_INIT = 2**24
# Size of the dataset relative to the cache      
CACHE_BYTES_GROWTH = 2**17 
# blocks per epoch
EPOCH_LENGTH = 30000  
# hash length in bytes
HASH_BYTES = 64     
# number of rounds in cache production
CACHE_ROUNDS = 3    

cache_seeds = [b'\x00' * 32]

def mkcache(block_number):
  while len(cache_seeds) <= block_number // EPOCH_LENGTH:
    cache_seeds.append(sha3.sha3_256(cache_seeds[-1]).digest())

  seed = cache_seeds[block_number // EPOCH_LENGTH]

  n = get_cache_size(block_number) // HASH_BYTES
  return _get_cache(seed, n)


@lru_cache(5)
def _get_cache(seed, n):
  # Sequentially produce the initial dataset
  o = [sha3_512(seed)]
  for i in range(1, n):
    o.append(sha3_512(o[-1]))

  for _ in range(CACHE_ROUNDS):
    for i in range(n):
      v = o[i][0] % n
      o[i] = sha3_512(list(map(xor, o[(i - 1 + n) % n], o[v])))

  return o