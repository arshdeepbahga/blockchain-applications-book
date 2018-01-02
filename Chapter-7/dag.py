# bytes in word
WORD_BYTES = 4                    
# bytes in dataset at genesis
DATASET_BYTES_INIT = 2**30        
# growth per epoch (~7 GB per year)
DATASET_BYTES_GROWTH = 2**23      
# hash length in bytes
HASH_BYTES = 64        
# number of parents of each dataset element           
DATASET_PARENTS = 256  

def calc_dataset_item(cache, i):
    n = len(cache)
    r = HASH_BYTES // WORD_BYTES
    mix = copy.copy(cache[i % n])
    mix[0] ^= i
    mix = sha3_512(mix)
    for j in range(DATASET_PARENTS):
        cache_index = fnv(i ^ j, mix[j % r])
        mix = list(map(fnv, mix, cache[cache_index % n]))
    return sha3_512(mix)

def calc_dataset(full_size, cache):
    o = []
    percent = (full_size // HASH_BYTES) // 100
    for i in range(full_size // HASH_BYTES):
        if i % percent == 0:
            sys.stderr.write("Completed %d items, 
                %d percent\n" % (i, i // percent))
        o.append(calc_dataset_item(cache, i))
    return o