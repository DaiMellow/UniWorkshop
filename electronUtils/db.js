import { app } from "electron";
import { join } from "path";
import sqlite3 from "sqlite3";

export let db;

// Allows the app to write to the database file
const dbPath = join(app.getPath("userData"), "settings.db");

export function createDatabase() {
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error("Failed to connect to the settings database.", err.message);
        } else {
            console.log("Connected to the settings database at", dbPath);

            db.run("PRAGMA foreign_keys = ON;");

            db.run(
                `CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT
            )`,
                (err) => {
                    if (err) {
                        console.error("Failed to create table", err.message);
                    }
                }
            );

            db.run(
                `CREATE TABLE IF NOT EXISTS game_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                path TEXT NOT NULL,
                disabledPath TEXT NOT NULL,
                steam_id TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
                (err) => {
                    if (err) {
                        console.error("Failed to create table", err.message);
                    } else {
                        console.log("Game profiles table created or already exists.");
                    }
                }
            );

            db.run(
                `CREATE TABLE IF NOT EXISTS mods (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                path TEXT NOT NULL,
                game_profile_id INTEGER NOT NULL,
                steam_id TEXT NOT NULL,
                mod_id TEXT NOT NULL,
                author TEXT,
                description TEXT,
                version TEXT,
                img TEXT,
                status TEXT DEFAULT 'enabled' not NULL,
                autoUpdate INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (game_profile_id) REFERENCES game_profiles(id) ON DELETE CASCADE
            )`,
                (err) => {
                    if (err) {
                        console.error("Failed to create table", err.message);
                    } else {
                        console.log("Mods table created or already exists.");
                    }
                }
            );

            db.run(
                `CREATE TABLE IF NOT EXISTS steam_ids (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                game_name TEXT NOT NULL,
                steam_id TEXT NOT NULL,
                is_compatible INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )`,
                (err) => {
                    if (err) {
                        console.error("Failed to create table", err.message);
                    } else {
                        console.log("Steam IDs table created or already exists.");
                    }
                }
            );
        }
    });
}

export function clearDatabase() {
    db.run("DROP TABLE IF EXISTS settings", (err) => {
        if (err) {
            console.error("Failed to delete the settings table", err.message);
        } else {
            console.log("Settings table cleared.");
        }
    });
    db.run("DROP TABLE IF EXISTS game_profiles", (err) => {
        if (err) {
            console.error("Failed to delete the game_profiles table", err.message);
        } else {
            console.log("Game profiles table cleared.");
        }
    });
    db.run("DROP TABLE IF EXISTS mods", (err) => {
        if (err) {
            console.error("Failed to delete the mods table", err.message);
        } else {
            console.log("Mods table cleared.");
        }
    });
    db.run("DROP TABLE IF EXISTS steam_ids", (err) => {
        if (err) {
            console.error("Failed to delete the steam_ids table", err.message);
        } else {
            console.log("Steam IDs table cleared.");
        }
    });
}