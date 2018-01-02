def finalize(self):
    """Apply rewards and commit."""
    delta = int(self.config['BLOCK_REWARD'] + 
        self.config['NEPHEW_REWARD'] * len(self.uncles))
    
    self.delta_balance(self.coinbase, delta)
    self.ether_delta += delta

    br = self.config['BLOCK_REWARD']
    udpf = self.config['UNCLE_DEPTH_PENALTY_FACTOR']

    for uncle in self.uncles:
        r = int(br * (udpf + uncle.number - self.number) // udpf)

        self.delta_balance(uncle.coinbase, r)
        self.ether_delta += r
    self.commit_state()