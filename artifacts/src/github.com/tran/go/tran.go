package main

import (
	"encoding/json"
	"fmt"

	"github.com/fatih/structs"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

type SmartContract struct {
	contractapi.Contract
}

type Tran struct {
	TransactionId string `json:"transactionId"`
	LandId        string `json:"landId"`
	Requester     string `json:"requester"`
	Validar       string `json:"validar"`
	IsValid       string `json:"isValid"`
	Status        string `json:"status"`
	Date          string `json:"date"`
	Price         string `json:"price"`
}

func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	return nil
}

func (s *SmartContract) CreateTransaction(ctx contractapi.TransactionContextInterface,
	transactionId string, landId string, requester string, validar string, isValid string, status string, date string, price string) error {
	var transaction = Tran{
		TransactionId: transactionId,
		LandId:        landId,
		Requester:     requester,
		Validar:       validar,
		IsValid:       isValid,
		Status:        status,
		Date:          date,
		Price:         price,
	}
	transactionAsBytes, _ := json.Marshal(transaction)

	return ctx.GetStub().PutState(transactionId, transactionAsBytes)
}

func (s *SmartContract) QueryTransaction(ctx contractapi.TransactionContextInterface, transactionId string) (*Tran, error) {
	transactionAsBytes, err := ctx.GetStub().GetState(transactionId)

	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %s", err.Error())
	}

	if transactionAsBytes == nil {
		return nil, fmt.Errorf("%s does not exist", transactionId)
	}

	transaction := new(Tran)
	_ = json.Unmarshal(transactionAsBytes, transaction)

	return transaction, nil
}

func (s *SmartContract) QueryTransactionByKey(ctx contractapi.TransactionContextInterface, key string, value string) ([]Tran, error) {
	startKey := ""
	endKey := ""

	resultsIterator, err := ctx.GetStub().GetStateByRange(startKey, endKey)

	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var results []Tran

	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()

		if err != nil {
			return nil, err
		}

		transaction := new(Tran)
		_ = json.Unmarshal(queryResponse.Value, transaction)

		transactionMap := structs.Map(transaction)

		// return landMap, nil

		target, _ := transactionMap[cases.Title(language.Und, cases.NoLower).String(key)].(string)

		// return []string{target, value, cases.Title(language.Und, cases.NoLower).String(key)}, nil

		if target == value {
			results = append(results, *transaction)
		}
	}

	return results, nil
}

func (s *SmartContract) ValidTransaction(ctx contractapi.TransactionContextInterface, transactionId string, status string) (string, error) {
	transactionAsBytes, err := ctx.GetStub().GetState(transactionId)

	if err != nil {
		return "", fmt.Errorf("failed to read from world state: %s", err.Error())
	}

	if transactionAsBytes == nil {
		return "", fmt.Errorf("%s does not exist", transactionId)
	}

	transaction := new(Tran)
	_ = json.Unmarshal(transactionAsBytes, transaction)

	if status == "1" {
		transaction.Status = "1"
		transaction.IsValid = "true"
	} else {
		transaction.Status = status
		transaction.IsValid = "false"
	}

	transactionAsBytes, _ = json.Marshal(transaction)
	return transaction.LandId, ctx.GetStub().PutState(transactionId, transactionAsBytes)
}

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
