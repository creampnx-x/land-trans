. ./envVar.sh

setGlobalsForPeer0Org1

# peer chaincode query -C mychannel -n users -c '{"function": "QueryAllBossId","Args":[""]}'

# peer chaincode query -C mychannel -n land -c '{"function": "CreateLand","Args":["beijing", "1e2d","pinxue","Yes"]}'

peer chaincode query -C mychannel -n land -c '{"function": "QueryLand","Args":["1e2d"]}'

# peer chaincode list -C mychannel --instantiated


# peer chaincode invoke -o orderer.example.com:7050 --ordererTLSHostnameOverride orderer.example.com -C mychannel -n users -c '{"function": "CreateUser","Args":["beijing", "1e2d","pinxue","Yes", ""]}'

# sleep 3

# peer chaincode query -C mychannel -n users -c '{"function": "QueryUser","Args":["1e2d"]}'