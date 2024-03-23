package main

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/hyperledger/fabric-sdk-go/pkg/core/config"
	"github.com/hyperledger/fabric-sdk-go/pkg/gateway"
)

func GetNetwork() *gateway.Network {
	// Path to the network config (CCP) file
	ccpPath := filepath.Join(
		"..",
		"connection",
		"connection-org1-go-test.yaml",
	)

	// Connect to the gateway peer(s) using the network config and identity in the wallet
	gw, err := gateway.Connect(
		gateway.WithConfig(config.FromFile(ccpPath)),
		gateway.WithUser("Admin"),
	)
	if err != nil {
		fmt.Printf("Failed to connect to gateway: %s\n", err)
		os.Exit(1)
	}
	defer gw.Close()

	// Get the network channel 'mychannel'
	network, err := gw.GetNetwork("mychannel")
	if err != nil {
		fmt.Printf("Failed to get network: %s\n", err)
		os.Exit(1)
	}

	return network
}

type Information struct {
	contractName string
	method       string
	args         []string
}

func BaseQuery(network *gateway.Network, info Information) (string, error) {
	contract := network.GetContract(info.contractName)

	// Submit a transaction in that contract to the ledger
	result, err := contract.EvaluateTransaction(info.method, info.args...)
	if err != nil {
		fmt.Printf("Failed to submit transaction: %s\n", err)
		return "", err
	}
	return string(result), nil
}

func BaseInvoke(network *gateway.Network, info Information) (string, error) {
	contract := network.GetContract(info.contractName)

	// Submit a transaction in that contract to the ledger
	result, err := contract.SubmitTransaction(info.method, info.args...)
	if err != nil {
		fmt.Printf("Failed to submit transaction: %s\n", err)
		return "", err
	}
	return string(result), nil
}

// func main() {
// 	network := GetNetwork()

// 	info := Information{"users", "QueryUser", []string{"pinxue01"}}

// 	result := BaseQuery(network, info)

// 	println(result)
// }
