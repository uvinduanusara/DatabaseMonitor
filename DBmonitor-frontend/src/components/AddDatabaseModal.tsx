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
        <Button className="w-full sm:w-auto bg-[var(--color-emerald)] hover:bg-[var(--color-emerald-glow)] text-black gap-2 transition-all duration-200">
          <Plus size={16} /> Add Database
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-[500px] bg-[#0B0E11] backdrop-blur-md text-white border-[rgba(16,185,129,0.2)] p-4 sm:p-6 max-h-[80vh] overflow-y-auto shadow-[0_25px_50px_-12px_rgba(16,185,129,0.25)]">
        <DialogHeader>
          <DialogTitle>Register New Database</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-6">
            <Label className="text-slate-300">Database Type</Label>
            <Select value={dbType} onValueChange={setDbType}>
              <SelectTrigger className="h-10 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.1)] text-white focus:ring-[var(--color-emerald)] focus:border-[var(--color-emerald)] transition-all duration-200">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent className="bg-[#0B0E11] border-[rgba(16,185,129,0.2)] text-white">
                <SelectItem value="Postgres">PostgreSQL</SelectItem>
                <SelectItem value="MongoDB">MongoDB</SelectItem>
                <SelectItem value="Redis">Redis</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-6">
            <Label htmlFor="name" className="text-slate-300">Display Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Database"
              className="h-10 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.1)] text-white placeholder:text-slate-500 focus:ring-[var(--color-emerald)] focus:border-[var(--color-emerald)] transition-all duration-200"
            />
          </div>

          {showRawStringOption && (
            <div className="grid gap-2">
              <Label className="flex items-start gap-3 cursor-pointer text-slate-300 text-sm leading-none">
                <input
                  type="checkbox"
                  checked={useRawString}
                  onChange={(e) => setUseRawString(e.target.checked)}
                  className="rounded border-[rgba(16,185,129,0.3)] bg-[rgba(16,185,129,0.1)] text-[var(--color-emerald)] focus:ring-[var(--color-emerald)]"
                />
                Use Connection String (for MongoDB Atlas)
              </Label>
            </div>
          )}

          {useRawString ? (
            <div className="grid gap-6">
              <Label htmlFor="connStr" className="text-slate-300 text-sm leading-none">MongoDB Connection String</Label>
              <textarea
                id="connStr"
                value={rawConnectionString}
                onChange={(e) => setRawConnectionString(e.target.value)}
                placeholder="mongodb+srv://username:password@cluster.mongodb.net/database"
                className="h-[60px] min-h-[60px] w-full bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.1)] font-mono text-xs text-white placeholder:text-slate-500 focus:ring-[var(--color-emerald)] focus:border-[var(--color-emerald)] transition-all duration-200 resize-none overflow-y-auto"
              />
              <p className="text-xs text-slate-500 italic mt-1">
                Example: mongodb+srv://admin:pass@cluster.mongodb.net/mydb
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6">
                <Label htmlFor="host" className="text-slate-300">Host</Label>
                <Input
                  id="host"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="localhost or IP address"
                  className="h-10 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.1)] text-white placeholder:text-slate-500 focus:ring-[var(--color-emerald)] focus:border-[var(--color-emerald)] transition-all duration-200"
                />
              </div>
              <div className="grid gap-6">
                <Label htmlFor="port" className="text-slate-300">Port</Label>
                <Input
                  id="port"
                  type="number"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  placeholder={getPortPlaceholder()}
                  className="h-10 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.1)] text-white placeholder:text-slate-500 focus:ring-[var(--color-emerald)] focus:border-[var(--color-emerald)] transition-all duration-200"
                />
              </div>
              {dbType !== "Redis" && (
                <>
                  <div className="grid gap-6">
                    <Label htmlFor="username" className="text-slate-300">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={dbType === "Postgres" ? "postgres" : "admin"}
                      className="h-10 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.1)] text-white placeholder:text-slate-500 focus:ring-[var(--color-emerald)] focus:border-[var(--color-emerald)] transition-all duration-200"
                    />
                  </div>
                  <div className="grid gap-6">
                    <Label htmlFor="password" className="text-slate-300">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="(optional for local databases)"
                      className="h-10 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.1)] text-white placeholder:text-slate-500 focus:ring-[var(--color-emerald)] focus:border-[var(--color-emerald)] transition-all duration-200"
                    />
                  </div>
                  <div className="grid gap-6">
                    <Label htmlFor="database" className="text-slate-300">Database/Default DB</Label>
                    <Input
                      id="database"
                      value={database}
                      onChange={(e) => setDatabase(e.target.value)}
                      placeholder={dbType === "Postgres" ? "postgres" : "test"}
                      className="h-10 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.1)] text-white placeholder:text-slate-500 focus:ring-[var(--color-emerald)] focus:border-[var(--color-emerald)] transition-all duration-200"
                    />
                  </div>
                </>
              )}
              {dbType === "Redis" && (
                <div className="grid gap-2">
                  <Label htmlFor="database" className="text-slate-300">Database Number (optional)</Label>
                  <Input
                    id="database"
                    type="number"
                    value={database}
                    onChange={(e) => setDatabase(e.target.value)}
                    placeholder="0"
                    className="h-10 bg-[rgba(16,185,129,0.05)] border-[rgba(16,185,129,0.1)] text-white placeholder:text-slate-500 focus:ring-[var(--color-emerald)] focus:border-[var(--color-emerald)] transition-all duration-200"
                  />
                </div>
              )}
            </>
          )}
          {error && <div className="text-red-400 text-sm">{error}</div>}
        </div>
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <Button
          onClick={handleSubmit}
          className="w-full mt-6 bg-[var(--color-emerald)] text-black hover:bg-[var(--color-emerald-glow)] transition-all duration-200"
        >
          Save Configuration
        </Button>
      </DialogContent>
    </Dialog>
  );
}
