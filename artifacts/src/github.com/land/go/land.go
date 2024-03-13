

package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing a car
type SmartContract struct {
	contractapi.Contract
}

type Land struct {
	Position string `json:"position"`
	LandId   string `json:"landId"`
	Owner    string `json:"owner"`
	Valid    string `json:"valid"`
}

// InitLedger adds a base set of cars to the ledger
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
  return nil

}

func (s *SmartContract) CreateLand(ctx contractapi.TransactionContextInterface, position string, landId string, owner string, valid string) error {
	// return nil, fmt.Errorf("%s does not exist", landId)
	
	if landId == "1e2b" {
		return fmt.Errorf("Failed to read from world state.")
	}

	land := Land{Position: position,
		LandId: landId,
		Owner:  owner,
		Valid:  valid} // create object
	landAsBytes, _ := json.Marshal(land)

	return ctx.GetStub().PutState(landId, landAsBytes)
}

func (s *SmartContract) QueryLand(ctx contractapi.TransactionContextInterface, landId string) (*Land, error) {
	landAsBytes, err := ctx.GetStub().GetState(landId)

	if err != nil {
		return nil, fmt.Errorf("Failed to read from world state. %s", err.Error())
	}

	if landAsBytes == nil {
		return nil, fmt.Errorf("%s does not exist", landId)
	}

	land := new(Land)
	_ = json.Unmarshal(landAsBytes, land)

	return land, nil
}

// func (s *SmartContract) QueryAllBossId(ctx contractapi.TransactionContextInterface) ([]string, error) {
// 	startKey := ""
// 	endKey := ""

// 	resultsIterator, err := ctx.GetStub().GetStateByRange(startKey, endKey)

// 	if err != nil {
// 		return nil, err
// 	}
// 	defer resultsIterator.Close()

// 	results := []string{}

// 	for resultsIterator.HasNext() {
// 		queryResponse, err := resultsIterator.Next()

// 		if err != nil {
// 			return nil, err
// 		}

// 		results = append(results,  queryResponse.Key)
// 	}

// 	return results, nil
// }

// func (s *SmartContract) LogIn(ctx contractapi.TransactionContextInterface, userId string, password string) string {
// 	user, err := s.QueryUser(ctx, userId)

// 	if err != nil {
// 		return `error`
// 	}
//   check := ``
//   if user.UserId == userId && user.Password == password {	// check the Value
//     check = `true`
//   } else {
//     check = `fasle`
//   }
// 	return check

// }

func main() {

	chaincode, err := contractapi.NewChaincode(new(SmartContract))

	if err != nil {
		fmt.Printf("Error create fabcar chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting fabcar chaincode: %s", err.Error())
	}
}
