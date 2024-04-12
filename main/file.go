package main

import (
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func SaveFile(c *gin.Context) {

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, Response{"fail", err.Error(), ""})
		return
	}

	fileName := file.Filename
	urlPrefix := "assets/"
	uploadPictureUrl := strconv.FormatInt(time.Now().Unix()%1000, 10) + fileName

	if err := c.SaveUploadedFile(file, urlPrefix+uploadPictureUrl); err != nil {
		c.JSON(http.StatusBadRequest, Response{"fail", err.Error(), ""})
		return
	}

	c.JSON(http.StatusOK, Response{"ok", "", uploadPictureUrl})
}

func GetFile(c *gin.Context) {
	fileName, _ := c.Params.Get("fileName")

	os.Open("assets" + "/" + fileName)

	c.Header("Content-Type", "application/octet-stream")
	c.Header("Content-Disposition", "attachment; filename="+fileName)
	c.Header("Content-Transfer-Encoding", "binary")
	c.File("assets" + "/" + fileName)
}
