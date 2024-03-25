package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

/***********************  invoke  ******************************/

func CreateLand(c *gin.Context) {
	network := GetNetwork()

	var body struct {
		Position      string `json:"position" binding:"required"`
		LandId        string `json:"landId" binding:"required"`
		Owner         string `json:"owner" binding:"required"`
		Valid         string `json:"valid" binding:"required"`
		InTransaction string `json:"inTransaction" binding:"required"`
	}

	// 检查字段
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "fail",
			"data":   nil,
			"info":   err.Error(),
		})
		return
	}

	// 检查ID是否冲突
	// fixme: 应该放在链码内部
	sameLand, _ := BaseQuery(network, Information{"land", "QueryLand", []string{body.LandId}})
	if sameLand != "" {
		c.JSON(http.StatusBadRequest, Response{"fail", "The land already exist.", nil})
		return
	}

	// 上链
	result, err := BaseInvoke(network, Information{"land", "CreateLand", []string{
		body.Position, body.LandId, body.Owner, body.Valid, body.InTransaction,
	}})
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{"fail", err.Error(), nil})
		return
	}

	c.JSON(http.StatusOK, Response{"ok", "", result})
}

func ValidLand(c *gin.Context) {
	network := GetNetwork()

	landId, isMatch := c.Params.Get("landId")
	if isMatch {
		result, err := BaseInvoke(network, Information{"land", "ValidLand", []string{landId}})
		if err != nil {
			c.JSON(http.StatusBadRequest, Response{"fail", err.Error(), nil})
			return
		}

		c.JSON(http.StatusOK, Response{"ok", "", result})
	} else {
		c.JSON(http.StatusBadRequest, Response{"fail", "land ID is required.", nil})
	}
}

func UpdateLand(c *gin.Context) {
	network := GetNetwork()

	var body struct {
		LandId string `json:"landId" binding:"required"`
		Key    string `json:"key" binding:"required"`
		Value  string `json:"value" binding:"required"`
	}

	// 检查字段
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "fail",
			"data":   nil,
			"info":   err.Error(),
		})
		return
	}

	result, err := BaseInvoke(network, Information{"land", "UpdateLand", []string{body.LandId, body.Key, body.Value}})
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{"fail", err.Error(), nil})
		return
	}

	c.JSON(http.StatusOK, Response{"ok", "", result})
}

/***********************   query  ******************************/

func QueryLand(c *gin.Context) {
	network := GetNetwork()

	landId, isMatch := c.Params.Get("landId")
	if isMatch {
		result, err := BaseQuery(network, Information{"land", "QueryLand", []string{landId}})

		if err != nil {
			c.JSON(http.StatusBadRequest, Response{"fail", err.Error(), nil})
			return
		}
		c.JSON(http.StatusOK, Response{"ok", "", result})
	} else {
		c.JSON(http.StatusBadRequest, Response{"fail", "land id is required.", nil})
	}
}

func QueryLandByKey(c *gin.Context) {
	network := GetNetwork()

	key := c.Query("key")
	value := c.Query("value")

	if key != "" && value != "" {
		// 查链
		result, err := BaseQuery(network, Information{"land", "QueryLandByKey", []string{key, value}})

		if err != nil {
			c.JSON(http.StatusBadRequest, Response{"fail", err.Error(), nil})
			return
		}

		c.JSON(http.StatusOK, Response{"ok", "", result})
	} else {
		c.JSON(http.StatusBadRequest, Response{"fail", "key and value is not a pair.", nil})
	}
}
