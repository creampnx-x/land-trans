package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

/***********************  invoke  ******************************/

func Register(c *gin.Context) {
	network := GetNetwork()

	var Body struct {
		UserId   string `json:"userId" binding:"required"`
		Password string `json:"password" binding:"required"`
		Name     string `json:"name" binding:"required"`
	}

	// 检查字段并绑定
	if err := c.ShouldBindJSON(&Body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "fail",
			"data":   nil,
			"info":   err.Error(),
		})
		return
	}

	// 检查用户是否已经注册
	if _, err := BaseQuery(network, Information{"users", "QueryUser", []string{Body.UserId}}); err == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "fail",
			"data":   nil,
			"info":   "user alreay exist.",
		})

		return
	}

	// 上链
	args := []string{Body.Name, Body.UserId, Body.Password, "normal", ""}
	info := Information{"users", "CreateUser", args}

	if _, err := BaseInvoke(network, info); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "fail",
			"data":   nil,
			"info":   err.Error(),
		})
		return
	}

	// 返回结果
	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
		"data":   nil,
		"info":   "",
	})
}

/***********************   query  ******************************/

func LogIn(c *gin.Context) {
	network := GetNetwork()

	var Body struct {
		UserId   string `json:"userId" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	// 检查字段并绑定
	if err := c.ShouldBindJSON(&Body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "fail",
			"data":   nil,
			"info":   err.Error(),
		})
		return
	}

	// 登录
	result, err := BaseQuery(network, Information{"users", "LogIn", []string{Body.UserId, Body.Password}})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "fail",
			"data":   nil,
			"info":   err.Error(),
		})
		return
	}

	if result == "error" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "fail",
			"data":   nil,
			"info":   "user does not exist.",
		})
	} else if result == "false" {
		c.JSON(http.StatusBadRequest, gin.H{
			"status": "fail",
			"data":   nil,
			"info":   "wrong password.",
		})
	} else {
		data, _ := BaseQuery(network, Information{"users", "QueryUser", []string{Body.UserId}})
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
			"data":   data,
			"info":   "",
		})
	}
}
