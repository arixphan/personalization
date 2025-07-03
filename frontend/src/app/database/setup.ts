import { MongoClient } from "mongodb";

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private client: MongoClient;
  private database: string = "personalization";
  private isConnected: boolean = false;

  private constructor() {
    this.client = new MongoClient(process.env.DB_CONN_STRING as string);
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect() {
    if (!this.isConnected) {
      try {
        await this.client.connect();
        console.log("Connected to MongoDB");
        this.isConnected = true;
      } catch (error) {
        console.error("Error connecting to MongoDB:", error);
      }
    }
  }

  public getClient(): MongoClient {
    return this.client;
  }

  get db() {
    return this.client.db(this.database);
  }
}

export const DBConnection = DatabaseConnection.getInstance();
