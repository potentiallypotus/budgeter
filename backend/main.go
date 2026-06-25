package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	_ "modernc.org/sqlite"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

type money int64

type overviewResponse struct {
	Spent     money `json:"spent"`
	Withdrawn money `json:"withdrawn"`
}

type entryType struct {
	Type        string `json:"type"`
	User        int    `json:"user"`
	Amount      int64  `json:"amount"`
	Description string `json:"description"`
}

func overviewHandler(w http.ResponseWriter, _ *http.Request) {
	var spent, withdrawn int64
	spent = queryExpenses(0)
	withdrawn = queryWithdrawals(0)

	w.Header().Set("Content-Type", "application/json")
	resp := overviewResponse{
		Spent:     money(spent),
		Withdrawn: money(withdrawn),
	}
	json.NewEncoder(w).Encode(resp)
}

func storeEntry(entry *entryType, db *sql.DB) (int64, error) {
	var result sql.Result
	var err error
	switch entry.Type {
	case "expense", "withdrawal":
		result, err = db.Exec(
			"INSERT INTO expenses (user_id, cents, description, type) VALUES (?, ?, ?, ?)",
			entry.User, entry.Amount, entry.Description, entry.Type,
		)
		if err != nil {
			log.Printf("%v", err)
			return 0, err
		}
	default:
		return 0, errors.New("unknown entry type")
	}
	id, err := result.LastInsertId()
	if err != nil {
		return 0, err
	}
	return id, nil
}

func postHandler(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	if r.Method != http.MethodPost {
		http.Error(w, "Endpoint only accepts POST", http.StatusMethodNotAllowed)
		return
	}
	// is correctly a post request
	if !strings.HasPrefix(r.Header.Get("Content-Type"), "multipart/form-data") {
		http.Error(w, "Bad Content Type", http.StatusBadRequest)
		return
	}
	// Decode directly from the stream into struct
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Bad Request Contents", http.StatusBadRequest)
		return
	}
	var e entryType
	e.Type = r.FormValue("type")
	e.User = 0
	e.Amount, err = strconv.ParseInt(r.FormValue("amount"), 10, 64)
	if err != nil {
		http.Error(w, "Invalid Amount", http.StatusBadRequest)
	}
	e.Description = r.FormValue("description")

	//load file
	file, header, err := r.FormFile("file")
	if err != nil && e.Type == "expense" {
		// No File in expense entry
		http.Error(w, "Bad Request Contents", http.StatusBadRequest)
		return
	}
	hasFile := err == nil
	var ext string
	if hasFile {
		//get file extension and check validity
		ext = filepath.Ext(header.Filename)
		allowed := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".pdf": true}
		if !allowed[strings.ToLower(ext)] {
			http.Error(w, "unsupported file type", http.StatusBadRequest)
			return
		}
		defer file.Close()
	}
	id, err := storeEntry(&e, db)
	if err != nil {
		http.Error(w, "failed to store data", http.StatusInternalServerError)
		return
	}
	if hasFile {
		filename := fmt.Sprintf("exp_%d%s", id, ext)
		dst, err := os.Create(filepath.Join("./uploads", filename))
		if err != nil {
			db.Exec("DELETE FROM expenses WHERE id = ?", id)
			log.Printf("error creating file: %v\n", err)
			http.Error(w, "failed to save receipt", http.StatusInternalServerError)
			return
		}
		defer dst.Close()
		_, err = io.Copy(dst, file)
		if err != nil {
			db.Exec("DELETE FROM expenses WHERE id = ?", id)
			log.Printf("error copying file: %v\n", err)
			http.Error(w, "failed to save receipt", http.StatusInternalServerError)
			return
		}
	}
	w.WriteHeader(http.StatusCreated)
	//TODO: discover user id and populate the entry
	fmt.Printf("-----New Entry------\n\tType: %s\n\tUser: %d\n\tAmount: %d.%02d\n\tDescription: %s\n",
		e.Type,
		e.User,
		e.Amount/100,
		e.Amount%100,
		e.Description)
}

type transactionType struct {
	ID          int64  `json:"id"`
	Type        string `json:"type"`
	Cents       int64  `json:"cents"`
	Description string `json:"description"`
	CreatedAt   string `json:"created_at"`
}

func expensesHandler(w http.ResponseWriter, _ *http.Request) {
	var user int = 0
	rows, err := db.Query("SELECT id, cents, description, created_at FROM expenses WHERE user_id = ? AND type = ?",
		user, "expense")
	if err != nil {
		http.Error(w, "Query Failed", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var results []transactionType
	for rows.Next() {
		var t transactionType
		rows.Scan(&t.ID, &t.Cents, &t.Description, &t.CreatedAt)
		results = append(results, t)
	}
	w.Header().Set("content-type", "application/json")
	json.NewEncoder(w).Encode(results)

}

func withdrawalsHandler(w http.ResponseWriter, _ *http.Request) {

}

func queryExpenses(user int) int64 {
	rows, err := db.Query("SELECT cents FROM expenses WHERE user_id = ? AND type = ?", user, "expense")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()
	var sum int64 = 0
	for rows.Next() {
		var amount int64
		rows.Scan(&amount)
		sum += amount
	}
	return sum
}
func queryWithdrawals(user int) int64 {
	rows, err := db.Query("SELECT cents FROM expenses WHERE user_id = ? AND type = ?", user, "withdrawal")
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()
	var sum int64 = 0
	for rows.Next() {
		var amount int64
		rows.Scan(&amount)
		sum += amount
	}
	return sum
}

func dbSetup() *sql.DB {
	db, err := sql.Open("sqlite", "expenses.db")
	if err != nil {
		log.Fatal(err)
	}
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS expenses (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			cents INTEGER NOT NULL,
			description TEXT,
			type TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		log.Fatal(err)
	}

	return db
}

var db *sql.DB

func main() {
	db = dbSetup()
	defer db.Close()
	http.HandleFunc("/api/overview", overviewHandler)
	http.HandleFunc("/api/new", postHandler)
	http.HandleFunc("/api/expenses", expensesHandler)
	http.HandleFunc("/api/withdrawals", withdrawalsHandler)
	fmt.Printf("Listening on localhost:8080\n")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
