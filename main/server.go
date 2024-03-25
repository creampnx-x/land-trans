package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func setupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(Cors())

	/********************* test *****************************/

	r.GET("/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong")
	})

	/********************* user *****************************/

	r.POST("/land/user/register", Register)

	r.POST("/land/user/login", LogIn)

	/********************* land *****************************/

	r.POST("/land/create", CreateLand)

	r.POST("/land/valid/:landId", ValidLand)

	r.POST("/land/update", UpdateLand)

	r.GET("/land/:landId", QueryLand)

	r.GET("/land", QueryLandByKey)

	/********************* tran *****************************/

	r.POST("/land/tran/create", CreateTransaction)

	r.POST("/land/tran/valid", ValidTransaction)

	r.GET("/land/tran/:transactionId", QueryTransaction)

	r.GET("/land/tran", QueryTransactionByKey)

	return r
}

func main() {
	r := setupRouter()

	r.Run(":8080")
}

/************************************  mid ware *************************************/

func Cors() gin.HandlerFunc {
	return func(c *gin.Context) {
		method := c.Request.Method
		origin := c.Request.Header.Get("Origin")
		if origin != "" {
			c.Header("Access-Control-Allow-Origin", "*") // 可将将 * 替换为指定的域名
			c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")
			c.Header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
			c.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Cache-Control, Content-Language, Content-Type")
			c.Header("Access-Control-Allow-Credentials", "true")
		}
		if method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
		}
		c.Next()
	}
}

/************************************  modal  *************************************/

type Response struct {
	status string
	info   string
	data   interface{}
}
