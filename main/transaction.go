package main

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
)

/***********************  invoke  ******************************/

func CreateTransaction(c *gin.Context) {
	network := GetNetwork()

	// status 代表流转状态 -2 - -1 - 0 - 1 分别代表 [已取消、已拒绝、流转中、已成交]
	var body struct {
		TransactionId string `json:"transactionId" binding:"required"`
		LandId        string `json:"landId" binding:"required"`
		Requester     string `json:"requester" binding:"required"`
		Validar       string `json:"validar" binding:"required"`
		IsValid       string `json:"isValid" binding:"required"`
		Status        string `json:"status" binding:"required"`
		Date          string `json:"date" binding:"required"`
		Price         string `json:"price" binding:"required"`
		Name          string `json:"name" binding:"required"`
		Person        string `json:"person" binding:"required"`
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

	// 查询土地是否在流转中
	land, err := BaseQuery(network, Information{"land", "QueryLand", []string{body.LandId}})

	if err != nil {
		c.JSON(http.StatusBadRequest, Response{"fail", err.Error(), nil})
		return
	}

	var jsonMap map[string]interface{}
	json.Unmarshal([]byte(land), &jsonMap)

	// 在流转中 - 不得再流转
	if jsonMap["inTransaction"] == "true" {
		c.JSON(http.StatusBadRequest, Response{"fail", "land already in transition!", nil})
		return
	}

	// 不在流转中 - 流转流转状态
	BaseInvoke(network, Information{"land", "UpdateLand", []string{body.LandId, "inTransaction", "true"}})

	result, err := BaseInvoke(network, Information{"tran", "CreateTransaction", []string{
		body.TransactionId, body.LandId, body.Requester, body.Validar, body.IsValid, body.Status, body.Date, body.Price,
		body.Name, body.Person,
	}})

	if err != nil {
		c.JSON(http.StatusBadRequest, Response{"fail", err.Error(), nil})

		// 回退流转状态
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
	// fixme: 当流转结束应当取消所有请求流转本土地的请求
	// 或者 将在流转中的土地锁起来 [use this to fix]

	println(body.TransactionId)
	println(body.Status)

	landId, err := BaseInvoke(network, Information{"tran", "ValidTransaction", []string{body.TransactionId, body.Status}})
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{"fail", err.Error(), nil})
		return
	}

	BaseInvoke(network, Information{"land", "UpdateLand", []string{landId, "inTransaction", "false"}})

	if body.Status != "1" {
		// 只有当请求流转完成时，才能继续下面的转让操作
		c.JSON(http.StatusOK, Response{"ok", "", nil})
		return
	}

	// 进行所有权转让
	result, err := BaseInvoke(network, Information{"land", "UpdateLand", []string{landId, "owner", body.Requester}})
	if err != nil {
		// 流转回退状态
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
