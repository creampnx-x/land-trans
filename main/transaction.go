package main

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
)

/***********************  invoke  ******************************/

func CreateTransaction(c *gin.Context) {
	network := GetNetwork()

	var body struct {
		TransactionId string `json:"transactionId" binding:"required"`
		LandId        string `json:"landId" binding:"required"`
		Requester     string `json:"requester" binding:"required"`
		Validar       string `json:"validar" binding:"required"`
		IsValid       string `json:"isValid" binding:"required"`
		// status 代表交易状态 -2 - -1 - 0 - 1 分别代表 [已取消、已拒绝、交易中、已成交]
		Status string `json:"status" binding:"required"`
		Date   string `json:"date" binding:"required"`
		Price  string `json:"price" binding:"required"`
	}

	// 检查字段并绑定
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "fail",
			"data":   nil,
			"info":   err.Error(),
		})
		return
	}

	// 查询土地是否在交易中
	land, err := BaseQuery(network, Information{"land", "QueryLand", []string{body.LandId}})

	if err != nil {
		c.JSON(http.StatusBadRequest, Response{"fail", err.Error(), nil})
		return
	}

	var jsonMap map[string]interface{}
	json.Unmarshal([]byte(land), &jsonMap)

	// 在交易中 - 不得再交易
	if jsonMap["inTransaction"] == "true" {
		c.JSON(http.StatusBadRequest, Response{"fail", "land already in transition!", nil})
		return
	}

	// 不在交易中 - 流转交易状态
	BaseInvoke(network, Information{"land", "UpdateLand", []string{body.LandId, "inTransaction", "true"}})

	result, err := BaseInvoke(network, Information{"tran", "CreateTransaction", []string{
		body.TransactionId, body.LandId, body.Requester, body.Validar, body.IsValid, body.Date, body.Price,
	}})

	if err != nil {
		c.JSON(http.StatusBadRequest, Response{"fail", err.Error(), nil})

		// 回退交易状态
		BaseInvoke(network, Information{"land", "UpdateLand", []string{body.LandId, "inTransaction", "false"}})
		return
	}

	c.JSON(http.StatusOK, Response{"ok", "", result})
}

func ValidTransaction(c *gin.Context) {
	network := GetNetwork()

	var body struct {
		TransactionId string `json:"transactionId" binding:"required"`
		Requester     string `json:"requester" binding:"required"`
		Validar       string `json:"validar" binding:"required"`
		Status        string `json:"status" binding:"required"`
	}

	// 检查字段并绑定
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "fail",
			"data":   nil,
			"info":   err.Error(),
		})
		return
	}

	// fixme: 应当检查土地的归属
	// fixme: 当交易结束应当取消所有请求交易本土地的请求
	// 或者 将在交易中的土地锁起来 [use this to fix]

	_, err := BaseInvoke(network, Information{"tran", "ValidTransaction", []string{body.TransactionId, body.Status}})
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{"fail", err.Error(), nil})
		return
	}

	if body.Status != "1" {
		// 只有当请求交易完成时，才能继续下面的转让操作
		c.JSON(http.StatusOK, Response{"ok", "", nil})
		return
	}

	// 进行所有权转让
	result, err := BaseInvoke(network, Information{"land", "UpdateLand", []string{body.TransactionId, "owner", body.Requester}})
	if err != nil {
		// 交易回退状态
		BaseInvoke(network, Information{"tran", "ValidTransaction", []string{body.TransactionId, "0"}})

		c.JSON(http.StatusBadRequest, Response{"fail", err.Error(), nil})
		return
	}

	c.JSON(http.StatusOK, Response{"ok", "transition success.", result})
}

/***********************   query  ******************************/

func QueryTransaction(c *gin.Context) {
	network := GetNetwork()

	transactionId, isMatch := c.Params.Get("transactionId")

	if isMatch {
		result, err := BaseQuery(network, Information{"tran", "QueryTransaction", []string{transactionId}})

		if err != nil {
			c.JSON(http.StatusBadRequest, Response{"fail", err.Error(), nil})
			return
		}

		c.JSON(http.StatusOK, Response{"ok", "query success.", result})

	} else {
		c.JSON(http.StatusBadRequest, Response{"fail", "transaction ID is required.", nil})
	}
}

func QueryTransactionByKey(c *gin.Context) {
	network := GetNetwork()

	key := c.Query("key")
	value := c.Query("value")

	if key != "" && value != "" {
		// 查链
		result, err := BaseQuery(network, Information{"tran", "QueryTransactionByKey", []string{key, value}})

		if err != nil {
			c.JSON(http.StatusBadRequest, Response{"fail", err.Error(), nil})
		}

		c.JSON(http.StatusOK, Response{"ok", "", result})
	} else {
		c.JSON(http.StatusBadRequest, Response{"fail", "key and value is not a pair.", nil})
	}
}
