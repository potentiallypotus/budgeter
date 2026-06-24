package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type money struct {
	Dollars int `json:"dollars"`
	Cents   int `json:"cents"`
}

func add(a money, b money) money {
	return money{a.Dollars + b.Dollars, a.Cents + b.Cents}
}

type timeResponse struct {
	Time string `json:"time"`
}

func (m money) mToString() string {
	return fmt.Sprintf("%d.%d", m.Dollars, m.Cents)
}

type overviewResponse struct {
	Spent     string `json:"spent"`
	Withdrawn string `json:"withdrawn"`
}

func overviewHandler(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	resp := overviewResponse{
		Spent:     money{145, 34}.mToString(),
		Withdrawn: money{8000, 0}.mToString(),
	}
	json.NewEncoder(w).Encode(resp)
}

func main() {
	http.HandleFunc("/api/overview", overviewHandler)
	log.Printf("Listening on localhost:8080\n")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
