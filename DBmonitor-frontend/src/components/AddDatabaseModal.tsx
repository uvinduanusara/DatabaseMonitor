import { useState } from "react";
import axios from "../lib/axiosConfig";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

interface AddDatabaseModalProps {
  onSuccess?: () => void;
}

export function AddDatabaseModal({ onSuccess }: AddDatabaseModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [dbType, setDbType] = useState("Postgres");
  const [useRawString, setUseRawString] = useState(false);
  const [rawConnectionString, setRawConnectionString] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [database, setDatabase] = useState("");
  const [error, setError] = useState("");

  const buildConnectionString = (): string => {
    if (useRawString) {
      if (!rawConnectionString.trim()) {
        setError("Connection string is required");
        return "";
      }
      return rawConnectionString.trim();
    }

    switch (dbType) {
      case "Postgres":
        if (!host || !port || !database) {
          setError("Host, Port, and Database are required");
          return "";
        }
        return `Host=${host};Port=${port};Database=${database};Username=${username || "postgres"};Password=${password || ""}`;

      case "MongoDB":
        if (!host || !port || !database) {
          setError("Host, Port, and Database are required");
          return "";
        }
        const userPass = username && password ? `${username}:${password}@` : "";
        return `mongodb://${userPass}${host}:${port}/${database}`;

      case "Redis":
        if (!host || !port) {
          setError("Host and Port are required");
          return "";
        }
        return `${host}:${port}`;

      default:
        return "";
    }
  };

  const handleSubmit = async () => {
    setError("");

    if (!name.trim()) {
      setError("Display name is required");
      return;
    }

    const connStr = buildConnectionString();
    if (!connStr) return;

    try {
      await axios.post(
        "/api/databases",
        {
          name,
          dbType,
          connStr,
        },
      );

      // Reset form and close
      setOpen(false);
      setName("");
      setHost("");
      setPort("");
      setUsername("");
      setPassword("");
      setDatabase("");
      setRawConnectionString("");
      setUseRawString(false);
      setDbType("Postgres");
      setError("");

      // TRIGGER REFRESH IN PARENT
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to add database:", error);
      setError("Failed to register database. Please try again.");
    }
  };

  const getPortPlaceholder = () => {
    switch (dbType) {
      case "Postgres":
        return "5432";
      case "MongoDB":
        return "27017";
      case "Redis":
        return "6379";
      default:
        return "";
    }
  };

  const showRawStringOption = dbType === "MongoDB";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-500 gap-2">
          <Plus size={16} /> Add Database
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 text-white border-slate-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register New Database</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Database Type</Label>
            <Select value={dbType} onValueChange={setDbType}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-white">
                <SelectItem value="Postgres">PostgreSQL</SelectItem>
                <SelectItem value="MongoDB">MongoDB</SelectItem>
                <SelectItem value="Redis">Redis</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Database"
              className="bg-slate-800 border-slate-700"
            />
          </div>

          {showRawStringOption && (
            <div className="grid gap-2">
              <Label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useRawString}
                  onChange={(e) => setUseRawString(e.target.checked)}
                  className="rounded"
                />
                Use Connection String (for MongoDB Atlas)
              </Label>
            </div>
          )}

          {useRawString ? (
            <div className="grid gap-2">
              <Label htmlFor="connStr">MongoDB Connection String</Label>
              <Input
                id="connStr"
                value={rawConnectionString}
                onChange={(e) => setRawConnectionString(e.target.value)}
                placeholder="mongodb+srv://username:password@cluster.mongodb.net/database"
                className="bg-slate-800 border-slate-700 font-mono text-xs"
              />
              <p className="text-xs text-slate-400">
                Example: mongodb+srv://admin:pass@cluster.mongodb.net/mydb
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-2">
                <Label htmlFor="host">Host</Label>
                <Input
                  id="host"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="localhost or IP address"
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="port">Port</Label>
                <Input
                  id="port"
                  type="number"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder={getPortPlaceholder()}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              {dbType !== "Redis" && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={dbType === "Postgres" ? "postgres" : "admin"}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="(optional for local databases)"
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="database">Database/Default DB</Label>
                    <Input
                      id="database"
                      value={database}
                      onChange={(e) => setDatabase(e.target.value)}
                      placeholder={dbType === "Postgres" ? "postgres" : "test"}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                </>
              )}
              {dbType === "Redis" && (
                <div className="grid gap-2">
                  <Label htmlFor="database">Database Number (optional)</Label>
                  <Input
                    id="database"
                    type="number"
                    value={database}
                    onChange={(e) => setDatabase(e.target.value)}
                    placeholder="0"
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
              )}
            </>
          )}
          {error && <div className="text-red-400 text-sm">{error}</div>}
        </div>
        <Button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-500"
        >
          Save Configuration
        </Button>
      </DialogContent>
    </Dialog>
  );
}
