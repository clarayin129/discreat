"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
var mongodb_1 = require("mongodb");
var uri = process.env.MONGODB_URI;
var client = new mongodb_1.MongoClient(uri);
function seed() {
    return __awaiter(this, void 0, void 0, function () {
        var db, reports, eventLogs, notifications, now_1, sampleReports, inserted, ids, eventSamples, notifSamples, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, 10, 12]);
                    return [4 /*yield*/, client.connect()];
                case 1:
                    _a.sent();
                    db = client.db("safehub");
                    reports = db.collection("reports");
                    eventLogs = db.collection("event_logs");
                    notifications = db.collection("notifications");
                    // Create 2dsphere index for geospatial queries
                    return [4 /*yield*/, reports.createIndex({ location: "2dsphere" })];
                case 2:
                    // Create 2dsphere index for geospatial queries
                    _a.sent();
                    return [4 /*yield*/, reports.deleteMany({})];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, eventLogs.deleteMany({})];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, notifications.deleteMany({})];
                case 5:
                    _a.sent();
                    now_1 = new Date();
                    sampleReports = Array.from({ length: 10 }, function (_, i) {
                        var offset = i * 300000; // 5 min apart
                        var lat = 37.7749 + i * 0.001; // simulate slight location shifts
                        var lng = -122.4194 + i * 0.001;
                        return {
                            address: "".concat(100 + i, " Test St"),
                            city: ["Rivertown", "Hillcrest", "Oakridge"][i % 3],
                            country: "USA",
                            createdAt: new Date(now_1.getTime() + offset).toISOString(),
                            status: ["pending", "in progress", "resolved"][i % 3],
                            policeDepartment: "".concat(["Rivertown", "Hillcrest", "Oakridge"][i % 3], " PD"),
                            location: {
                                type: "Point",
                                coordinates: [lng, lat]
                            },
                            responseTime: i % 3 !== 0 ? 5 + i : undefined,
                            resolutionTime: i % 3 === 2 ? 10 + i : undefined
                        };
                    });
                    return [4 /*yield*/, reports.insertMany(sampleReports)];
                case 6:
                    inserted = _a.sent();
                    ids = Object.values(inserted.insertedIds).map(function (id) { return id.toString(); });
                    eventSamples = ids.flatMap(function (id, i) {
                        var base = now_1.getTime() + i * 300000;
                        var logs = [
                            {
                                reportId: id,
                                type: "help_requested",
                                timestamp: new Date(base).toISOString(),
                                note: "Initial request submitted"
                            },
                            {
                                reportId: id,
                                type: "responded",
                                timestamp: new Date(base + 300000).toISOString(),
                                responderId: "responder_".concat(i)
                            }
                        ];
                        if (i % 3 === 2) {
                            logs.push({
                                reportId: id,
                                type: "resolved",
                                timestamp: new Date(base + 600000).toISOString(),
                                note: "Case closed"
                            });
                        }
                        return logs;
                    });
                    notifSamples = ids.map(function (id, i) { return ({
                        reportId: id,
                        message: i % 2 === 0 ? "Help is on the way 🚓" : "Are you safe?",
                        type: i % 2 === 0 ? "help_on_the_way" : "check_in",
                        responded: i % 2 === 0,
                        timestamp: new Date(now_1.getTime() + i * 300000 + 120000).toISOString()
                    }); });
                    return [4 /*yield*/, eventLogs.insertMany(eventSamples)];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, notifications.insertMany(notifSamples)];
                case 8:
                    _a.sent();
                    console.log("✅ Seeded 10 reports with event logs and notifications");
                    return [3 /*break*/, 12];
                case 9:
                    err_1 = _a.sent();
                    console.error("❌ Seed error:", err_1);
                    return [3 /*break*/, 12];
                case 10: return [4 /*yield*/, client.close()];
                case 11:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    });
}
seed();
