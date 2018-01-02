class Transaction(rlp.Serializable):
    fields = [
        ('nonce', big_endian_int),
        ('gasprice', big_endian_int),
        ('startgas', big_endian_int),
        ('to', utils.address),
        ('value', big_endian_int),
        ('data', binary),
        ('v', big_endian_int),
        ('r', big_endian_int),
        ('s', big_endian_int),
    ]

    _sender = None

    def __init__(self, nonce, gasprice, startgas, 
                    to, value, data, v=0, r=0, s=0):
        self.data = None

        to = utils.normalize_address(to, allow_blank=True)
        assert len(to) == 20 or len(to) == 0
        super(Transaction, self).__init__(nonce, gasprice, 
                        startgas, to, value, data, v, r, s)
        self.logs = []

        if self.gasprice >= TT256 or self.startgas >= TT256 or \
                self.value >= TT256 or self.nonce >= TT256:
            raise InvalidTransaction("Values way too high!")
        if self.startgas < self.intrinsic_gas_used:
            raise InvalidTransaction("Startgas too low")

        log.debug('deserialized tx', tx=encode_hex(self.hash)[:8])