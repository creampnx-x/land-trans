/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"strings"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing a car
type SmartContract struct {
	contractapi.Contract
}

// Car describes basic details of what makes up a car
type Tran struct {
	TransactionId       string `json:"transactionid"`
	To                  string `json:"to"`
	From                string `json:"from"`
	Date                string `json:"date"`
	Amount              string `json:"amount"`
	TransactionCreateBy string `json:"transactioncreateby"` // this will tell who create the transaction
	ValidatedBy         string `json:"validatedby"`         // this will tell who is the Validator
	Validate            string `json:"validate"`            // this will tell transaction is valid or not
	ViewBy              string `json:"viewby"`              // this will tell who have permissions to View the transaction Details
}

type TransactionViewRequest struct { // this struct is user to store request data into SmartContract
	TransactionId  string `json:"transactionid"`
	RequestId      string `json:"requestid"`
	RequestTo      string `json:"requestto"`
	RequestBy      string `json:"requestby"`
	RequestProcess string `json:"requestprocess"`
}

//
// type QueryResult struct {
// 	Key    string
// }

// InitLedger adds a base set of cars to the ledger
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	_ = ctx.GetStub().PutState("transationCount", []byte(strconv.Itoa(1)))
	_ = ctx.GetStub().PutState("requestCount", []byte(strconv.Itoa(1)))

	return nil
}

// CreateCar adds a new car to the world state with given details
func (s *SmartContract) CreateTransaton(ctx contractapi.TransactionContextInterface, transactionId string, to string, from string, date string, amount string, transactioncreateby string, validatedby string) error {
	transationCountBytes, _ := ctx.GetStub().GetState("transationCount")
	transationCount, _ := strconv.Atoi(string(transationCountBytes))
	transationCount = transationCount + 1

	var transaction = Tran{
		TransactionId:       transactionId,
		To:                  to,
		From:                from,
		Date:                amount,
		Amount:              date,
		TransactionCreateBy: transactioncreateby,
		ValidatedBy:         validatedby,
		Validate:            `false`,
		ViewBy:              ``}
	transationAsBytes, _ := json.Marshal(transaction)
	id := transactionId + `-` + string(transationCountBytes)

	_ = ctx.GetStub().PutState("transationCount", []byte(strconv.Itoa(transationCount)))
	return ctx.GetStub().PutState(id, transationAsBytes)
}

/*
this function required two parameter one is transaction id and other will be userid to check the permission
*/

func (s *SmartContract) QueryTransation(ctx contractapi.TransactionContextInterface, transactionId string, viewBy string) *Tran {
	transationAsBytes, err := ctx.GetStub().GetState(transactionId)

	if err != nil {
		return nil
	}
	if transationAsBytes == nil {
		return nil
	}

	transaction := new(Tran)
	_ = json.Unmarshal(transationAsBytes, transaction)

	if transaction.ValidatedBy == viewBy {
		return transaction
	} else {
		index := strings.Index(transaction.ViewBy, viewBy)
		if index > -1 {
			return transaction
		} else {
			return nil
		}
	}
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
