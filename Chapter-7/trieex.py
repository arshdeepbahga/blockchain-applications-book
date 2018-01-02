>>> import trie, utils, rlp

>>> state = trie.Trie('triedb', trie.BLANK_ROOT)
>>> state.update('\x0d\x91\x13\x32', rlp.encode(['1,2,a,b']))
>>> state.update('\x0d\x98\xb2\x37', rlp.encode(['3,4,c,d']))
>>> state.update('\x0d\x98\xb2\x49', rlp.encode(['5,6,e,f']))
>>> state.update('\x0d\x98\xb2', rlp.encode(['7,8,g,h']))

>>> state.to_dict()
{'\r\x98\xb2I': '\xc8\x875,6,e,f', '\r\x98\xb2': '\xc8\x877,8,g,h', 
'\r\x91\x132': '\xc8\x871,2,a,b', '\r\x98\xb27': '\xc8\x873,4,c,d'}

>>> state.root_hash.encode('hex')
'3faf9d35343ffcc2023c3f8480535414f0b820ea660e50af8c95ca14143456b2'

>>> state.root_node[1].encode('hex')
'a5cd427fa8e7f2c71d2daecc7499cf3d54d66fa25e464315a363e05c743e33aa'

>>> b=state._decode_to_node(state.root_node[1])
>>> b
['', [' \x132', '\xc8\x871,2,a,b'], '', '', '', '', '', '', 
'\x17\xa3\x9bD\xa9*\x96\xe7{&\x9c\x9do\x9c\xf69e\x03
\xec\x93\xe9<\xaaE\x83\x8f;=\x19\xea\xc9\xfe', 
'', '', '', '', '', '', '', '']

>>> b[1][0].encode('hex')
'201332'

>>> b[8].encode('hex')
'17a39b44a92a96e77b269c9d6f9cf6396503ec93e93caa45838f3b3d19eac9fe'

>>> c=state._decode_to_node(b[8])
>>> c
['\x00\xb2', '\xc5)\xadu\xbe\xfe\xf3\x08\x8d\x19j\x9a\x1d
\xdaW>\x1f\xd0K\xd4\xe0\x1b\xd7\xf9\xcaee\xec\xdf\xc2X4']

>>> c[0].encode('hex')
'00b2'

>>> d=state._decode_to_node(c[1])
>>> d
['', '', '', ['7', '\xc8\x873,4,c,d'], ['9', '\xc8\x875,6,e,f'], 
'', '', '', '', '', '', '', '', '', '', '', '\xc8\x877,8,g,h']

>>> d[3][0].encode('hex')
'37'

>>> d[4][0].encode('hex')
'39'

>>> d[16]
'\xc8\x877,8,g,h'
