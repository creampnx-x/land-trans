package main

import (
	"encoding/json"
	"fmt"

	"github.com/fatih/structs"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

// SmartContract provides functions for managing a car
type SmartContract struct {
	contractapi.Contract
}

type Land struct {
	Position      string `json:"position"`
	LandId        string `json:"landId"`
	Owner         string `json:"owner"`
	Valid         string `json:"valid"`
	InTransaction string `json:"inTransaction"`
	Size          string `json:"size"`
	Price         string `json:"price"`
	Image         string `json:"image"`
	Lng           string `json:"lng"`
	All           string `json:"all"`
}

// InitLedger adds a base set of cars to the ledger
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	return nil
}

func (s *SmartContract) CreateLand(ctx contractapi.TransactionContextInterface,
	position string, landId string, owner string, valid string, inTransaction string,
	size string, price string, image string, lng string) error {
	land := Land{
		Position:      position,
		LandId:        landId,
		Owner:         owner,
		Valid:         valid,
		InTransaction: inTransaction,
		Size:          size,
		Price:         price,
		Image:         image,
		Lng:           lng,
		All:           "",
	}

	landAsBytes, _ := json.Marshal(land)
	return ctx.GetStub().PutState(landId, landAsBytes)
}

func (s *SmartContract) ValidLand(ctx contractapi.TransactionContextInterface, landId string) error {
	land, err := s.QueryLand(ctx, landId)

	if err != nil {
		return err
	}

	land.Valid = "Yes"

	landAsBytes, _ := json.Marshal(land)
	return ctx.GetStub().PutState(landId, landAsBytes)
}

func (s *SmartContract) UpdateLand(ctx contractapi.TransactionContextInterface, landId string, key string, value string) error {
	land, err := s.QueryLand(ctx, landId)

	// 可以手动转换 Map

	if err != nil {
		return err
	}

	landMap := structs.Map(land)

	landMap[key] = value

	landAsBytes, _ := json.Marshal(landMap)
	return ctx.GetStub().PutState(landId, landAsBytes)
}

func (s *SmartContract) QueryLand(ctx contractapi.TransactionContextInterface, landId string) (*Land, error) {
	landAsBytes, err := ctx.GetStub().GetState(landId)

	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %s", err.Error())
	}

	if landAsBytes == nil {
		return nil, fmt.Errorf("%s does not exist", landId)
	}

	land := new(Land)
	_ = json.Unmarshal(landAsBytes, land)

	return land, nil
}

func (s *SmartContract) QueryLandByKey(ctx contractapi.TransactionContextInterface, key string, value string) ([]Land, error) {
	startKey := ""
	endKey := ""

	resultsIterator, err := ctx.GetStub().GetStateByRange(startKey, endKey)

	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var results []Land

	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()

		if err != nil {
			return nil, err
		}

		land := new(Land)
		_ = json.Unmarshal(queryResponse.Value, land)

		landMap := structs.Map(land)

		target, _ := landMap[cases.Title(language.Und, cases.NoLower).String(key)].(string)

		if target == value {
			results = append(results, *land)
		}
	}

	return results, nil
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
