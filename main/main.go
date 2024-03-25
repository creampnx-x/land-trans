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

/***********************************   TEST   **************************************/

// func main() {
// network := GetNetwork()

// createTransaction(network)

// time.Sleep(3 * time.Second)

// queryTransaction(network, "tran-325-1")

// time.Sleep(3 * time.Second)

// validTransaction(network, "tran-325-1", "1")

// time.Sleep(3 * time.Second)

// queryTransaction(network, "tran-325-1")

// time.Sleep(3 * time.Second)

// validTransaction(network, "tran-325-1", "0")

// time.Sleep(3 * time.Second)

// queryTransaction(network, "tran-325-1")

// queryTransactionByKey(network, "landId", "land-325")

// position string, landId string, owner string, valid string, inTransaction string
// BaseInvoke(network, Information{"land", "CreateLand", []string{"beijing", "1", "2", "No", "false"}})

// queryLandByKey(network, "position", "beijing")
// }

// func queryLand(network *gateway.Network, landId string) {
// 	info := Information{"land", "QueryLand", []string{landId}}
// 	result, err := BaseQuery(network, info)

// 	if err != nil {
// 		println(err)
// 		os.Exit(1)
// 	}

// 	println("==============土地信息返回==============")
// 	println(result)
// }

// func queryLandByKey(network *gateway.Network, key string, value string) {
// 	info := Information{"land", "QueryLandByKey", []string{key, value}}
// 	result, err := BaseQuery(network, info)

// 	if err != nil {
// 		println(err)
// 		os.Exit(1)
// 	}

// 	println("==============土地信息返回==============")
// 	println(result)
// }

// func createTransaction(network *gateway.Network) {
// 	// transactionId, landId, requester, validar, isValid, status, date, price
// 	info := Information{"tran", "CreateTransaction", []string{"tran-325-1", "land-325", "user-325-1", "user-325-2", "false", "0", "2024-3-25", "30420"}}

// 	result, err := BaseInvoke(network, info)

// 	if err != nil {
// 		println(err)
// 		os.Exit(1)
// 	}

// 	println("==============流转创建成功==============")
// 	println(result)
// }

// func queryTransaction(network *gateway.Network, transactionId string) {
// 	info := Information{"tran", "QueryTransaction", []string{transactionId}}
// 	result, err := BaseQuery(network, info)

// 	if err != nil {
// 		println(err)
// 		os.Exit(1)
// 	}

// 	println("==============流转信息返回==============")
// 	println(result)
// }

// func validTransaction(network *gateway.Network, transactionId string, status string) {
// 	info := Information{"tran", "ValidTransaction", []string{transactionId, status}}
// 	result, err := BaseInvoke(network, info)

// 	if err != nil {
// 		println(err)
// 		os.Exit(1)
// 	}

// 	println("==============通过流转成功==============")
// 	println(result)
// }

// func queryTransactionByKey(network *gateway.Network, key string, value string) {
// 	info := Information{"tran", "QueryTransactionByKey", []string{key, value}}
// 	result, err := BaseQuery(network, info)

// 	println(err)

// 	if err != nil {
// 		println(err)
// 		os.Exit(1)
// 	}

// 	println("==============流转信息返回<" + key + ": " + value + ">==============")
// 	println(result)
// }
